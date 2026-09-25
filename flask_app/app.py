import os
import sys
import json
import pandas as pd
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS

# Add root directory to path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from src.models.predictor import CardiovascularPredictor
from src.evaluation.metrics import get_model_summary
from src.utils.helpers import get_sample_patients

# Check if React build dist exists
frontend_dist = os.path.join(root_dir, "frontend", "dist")
if os.path.exists(frontend_dist):
    app = Flask(__name__, static_folder=frontend_dist, static_url_path="")
else:
    app = Flask(__name__, template_folder="templates", static_folder="static")

CORS(app)  # Enable CORS for React frontend

# Initialize predictor
try:
    predictor = CardiovascularPredictor(model_dir="models")
    print("[OK] All Cardiovascular Models loaded successfully into Predictor.")
except Exception as e:
    predictor = None
    print(f"[Warning] Could not initialize predictor: {e}")

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_ui(path):
    """Serves the compiled React App if built, or fallback to templates/index.html."""
    if os.path.exists(frontend_dist):
        if path != "" and os.path.exists(os.path.join(frontend_dist, path)):
            return send_from_directory(frontend_dist, path)
        else:
            return send_from_directory(frontend_dist, "index.html")
    return render_template("index.html")

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "Cardiovascular Disease Multi-Model Prediction API",
        "model_loaded": predictor is not None,
        "loaded_models_count": len(predictor.models) if predictor else 0
    })

@app.route("/api/models-list", methods=["GET"])
def models_list():
    """Returns all available models matching the user's reference image layout."""
    if predictor is None:
        return jsonify({"error": "Predictor not loaded."}), 500
    return jsonify({"models": predictor.get_models_catalog()})

@app.route("/api/model-info", methods=["GET"])
def model_info():
    """Returns model performance metrics and feature list."""
    summary = get_model_summary(model_dir="models")
    return jsonify(summary)

@app.route("/api/sample-patients", methods=["GET"])
def sample_patients():
    """Returns sample patient profiles for testing."""
    return jsonify({"samples": get_sample_patients()})

@app.route("/api/predict", methods=["POST"])
def predict():
    """Main prediction endpoint (Uses Best Model - Random Forest)."""
    if predictor is None:
        return jsonify({"error": "ML Model is not loaded on the server."}), 500

    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No JSON payload provided."}), 400

        result = predictor.predict_patient(data)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500

@app.route("/api/predict-all", methods=["POST"])
def predict_all():
    """
    Simultaneous Multi-Model Prediction Endpoint.
    Passes patient vitals to all 7 models and returns predictions & probabilities for all of them.
    """
    if predictor is None:
        return jsonify({"error": "ML Model is not loaded on the server."}), 500

    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No JSON payload provided."}), 400

        result = predictor.predict_all_models(data)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": f"Multi-model prediction error: {str(e)}"}), 500

@app.route("/api/eda-stats", methods=["GET"])
def eda_stats():
    """Returns statistical summaries for the EDA dashboard."""
    data_path = os.path.join(root_dir, "dataset", "processed", "cardio_cleaned.csv")
    if not os.path.exists(data_path):
        return jsonify({"error": "Processed dataset not found."}), 404

    df = pd.read_csv(data_path)
    
    total_patients = len(df)
    disease_count = int(df["cardio"].sum())
    healthy_count = total_patients - disease_count

    df["age_group"] = pd.cut(df["age_years"], bins=[25, 40, 50, 60, 70], labels=["<40", "40-49", "50-59", "60+"])
    age_dist = df.groupby(["age_group", "cardio"], observed=False).size().unstack(fill_value=0).to_dict()

    chol_rate = df.groupby("cholesterol")["cardio"].mean().round(4).to_dict()

    bp_stats = {
        "healthy_ap_hi": round(float(df[df["cardio"] == 0]["ap_hi"].mean()), 1),
        "disease_ap_hi": round(float(df[df["cardio"] == 1]["ap_hi"].mean()), 1),
        "healthy_ap_lo": round(float(df[df["cardio"] == 0]["ap_lo"].mean()), 1),
        "disease_ap_lo": round(float(df[df["cardio"] == 1]["ap_lo"].mean()), 1),
    }

    return jsonify({
        "total_records": total_patients,
        "disease_cases": disease_count,
        "healthy_cases": healthy_count,
        "cholesterol_disease_rate": chol_rate,
        "bp_comparison": bp_stats,
        "age_distribution": {
            "labels": ["<40", "40-49", "50-59", "60+"],
            "healthy": [int(age_dist[0].get(g, 0)) for g in ["<40", "40-49", "50-59", "60+"]],
            "disease": [int(age_dist[1].get(g, 0)) for g in ["<40", "40-49", "50-59", "60+"]]
        }
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV") != "production"
    app.run(host="0.0.0.0", port=port, debug=debug)
