import React from 'react';
import AppEffects from './AppEffects';
import './Landing.css';

export default function Landing({ onTryNow, onExistingUser }) {
  return (
    <div className="landing-page">
      <AppEffects />

      {/* Left Section — App Info */}
      <div className="landing-left">
        <div className="landing-left-content">

          <div className="landing-logo">
            <img src="/src/assets/logo.png" alt="WiseWorks" className="landing-logo-img" />
            <div>
              <h1 className="landing-brand">
                <span className="logo-wise">WISE</span>
                <span className="logo-works">WORKS</span>
              </h1>
              <p className="landing-tagline">AI Career Agent for Skilled Trades</p>
            </div>
          </div>

          <h2 className="landing-headline">
            Find work that pays<br />
            <span className="landing-highlight">what you're worth.</span>
          </h2>

          <p className="landing-description">
            No resume. No LinkedIn. No forms.
            Just speak — and WiseWorks finds you jobs,
            checks if you're being underpaid, and explains
            contracts in plain language.
          </p>

          <div className="landing-stats">
            <div className="landing-stat">
              <span className="landing-stat-value">300K+</span>
              <span className="landing-stat-label">Trades jobs unfilled in Canada</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-value">$0</span>
              <span className="landing-stat-label">Cost to use WiseWorks</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-value">8 sec</span>
              <span className="landing-stat-label">To build your profile</span>
            </div>
          </div>

          <div className="landing-features">
            <div className="landing-feature">
              <span className="landing-feature-icon">🎙</span>
              <span>Speak your experience — no typing needed</span>
            </div>
            <div className="landing-feature">
              <span className="landing-feature-icon">💰</span>
              <span>Know if a job is underpaying you</span>
            </div>
            <div className="landing-feature">
              <span className="landing-feature-icon">📋</span>
              <span>Understand contracts in plain language</span>
            </div>
            <div className="landing-feature">
              <span className="landing-feature-icon">🎯</span>
              <span>Get matched to jobs that fit your skills</span>
            </div>
          </div>

        </div>
      </div>

      {/* Right Section — CTA */}
      <div className="landing-right">
        <div className="landing-right-content">

          <div className="landing-cta-card">
            <h3 className="landing-cta-title">Ready to start?</h3>
            <p className="landing-cta-subtitle">
              No account needed. Just your voice.
            </p>

            <button className="landing-btn-primary" onClick={onTryNow}>
              <span className="landing-btn-icon">🎙</span>
              <div>
                <span className="landing-btn-label">Try it now</span>
                <span className="landing-btn-sub">No account needed</span>
              </div>
            </button>

            <div className="landing-divider">
              <span>or</span>
            </div>

            <button className="landing-btn-secondary" onClick={onExistingUser}>
              <span className="landing-btn-icon">👤</span>
              <div>
                <span className="landing-btn-label">I already have a profile</span>
                <span className="landing-btn-sub">Continue where you left off</span>
              </div>
            </button>

            <p className="landing-privacy">
              🔒 Your data stays private. We never sell your information.
            </p>
          </div>

          <div className="landing-built-at">
            <span>Built at</span>
            <strong>GenAI Genesis 2026 🇨🇦</strong>
          </div>

        </div>
      </div>

    </div>
  );
}