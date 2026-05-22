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
      <div className="w-full p-10 premium-card flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-800 font-semibold text-lg">Running Semantic Chunker...</p>
        <p className="text-sm text-slate-500 mt-2">Splitting document into context-aware chunks for Vector Database</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-10 premium-card flex flex-col items-center justify-center min-h-[300px] border-red-200 bg-red-50/50">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-red-700 font-bold text-lg mb-2">Chunking Failed</p>
        <p className="text-red-600 text-sm mb-6">{error}</p>
        <button 
          onClick={processText}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="w-full premium-card overflow-hidden flex flex-col mt-2">
      <div className="px-8 py-6 bg-white flex flex-col sm:flex-row items-center justify-between border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-neutral-100 text-neutral-800 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-xl text-neutral-900 tracking-tight">Semantic Chunks</h4>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold text-neutral-600 mt-4 sm:mt-0">
          <span className="bg-neutral-100 text-neutral-800 px-4 py-2 rounded-xl">
            {chunks.length} Chunks Generated
          </span>
          <div className="h-5 w-px bg-neutral-200"></div>
          <span>Size: {chunkSize}</span>
          <span>Overlap: {chunkOverlap}</span>
        </div>
      </div>
      
      <div className="px-8 py-6 bg-neutral-50 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-base text-neutral-600 leading-relaxed max-w-2xl text-left">
          These cohesive chunks are ready to be converted into <strong className="text-neutral-900">Vector Embeddings</strong>. The overlap ensures context isn't lost between boundaries.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={processText}
            className="text-sm font-semibold px-5 py-2.5 bg-white text-neutral-900 rounded-xl hover:bg-neutral-50 transition-colors border border-neutral-200 shadow-sm whitespace-nowrap"
          >
            Re-Process
          </button>
          {!showDebugger && chunks.length > 0 && (
            <button 
              onClick={() => setShowDebugger(true)}
              className="premium-btn flex items-center gap-2 bg-neutral-900 hover:bg-black text-white"
            >
              <Database className="w-4 h-4" />
              Generate Vectors
            </button>
          )}
        </div>
      </div>

      <div className="p-8 h-[450px] overflow-y-auto bg-white custom-scrollbar flex flex-col gap-6 text-left">
        {chunks.map((chunk, index) => (
          <div key={index} className="bg-neutral-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-neutral-800 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-widest bg-neutral-200/50 px-3 py-1.5 rounded-lg">
                Chunk {index + 1}
              </span>
              <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-neutral-200">
                <Maximize2 className="w-3.5 h-3.5" />
                {metadata[index]?.length || chunk.length} chars
              </span>
            </div>
            
            <p className="text-base text-neutral-800 leading-relaxed font-sans">
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
