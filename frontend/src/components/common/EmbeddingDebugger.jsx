import React, { useState, useEffect } from 'react';
import { Loader2, Database, AlertCircle, Hash, Box } from 'lucide-react';
import { generateEmbeddings, storeEmbeddings } from '../../services/api';

const EmbeddingDebugger = ({ chunks }) => {
  const [embeddings, setEmbeddings] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [storing, setStoring] = useState(false);
  const [storeSuccess, setStoreSuccess] = useState(false);

  const handleStore = async () => {
    setStoring(true);
    setError('');
    try {
      const ids = chunks.map((_, i) => `chunk_${Date.now()}_${i}`);
      const metas = chunks.map((_, i) => ({ source: "uploaded_doc", chunk_index: i }));
      
      await storeEmbeddings(ids, embeddings, chunks, metas);
      setStoreSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to store in Vector DB.");
    } finally {
      setStoring(false);
    }
  };

  const processEmbeddings = async () => {
    if (!chunks || chunks.length === 0) return;
    setLoading(true);
    setError('');
    
    try {
      const response = await generateEmbeddings(chunks);
      setEmbeddings(response.data.embeddings);
      setMetadata(response.data.metadata);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to generate embeddings.");
      setLoading(false);
    }
  };

  useEffect(() => {
    processEmbeddings();
  }, [chunks]);

  if (loading) {
    return (
      <div className="w-full p-10 premium-card flex flex-col items-center justify-center min-h-[300px] mt-6">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-800 font-semibold text-lg">Loading AI Model & Generating Vectors...</p>
        <p className="text-sm text-slate-500 mt-2 text-center max-w-md">
          The <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-600 mx-1">all-MiniLM-L6-v2</code> model is converting text into high-density mathematical vectors.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-10 premium-card flex flex-col items-center justify-center min-h-[300px] mt-6 border-red-200 bg-red-50/50">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-red-700 font-bold text-lg mb-2">Embedding Generation Failed</p>
        <p className="text-red-600 text-sm mb-6 text-center max-w-md">{error}</p>
        <button 
          onClick={processEmbeddings}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full premium-card overflow-hidden flex flex-col mt-6">
      <div className="px-8 py-6 bg-white flex flex-col sm:flex-row items-center justify-between border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-neutral-100 text-neutral-800 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-xl text-neutral-900 tracking-tight">Vector Embeddings Debugger</h4>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold text-neutral-600 mt-4 sm:mt-0">
          <span className="bg-neutral-100 text-neutral-800 px-4 py-2 rounded-xl flex items-center gap-2">
            <Box className="w-4 h-4" />
            Model: {metadata?.model}
          </span>
          <div className="h-5 w-px bg-neutral-200"></div>
          <span className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Dimension: {metadata?.vector_dimension}d
          </span>
        </div>
      </div>

      <div className="px-8 py-6 bg-neutral-50 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-base text-neutral-600 leading-relaxed max-w-2xl text-left">
          Successfully converted <strong className="text-neutral-900">{metadata?.total_chunks_processed} chunks</strong> into {metadata?.vector_dimension}-dimensional high-density floating-point vectors.
        </p>
        <div className="flex gap-3">
          {storeSuccess ? (
             <span className="text-sm text-neutral-800 font-bold flex items-center gap-2 px-5 py-2.5 bg-neutral-200/50 rounded-xl"><Database className="w-4 h-4"/> Saved to DB!</span>
          ) : (
            <button
               onClick={handleStore}
               disabled={storing || embeddings.length === 0}
               className="premium-btn flex items-center gap-2 bg-neutral-900 hover:bg-black text-white"
            >
               {storing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
               {storing ? 'Saving...' : 'Save to Vector DB'}
            </button>
          )}
        </div>
      </div>

      <div className="p-8 h-[450px] overflow-y-auto bg-white custom-scrollbar flex flex-col gap-6 text-left">
        {embeddings.map((vector, index) => (
          <div key={index} className="bg-neutral-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-neutral-800 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-widest bg-neutral-200/50 px-3 py-1.5 rounded-lg">
                Vector {index + 1}
              </span>
              <span className="text-xs font-semibold text-neutral-500 font-mono bg-white px-3 py-1.5 rounded-lg border border-neutral-200 flex items-center gap-1">
                Preview: [{vector[0].toFixed(3)}, {vector[1].toFixed(3)}, {vector[2].toFixed(3)}...]
              </span>
            </div>
            
            <div className="bg-neutral-200/40 rounded-xl p-6 overflow-x-auto custom-scrollbar border border-neutral-200/60">
              <p className="text-xs text-neutral-600 font-mono leading-relaxed whitespace-nowrap opacity-90 tracking-tight">
                {JSON.stringify(vector)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmbeddingDebugger;
