import React, { useState } from 'react';
import ChatBot from './components/ChatBot';
import Recommendations from './components/Recommendations';
import PayCheck from './components/PayCheck';
import ContractExplainer from './components/ContractExplainer';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import Landing from './components/Landing';
import AppEffects from './components/AppEffects';
import './App.css';

function App() {
  const [screen, setScreen] = useState(
    localStorage.getItem('wiseworks_worker_id') ? 'app' : 'landing'
  );
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workerId, setWorkerId] = useState(
    localStorage.getItem('wiseworks_worker_id') || ''
  );
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [tempWorkerId, setTempWorkerId] = useState(workerId);

  const handleSignOut = () => {
    localStorage.removeItem('wiseworks_worker_id');
    localStorage.removeItem('wiseworks_worker');
    localStorage.removeItem('wiseworks_worker_name');
    setWorkerId('');
    setScreen('landing');
    setActiveTab('dashboard');
  };

  const handleOnboardingComplete = (worker) => {
    if (worker?.id) {
      setWorkerId(worker.id);
      localStorage.setItem('wiseworks_worker_id', worker.id);
    }
    setScreen('app');
    setActiveTab('dashboard');
  };

  const handleChangeWorker = () => {
    setWorkerId(tempWorkerId);
    localStorage.setItem('wiseworks_worker_id', tempWorkerId);
    setShowWorkerModal(false);
  };

  const presetWorkers = [
    { id: 'worker-001', name: 'Carlos Rodriguez - Electrician' },
    { id: 'worker-002', name: 'Maria Chen - Plumber' },
    { id: 'worker-003', name: 'David Thompson - HVAC' },
  ];

  // ——— LANDING ———
  if (screen === 'landing') {
    return (
      <Landing
        onTryNow={() => setScreen('onboarding')}
        onExistingUser={() => {
          const id = localStorage.getItem('wiseworks_worker_id');
          if (id) {
            setWorkerId(id);
            setScreen('app');
          } else {
            setScreen('onboarding');
          }
        }}
      />
    );
  }

  // ——— ONBOARDING ———
  if (screen === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // ——— MAIN APP ———
  return (
    <div className="app">
      <AppEffects />

      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-lockup">
              <img src="/src/assets/logo.png" alt="WiseWorks" className="logo-img" />
              <div className="logo-text">
                <h1>
                  <span className="logo-wise">WISE</span>
                  <span className="logo-works">WORKS</span>
                </h1>
                <p>AI-Powered Job Matching for Skilled Trades</p>
              </div>
            </div>
          </div>
          <button
            className="worker-selector"
            onClick={() => setShowWorkerModal(true)}
          >
            👤 {localStorage.getItem('wiseworks_worker_name') || workerId?.slice(0, 12) || 'worker'}
          </button>
        </div>
      </header>

      {showWorkerModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Select Worker Profile</h2>
            </div>
            <div className="modal-body">
              <div className="preset-workers">
                {presetWorkers.map((worker) => (
                  <button
                    key={worker.id}
                    className={`worker-option ${workerId === worker.id ? 'active' : ''}`}
                    onClick={() => setTempWorkerId(worker.id)}
                  >
                    {worker.name}
                  </button>
                ))}
              </div>
              <div className="custom-worker">
                <label htmlFor="custom-id">Or enter custom Worker ID:</label>
                <input
                  id="custom-id"
                  type="text"
                  value={tempWorkerId}
                  onChange={(e) => setTempWorkerId(e.target.value)}
                  placeholder="e.g., worker-004"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowWorkerModal(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleChangeWorker}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="app-nav">
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          🏠 Dashboard
        </button>
        <button
          className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
        <button
          className={`nav-item ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          🎯 Recommendations
        </button>
        <button
          className={`nav-item ${activeTab === 'paycheck' ? 'active' : ''}`}
          onClick={() => setActiveTab('paycheck')}
        >
          💰 Pay Check
        </button>
        <button
          className={`nav-item ${activeTab === 'contracts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contracts')}
        >
          📋 Contracts
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'dashboard' && (
          <Dashboard workerId={workerId} onSignOut={handleSignOut} />
        )}
        {activeTab === 'chat' && <ChatBot workerId={workerId} />}
        {activeTab === 'recommendations' && <Recommendations workerId={workerId} />}
        {activeTab === 'paycheck' && <PayCheck />}
        {activeTab === 'contracts' && <ContractExplainer />}
      </main>

      <footer className="app-footer">
        <p>&copy; 2026 WiseWorks — AI Career Agent for Skilled Trades. Built at GenAI Genesis 🇨🇦</p>
      </footer>
    </div>
  );
}

export default App;