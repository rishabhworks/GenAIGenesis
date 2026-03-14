import React, { useState } from 'react';
import { chatbotAPI } from '../services/apiService';
import './PayCheck.css';

export default function PayCheck() {
  const [trade, setTrade] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [location, setLocation] = useState('Ontario, Canada');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trades = [
    'Electrician', 'Plumber', 'HVAC Technician', 'Carpenter', 'Welder',
    'Ironworker', 'Heavy Equipment Operator', 'Construction Laborer',
    'Roofer', 'Painter', 'Mason', 'Pipefitter', 'General Contractor', 'Mechanic'
  ];

  const locations = [
    'Ontario, Canada', 'British Columbia, Canada', 'Alberta, Canada',
    'Quebec, Canada', 'Manitoba, Canada', 'Saskatchewan, Canada', 'Canada'
  ];

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!trade || !hourlyRate) return;

    try {
      setLoading(true);
      setError(null);
      const data = await chatbotAPI.checkPayFairness(trade, parseFloat(hourlyRate), location);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'underpaid': return '#e74c3c';
      case 'slightly_underpaid': return '#f39c12';
      case 'fair': return '#27ae60';
      case 'competitive': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'underpaid': return '🚨';
      case 'slightly_underpaid': return '⚠️';
      case 'fair': return '✅';
      case 'competitive': return '🌟';
      default: return '❓';
    }
  };

  return (
    <div className="paycheck-container">
      <div className="paycheck-header">
        <h2>💰 Pay Fairness Check</h2>
        <p>Check if a job offer is paying a fair market rate using AI analysis</p>
        <span className="powered-by">Powered by Moorcheh AI + Canadian Wage Data</span>
      </div>

      <form onSubmit={handleCheck} className="paycheck-form">
        <div className="form-group">
          <label htmlFor="trade">Trade / Occupation</label>
          <select
            id="trade"
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            required
          >
            <option value="">Select your trade...</option>
            {trades.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="rate">Offered Hourly Rate (CAD)</label>
          <div className="rate-input">
            <span className="currency">$</span>
            <input
              id="rate"
              type="number"
              step="0.50"
              min="0"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="e.g., 30.00"
              required
            />
            <span className="per-hour">/hr</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading} className="check-button">
          {loading ? '⏳ Analyzing...' : '🔍 Check Pay Fairness'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="result-card" style={{ borderColor: getStatusColor(result.status) }}>
          <div className="result-header">
            <span className="status-icon">{getStatusIcon(result.status)}</span>
            <h3 style={{ color: getStatusColor(result.status) }}>
              {result.status === 'underpaid' && 'Underpaid — Below Market Rate'}
              {result.status === 'slightly_underpaid' && 'Slightly Below Market'}
              {result.status === 'fair' && 'Fair Market Rate'}
              {result.status === 'competitive' && 'Competitive — Above Market!'}
              {!['underpaid', 'slightly_underpaid', 'fair', 'competitive'].includes(result.status) && result.status}
            </h3>
          </div>

          <div className="result-details">
            <div className="detail-row">
              <span className="label">Your Rate:</span>
              <span className="value">${result.hourly_rate?.toFixed(2)}/hr</span>
            </div>
            {result.market_rate > 0 && (
              <div className="detail-row">
                <span className="label">Market Average:</span>
                <span className="value">${result.market_rate?.toFixed(2)}/hr</span>
              </div>
            )}
            {result.difference_percentage !== undefined && result.difference_percentage !== 0 && (
              <div className="detail-row">
                <span className="label">Difference:</span>
                <span className="value" style={{ color: getStatusColor(result.status) }}>
                  {result.difference_percentage > 0 ? '+' : ''}{result.difference_percentage?.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          <div className="recommendation">
            <p>{result.recommendation}</p>
          </div>

          {result.alert && (
            <div className="alert-banner">
              🚨 <strong>Alert:</strong> This pay rate is significantly below market value. Consider negotiating or exploring other opportunities.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
