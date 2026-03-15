import React, { useState } from 'react';
import Onboarding from './components/Onboarding';
import Resume from './components/Resume';
import ChatBot from './components/ChatBot';
import Recommendations from './components/Recommendations';
import PayCheck from './components/PayCheck';
import ContractExplainer from './components/ContractExplainer';
import './App.css';

function App() {
  const [workerId, setWorkerId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('resume');

  const handleOnboardingComplete = (data) => {
    setWorkerId(data.worker_id);
    setProfile(data.profile);
    setActiveTab('resume');
  };

  const handleLogout = () => {
    setWorkerId(null);
    setProfile(null);
    setActiveTab('resume');
  };

  // Show onboarding if no profile yet
  if (!workerId || !profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const TABS = [
    { key: 'resume', label: '📄 Resume' },
    { key: 'chat', label: '💬 Job Matching' },
    { key: 'recommendations', label: '🎯 Recommendations' },
    { key: 'paycheck', label: '💰 Pay Check' },
    { key: 'contracts', label: '📋 Contracts' },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>⚡ TradePass</h1>
            <p>AI-Powered Career Agent for Skilled Trades</p>
          </div>
          <div className="user-info">
            <span className="user-name">👤 {profile.name}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`nav-item ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-content">
        {activeTab === 'resume' && <Resume profile={profile} workerId={workerId} />}
        {activeTab === 'chat' && <ChatBot workerId={workerId} />}
        {activeTab === 'recommendations' && <Recommendations workerId={workerId} />}
        {activeTab === 'paycheck' && <PayCheck />}
        {activeTab === 'contracts' && <ContractExplainer />}
      </main>

      <footer className="app-footer">
        <p>&copy; 2026 TradePass - AI Career Agent. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
