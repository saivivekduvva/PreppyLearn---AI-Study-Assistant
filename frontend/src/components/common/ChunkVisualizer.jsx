import React, { useState, useEffect } from 'react';
import { Loader2, Layers, AlertCircle, Maximize2, Database } from 'lucide-react';
import { generateSemanticChunks } from '../../services/api';
import EmbeddingDebugger from './EmbeddingDebugger';

const ChunkVisualizer = ({ text, onComplete }) => {
  const [chunks, setChunks] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDebugger, setShowDebugger] = useState(false);
  
  // RAG Configuration Settings
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(200);

  const processText = async () => {
    if (!text) return;
    setLoading(true);
    setError('');
    
    try {
      const response = await generateSemanticChunks(text, chunkSize, chunkOverlap);
      setChunks(response.data.chunks);
      setMetadata(response.data.metadata);
      setLoading(false);
      if (onComplete) onComplete(response.data.chunks.length);
    } catch (err) {
      setError(err.message || "Failed to generate chunks.");
      setLoading(false);
    }
  };

  // Run chunking automatically when component mounts with text
  useEffect(() => {
    processText();
  }, [text]);

  if (loading) {
    return (
      <div className="w-full p-8 border border-slate-200 rounded-2xl bg-white shadow-xl flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-700 font-medium">Running Semantic Chunker...</p>
        <p className="text-sm text-slate-400 mt-2">Splitting document into context-aware chunks for Vector Database</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 border border-red-200 rounded-2xl bg-red-50 shadow-xl flex flex-col items-center justify-center min-h-[300px]">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-red-700 font-semibold mb-2">Chunking Failed</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button 
          onClick={processText}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="w-full border border-slate-200 rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col transform transition-all hover:shadow-2xl">
      <div className="px-6 py-4 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h4 className="font-semibold text-white">Semantic Chunks</h4>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
          <span className="bg-indigo-500/20 text-indigo-200 px-3 py-1 rounded-full border border-indigo-500/30">
            {chunks.length} Chunks Generated
          </span>
          <div className="h-4 w-px bg-slate-700"></div>
          <span>Size: {chunkSize}</span>
          <span>Overlap: {chunkOverlap}</span>
        </div>
      </div>
      
      <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-600">
          These cohesive chunks are ready to be converted into <strong className="text-slate-800">Vector Embeddings</strong>. The overlap ensures context isn't lost between boundaries.
        </p>
        <div className="flex gap-2">
          <button 
            onClick={processText}
            className="text-xs font-bold px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors shadow-sm whitespace-nowrap"
          >
            Re-Process Chunks
          </button>
          {!showDebugger && chunks.length > 0 && (
            <button 
              onClick={() => setShowDebugger(true)}
              className="text-xs font-bold px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              Generate Vectors
            </button>
          )}
        </div>
      </div>

      <div className="p-6 h-[500px] overflow-y-auto bg-slate-100 custom-scrollbar flex flex-col gap-5 shadow-inner">
        {chunks.map((chunk, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative group hover:shadow-md transition-shadow">
            {/* Visual Indicator for Chunk */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-400 rounded-l-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">
                Chunk {index + 1}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                <Maximize2 className="w-3 h-3" />
                {metadata[index]?.length || chunk.length} chars
              </span>
            </div>
            
            <p className="text-sm text-slate-700 leading-relaxed font-serif">
              {chunk}
            </p>
          </div>
        ))}
      </div>
    </div>
    
    {showDebugger && chunks.length > 0 && (
      <div className="animate-fadeIn w-full" style={{ animationDelay: '0.1s' }}>
        <EmbeddingDebugger chunks={chunks} />
      </div>
    )}
    </>
  );
};

export default ChunkVisualizer;
