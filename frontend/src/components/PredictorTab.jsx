import React, { useState, useEffect } from 'react';
import { 
  Sparkles, UserCheck, Activity, ShieldAlert, Heart, Loader2,
  GitBranch, Trees, Zap, Disc, Users, Sigma, ArrowRight, CheckCircle2, AlertTriangle, AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function PredictorTab() {
  const [formData, setFormData] = useState({
    age_years: 52,
    gender: 2,
    height: 168,
    weight: 75.0,
    ap_hi: 135,
    ap_lo: 85,
    cholesterol: 1,
    gluc: 1,
    smoke: 0,
    alco: 0,
    active: 1
  });

  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [multiResult, setMultiResult] = useState(null);

  // Derived live indicators
  const liveBmi = (formData.weight / ((formData.height / 100) ** 2)).toFixed(1);
  const livePulse = Math.round(formData.ap_hi - formData.ap_lo);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/sample-patients`)
      .then(res => res.json())
      .then(data => {
        if (data.samples) setSamples(data.samples);
      })
      .catch(err => console.log('Sample profiles fetch error:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || value
    }));
  };

  const handleLoadSample = (sample) => {
    setFormData({
      age_years: sample.age_years,
      gender: sample.gender,
      height: sample.height,
      weight: sample.weight,
      ap_hi: sample.ap_hi,
      ap_lo: sample.ap_lo,
      cholesterol: sample.cholesterol,
      gluc: sample.gluc,
      smoke: sample.smoke,
      alco: sample.alco,
      active: sample.active
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/predict-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setMultiResult(data);
      } else {
        alert('Prediction Error: ' + (data.error || 'Server error'));
      }
    } catch (err) {
      alert('Error connecting to ML API Server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getModelIcon = (key) => {
    switch (key) {
      case 'decision_tree': return <GitBranch size={18} />;
      case 'random_forest': return <Trees size={18} />;
      case 'adaboost': return <Zap size={18} />;
      case 'svm': return <Disc size={18} />;
      case 'knn': return <Users size={18} />;
      case 'naive_bayes': return <Sigma size={18} />;
      case 'logistic_regression': return <Activity size={18} />;
      default: return <Activity size={18} />;
    }
  };

  const primary = multiResult?.primary;

  return (
    <div className="predictor-container">
      {/* Quick Profile Load Presets Bar */}
      {samples.length > 0 && (
        <div className="preset-bar">
          <span className="preset-title">Load Test Profile:</span>
          <div className="preset-chips">
            {samples.map((s, idx) => (
              <button
                key={idx}
                type="button"
                className="preset-chip"
                onClick={() => handleLoadSample(s)}
              >
                <span>{s.name}</span>
                <span className="preset-tag">{s.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="prediction-grid">
        {/* Left Side: Clean Clinical Input Form */}
        <div className="clean-card form-card">
          <div className="card-top">
            <div>
              <h2 className="card-heading">Patient Clinical Parameters</h2>
              <p className="card-subtext">Enter vitals to calculate real-time risk assessment.</p>
            </div>
            <div className="live-pill-group">
              <span className="live-calc-pill">BMI: <strong>{liveBmi}</strong></span>
              <span className="live-calc-pill">Pulse: <strong>{livePulse} mmHg</strong></span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="clean-form">
            {/* Section 1: Demographics & Biometrics */}
            <div className="form-group-title">1. Biometrics & Demographics</div>
            <div className="form-row-4">
              <div className="field-group">
                <label>Age (Years)</label>
                <input 
                  type="number" 
                  name="age_years" 
                  value={formData.age_years} 
                  onChange={handleChange} 
                  min="20" 
                  max="90" 
                  required 
                />
              </div>

              <div className="field-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value={2}>Male</option>
                  <option value={1}>Female</option>
                </select>
              </div>

              <div className="field-group">
                <label>Height (cm)</label>
                <input 
                  type="number" 
                  name="height" 
                  value={formData.height} 
                  onChange={handleChange} 
                  min="120" 
                  max="220" 
                  required 
                />
              </div>

              <div className="field-group">
                <label>Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.5" 
                  name="weight" 
                  value={formData.weight} 
                  onChange={handleChange} 
                  min="35" 
                  max="180" 
                  required 
                />
              </div>
            </div>

            {/* Section 2: Blood Pressure */}
            <div className="form-group-title">2. Blood Pressure (Vitals)</div>
            <div className="form-row-2">
              <div className="field-group">
                <label>Systolic BP — ap_hi (mmHg)</label>
                <input 
                  type="number" 
                  name="ap_hi" 
                  value={formData.ap_hi} 
                  onChange={handleChange} 
                  min="70" 
                  max="240" 
                  required 
                />
                <span className="field-hint">Normal: 110–120 mmHg</span>
              </div>

              <div className="field-group">
                <label>Diastolic BP — ap_lo (mmHg)</label>
                <input 
                  type="number" 
                  name="ap_lo" 
                  value={formData.ap_lo} 
                  onChange={handleChange} 
                  min="40" 
                  max="150" 
                  required 
                />
                <span className="field-hint">Normal: 70–80 mmHg</span>
              </div>
            </div>

            {/* Section 3: Lab & Lifestyle */}
            <div className="form-group-title">3. Laboratory & Lifestyle Factors</div>
            <div className="form-row-3">
              <div className="field-group">
                <label>Cholesterol</label>
                <select name="cholesterol" value={formData.cholesterol} onChange={handleChange}>
                  <option value={1}>1 - Normal (&lt;200 mg/dL)</option>
                  <option value={2}>2 - Above Normal (200-239)</option>
                  <option value={3}>3 - Well Above (≥240 mg/dL)</option>
                </select>
              </div>

              <div className="field-group">
                <label>Glucose</label>
                <select name="gluc" value={formData.gluc} onChange={handleChange}>
                  <option value={1}>1 - Normal (&lt;100 mg/dL)</option>
                  <option value={2}>2 - Above Normal (100-125)</option>
                  <option value={3}>3 - Well Above (≥126 mg/dL)</option>
                </select>
              </div>

              <div className="field-group">
                <label>Physical Activity</label>
                <select name="active" value={formData.active} onChange={handleChange}>
                  <option value={1}>Yes (Regular Active)</option>
                  <option value={0}>No (Sedentary)</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="field-group">
                <label>Smoking Status</label>
                <select name="smoke" value={formData.smoke} onChange={handleChange}>
                  <option value={0}>Non-Smoker</option>
                  <option value={1}>Active Smoker</option>
                </select>
              </div>

              <div className="field-group">
                <label>Alcohol Intake</label>
                <select name="alco" value={formData.alco} onChange={handleChange}>
                  <option value={0}>No Alcohol Intake</option>
                  <option value={1}>Consumes Alcohol</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Running 7-Model Prediction...
                </>
              ) : (
                <>
                  Run Multi-Model Prediction <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Primary Assessment Card */}
        <div className="clean-card assessment-card">
          <div className="card-top">
            <div>
              <h2 className="card-heading">Primary Clinical Assessment</h2>
              <p className="card-subtext">Benchmark: Tuned Random Forest (73.4% Acc, 0.801 ROC-AUC)</p>
            </div>
            {primary && (
              <span className={`risk-badge risk-${primary.risk_level.toLowerCase().replace(' ', '-')}`}>
                {primary.risk_level}
              </span>
            )}
          </div>

          {!primary ? (
            <div className="awaiting-state">
              <div className="awaiting-icon-wrap">
                <Heart size={32} />
              </div>
              <h3>Awaiting Clinical Input</h3>
              <p>
                Enter patient vitals on the left or select a preset profile, then click 
                <strong>"Run Multi-Model Prediction"</strong> to assess cardiovascular risk.
              </p>
            </div>
          ) : (
            <div className="result-content">
              {/* Score Display */}
              <div className="score-hero">
                <div className="score-circle" style={{ borderColor: primary.risk_color }}>
                  <span className="score-num" style={{ color: primary.risk_color }}>
                    {primary.disease_probability}%
                  </span>
                  <span className="score-lbl">Risk Score</span>
                </div>
                <div className="score-info">
                  <h3 style={{ color: primary.risk_color }}>{primary.prediction_label}</h3>
                  <p className="clinical-advice-text">{primary.clinical_advice}</p>
                </div>
              </div>

              {/* Clinical Derived Metrics */}
              <div className="derived-metrics-strip">
                <div className="derived-metric">
                  <span className="dm-label">Body Mass Index</span>
                  <span className="dm-val">{primary.derived_metrics.bmi}</span>
                </div>
                <div className="derived-metric">
                  <span className="dm-label">Pulse Pressure</span>
                  <span className="dm-val">{primary.derived_metrics.pulse_pressure} mmHg</span>
                </div>
                <div className="derived-metric">
                  <span className="dm-label">Mean Arterial (MAP)</span>
                  <span className="dm-val">{primary.derived_metrics.map_pressure} mmHg</span>
                </div>
              </div>

              {/* Key Contributing Factors */}
              {primary.key_factors && primary.key_factors.length > 0 && (
                <div className="contributing-box">
                  <span className="contrib-title">Key Contributing Clinical Risk Factors:</span>
                  <ul className="contrib-list">
                    {primary.key_factors.map((f, i) => (
                      <li key={i}>
                        <AlertTriangle size={14} className="text-amber" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Multi-Model Live Consensus Cards Grid */}
      {multiResult && (
        <div className="clean-card mt-6">
          <div className="card-top">
            <div>
              <h3 className="card-heading">
                Multi-Model Real-Time Consensus ({multiResult.consensus.disease_votes}/{multiResult.consensus.total_models} Models Flag Risk)
              </h3>
              <p className="card-subtext">
                Live predictions generated simultaneously across all 7 trained algorithms for this patient:
              </p>
            </div>
            <span className="consensus-pill">
              {multiResult.consensus.agreement_percentage}% Model Agreement
            </span>
          </div>

          <div className="ref-cards-grid">
            {multiResult.all_models.map((m) => (
              <div key={m.key} className="ref-model-card">
                <div className="ref-model-header">
                  <div className="ref-model-title">
                    <span className="ref-model-icon">{getModelIcon(m.key)}</span>
                    <span className="ref-model-name">{m.name}</span>
                  </div>
                </div>

                <div className="ref-model-rows">
                  <div className="ref-model-row">
                    <span className="ref-lbl">File:</span>
                    <span className="ref-val font-mono">{m.file}</span>
                  </div>
                  <div className="ref-model-row">
                    <span className="ref-lbl">Week:</span>
                    <span className="ref-val">{m.week}</span>
                  </div>
                  <div className="ref-model-row">
                    <span className="ref-lbl">Accuracy:</span>
                    <span className="ref-acc">{m.accuracy}%</span>
                  </div>
                </div>

                {/* Prominent Full-Width Prediction Outcome Banner */}
                <div 
                  className="ref-prediction-banner"
                  style={{
                    backgroundColor: m.prediction === 1 ? '#fef2f2' : '#f0fdf4',
                    borderColor: m.prediction === 1 ? '#fecaca' : '#bbf7d0',
                    color: m.prediction === 1 ? '#dc2626' : '#16a34a'
                  }}
                >
                  <span className="pred-dot" style={{ backgroundColor: m.prediction === 1 ? '#dc2626' : '#16a34a' }}></span>
                  <span className="pred-text">{m.prediction_label}</span>
                  <span className="pred-pct font-mono font-bold">({m.disease_probability}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
