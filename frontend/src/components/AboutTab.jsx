import React from 'react';
import { Code } from 'lucide-react';

export default function AboutTab() {
  return (
    <div className="card">
      <h2 className="card-title"><Code size={20} /> Complete ML Engineering Pipeline</h2>
      <p className="card-desc">End-to-End lifecycle from raw health data to interactive prediction web application.</p>

      <div className="pipeline-steps">
        <div className="pipe-step">
          <div className="step-num">1</div>
          <div className="step-text">
            <strong>Dataset Exploration & Quality Audit</strong>
            <p>Analyzed 70,000 raw patient records, identified physiological blood pressure anomalies (-150 to 16,000 mmHg), and confirmed exact 50-50 balanced class distribution.</p>
          </div>
        </div>

        <div className="pipe-step">
          <div className="step-num">2</div>
          <div className="step-text">
            <strong>Data Preprocessing & Feature Engineering</strong>
            <p>Filtered outliers with $ap\_hi &gt; ap\_lo$, engineered Body Mass Index ($BMI$), Pulse Pressure ($ap\_hi - ap\_lo$), and Mean Arterial Pressure ($MAP$). Saved clean dataset of 68,555 rows.</p>
          </div>
        </div>

        <div className="pipe-step">
          <div className="step-num">3</div>
          <div className="step-text">
            <strong>Scratch Logistic Regression Implementation</strong>
            <p>Built binary classification engine from scratch with pure NumPy: Sigmoid activation, Binary Cross-Entropy (Log Loss), and Gradient Descent weight updates without Scikit-learn.</p>
          </div>
        </div>

        <div className="pipe-step">
          <div className="step-num">4</div>
          <div className="step-text">
            <strong>Model Benchmarking & 5-Fold GridSearchCV</strong>
            <p>Compared Logistic Regression, Decision Tree, Random Forest, KNN, and SVM. Hyperparameter tuned Random Forest to achieve a 0.8012 ROC-AUC score.</p>
          </div>
        </div>

        <div className="pipe-step">
          <div className="step-num">5</div>
          <div className="step-text">
            <strong>Flask REST API & React Frontend</strong>
            <p>Serialized production model (`trained_model.pkl`) and scaler (`scaler.pkl`) with a CORS-enabled Flask backend and modern React interface.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
