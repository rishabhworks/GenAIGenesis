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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

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

  const openEditModal = () => {
    const stored = localStorage.getItem('wiseworks_worker');
    const worker = stored ? JSON.parse(stored) : {};
    const name = localStorage.getItem('wiseworks_worker_name') || '';
    setEditForm({
      name,
      trade: worker.trade || '',
      experience_years: worker.experience_years || '',
      location: worker.location || '',
      availability: worker.availability || '',
      hourly_rate_expectation: worker.hourly_rate_expectation || '',
      certifications: Array.isArray(worker.certifications)
        ? worker.certifications.join(', ')
        : worker.certifications || '',
      specialties: Array.isArray(worker.specialties)
        ? worker.specialties.join(', ')
        : worker.specialties || '',
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const stored = localStorage.getItem('wiseworks_worker');
      const worker = stored ? JSON.parse(stored) : {};

      const updated = {
        ...worker,
        trade: editForm.trade,
        experience_years: parseInt(editForm.experience_years) || 0,
        location: editForm.location,
        availability: editForm.availability,
        hourly_rate_expectation: parseFloat(editForm.hourly_rate_expectation) || 0,
        certifications: editForm.certifications
          ? editForm.certifications.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        specialties: editForm.specialties
          ? editForm.specialties.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      };

      // Update backend
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/workers/${workerId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trade: updated.trade,
            experience_years: updated.experience_years,
            location: updated.location,
            availability: updated.availability,
            hourly_rate_expectation: updated.hourly_rate_expectation,
            certifications: updated.certifications,
            specialties: updated.specialties,
            voice_transcript: worker.voice_transcript || '',
          }),
        }
      );

      // Update localStorage
      localStorage.setItem('wiseworks_worker', JSON.stringify(updated));
      localStorage.setItem('wiseworks_worker_name', editForm.name || '');
      setShowEditModal(false);

      // Force dashboard refresh
      setActiveTab('chat');
      setTimeout(() => setActiveTab('dashboard'), 50);

    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const workerName = localStorage.getItem('wiseworks_worker_name') || workerId?.slice(0, 12) || 'worker';

  const presetWorkers = [
    { id: 'worker-001', name: 'Carlos Rodriguez - Electrician' },
    { id: 'worker-002', name: 'Maria Chen - Plumber' },
    { id: 'worker-003', name: 'David Thompson - HVAC' },
  ];

  if (screen === 'landing') {
    return (
      <Landing
        onTryNow={() => setScreen('onboarding')}
        onExistingUser={() => {
          const id = localStorage.getItem('wiseworks_worker_id');
          if (id) { setWorkerId(id); setScreen('app'); }
          else setScreen('onboarding');
        }}
      />
    );
  }

  if (screen === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="app">
      <AppEffects />

      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div
              className="logo-lockup"
              onClick={() => setActiveTab('dashboard')}
              style={{ cursor: 'pointer' }}
            >
              <img src="/src/assets/logo2.png" alt="WiseWorks" className="logo-img" />
              <div className="logo-text">
                <h1>
                  <span className="logo-wise">WISE</span>
                  <span className="logo-works">WORKS</span>
                </h1>
                <p>AI-Powered Job Matching for Elderly Skilled Trades</p>
              </div>
            </div>
          </div>
          <button className="worker-selector" onClick={openEditModal}>
            👤 {workerName}
          </button>
        </div>
      </header>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal edit-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
            </div>
            <div className="modal-body edit-modal-body">
              <div className="edit-form-grid">
                {[
                  { label: 'Full Name', key: 'name', placeholder: 'e.g. Carlos Rodriguez' },
                  { label: 'Trade', key: 'trade', placeholder: 'e.g. Electrician' },
                  { label: 'Years of Experience', key: 'experience_years', placeholder: 'e.g. 8' },
                  { label: 'Location', key: 'location', placeholder: 'e.g. Mississauga, ON' },
                  { label: 'Availability', key: 'availability', placeholder: 'Full-time or Part-time' },
                  { label: 'Expected Hourly Rate ($)', key: 'hourly_rate_expectation', placeholder: 'e.g. 38' },
                ].map(field => (
                  <div key={field.key} className="edit-form-group">
                    <label>{field.label}</label>
                    <input
                      type="text"
                      value={editForm[field.key] || ''}
                      onChange={e => setEditForm({ ...editForm, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
                <div className="edit-form-group edit-form-group--full">
                  <label>Certifications (comma-separated)</label>
                  <input
                    type="text"
                    value={editForm.certifications || ''}
                    onChange={e => setEditForm({ ...editForm, certifications: e.target.value })}
                    placeholder="e.g. Red Seal, WHMIS, ESA"
                  />
                </div>
                <div className="edit-form-group edit-form-group--full">
                  <label>Specialties (comma-separated)</label>
                  <input
                    type="text"
                    value={editForm.specialties || ''}
                    onChange={e => setEditForm({ ...editForm, specialties: e.target.value })}
                    placeholder="e.g. Residential Wiring, Panel Upgrades"
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions edit-modal-actions">
              <button
                className="btn-signout"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? '⏳ Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="app-nav">
        <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>🏠 Dashboard</button>
        <button className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>💬 Chat</button>
        <button className={`nav-item ${activeTab === 'recommendations' ? 'active' : ''}`} onClick={() => setActiveTab('recommendations')}>🎯 Recommendations</button>
        <button className={`nav-item ${activeTab === 'paycheck' ? 'active' : ''}`} onClick={() => setActiveTab('paycheck')}>💰 Pay Check</button>
        <button className={`nav-item ${activeTab === 'contracts' ? 'active' : ''}`} onClick={() => setActiveTab('contracts')}>📋 Contracts</button>
      </nav>

      <main className="app-content">
        {activeTab === 'dashboard' && <Dashboard workerId={workerId} onSignOut={handleSignOut} />}
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