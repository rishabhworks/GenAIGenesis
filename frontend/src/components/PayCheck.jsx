import React, { useState } from 'react';
import './PayCheck.css';

const TRADES = [
  'Electrician', 'Plumber', 'HVAC Technician', 'Carpenter', 'Welder',
  'Ironworker', 'Heavy Equipment Operator', 'Construction Labourer',
  'Roofer', 'Painter', 'Mason', 'Pipefitter', 'Mechanic', 'General Contractor',
];

const LOCATIONS = ['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 'Saskatchewan', 'Nova Scotia'];

export default function PayCheck() {
  const [trade, setTrade] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [location, setLocation] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!trade || !hourlyRate || !location) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/pay/check`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trade, hourly_rate: parseFloat(hourlyRate), location }),
        }
      );
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || res.statusText);
      setResult(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    underpaid: '#dc2626',
    slightly_underpaid: '#f59e0b',
    fair: '#16a34a',
    competitive: '#059669',
  };

  const statusIcon = {
    underpaid: '🔴',
    slightly_underpaid: '🟡',
    fair: '🟢',
    competitive: '🌟',
  };

  return (
    <div className="paycheck-container">
      <div className="paycheck-header">
        <h2>💰 Pay Fairness Check</h2>
        <p>See how your rate compares to market averages</p>
      </div>

      <form onSubmit={handleCheck} className="paycheck-form">
        <div className="form-row">
          <div className="form-group">
            <label>Trade</label>
            <select value={trade} onChange={(e) => setTrade(e.target.value)} required>
              <option value="">Select trade</option>
              {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Your Hourly Rate ($)</label>
            <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="e.g. 30" min="0" step="0.5" required />
          </div>
          <div className="form-group">
            <label>Location</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} required>
              <option value="">Select location</option>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading} className="check-btn">
          {loading ? '⏳ Checking...' : '📊 Check My Pay'}
        </button>
      </form>

      {error && <div className="paycheck-error">⚠️ {error}</div>}

      {result && (
        <div className="paycheck-result" style={{ borderColor: statusColor[result.status] || '#ccc' }}>
          <div className="result-status" style={{ color: statusColor[result.status] }}>
            {statusIcon[result.status]} {result.status?.replace('_', ' ').toUpperCase()}
          </div>
          <div className="result-grid">
            <div className="result-item">
              <span className="result-label">Your Rate</span>
              <span className="result-value">${result.hourly_rate}/hr</span>
            </div>
            <div className="result-item">
              <span className="result-label">Market Rate</span>
              <span className="result-value">${result.market_rate}/hr</span>
            </div>
            <div className="result-item">
              <span className="result-label">Difference</span>
              <span className="result-value" style={{ color: result.difference_percentage < 0 ? '#dc2626' : '#16a34a' }}>
                {result.difference_percentage > 0 ? '+' : ''}{result.difference_percentage?.toFixed(1)}%
              </span>
            </div>
          </div>
          {result.alert && <div className="result-alert">⚠️ Your pay is significantly below market rate</div>}
          {result.recommendation && <p className="result-rec">{result.recommendation}</p>}
        </div>
      )}
    </div>
  );
}
