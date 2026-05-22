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
    <div className="w-full premium-card overflow-hidden flex flex-col mt-4">
      <div className="px-8 py-6 bg-white flex flex-col sm:flex-row items-center justify-between border-b border-neutral-200">
        <h3 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
          <span className="p-3 bg-neutral-100 rounded-xl text-neutral-800">🔍</span> Vector DB Debug Panel
        </h3>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0 bg-neutral-50 px-5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold">
          <span className="text-neutral-500 tracking-wide">Stored Chunks:</span>
          {loadingCount ? (
            <span className="text-neutral-900">Loading...</span>
          ) : countError ? (
            <span className="text-red-500" title={countError}>Error</span>
          ) : (
            <span className="text-neutral-900">{count !== null ? count : 'N/A'}</span>
          )}
          <button 
            onClick={fetchCount}
            className="text-neutral-900 hover:text-neutral-500 transition-colors ml-2 font-bold text-lg"
            title="Refresh Count"
          >
            ↻
          </button>
        </div>
      </div>

      <div className="px-8 py-6 bg-neutral-50 border-b border-neutral-200">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Test similarity search... (e.g. 'What is machine learning?')"
            className="flex-1 px-5 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all shadow-sm"
          />
          <button 
            type="submit" 
            disabled={loadingSearch || !searchQuery.trim()}
            className="premium-btn whitespace-nowrap bg-neutral-900 hover:bg-black text-white"
          >
            {loadingSearch ? 'Searching...' : 'Search Vectors'}
          </button>
        </form>
      </div>

      <div className="p-8 h-[450px] overflow-y-auto bg-white custom-scrollbar flex flex-col gap-6 text-left">
        {searchError && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">
            ⚠️ {searchError}
          </div>
        )}

        {searchResults && (
          <div className="flex flex-col gap-6 w-full">
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">
              Results ({searchResults.length})
            </h4>
            
            {searchResults.length === 0 ? (
              <p className="text-neutral-500 italic pl-1">No similar chunks found.</p>
            ) : (
              searchResults.map((result, idx) => (
                <div key={result.id || idx} className="bg-neutral-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-neutral-800 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-semibold text-neutral-500 font-mono bg-white px-3 py-1.5 rounded-lg border border-neutral-200">
                      ID: {result.id}
                    </span>
                    <span className="text-xs font-bold px-3 py-1.5 bg-neutral-200/50 text-neutral-900 rounded-lg">
                      Score: {result.similarity_score !== null ? result.similarity_score.toFixed(4) : 'N/A'}
                    </span>
                  </div>
                  <p className="text-base text-neutral-900 leading-relaxed font-sans">
                    {result.document}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VectorDbDebugPanel;
