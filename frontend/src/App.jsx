import React, { useState } from 'react';
import { 
  HeartPulse, LayoutDashboard, Target, Cpu, BarChart3, Sparkles 
} from 'lucide-react';
import DashboardTab from './components/DashboardTab';
import PredictorTab from './components/PredictorTab';
import ModelTab from './components/ModelTab';
import EdaTab from './components/EdaTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-layout">
      {/* Top Clean Header / Navbar */}
      <header className="top-navbar">
        <div className="nav-container">
          {/* Brand Logo & Name */}
          <div className="brand-group" onClick={() => setActiveTab('dashboard')}>
            <div className="brand-icon-box">
              <HeartPulse size={20} className="brand-icon" />
            </div>
            <div className="brand-titles">
              <div className="brand-main">
                <span className="brand-name">CardioIQ</span>
                <Sparkles size={14} className="brand-sparkle" />
              </div>
              <span className="brand-sub">AI Clinical Intelligence</span>
            </div>
          </div>

          {/* Segmented Pill Tabs Navigation */}
          <nav className="pill-nav">
            <button 
              className={`pill-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>
            <button 
              className={`pill-btn ${activeTab === 'predictor' ? 'active' : ''}`}
              onClick={() => setActiveTab('predictor')}
            >
              <Target size={16} />
              <span>Prediction</span>
            </button>
            <button 
              className={`pill-btn ${activeTab === 'model' ? 'active' : ''}`}
              onClick={() => setActiveTab('model')}
            >
              <Cpu size={16} />
              <span>Model Lab</span>
            </button>
            <button 
              className={`pill-btn ${activeTab === 'eda' ? 'active' : ''}`}
              onClick={() => setActiveTab('eda')}
            >
              <BarChart3 size={16} />
              <span>Insights</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content-wrapper">
        <div className="content-container">
          {activeTab === 'dashboard' && <DashboardTab onNavigate={setActiveTab} />}
          {activeTab === 'predictor' && <PredictorTab />}
          {activeTab === 'model' && <ModelTab />}
          {activeTab === 'eda' && <EdaTab />}
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="clean-footer">
        <div className="footer-container">
          <div className="footer-left">
            <div className="footer-logo">
              <HeartPulse size={16} />
            </div>
            <span className="footer-brand">CardioIQ</span>
            <span className="footer-divider">|</span>
            <span className="footer-tagline">AI-Powered Clinical Intelligence</span>
          </div>

          <div className="footer-right">
            <span>Cardiovascular Dataset (70,000 Records)</span>
            <span className="footer-dot">•</span>
            <span>© 2026 CardioIQ</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
