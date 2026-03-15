import React, { useState } from 'react';
import ChatBot from './components/ChatBot';
import Recommendations from './components/Recommendations';
import WorkerSearch from './components/WorkerSearch';
import PayCheck from './components/PayCheck';
import ContractExplainer from './components/ContractExplainer';
import Resume from './components/Resume';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [workerId, setWorkerId] = useState('worker-001');
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [tempWorkerId, setTempWorkerId] = useState(workerId);

  const handleChangeWorker = () => {
    setWorkerId(tempWorkerId);
    setShowWorkerModal(false);
  };

  const presetWorkers = [
    { id: 'worker-001', name: 'Carlos Rodriguez - Electrician' },
    { id: 'worker-002', name: 'Maria Chen - Plumber' },
    { id: 'worker-003', name: 'David Thompson - HVAC' },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1><span className="logo-wise">WISE</span><span className="logo-works">WORKS</span></h1>
            <p>AI-Powered Job Matching for Skilled Trades</p>
          </div>
          <button
            className="worker-selector"
            onClick={() => setShowWorkerModal(true)}
          >
            👤 {workerId}
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
                    onClick={() => {
                      setTempWorkerId(worker.id);
                    }}
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
          className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 Search Workers
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
        <button
          className={`nav-item ${activeTab === 'resume' ? 'active' : ''}`}
          onClick={() => setActiveTab('resume')}
        >
          📄 Resume
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'chat' && <ChatBot workerId={workerId} />}
        {activeTab === 'recommendations' && <Recommendations workerId={workerId} />}
        {activeTab === 'search' && <WorkerSearch />}
        {activeTab === 'paycheck' && <PayCheck />}
        {activeTab === 'contracts' && <ContractExplainer />}
        {activeTab === 'resume' && <Resume workerId={workerId} profile={{
          name: 'Carlos Rodriguez',
          trade: 'Electrician',
          email: 'carlos@email.com',
          phone: '(416) 555-1234',
          location: 'Toronto, Ontario',
          availability: 'Full-time',
          experience_years: 8,
          hourly_rate_expectation: 38,
          skill_summary: 'Licensed Red Seal electrician with 8 years of residential and commercial experience across the GTA. Specialized in panel upgrades, code compliance, and solar installation.',
          specialties: ['Red Seal Certification', 'Residential Wiring', 'Panel Upgrades', 'Solar Installation', 'Code Compliance', 'WHMIS 2015'],
          }} />}
      </main>

      <footer className="app-footer">
       <p>&copy; 2026 WiseWorks — AI Career Agent for Skilled Trades. Built at GenAI Genesis 🇨🇦</p>
      </footer>
    </div>
  );
}

export default App;
