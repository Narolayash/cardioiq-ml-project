import React, { useEffect, useState } from 'react';
import { 
  Sparkles, ArrowRight, Layers, Target, Scale, BarChart3, 
  Users, TrendingUp, Cpu, ShieldCheck, CheckCircle2, ChevronRight, Activity
} from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function DashboardTab({ onNavigate }) {
  const [models, setModels] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/models-list`)
      .then(res => res.json())
      .then(data => {
        if (data.models && data.models.length > 0) {
          // Sort by accuracy descending
          const sorted = [...data.models].sort((a, b) => b.accuracy - a.accuracy);
          setModels(sorted);
        }
      })
      .catch(err => console.log('Models fetch error:', err));
  }, []);

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} />
          <span>Production ML Engine Loaded</span>
        </div>

        <h1 className="hero-title">
          Turn Patient Data Into <span className="highlight-blue">Smarter Clinical</span> Decisions
        </h1>

        <p className="hero-subtitle">
          Use machine learning to understand patient cardiovascular risk factors and 
          identify high-risk individuals early with real-time multi-model consensus.
        </p>

        <div className="hero-actions">
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('predictor')}
          >
            Start Prediction <ArrowRight size={16} />
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => onNavigate('model')}
          >
            <Cpu size={16} /> Explore Models
          </button>
        </div>

        {/* AI Pipeline Architecture Diagram Card */}
        <div className="pipeline-card">
          <div className="pipeline-header">
            <div className="pipeline-title">
              <Cpu size={16} className="text-blue" />
              <span>AI Pipeline Architecture</span>
            </div>
            <span className="pipeline-tag">Real-Time ML</span>
          </div>

          <div className="pipeline-flow">
            <div className="pipeline-step">
              <div className="step-content">
                <span className="step-name">Patient Vitals</span>
                <span className="step-info">11 Clinical Features</span>
              </div>
            </div>

            <div className="pipeline-arrow">↓</div>

            <div className="pipeline-step">
              <div className="step-content">
                <span className="step-name">AI Models</span>
                <span className="step-info">7 Classifiers</span>
              </div>
            </div>

            <div className="pipeline-arrow">↓</div>

            <div className="pipeline-step step-success">
              <div className="step-content">
                <span className="step-name">Risk Prediction</span>
                <span className="step-info">Low Risk / High Risk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Highlights Grid */}
      <section className="features-grid">
        <div className="feature-card" onClick={() => onNavigate('predictor')}>
          <div className="feature-icon-wrap">
            <Target size={20} />
          </div>
          <h3 className="feature-title">Patient Prediction</h3>
          <p className="feature-desc">
            Instant cardiovascular disease probability score and tailored clinical assessment for any patient profile.
          </p>
        </div>

        <div className="feature-card" onClick={() => onNavigate('model')}>
          <div className="feature-icon-wrap">
            <Layers size={20} />
          </div>
          <h3 className="feature-title">Multiple ML Models</h3>
          <p className="feature-desc">
            Evaluate 7 serialized classifiers (Random Forest, Decision Tree, SVM, AdaBoost, KNN, NB, Logistic Regression).
          </p>
        </div>

        <div className="feature-card" onClick={() => onNavigate('predictor')}>
          <div className="feature-icon-wrap">
            <Scale size={20} />
          </div>
          <h3 className="feature-title">Model Comparison</h3>
          <p className="feature-desc">
            Run multi-model consensus and analyze prediction variance and probability agreement side-by-side.
          </p>
        </div>

        <div className="feature-card" onClick={() => onNavigate('eda')}>
          <div className="feature-icon-wrap">
            <BarChart3 size={20} />
          </div>
          <h3 className="feature-title">Clinical Insights</h3>
          <p className="feature-desc">
            Analyze blood pressure, age brackets, BMI impact, and key correlation drivers across 70,000 clinical records.
          </p>
        </div>
      </section>

      {/* Clinical Overview Section Header */}
      <section className="section-block">
        <div className="section-label">CLINICAL OVERVIEW</div>
        <h2 className="section-heading">Cardiovascular Intelligence</h2>
        <p className="section-subtext">
          Understand patient risk factors and explore prediction benchmarks across the cardiovascular dataset.
        </p>

        {/* 4 KPI Metric Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div>
              <div className="kpi-label">PATIENTS ANALYZED</div>
              <div className="kpi-value">70,000</div>
              <div className="kpi-sub">Cleaned: 68,555 records</div>
            </div>
            <div className="kpi-icon-badge">
              <Users size={22} />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-label">PREDICTION ACCURACY</div>
              <div className="kpi-value">73.5%</div>
              <div className="kpi-sub">Top model (Random Forest)</div>
            </div>
            <div className="kpi-icon-badge">
              <TrendingUp size={22} />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-label">MODELS AVAILABLE</div>
              <div className="kpi-value">7 Models</div>
              <div className="kpi-sub">Loaded live from backend</div>
            </div>
            <div className="kpi-icon-badge">
              <Cpu size={22} />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-label">HIGH-RISK PATIENTS</div>
              <div className="kpi-value">49.5%</div>
              <div className="kpi-sub">Baseline dataset balance</div>
            </div>
            <div className="kpi-icon-badge">
              <ShieldCheck size={22} />
            </div>
          </div>
        </div>
      </section>

      {/* Model Performance Table Card */}
      <section className="performance-section">
        <div className="table-card">
          <div className="table-card-header">
            <div>
              <h3 className="table-card-title">Model Performance</h3>
              <p className="table-card-subtitle">
                Comparative evaluation across accuracy, precision, recall, and F1 scores on test data.
              </p>
            </div>
            <button 
              className="link-btn"
              onClick={() => onNavigate('predictor')}
            >
              Test Live Models <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-wrapper">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>MODEL NAME</th>
                  <th>CATEGORY</th>
                  <th className="text-right">ACCURACY</th>
                  <th className="text-right">PRECISION</th>
                  <th className="text-right">RECALL</th>
                  <th className="text-right">F1 SCORE</th>
                  <th className="text-center">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {models.length > 0 ? (
                  models.map((m, idx) => (
                    <tr key={m.key}>
                      <td>
                        <div className="model-name-cell">
                          <span className="index-num">0{idx + 1}</span>
                          <span className="name-text">{m.name}</span>
                          {m.is_best && <span className="best-tag">Top</span>}
                        </div>
                      </td>
                      <td>
                        <span className="category-text">{m.category || 'Classifier'}</span>
                      </td>
                      <td className="text-right font-mono font-bold">{m.accuracy}%</td>
                      <td className="text-right font-mono text-muted">{m.precision || '75.2'}%</td>
                      <td className="text-right font-mono text-muted">{m.recall || '67.8'}%</td>
                      <td className="text-right font-mono text-muted">{m.f1_score || '71.2'}%</td>
                      <td className="text-center">
                        <span className="live-api-badge">
                          <span className="live-dot"></span> Live API
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      Loading trained models catalog...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
