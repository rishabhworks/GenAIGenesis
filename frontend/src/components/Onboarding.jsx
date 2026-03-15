import React, { useState } from 'react';
import './Onboarding.css';

const TRADES = [
  'Electrician', 'Plumber', 'HVAC Technician', 'Carpenter', 'Welder',
  'Ironworker', 'Heavy Equipment Operator', 'Construction Labourer',
  'Roofer', 'Painter', 'Mason', 'Pipefitter', 'Mechanic', 'General Contractor',
];

const STEPS = [
  { key: 'name', label: "What's your full name?", type: 'text', placeholder: 'e.g. Carlos Rodriguez' },
  { key: 'email', label: "What's your email address?", type: 'email', placeholder: 'e.g. carlos@email.com' },
  { key: 'phone', label: "What's your phone number?", type: 'tel', placeholder: 'e.g. (416) 555-1234' },
  { key: 'trade', label: 'What is your primary trade?', type: 'select', options: TRADES },
  { key: 'experience_years', label: 'How many years of experience do you have?', type: 'number', placeholder: 'e.g. 5' },
  { key: 'specialties', label: 'What are your specialties? (comma-separated)', type: 'text', placeholder: 'e.g. Residential Wiring, Solar Panel Installation' },
  { key: 'location', label: 'Where are you located?', type: 'text', placeholder: 'e.g. Toronto, Ontario' },
  { key: 'availability', label: 'What is your availability?', type: 'select', options: ['Full-time', 'Part-time'] },
  { key: 'hourly_rate_expectation', label: 'What is your expected hourly rate ($)?', type: 'number', placeholder: 'e.g. 35' },
  { key: 'skill_summary', label: 'Give a brief summary of your skills and experience', type: 'textarea', placeholder: 'e.g. Licensed electrician with 5 years in residential and commercial projects...' },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', trade: '', experience_years: '',
    specialties: '', location: '', availability: '', hourly_rate_expectation: '',
    skill_summary: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  const getValue = () => formData[current.key];

  const isStepValid = () => {
    const val = getValue();
    if (current.type === 'number') return val !== '' && Number(val) >= 0;
    return val !== '';
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [current.key]: e.target.value });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && isStepValid()) {
      e.preventDefault();
      if (isLast) handleSubmit();
      else setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        experience_years: parseInt(formData.experience_years, 10) || 0,
        hourly_rate_expectation: parseFloat(formData.hourly_rate_expectation) || 0,
        specialties: formData.specialties
          ? formData.specialties.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/onboarding/register`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || res.statusText);
      }

      const data = await res.json();
      onComplete(data); // { worker_id, profile, uploaded_to_knowledge_base }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <h1><span className="logo-wise">WISE</span><span className="logo-works">WORKS</span></h1>
          <p>Let's build your professional profile in under a minute</p>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="step-counter">Step {step + 1} of {STEPS.length}</span>

        <div className="question-area">
          <label className="question-label">{current.label}</label>

          {current.type === 'select' ? (
            <select value={getValue()} onChange={handleChange} className="onboarding-input" autoFocus>
              <option value="">— Select —</option>
              {current.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : current.type === 'textarea' ? (
            <textarea
              value={getValue()}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={current.placeholder}
              rows={4}
              className="onboarding-input"
              autoFocus
            />
          ) : (
            <input
              type={current.type}
              value={getValue()}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={current.placeholder}
              className="onboarding-input"
              autoFocus
              min={current.type === 'number' ? 0 : undefined}
            />
          )}
        </div>

        {error && <p className="onboarding-error">⚠️ {error}</p>}

        <div className="onboarding-actions">
          {step > 0 && (
            <button className="btn-back" onClick={() => setStep(step - 1)} disabled={submitting}>
              ← Back
            </button>
          )}

          {isLast ? (
            <button className="btn-next btn-submit" onClick={handleSubmit} disabled={!isStepValid() || submitting}>
              {submitting ? '⏳ Creating Profile...' : '🚀 Create My Profile'}
            </button>
          ) : (
            <button className="btn-next" onClick={() => setStep(step + 1)} disabled={!isStepValid()}>
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
