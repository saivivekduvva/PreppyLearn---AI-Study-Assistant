import React, { useState, useEffect } from 'react';
import { getVectorCount, generateEmbeddings, searchVectorStore } from '../../services/api';

const VectorDbDebugPanel = () => {
  const [count, setCount] = useState(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [countError, setCountError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Fetch count on mount
  useEffect(() => {
    fetchCount();
  }, []);

  const fetchCount = async () => {
    setLoadingCount(true);
    setCountError(null);
    try {
      const data = await getVectorCount();
      if (data.status === 'success') {
        setCount(data.count);
      }
    } catch (err) {
      setCountError(err.message);
    } finally {
      setLoadingCount(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoadingSearch(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      // 1. Get embeddings for the query
      const embeddingsData = await generateEmbeddings([searchQuery]);
      
      let query_embeddings = embeddingsData;
      if (embeddingsData?.data?.embeddings) {
          query_embeddings = embeddingsData.data.embeddings;
      } else if (embeddingsData?.embeddings) {
          query_embeddings = embeddingsData.embeddings;
      }
      
      if (!Array.isArray(query_embeddings) || query_embeddings.length === 0) {
          throw new Error("Invalid embeddings response from server.");
      }

      // 2. Search vector store
      const searchData = await searchVectorStore(query_embeddings, 5);
      if (searchData.status === 'success') {
        setSearchResults(searchData.results);
      } else {
        throw new Error("Search failed.");
      }

    } catch (err) {
      setSearchError(err.message || "An error occurred during search.");
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem', textAlign: 'left', border: '1px solid #334155', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#e2e8f0', margin: 0, fontWeight: '600' }}>
          <span style={{ marginRight: '8px' }}>🔍</span> Vector DB Debug Panel
        </h3>
        
        <div style={{ background: '#1e293b', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <span style={{ color: '#94a3b8' }}>Stored Chunks:</span>
          {loadingCount ? (
            <span style={{ color: '#fbbf24' }}>Loading...</span>
          ) : countError ? (
            <span style={{ color: '#f87171' }} title={countError}>Error</span>
          ) : (
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{count !== null ? count : 'N/A'}</span>
          )}
          <button 
            onClick={fetchCount}
            style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '0 4px' }}
            title="Refresh Count"
          >
            ↻
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Test similarity search... (e.g. 'What is machine learning?')"
          style={{ 
            flex: 1, 
            padding: '0.75rem 1rem', 
            borderRadius: '8px', 
            border: '1px solid #334155', 
            background: '#0f172a',
            color: '#f8fafc',
            outline: 'none',
            fontSize: '0.95rem'
          }}
        />
        <button 
          type="submit" 
          disabled={loadingSearch || !searchQuery.trim()}
          style={{
            padding: '0 1.5rem',
            background: loadingSearch || !searchQuery.trim() ? '#334155' : '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: loadingSearch || !searchQuery.trim() ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            transition: 'background 0.2s'
          }}
        >
          {loadingSearch ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searchError && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ⚠️ {searchError}
        </div>
      )}

      {searchResults && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Results ({searchResults.length})
          </h4>
          
          {searchResults.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.95rem', fontStyle: 'italic' }}>No similar chunks found.</p>
          ) : (
            searchResults.map((result, idx) => (
              <div key={result.id || idx} style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>ID: {result.id}</span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.2rem 0.5rem', 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    color: '#34d399', 
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}>
                    Score: {result.similarity_score !== null ? result.similarity_score.toFixed(4) : 'N/A'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {result.document}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default VectorDbDebugPanel;
