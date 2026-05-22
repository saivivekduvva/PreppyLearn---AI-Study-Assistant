import React, { useState, useEffect } from 'react';
import { Loader2, FileText, AlertCircle, FileDigit } from 'lucide-react';
import { extractPdfText } from '../../services/api';

const PdfPreview = ({ filename, onTextExtracted }) => {
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
          if (onTextExtracted) {
            onTextExtracted(response.data.text);
          }
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
      <div className="w-full p-10 premium-card flex flex-col items-center justify-center animate-pulse min-h-[300px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-700 font-medium text-lg">Extracting text from document...</p>
        <p className="text-sm text-slate-500 mt-2">This might take a few seconds for larger PDFs.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-10 premium-card flex flex-col items-center justify-center min-h-[300px]">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-red-700 font-bold text-lg mb-2">Extraction Failed</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full premium-card overflow-hidden flex flex-col">
        <div className="px-8 py-6 bg-white flex flex-col sm:flex-row items-center justify-between border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neutral-100 text-neutral-800 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xl text-neutral-900 tracking-tight">Document Preview</h4>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-600 bg-neutral-100 px-4 py-2 rounded-xl">
              <FileDigit className="w-4 h-4" />
              {stats.length.toLocaleString()} chars
            </div>
          </div>
        </div>
      
      <div className="p-8 h-[450px] overflow-y-auto bg-white custom-scrollbar text-left">
        {text ? (
          <div className="prose prose-slate max-w-none">
            <pre className="text-base text-neutral-800 whitespace-pre-wrap font-sans leading-relaxed bg-transparent p-0 border-none m-0">
              {text}
            </pre>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-neutral-500 italic text-center text-lg">
            No text could be extracted from this document. It might be an image-only PDF.
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfPreview;
