import React, { useState } from 'react';
import './WorkerSearch.css';

export default function WorkerSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setResults(null);

      const url = new URL(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/chatbot/search-workers`
      );
      url.searchParams.append('query', searchQuery);
      url.searchParams.append('top_k', '5');

      const res = await fetch(url.toString(), { method: 'POST' });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="worker-search-container">
      <div className="search-header">
        <h2>🔍 Worker Search</h2>
        <p>Find workers with specific skills and experience</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by skills, trade, experience... e.g., 'electrician with 5+ years'"
          className="search-input"
        />
        <button type="submit" disabled={loading} className="search-button">
          {loading ? '⏳ Searching...' : '🔍 Search'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {results && (
        <div className="search-results">
          <h3>Search Results ({results.result_count || 0} found)</h3>
          <div className="results-content">
            {results.results && results.results.length > 0 ? (
              results.results.map((r, i) => (
                <div key={i} style={{
                  padding: '12px 0',
                  borderBottom: '1px solid #1A2535',
                  color: '#A0B0C0',
                  fontSize: '0.875rem',
                  lineHeight: '1.6'
                }}>
                  <p style={{ color: '#22A8BE', fontWeight: '600', marginBottom: '4px' }}>
                    Worker {r.worker_id?.slice(0, 8) || i + 1}
                  </p>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{r.text}</p>
                </div>
              ))
            ) : (
              <p style={{ color: '#3A4F65' }}>No workers found matching your search.</p>
            )}
          </div>
        </div>
      )}

      <div className="suggested-searches">
        <p>Try:</p>
        <button onClick={() => setSearchQuery('Electrician with 5+ years experience')} className="suggestion">
          Electrician 5+ years
        </button>
        <button onClick={() => setSearchQuery('Master plumber in Toronto')} className="suggestion">
          Master plumber
        </button>
        <button onClick={() => setSearchQuery('HVAC technician with EPA certification')} className="suggestion">
          HVAC with EPA cert
        </button>
      </div>
    </div>
  );
}