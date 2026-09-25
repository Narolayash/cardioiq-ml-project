import os
import json
import joblib
import warnings
import pandas as pd
import numpy as np

warnings.filterwarnings("ignore")
from src.preprocessing.pipeline import prepare_feature_array

class CardiovascularPredictor:
    def __init__(self, model_dir: str = "models"):
        # Resolve absolute paths
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        self.models_dir = os.path.join(base_dir, model_dir)
        self.scaler_path = os.path.join(self.models_dir, "scaler.pkl")
        self.registry_path = os.path.join(self.models_dir, "models_registry.json")

        self.scaler = None
        self.models = {}
        self.registry = {}
        self.features = []
        self._load_artifacts()

    def _load_artifacts(self):
        """Loads scaler and all registered models from disk."""
        if not os.path.exists(self.scaler_path):
            raise FileNotFoundError("Scaler not found in models/ directory.")

        self.scaler = joblib.load(self.scaler_path)

        if os.path.exists(self.registry_path):
            with open(self.registry_path, "r") as f:
                self.registry = json.load(f)
                self.features = self.registry.get("features", [])
                
                # Load all individual models
                for key, info in self.registry.get("models", {}).items():
                    pkl_file = os.path.join(self.models_dir, info["file"])
                    if os.path.exists(pkl_file):
                        self.models[key] = joblib.load(pkl_file)
        else:
            # Fallback single model loading
            default_model_path = os.path.join(self.models_dir, "trained_model.pkl")
            if os.path.exists(default_model_path):
                self.models["random_forest"] = joblib.load(default_model_path)
            self.features = [
                "age_years", "gender", "height", "weight", "ap_hi", "ap_lo",
                "cholesterol", "gluc", "smoke", "alco", "active", "bmi",
                "pulse_pressure", "map_pressure"
            ]

    def get_models_catalog(self) -> list:
        """Returns metadata for all trained models matching the reference layout."""
        if "models" in self.registry:
            return list(self.registry["models"].values())
        return []

    def predict_patient(self, input_dict: dict, model_key: str = "random_forest") -> dict:
        """
        Executes inference pipeline for a chosen model (default: Random Forest).
        """
        df_features = prepare_feature_array(input_dict, self.features)
        scaled_features = self.scaler.transform(df_features)

        model = self.models.get(model_key) or self.models.get("random_forest")
        if model is None:
            raise ValueError(f"Model '{model_key}' is not loaded.")

        prediction = int(model.predict(scaled_features)[0])
        
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(scaled_features)[0]
            prob_disease = float(probabilities[1])
            prob_healthy = float(probabilities[0])
        else:
            decision = float(model.decision_function(scaled_features)[0])
            prob_disease = 1.0 / (1.0 + np.exp(-decision))
            prob_healthy = 1.0 - prob_disease

        # Determine clinical risk tier
        if prob_disease < 0.35:
            risk_level = "Low Risk"
            risk_color = "#27ae60"
            advice = "Healthy cardiovascular profile. Maintain current healthy diet and physical activity."
        elif prob_disease < 0.60:
            risk_level = "Moderate Risk"
            risk_color = "#f39c12"
            advice = "Moderate cardiovascular risk. Routine checkup and lifestyle modifications recommended."
        else:
            risk_level = "High Risk"
            risk_color = "#e74c3c"
            advice = "High cardiovascular disease risk detected. Clinical consultation and detailed lipid/ECG assessment advised."

        # Key Contributing Factor identification
        factors = []
        if float(input_dict.get("ap_hi", 120)) >= 140 or float(input_dict.get("ap_lo", 80)) >= 90:
            factors.append("Elevated Blood Pressure (Hypertension)")
        if int(input_dict.get("cholesterol", 1)) >= 2:
            factors.append("Elevated Serum Cholesterol")
        if df_features["bmi"].values[0] >= 30:
            factors.append("High BMI (Obesity)")
        elif df_features["bmi"].values[0] >= 25:
            factors.append("Overweight BMI")
        if int(input_dict.get("smoke", 0)) == 1:
            factors.append("Active Smoker")
        if float(df_features["age_years"].values[0]) >= 55:
            factors.append("Age Factor (55+)")

        if not factors:
            factors.append("No major primary risk markers identified")

        return {
            "prediction": prediction,
            "prediction_label": "Cardiovascular Disease Detected" if prediction == 1 else "Healthy (No Disease)",
            "disease_probability": round(prob_disease * 100, 2),
            "healthy_probability": round(prob_healthy * 100, 2),
            "risk_level": risk_level,
            "risk_color": risk_color,
            "clinical_advice": advice,
            "key_factors": factors,
            "derived_metrics": {
                "bmi": float(df_features["bmi"].values[0]),
                "pulse_pressure": float(df_features["pulse_pressure"].values[0]),
                "map_pressure": float(df_features["map_pressure"].values[0])
            }
        }

    def predict_all_models(self, input_dict: dict) -> dict:
        """
        Runs patient vitals through ALL trained models simultaneously and returns
        individual predictions alongside an ensemble consensus.
        """
        df_features = prepare_feature_array(input_dict, self.features)
        scaled_features = self.scaler.transform(df_features)

        model_results = []
        disease_votes = 0

        models_info = self.registry.get("models", {})
        for key, model in self.models.items():
            info = models_info.get(key, {
                "name": key.replace("_", " ").title(),
                "file": f"{key}_model.pkl",
                "week": "Week 5",
                "accuracy": 73.0,
                "roc_auc": 0.80
            })

            pred = int(model.predict(scaled_features)[0])
            if pred == 1:
                disease_votes += 1

            if hasattr(model, "predict_proba"):
                prob = float(model.predict_proba(scaled_features)[0][1])
            else:
                decision = float(model.decision_function(scaled_features)[0])
                prob = 1.0 / (1.0 + np.exp(-decision))

            model_results.append({
                "key": key,
                "name": info.get("name", key),
                "file": info.get("file", f"{key}_model.pkl"),
                "week": info.get("week", "Week 5"),
                "accuracy": info.get("accuracy", 73.0),
                "precision": info.get("precision", 75.0),
                "recall": info.get("recall", 68.0),
                "f1_score": info.get("f1_score", 71.0),
                "roc_auc": info.get("roc_auc", 0.80),
                "icon": info.get("icon", "activity"),
                "prediction": pred,
                "prediction_label": "Disease Detected" if pred == 1 else "Healthy",
                "disease_probability": round(prob * 100, 2),
                "risk_color": "#e74c3c" if pred == 1 else "#27ae60",
                "is_best": info.get("is_best", False)
            })

        # Primary prediction from Best Model (Random Forest)
        primary_prediction = self.predict_patient(input_dict, model_key="random_forest")

        return {
            "primary": primary_prediction,
            "consensus": {
                "disease_votes": disease_votes,
                "healthy_votes": len(self.models) - disease_votes,
                "total_models": len(self.models),
                "agreement_percentage": round((max(disease_votes, len(self.models) - disease_votes) / len(self.models)) * 100, 1)
            },
            "all_models": model_results
        }
