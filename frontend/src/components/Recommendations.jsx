import React, { useState, useEffect } from 'react';
import { chatbotAPI } from '../services/apiService';
import './Recommendations.css';

export default function Recommendations({ workerId }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await chatbotAPI.getRecommendations(workerId);
        setRecommendations(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.detail || err.message);
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    if (workerId) {
      fetchRecommendations();
    }
  }, [workerId]);

  if (loading) {
    return (
      <div className="recommendations-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your job recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h2>🎯 Your Job Recommendations</h2>
        <p>Personalized positions that match your skills</p>
      </div>

      {error && (
        <div className="error-message">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {recommendations && recommendations.recommendations ? (
        <div className="jobs-grid">
          {recommendations.recommendations.map((job, index) => (
            <div key={index} className="job-card">
              <div className="job-card-header">
                <h3>{job.title}</h3>
                <span className="match-score">{job.match_percentage || '85'}% Match</span>
              </div>

              <div className="job-card-details">
                <div className="detail-row">
                  <span className="detail-label">🏢 Company:</span>
                  <span className="detail-value">{job.company || 'Not specified'}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">📍 Location:</span>
                  <span className="detail-value">{job.location || 'Not specified'}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">💰 Rate:</span>
                  <span className="detail-value">${job.hourly_rate || 'TBD'}/hr</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">⏰ Experience:</span>
                  <span className="detail-value">{job.required_experience_years || '0'}+ years</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">📋 Type:</span>
                  <span className="detail-value">{job.job_type || 'Full-time'}</span>
                </div>
              </div>

              {job.description && (
                <div className="job-description">
                  <p>{job.description}</p>
                </div>
              )}

              {job.required_certifications && job.required_certifications.length > 0 && (
                <div className="certifications">
                  <p className="cert-label">Required Certifications:</p>
                  <div className="cert-badges">
                    {job.required_certifications.map((cert, idx) => (
                      <span key={idx} className="cert-badge">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button className="apply-button">Apply Now</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-recommendations">
          <p>👀 No recommendations available yet.</p>
          <p>Try asking the chatbot about job opportunities!</p>
        </div>
      )}
    </div>
  );
}
