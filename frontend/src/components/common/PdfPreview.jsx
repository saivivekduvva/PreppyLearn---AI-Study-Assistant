import React, { useState, useEffect } from 'react';
import { Loader2, FileText, AlertCircle, FileDigit, Layers } from 'lucide-react';
import { extractPdfText } from '../../services/api';
import ChunkVisualizer from './ChunkVisualizer';

const PdfPreview = ({ filename }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ length: 0 });
  const [showChunker, setShowChunker] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchText = async () => {
      if (!filename) return;
      
      setLoading(true);
      setError('');
      
      try {
        const response = await extractPdfText(filename);
        if (isMounted) {
          setText(response.data.text);
          setStats({ length: response.data.length });
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to extract text.");
          setLoading(false);
        }
      }
    };

    fetchText();
    
    return () => {
      isMounted = false;
    };
  }, [filename]);

  if (loading) {
    return (
      <div className="w-full p-8 border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center animate-pulse min-h-[300px]">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Extracting text from document...</p>
        <p className="text-sm text-slate-400 mt-2">This might take a few seconds for larger PDFs.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 border border-red-200 rounded-xl bg-red-50 flex flex-col items-center justify-center min-h-[300px]">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-red-700 font-semibold mb-2">Extraction Failed</p>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="w-full border border-slate-200 rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col transform transition-all hover:shadow-2xl">
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-500" />
            <h4 className="font-semibold text-slate-700">Document Preview</h4>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-200/50 px-3 py-1.5 rounded-full border border-slate-200">
              <FileDigit className="w-3.5 h-3.5" />
              {stats.length.toLocaleString()} chars
            </div>
            
            {text && !showChunker && (
              <button 
                onClick={() => setShowChunker(true)}
                className="text-xs font-bold px-4 py-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                Chunk for AI
              </button>
            )}
          </div>
        </div>
      
      <div className="p-8 h-[500px] overflow-y-auto bg-white custom-scrollbar text-left border-t border-slate-100 shadow-inner">
        {text ? (
          <div className="prose prose-slate max-w-none">
            <pre className="text-sm md:text-base text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-transparent p-0 border-none m-0">
              {text}
            </pre>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 italic text-center">
            No text could be extracted from this document. It might be an image-only PDF.
          </div>
        )}
      </div>
    </div>
    
    {showChunker && text && (
      <div className="animate-fadeIn w-full" style={{ animationDelay: '0.1s' }}>
        <ChunkVisualizer text={text} />
      </div>
    )}
    </div>
  );
};

export default PdfPreview;
