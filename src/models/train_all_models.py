import os
import json
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler

# Import all algorithms from reference
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

# 1. Load Cleaned Dataset
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
data_path = os.path.join(base_dir, "dataset", "processed", "cardio_cleaned.csv")
df = pd.read_csv(data_path)

# Derive features
df["pulse_pressure"] = df["ap_hi"] - df["ap_lo"]
df["map_pressure"] = (((2 * df["ap_lo"]) + df["ap_hi"]) / 3.0).round(2)

feature_cols = [
    "age_years", "gender", "height", "weight", "ap_hi", "ap_lo",
    "cholesterol", "gluc", "smoke", "alco", "active", "bmi",
    "pulse_pressure", "map_pressure"
]

X = df[feature_cols]
y = df["cardio"]

# Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

# Standard Scaler
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Save Scaler
models_dir = os.path.join(base_dir, "models")
os.makedirs(models_dir, exist_ok=True)
joblib.dump(scaler, os.path.join(models_dir, "scaler.pkl"))

# Define the 7 models matching the user's reference image
model_configs = {
    "random_forest": {
        "name": "Random Forest",
        "file": "random_forest_model.pkl",
        "week": "Week 5",
        "icon": "trees",
        "model": RandomForestClassifier(n_estimators=150, max_depth=14, min_samples_split=10, min_samples_leaf=4, random_state=42, n_jobs=-1)
    },
    "logistic_regression": {
        "name": "Logistic Regression",
        "file": "logistic_regression_model.pkl",
        "week": "Week 4",
        "icon": "activity",
        "model": LogisticRegression(max_iter=1000, random_state=42)
    },
    "decision_tree": {
        "name": "Decision Tree Classifier",
        "file": "decision_tree_model.pkl",
        "week": "Week 4",
        "icon": "git-branch",
        "model": DecisionTreeClassifier(max_depth=10, random_state=42)
    },
    "adaboost": {
        "name": "AdaBoost",
        "file": "adaboost_model.pkl",
        "week": "Week 5",
        "icon": "zap",
        "model": AdaBoostClassifier(n_estimators=100, random_state=42)
    },
    "knn": {
        "name": "K-Nearest Neighbors",
        "file": "knn_model.pkl",
        "week": "Week 5",
        "icon": "users",
        "model": KNeighborsClassifier(n_neighbors=25, n_jobs=-1)
    },
    "naive_bayes": {
        "name": "Naive Bayes",
        "file": "naive_bayes_model.pkl",
        "week": "Week 5",
        "icon": "sigma",
        "model": GaussianNB()
    },
    "svm": {
        "name": "SVM (RBF)",
        "file": "svm_model.pkl",
        "week": "Week 5",
        "icon": "disc",
        # Use sub-sampled training or probability calibration for fast high-accuracy RBF SVM
        "model": SVC(C=1.0, kernel="rbf", probability=True, max_iter=3000, random_state=42)
    }
}

models_registry = {}

print("Training all 7 ML models and exporting .pkl artifacts...")

for key, config in model_configs.items():
    name = config["name"]
    filename = config["file"]
    model = config["model"]
    print(f"--> Training {name} ({filename})...")

    # Fit model on scaled training data
    model.fit(X_train_scaled, y_train)

    # Predictions on test set
    y_pred = model.predict(X_test_scaled)
    if hasattr(model, "predict_proba"):
        y_prob = model.predict_proba(X_test_scaled)[:, 1]
    else:
        y_prob = model.decision_function(X_test_scaled)

    # Calculate metrics
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)

    # Save individual pkl file
    pkl_path = os.path.join(models_dir, filename)
    joblib.dump(model, pkl_path)

    models_registry[key] = {
        "key": key,
        "name": name,
        "file": filename,
        "week": config["week"],
        "icon": config["icon"],
        "accuracy": round(float(acc) * 100, 2),
        "precision": round(float(prec) * 100, 2),
        "recall": round(float(rec) * 100, 2),
        "f1_score": round(float(f1) * 100, 2),
        "roc_auc": round(float(auc), 4),
        "is_best": key == "random_forest"
    }

# Also save random forest as default trained_model.pkl
joblib.dump(model_configs["random_forest"]["model"], os.path.join(models_dir, "trained_model.pkl"))

# Save models registry JSON
registry_path = os.path.join(models_dir, "models_registry.json")
with open(registry_path, "w") as f:
    json.dump({
        "features": feature_cols,
        "best_model_key": "random_forest",
        "models": models_registry
    }, f, indent=4)

print(f"\n[OK] All 7 models trained and saved to {models_dir}!")
print(f"[OK] Models registry saved to {registry_path}")
