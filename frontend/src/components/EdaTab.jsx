import React, { useEffect, useState } from 'react';
import { 
  BarChart3, Database, Droplets, Activity, Heart, ShieldAlert, 
  TrendingUp, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function EdaTab() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/eda-stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.log('EDA stats fetch error:', err));
  }, []);

  return (
    <div className="insights-container">
      {/* Header */}
      <div className="section-block">
        <div className="section-label">DATASET & CLINICAL FINDINGS</div>
        <h2 className="section-heading">Exploratory Insights & Risk Drivers</h2>
        <p className="section-subtext">
          Statistical patterns and distributions derived from 68,555 cleaned clinical records.
        </p>
      </div>

      <div className="insights-grid">
        {/* Cholesterol vs Disease Incidence */}
        <div className="clean-card">
          <div className="card-top">
            <div>
              <h3 className="card-heading">Cardiovascular Risk by Cholesterol Level</h3>
              <p className="card-subtext">Disease incidence increases significantly as cholesterol levels elevate.</p>
            </div>
          </div>

          <div className="stat-bars-container">
            <div className="stat-bar-group">
              <div className="bar-label-row">
                <span className="b-name">Level 1: Normal Cholesterol (&lt;200 mg/dL)</span>
                <span className="b-val font-mono">43.5% Disease Rate</span>
              </div>
              <div className="clean-progress-track">
                <div className="clean-progress-fill fill-green" style={{ width: '43.5%' }}></div>
              </div>
            </div>

            <div className="stat-bar-group">
              <div className="bar-label-row">
                <span className="b-name">Level 2: Above Normal (200–239 mg/dL)</span>
                <span className="b-val font-mono">59.6% Disease Rate</span>
              </div>
              <div className="clean-progress-track">
                <div className="clean-progress-fill fill-amber" style={{ width: '59.6%' }}></div>
              </div>
            </div>

            <div className="stat-bar-group">
              <div className="bar-label-row">
                <span className="b-name">Level 3: Well Above Normal (≥240 mg/dL)</span>
                <span className="b-val font-mono">76.2% Disease Rate</span>
              </div>
              <div className="clean-progress-track">
                <div className="clean-progress-fill fill-red" style={{ width: '76.2%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Blood Pressure Contrast */}
        <div className="clean-card">
          <div className="card-top">
            <div>
              <h3 className="card-heading">Systolic Blood Pressure Contrast</h3>
              <p className="card-subtext">Comparison between non-disease and cardiovascular disease cohorts.</p>
            </div>
          </div>

          <div className="bp-contrast-grid">
            <div className="bp-stat-card healthy-border">
              <span className="bp-title">Healthy Patients</span>
              <span className="bp-number text-green">{stats?.bp_comparison?.healthy_ap_hi || '119.6'}</span>
              <span className="bp-unit">mmHg (Mean Systolic)</span>
            </div>

            <div className="bp-stat-card diseased-border">
              <span className="bp-title">CVD Patients</span>
              <span className="bp-number text-red">{stats?.bp_comparison?.disease_ap_hi || '133.8'}</span>
              <span className="bp-unit">mmHg (Mean Systolic)</span>
            </div>
          </div>

          <div className="insight-note">
            <AlertCircle size={16} className="text-blue" />
            <span>
              Systolic Blood Pressure ($ap\_hi$) and age have the highest mutual correlation ($r = 0.43$) with cardiovascular events.
            </span>
          </div>
        </div>
      </div>

      {/* Feature Correlation Summary */}
      <div className="clean-card mt-6">
        <div className="card-top">
          <div>
            <h3 className="card-heading">Top Clinical Feature Importance Ranking</h3>
            <p className="card-subtext">Weight assigned by Tuned Random Forest Classifier during inference.</p>
          </div>
        </div>

        <div className="importance-grid">
          <div className="imp-item">
            <span className="imp-rank">#1</span>
            <span className="imp-feature">Systolic Blood Pressure (ap_hi)</span>
            <span className="imp-weight font-mono">38.4%</span>
          </div>
          <div className="imp-item">
            <span className="imp-rank">#2</span>
            <span className="imp-feature">Age (Years)</span>
            <span className="imp-weight font-mono">21.2%</span>
          </div>
          <div className="imp-item">
            <span className="imp-rank">#3</span>
            <span className="imp-feature">Serum Cholesterol</span>
            <span className="imp-weight font-mono">14.6%</span>
          </div>
          <div className="imp-item">
            <span className="imp-rank">#4</span>
            <span className="imp-feature">Body Mass Index (BMI)</span>
            <span className="imp-weight font-mono">11.8%</span>
          </div>
          <div className="imp-item">
            <span className="imp-rank">#5</span>
            <span className="imp-feature">Diastolic Blood Pressure (ap_lo)</span>
            <span className="imp-weight font-mono">8.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
