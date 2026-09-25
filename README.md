# CardioGuard AI — Cardiovascular Disease Prediction Platform

An end-to-end Machine Learning and Full-Stack Clinical Screening application built from scratch to predict the risk of cardiovascular disease in patients based on physiological vitals.

---

## 🏗️ Project Architecture

```
ML Project/
│
├── dataset/
│   ├── raw/
│   │   └── cardio_train.csv           # Original 70,000 patient records (delimited by ';')
│   └── processed/
│       ├── cardio_cleaned.csv         # Cleaned dataset (outliers removed, BMI & age_years added)
│       └── cardio_scaled.csv          # Standardized dataset (Z-score scaled)
│
├── notebooks/
│   ├── 01_data_exploration.ipynb      # Exploration, data audit, and class balance analysis
│   ├── 02_data_preprocessing.ipynb    # Data cleaning, physiological filtering, BMI & MAP calculation
│   ├── 03_eda.ipynb                   # Exploratory Data Analysis & visual correlation insights
│   ├── 04_scratch_model.ipynb         # Logistic Regression from Scratch (Sigmoid, Log Loss, Gradient Descent)
│   ├── 05_library_models.ipynb        # Sklearn Benchmark (RF, Decision Tree, KNN, SVM, LogReg) & 5-Fold CV
│   └── 06_model_evaluation.ipynb      # 5-Fold GridSearchCV Tuning & Model Artifacts Export
│
├── src/                               # Modular Python Backend Package
│   ├── preprocessing/
│   │   ├── __init__.py
│   │   └── pipeline.py                # BMI, Pulse Pressure, MAP computation & input alignment
│   ├── models/
│   │   ├── __init__.py
│   │   └── predictor.py               # Inference engine (loads .pkl, runs predictions, tiers clinical risk)
│   ├── evaluation/
│   │   ├── __init__.py
│   │   └── metrics.py                 # Performance reporting & metadata reader
│   └── utils/
│       ├── __init__.py
│       └── helpers.py                 # Pre-configured clinical profiles & helpers
│
├── models/                            # Production Model Artifacts
│   ├── trained_model.pkl              # Tuned Random Forest Classifier (12 MB)
│   ├── scaler.pkl                     # Fitted StandardScaler (Z-score normalizer)
│   └── model_metadata.json            # Model performance scores & feature schema
│
├── flask_app/                         # Flask REST API Backend
│   ├── app.py                         # REST API endpoints with CORS enabled
│   ├── templates/
│   │   └── index.html                 # Modern Dark-Mode Glassmorphism Dashboard UI
│   └── static/
│       ├── style.css                  # Custom styling & animated risk gauge
│       └── script.js                  # Asynchronous API caller
│
├── frontend/                          # React Frontend Application (Vite + Lucide Icons)
│   ├── src/
│   │   ├── components/
│   │   │   ├── PredictorTab.jsx       # Interactive patient form with live derived metrics
│   │   │   ├── ModelTab.jsx           # Model performance metrics & architecture specs
│   │   │   ├── EdaTab.jsx             # EDA dashboard with live stats & insights
│   │   │   └── AboutTab.jsx           # Pipeline lifecycle documentation
│   │   ├── App.jsx                    # Main layout container
│   │   └── index.css                  # Glassmorphism design tokens & styles
│   ├── package.json
│   └── vite.config.js
│
├── requirements.txt                   # Python environment dependencies
└── README.md                          # Comprehensive project documentation
```

---

## 🚀 Step-by-Step Methodology

### 1. Data Exploration (`01_data_exploration.ipynb`)
- **Dataset Size**: 70,000 rows, 13 features.
- **Class Balance**: 50.03% healthy ($0$) vs. 49.97% diseased ($1$) — perfectly balanced.
- **Data Quality Audit**: Identified zero nulls, zero duplicates, negative/extreme blood pressure values ($-150$ to $16,000$ mmHg), and converted `age` in days to years.

### 2. Data Preprocessing (`02_data_preprocessing.ipynb`)
- Dropped non-predictive `id` column.
- Enforced physiological rule: $ap\_hi > ap\_lo$ (Systolic strictly greater than Diastolic).
- Filtered realistic ranges: $80 \le ap\_hi \le 220$, $50 \le ap\_lo \le 140$, $120 \le height \le 220$, $35 \le weight \le 200$.
- Feature Engineering: Body Mass Index ($\text{BMI} = \frac{\text{weight}}{(\text{height}/100)^2}$), Pulse Pressure ($ap\_hi - ap\_lo$), and Mean Arterial Pressure ($MAP = \frac{ap\_hi + 2 \times ap\_lo}{3}$).
- Exported `cardio_cleaned.csv` (68,555 clean rows) and `cardio_scaled.csv`.

### 3. Exploratory Data Analysis (`03_eda.ipynb`)
- Visualized age distribution (sharp increase in disease rate after age 50).
- Proved blood pressure ($ap\_hi$) and cholesterol level are the top predictive markers.
- Plotted feature correlation heatmaps and boxplots.

### 4. Scratch Algorithm (`04_scratch_model.ipynb`)
- Pure NumPy & Python implementation of **Logistic Regression**:
  - Sigmoid Activation: $\sigma(z) = \frac{1}{1 + e^{-z}}$
  - Binary Cross-Entropy Loss: $J(w, b) = -\frac{1}{m} \sum [y \ln(\hat{y}) + (1-y)\ln(1-\hat{y})]$
  - Gradients: $\frac{\partial J}{\partial w} = \frac{1}{m} X^T (\hat{y} - y)$, $\frac{\partial J}{\partial b} = \frac{1}{m} \sum (\hat{y} - y)$
  - Gradient Descent weight update loop.
- Achieved **~72.8% accuracy**, matching Scikit-learn's implementation.
- Tested with & without scaling to demonstrate gradient descent convergence.

### 5. Multi-Algorithm Benchmarking (`05_library_models.ipynb`)
Evaluated 5 classification algorithms with 5-Fold Stratified Cross-Validation:

| Model | 5-Fold CV Accuracy | Test Accuracy | Precision | Recall | F1 Score | ROC-AUC |
|---|---|---|---|---|---|---|
| **Random Forest (Tuned)** | **73.45%** | **73.34%** | **75.86%** | **67.60%** | **71.49%** | **0.8012** |
| **Logistic Regression** | 72.80% | 72.82% | 74.88% | 68.42% | 71.50% | 0.7935 |
| **Decision Tree** | 72.68% | 72.50% | 73.91% | 69.45% | 71.61% | 0.7842 |
| **Support Vector Machine (Linear)** | 72.76% | 72.75% | 74.92% | 68.16% | 71.38% | 0.7932 |
| **K-Nearest Neighbors (KNN)** | 71.90% | 71.85% | 73.12% | 68.90% | 70.95% | 0.7780 |

### 6. Hyperparameter Tuning & Export (`06_model_evaluation.ipynb`)
- Optimized Random Forest via `GridSearchCV` (`n_estimators=150`, `max_depth=14`, `min_samples_leaf=4`, `min_samples_split=10`).
- Exported `trained_model.pkl`, `scaler.pkl`, and `model_metadata.json`.

### 7. Flask Backend REST API (`flask_app/app.py`)
- `POST /api/predict` — Real-time inference with probability, risk badge, and personalized advice.
- `GET /api/model-info` — Model evaluation metrics.
- `GET /api/eda-stats` — Aggregated dataset statistics.
- `GET /api/sample-patients` — Preloaded patient profiles.

### 8. React Frontend UI (`frontend/`)
- Modern Dark-Mode Glassmorphism interface with Lucide Icons.
- 4 comprehensive navigation modules: **Risk Predictor**, **Model Metrics**, **EDA Dashboard**, and **Architecture Pipeline**.

---

## 🏃 Quick Start Guide

### 1. Run the Flask Backend
```bash
# Activate virtual environment
.\venv\Scripts\activate

# Start Flask server
python flask_app/app.py
```
*Backend runs on: `http://127.0.0.1:5000`*

### 2. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on: `http://localhost:5173`*
