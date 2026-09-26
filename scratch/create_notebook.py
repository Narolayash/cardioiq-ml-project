import json
import os

notebook = {
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Week 4 & 5: Multi-Model Training, Benchmarking & Serialization\n",
    "## Cardiovascular Disease Classification Project\n",
    "\n",
    "This notebook covers the complete training, evaluation, and serialization (`.pkl` export) of **7 machine learning classification algorithms**:\n",
    "\n",
    "| Algorithm | Category | Serialized File | Assigned Week | Target Role |\n",
    "| :--- | :--- | :--- | :--- | :--- |\n",
    "| **Random Forest (Tuned)** | Ensemble Tree | `random_forest_model.pkl` | **Week 5** | 🏆 **Best Model (Primary)** |\n",
    "| **Decision Tree Classifier** | Tree Classifier | `decision_tree_model.pkl` | **Week 4** | Baseline Non-Linear |\n",
    "| **Logistic Regression** | Linear Model | `logistic_regression_model.pkl` | **Week 4** | Parametric Baseline |\n",
    "| **AdaBoost Classifier** | Boosting Ensemble | `adaboost_model.pkl` | **Week 5** | Adaptive Boosting |\n",
    "| **SVM (RBF Kernel)** | Support Vector Machine | `svm_model.pkl` | **Week 5** | Kernel Non-Linear |\n",
    "| **K-Nearest Neighbors (KNN)** | Distance-Based | `knn_model.pkl` | **Week 5** | Instance-Based |\n",
    "| **Gaussian Naive Bayes** | Probabilistic | `naive_bayes_model.pkl` | **Week 5** | Bayes Theorem Baseline |"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 1. Import Required Libraries"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "import os\n",
    "import json\n",
    "import joblib\n",
    "import warnings\n",
    "import numpy as np\n",
    "import pandas as pd\n",
    "import matplotlib.pyplot as plt\n",
    "import seaborn as sns\n",
    "\n",
    "from sklearn.model_selection import train_test_split\n",
    "from sklearn.preprocessing import StandardScaler\n",
    "from sklearn.linear_model import LogisticRegression\n",
    "from sklearn.tree import DecisionTreeClassifier\n",
    "from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier\n",
    "from sklearn.neighbors import KNeighborsClassifier\n",
    "from sklearn.naive_bayes import GaussianNB\n",
    "from sklearn.svm import SVC\n",
    "from sklearn.metrics import (\n",
    "    accuracy_score, precision_score, recall_score, f1_score, \n",
    "    roc_auc_score, roc_curve, confusion_matrix, classification_report\n",
    ")\n",
    "\n",
    "warnings.filterwarnings('ignore')\n",
    "sns.set_theme(style='whitegrid', palette='muted')\n",
    "print(\"Libraries loaded successfully!\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 2. Load Processed Dataset & Feature Engineering"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Load cleaned unscaled dataset\n",
    "data_path = os.path.join('..', 'dataset', 'processed', 'cardio_cleaned.csv')\n",
    "df = pd.read_csv(data_path)\n",
    "\n",
    "# Feature Engineering: Derived clinical pressure metrics\n",
    "df['pulse_pressure'] = df['ap_hi'] - df['ap_lo']\n",
    "df['map_pressure'] = (((2 * df['ap_lo']) + df['ap_hi']) / 3.0).round(2)\n",
    "\n",
    "feature_cols = [\n",
    "    'age_years', 'gender', 'height', 'weight', 'ap_hi', 'ap_lo',\n",
    "    'cholesterol', 'gluc', 'smoke', 'alco', 'active', 'bmi',\n",
    "    'pulse_pressure', 'map_pressure'\n",
    "]\n",
    "\n",
    "X = df[feature_cols]\n",
    "y = df['cardio']\n",
    "\n",
    "print(f\"Total Samples: {X.shape[0]:,}\")\n",
    "print(f\"Feature Count: {X.shape[1]}\")\n",
    "print(f\"Target Distribution:\\n{y.value_counts(normalize=True).round(4) * 100}%\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 3. Stratified Train-Test Split & Standardization (`scaler.pkl`)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 80% Train, 20% Test with Stratification\n",
    "X_train, X_test, y_train, y_test = train_test_split(\n",
    "    X, y, test_size=0.20, random_state=42, stratify=y\n",
    ")\n",
    "\n",
    "# Fit Scaler on Training data only to prevent data leakage\n",
    "scaler = StandardScaler()\n",
    "X_train_scaled = scaler.fit_transform(X_train)\n",
    "X_test_scaled = scaler.transform(X_test)\n",
    "\n",
    "# Create models export directory\n",
    "models_dir = os.path.join('..', 'models')\n",
    "os.makedirs(models_dir, exist_ok=True)\n",
    "\n",
    "# Save fitted StandardScaler artifact\n",
    "scaler_file = os.path.join(models_dir, 'scaler.pkl')\n",
    "joblib.dump(scaler, scaler_file)\n",
    "print(f\"[OK] Saved Scaler artifact: {scaler_file}\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 4. Define All 7 Classification Models"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "model_definitions = {\n",
    "    \"random_forest\": {\n",
    "        \"name\": \"Random Forest\",\n",
    "        \"category\": \"Ensemble Tree\",\n",
    "        \"file\": \"random_forest_model.pkl\",\n",
    "        \"week\": \"Week 5\",\n",
    "        \"icon\": \"trees\",\n",
    "        \"model\": RandomForestClassifier(\n",
    "            n_estimators=150, max_depth=14, min_samples_split=10, \n",
    "            min_samples_leaf=4, random_state=42, n_jobs=-1\n",
    "        )\n",
    "    },\n",
    "    \"logistic_regression\": {\n",
    "        \"name\": \"Logistic Regression\",\n",
    "        \"category\": \"Linear Model\",\n",
    "        \"file\": \"logistic_regression_model.pkl\",\n",
    "        \"week\": \"Week 4\",\n",
    "        \"icon\": \"activity\",\n",
    "        \"model\": LogisticRegression(max_iter=1000, random_state=42)\n",
    "    },\n",
    "    \"decision_tree\": {\n",
    "        \"name\": \"Decision Tree Classifier\",\n",
    "        \"category\": \"Tree Classifier\",\n",
    "        \"file\": \"decision_tree_model.pkl\",\n",
    "        \"week\": \"Week 4\",\n",
    "        \"icon\": \"git-branch\",\n",
    "        \"model\": DecisionTreeClassifier(max_depth=10, min_samples_leaf=10, random_state=42)\n",
    "    },\n",
    "    \"adaboost\": {\n",
    "        \"name\": \"AdaBoost\",\n",
    "        \"category\": \"Boosting Ensemble\",\n",
    "        \"file\": \"adaboost_model.pkl\",\n",
    "        \"week\": \"Week 5\",\n",
    "        \"icon\": \"zap\",\n",
    "        \"model\": AdaBoostClassifier(n_estimators=100, random_state=42)\n",
    "    },\n",
    "    \"knn\": {\n",
    "        \"name\": \"K-Nearest Neighbors\",\n",
    "        \"category\": \"Distance Classifier\",\n",
    "        \"file\": \"knn_model.pkl\",\n",
    "        \"week\": \"Week 5\",\n",
    "        \"icon\": \"users\",\n",
    "        \"model\": KNeighborsClassifier(n_neighbors=25, n_jobs=-1)\n",
    "    },\n",
    "    \"naive_bayes\": {\n",
    "        \"name\": \"Naive Bayes\",\n",
    "        \"category\": \"Probabilistic\",\n",
    "        \"file\": \"naive_bayes_model.pkl\",\n",
    "        \"week\": \"Week 5\",\n",
    "        \"icon\": \"sigma\",\n",
    "        \"model\": GaussianNB()\n",
    "    },\n",
    "    \"svm\": {\n",
    "        \"name\": \"SVM (RBF Kernel)\",\n",
    "        \"category\": \"Support Vector Machine\",\n",
    "        \"file\": \"svm_model.pkl\",\n",
    "        \"week\": \"Week 5\",\n",
    "        \"icon\": \"disc\",\n",
    "        \"model\": SVC(C=1.0, kernel=\"rbf\", probability=True, max_iter=2500, random_state=42)\n",
    "    }\n",
    "}\n",
    "\n",
    "print(f\"Defined {len(model_definitions)} models for training.\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 5. Train All Models, Evaluate on Test Set & Save `.pkl` Artifacts"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "results_list = []\n",
    "models_registry = {}\n",
    "roc_data = {}\n",
    "\n",
    "print(\"=\" * 75)\n",
    "print(f\"{'Model Name':<28} | {'Accuracy':<9} | {'Precision':<9} | {'Recall':<9} | {'ROC-AUC':<9}\")\n",
    "print(\"=\" * 75)\n",
    "\n",
    "for key, config in model_definitions.items():\n",
    "    name = config[\"name\"]\n",
    "    filename = config[\"file\"]\n",
    "    clf = config[\"model\"]\n",
    "\n",
    "    # 1. Fit on Scaled Training Data\n",
    "    clf.fit(X_train_scaled, y_train)\n",
    "\n",
    "    # 2. Predict on Test Set\n",
    "    y_pred = clf.predict(X_test_scaled)\n",
    "    \n",
    "    # Predict Probabilities for ROC-AUC\n",
    "    if hasattr(clf, \"predict_proba\"):\n",
    "        y_prob = clf.predict_proba(X_test_scaled)[:, 1]\n",
    "    else:\n",
    "        y_prob = clf.decision_function(X_test_scaled)\n",
    "\n",
    "    # 3. Calculate Clinical Evaluation Metrics\n",
    "    acc = accuracy_score(y_test, y_pred)\n",
    "    prec = precision_score(y_test, y_pred)\n",
    "    rec = recall_score(y_test, y_pred)\n",
    "    f1 = f1_score(y_test, y_pred)\n",
    "    auc = roc_auc_score(y_test, y_prob)\n",
    "\n",
    "    # Store ROC curve points\n",
    "    fpr, tpr, _ = roc_curve(y_test, y_prob)\n",
    "    roc_data[name] = (fpr, tpr, auc)\n",
    "\n",
    "    # Print row\n",
    "    print(f\"{name:<28} | {acc*100:6.2f}%   | {prec*100:6.2f}%   | {rec*100:6.2f}%   | {auc:7.4f}\")\n",
    "\n",
    "    # 4. Save Model Artifact (.pkl)\n",
    "    pkl_path = os.path.join(models_dir, filename)\n",
    "    joblib.dump(clf, pkl_path)\n",
    "\n",
    "    # Record summary\n",
    "    results_list.append({\n",
    "        \"Model\": name,\n",
    "        \"Category\": config[\"category\"],\n",
    "        \"Week\": config[\"week\"],\n",
    "        \"File\": filename,\n",
    "        \"Accuracy (%)\": round(acc * 100, 2),\n",
    "        \"Precision (%)\": round(prec * 100, 2),\n",
    "        \"Recall (%)\": round(rec * 100, 2),\n",
    "        \"F1-Score (%)\": round(f1 * 100, 2),\n",
    "        \"ROC-AUC\": round(auc, 4)\n",
    "    })\n",
    "\n",
    "    models_registry[key] = {\n",
    "        \"key\": key,\n",
    "        \"name\": name,\n",
    "        \"category\": config[\"category\"],\n",
    "        \"file\": filename,\n",
    "        \"week\": config[\"week\"],\n",
    "        \"icon\": config[\"icon\"],\n",
    "        \"accuracy\": round(float(acc) * 100, 2),\n",
    "        \"precision\": round(float(prec) * 100, 2),\n",
    "        \"recall\": round(float(rec) * 100, 2),\n",
    "        \"f1_score\": round(float(f1) * 100, 2),\n",
    "        \"roc_auc\": round(float(auc), 4),\n",
    "        \"is_best\": key == \"random_forest\"\n",
    "    }\n",
    "\n",
    "print(\"=\" * 75)\n",
    "\n",
    "# Also save best model as default trained_model.pkl\n",
    "joblib.dump(model_definitions[\"random_forest\"][\"model\"], os.path.join(models_dir, \"trained_model.pkl\"))\n",
    "\n",
    "# Save Models Registry JSON for API and Frontend\n",
    "registry_path = os.path.join(models_dir, \"models_registry.json\")\n",
    "with open(registry_path, \"w\") as f:\n",
    "    json.dump({\n",
    "        \"features\": feature_cols,\n",
    "        \"best_model_key\": \"random_forest\",\n",
    "        \"models\": models_registry\n",
    "    }, f, indent=4)\n",
    "\n",
    "print(f\"\\n[SUCCESS] All 7 .pkl models saved to: {models_dir}\")\n",
    "print(f\"[SUCCESS] Registry catalog saved to: {registry_path}\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 6. Benchmark Comparison Table"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "df_results = pd.DataFrame(results_list).sort_values(by=\"Accuracy (%)\", ascending=False).reset_index(drop=True)\n",
    "df_results"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 7. ROC Curves Multi-Model Visualization"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "plt.figure(figsize=(10, 7))\n",
    "for name, (fpr, tpr, auc_val) in roc_data.items():\n",
    "    plt.plot(fpr, tpr, lw=2, label=f\"{name} (AUC = {auc_val:.4f})\")\n",
    "\n",
    "plt.plot([0, 1], [0, 1], color='gray', linestyle='--', label='Random Guessing (AUC = 0.5000)')\n",
    "plt.xlim([0.0, 1.0])\n",
    "plt.ylim([0.0, 1.05])\n",
    "plt.xlabel('False Positive Rate (1 - Specificity)', fontsize=12)\n",
    "plt.ylabel('True Positive Rate (Sensitivity)', fontsize=12)\n",
    "plt.title('Receiver Operating Characteristic (ROC) — 7 Models Comparison', fontsize=14, fontweight='bold')\n",
    "plt.legend(loc='lower right', frameon=True, facecolor='white', framealpha=0.9)\n",
    "plt.tight_layout()\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 8. End-to-End Live Inference Verification (Simultaneous 7-Model Prediction)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Test sample patient profile\n",
    "sample_patient = {\n",
    "    'age_years': 55,\n",
    "    'gender': 2,       # Male\n",
    "    'height': 170,\n",
    "    'weight': 82.0,\n",
    "    'ap_hi': 145,\n",
    "    'ap_lo': 90,\n",
    "    'cholesterol': 2,  # Above Normal\n",
    "    'gluc': 1,\n",
    "    'smoke': 1,        # Smoker\n",
    "    'alco': 0,\n",
    "    'active': 1\n",
    "}\n",
    "\n",
    "# Feature computation\n",
    "sample_patient['bmi'] = round(sample_patient['weight'] / ((sample_patient['height'] / 100) ** 2), 1)\n",
    "sample_patient['pulse_pressure'] = sample_patient['ap_hi'] - sample_patient['ap_lo']\n",
    "sample_patient['map_pressure'] = round(((2 * sample_patient['ap_lo']) + sample_patient['ap_hi']) / 3.0, 2)\n",
    "\n",
    "df_sample = pd.DataFrame([sample_patient])[feature_cols]\n",
    "scaled_sample = scaler.transform(df_sample)\n",
    "\n",
    "print(\"=\" * 65)\n",
    "print(\"LIVE MULTI-MODEL PREDICTION TEST ON SAMPLE PATIENT:\")\n",
    "print(f\"Age: {sample_patient['age_years']} | BP: {sample_patient['ap_hi']}/{sample_patient['ap_lo']} mmHg | BMI: {sample_patient['bmi']}\")\n",
    "print(\"=\" * 65)\n",
    "\n",
    "for key, config in model_definitions.items():\n",
    "    model_obj = joblib.load(os.path.join(models_dir, config['file']))\n",
    "    pred = int(model_obj.predict(scaled_sample)[0])\n",
    "    if hasattr(model_obj, 'predict_proba'):\n",
    "        prob = float(model_obj.predict_proba(scaled_sample)[0][1])\n",
    "    else:\n",
    "        decision = float(model_obj.decision_function(scaled_sample)[0])\n",
    "        prob = 1.0 / (1.0 + np.exp(-decision))\n",
    "    \n",
    "    status = \"🔴 Disease Detected\" if pred == 1 else \"🟢 Healthy\"\n",
    "    print(f\"{config['name']:<25} -> {status:<20} (Risk: {prob*100:5.2f}%)\")\n",
    "print(\"=\" * 65)"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbformat": 4,
   "nbformat_minor": 2,
   "version": "3.10.12"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 2
}

output_path = r"c:\Users\Yash Narola\Desktop\ML Project\notebooks\07_multi_model_training_and_serialization.ipynb"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(notebook, f, indent=1)

print(f"Notebook successfully created at: {output_path}")
