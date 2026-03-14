import React, { useState } from 'react';
import { chatbotAPI } from '../services/apiService';
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
      const data = await chatbotAPI.searchWorkers(searchQuery);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      console.error('Error searching workers:', err);
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
          <h3>Search Results</h3>
          <div className="results-content">
            {typeof results === 'string' ? (
              <p>{results}</p>
            ) : (
              <pre>{JSON.stringify(results, null, 2)}</pre>
            )}
          </div>
        </div>
      )}

      <div className="suggested-searches">
        <p>Try:</p>
        <button
          onClick={() => setSearchQuery('Electrician with 5+ years experience')}
          className="suggestion"
        >
          Electrician 5+ years
        </button>
        <button
          onClick={() => setSearchQuery('Master plumber in Toronto')}
          className="suggestion"
        >
          Master plumber
        </button>
        <button
          onClick={() => setSearchQuery('HVAC technician with EPA certification')}
          className="suggestion"
        >
          HVAC with EPA cert
        </button>
      </div>
    </div>
  );
}
