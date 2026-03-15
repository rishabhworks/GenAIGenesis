import React, { useState, useEffect } from 'react';
import './Recommendations.css';

export default function Recommendations({ workerId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/chatbot/recommendations/${workerId}`
        );
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        const data = await res.json();
        setRecommendations(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (workerId) fetchRecommendations();
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

      {recommendations && recommendations.length > 0 ? (
        <div className="jobs-grid">
          {recommendations.map((job, index) => (
            <div key={index} className="job-card">
              <div className="job-card-header">
                <h3>{job.title !== 'Unknown Job' ? job.title : `Job ${job.job_id}`}</h3>
                <span className="match-score">
                  {Math.round(job.relevance_score * 100)}% Match
                </span>
              </div>

              <div className="job-card-details">
                <div className="detail-row">
                  <span className="detail-label">🏢 Company:</span>
                  <span className="detail-value">
                    {job.company !== 'Unknown Company' ? job.company : 'See listing'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📍 Location:</span>
                  <span className="detail-value">{job.location}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">💰 Rate:</span>
                  <span className="detail-value">${job.hourly_rate}/hr</span>
                </div>
              </div>

              <button className="apply-button">Apply Now</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-recommendations">
          <p>👀 No recommendations available yet.</p>
          <p>Complete your profile to get personalized job matches!</p>
        </div>
      )}
    </div>
  );
}