import React from 'react';
import './Resume.css';

export default function Resume({ profile, workerId }) {
  if (!profile) return null;

  const specialties = Array.isArray(profile.specialties)
    ? profile.specialties
    : (profile.specialties || '').split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="resume-container">
      <div className="resume-sheet">
        {/* Header */}
        <div className="resume-top">
          <div className="resume-avatar">
            {(profile.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="resume-title-block">
            <h1 className="resume-name">{profile.name}</h1>
            <h2 className="resume-trade">{profile.trade}</h2>
            <p className="resume-tagline">{profile.availability} &middot; {profile.location}</p>
          </div>
        </div>

        {/* Contact */}
        <section className="resume-section">
          <h3 className="section-heading">Contact</h3>
          <div className="contact-grid">
            <span>📧 {profile.email}</span>
            <span>📱 {profile.phone}</span>
            <span>📍 {profile.location}</span>
          </div>
        </section>

        {/* Summary */}
        <section className="resume-section">
          <h3 className="section-heading">Professional Summary</h3>
          <p className="summary-text">
            {profile.skill_summary || `Experienced ${profile.trade} with ${profile.experience_years} years in the trade.`}
          </p>
        </section>

        {/* Experience */}
        <section className="resume-section">
          <h3 className="section-heading">Experience</h3>
          <div className="experience-row">
            <span className="exp-years">{profile.experience_years} years</span>
            <span className="exp-trade">in {profile.trade}</span>
          </div>
        </section>

        {/* Specialties */}
        {specialties.length > 0 && (
          <section className="resume-section">
            <h3 className="section-heading">Specialties &amp; Certifications</h3>
            <div className="tag-list">
              {specialties.map((s, i) => (
                <span key={i} className="tag">{s}</span>
              ))}
            </div>
          </section>
        )}

        {/* Rate & Availability */}
        <section className="resume-section">
          <h3 className="section-heading">Rate &amp; Availability</h3>
          <div className="rate-grid">
            <div className="rate-card">
              <span className="rate-value">${profile.hourly_rate_expectation}/hr</span>
              <span className="rate-label">Expected Rate</span>
            </div>
            <div className="rate-card">
              <span className="rate-value">{profile.availability}</span>
              <span className="rate-label">Availability</span>
            </div>
          </div>
        </section>

        <div className="resume-footer">
          <span>Worker ID: {workerId}</span>
          <span>Profile stored in TradePass AI Knowledge Base</span>
        </div>
      </div>
    </div>
  );
}
