import React, { useState } from 'react';
import './ContractExplainer.css';

const SAMPLES = [
  { label: 'Non-Compete Clause', text: 'The Employee agrees that for a period of two (2) years following the termination of employment, whether voluntary or involuntary, the Employee shall not directly or indirectly engage in, or have any ownership interest in, or provide services to any business that competes with the Company within a 100-kilometer radius of any Company location.' },
  { label: 'Overtime & Pay', text: 'The Contractor shall be compensated at a rate of $28.00 per hour for regular hours (up to 44 hours per week). Overtime hours shall be compensated at 1.0x the regular rate. The Company reserves the right to adjust compensation rates with 30 days written notice. Benefits are not included in this contract arrangement.' },
  { label: 'Termination Clause', text: 'Either party may terminate this agreement with 5 business days written notice. In the event of termination for cause, including but not limited to safety violations, no notice period shall be required. Upon termination, the Contractor forfeits any accrued but unpaid bonuses, and must return all company equipment within 48 hours at their own expense.' },
];

export default function ContractExplainer() {
  const [contractText, setContractText] = useState('');
  const [language, setLanguage] = useState('simple');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExplain = async (e) => {
    e.preventDefault();
    if (!contractText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/chatbot/explain-contract`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contract_text: contractText, language }) }
      );
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || res.statusText);
      setResult(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contract-container">
      <div className="contract-header">
        <h2>📋 Contract Explainer</h2>
        <p>Paste any employment contract clause and get a plain-language explanation</p>
      </div>

      <form onSubmit={handleExplain} className="contract-form">
        <div className="form-group">
          <label>Contract Text</label>
          <textarea value={contractText} onChange={(e) => setContractText(e.target.value)} placeholder="Paste your contract clause here..." rows={8} required />
        </div>
        <div className="form-group">
          <label>Explanation Level</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="simple">Simple — No legal jargon</option>
            <option value="intermediate">Intermediate — Some legal terms explained</option>
            <option value="detailed">Detailed — Full legal analysis</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="explain-btn">
          {loading ? '⏳ Analyzing...' : '📖 Explain Contract'}
        </button>
      </form>

      <div className="sample-contracts">
        <p className="samples-label">Try a sample:</p>
        <div className="sample-buttons">
          {SAMPLES.map((s, i) => (
            <button key={i} onClick={() => setContractText(s.text)} className="sample-btn">{s.label}</button>
          ))}
        </div>
      </div>

      {error && <div className="contract-error">⚠️ {error}</div>}

      {result && (
        <div className="result-card">
          <div className="result-section">
            <h3>📝 What This Means</h3>
            <p>{result.simplified_explanation}</p>
          </div>
          {result.key_points?.length > 0 && (
            <div className="result-section">
              <h3>🔑 Key Points</h3>
              <ul>{result.key_points.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </div>
          )}
          {result.potential_risks?.length > 0 && (
            <div className="result-section risks">
              <h3>⚠️ Potential Risks</h3>
              <ul className="risk-list">{result.potential_risks.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}
          {result.recommendations?.length > 0 && (
            <div className="result-section recommendations">
              <h3>💡 Recommendations</h3>
              <ul>{result.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
