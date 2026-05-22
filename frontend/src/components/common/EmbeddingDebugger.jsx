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
      <div className="w-full p-8 border border-slate-200 rounded-2xl bg-white shadow-xl flex flex-col items-center justify-center min-h-[300px] mt-10">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-700 font-medium">Loading AI Model & Generating Vectors...</p>
        <p className="text-sm text-slate-400 mt-2 text-center max-w-md leading-relaxed">
          The <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-600 mx-1">all-MiniLM-L6-v2</code> transformer model is converting your human text chunks into high-density mathematical vectors.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 border border-red-200 rounded-2xl bg-red-50 shadow-xl flex flex-col items-center justify-center min-h-[300px] mt-10">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-red-700 font-semibold mb-2">Embedding Generation Failed</p>
        <p className="text-red-500 text-sm mb-4 text-center max-w-md">{error}</p>
        <button 
          onClick={processEmbeddings}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full border border-slate-200 rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col mt-10 transform transition-all hover:shadow-2xl">
      <div className="px-6 py-4 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <h4 className="font-semibold text-white">Vector Embeddings Debugger</h4>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
          <span className="bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5" />
            Model: {metadata?.model}
          </span>
          <div className="h-4 w-px bg-slate-700"></div>
          <span className="flex items-center gap-1">
            <Hash className="w-3.5 h-3.5" />
            Dimension: {metadata?.vector_dimension}d
          </span>
        </div>
      </div>

      <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-600">
          Successfully converted <strong className="text-slate-800">{metadata?.total_chunks_processed} chunks</strong> into {metadata?.vector_dimension}-dimensional high-density floating-point vectors. These vectors map semantic meaning to math.
        </p>
        <div className="flex gap-2">
          {storeSuccess ? (
             <span className="text-sm text-emerald-600 font-bold flex items-center gap-1 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200"><Database className="w-4 h-4"/> Saved to DB!</span>
          ) : (
            <button
               onClick={handleStore}
               disabled={storing || embeddings.length === 0}
               className="text-xs font-bold px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap flex items-center gap-1.5"
            >
               {storing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
               {storing ? 'Saving...' : 'Save to Vector DB'}
            </button>
          )}
        </div>
      </div>

      <div className="p-6 h-[500px] overflow-y-auto bg-slate-100 custom-scrollbar flex flex-col gap-5 shadow-inner">
        {embeddings.map((vector, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative group overflow-hidden hover:shadow-md transition-shadow">
            {/* Visual Indicator */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-400 rounded-l-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded">
                Vector {index + 1}
              </span>
              <span className="text-[11px] text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center gap-1">
                Preview: [{vector[0].toFixed(3)}, {vector[1].toFixed(3)}, {vector[2].toFixed(3)}...]
              </span>
            </div>
            
            <div className="bg-slate-900 rounded-lg p-5 overflow-x-auto custom-scrollbar">
              <p className="text-xs text-emerald-400 font-mono leading-relaxed whitespace-nowrap opacity-90 tracking-tight">
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
