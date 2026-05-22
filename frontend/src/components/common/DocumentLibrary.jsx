import React, { useState, useEffect } from 'react';
import { getLibraryDocuments } from '../../services/api';
import { BookMarked, FileText, Loader2, Clock } from 'lucide-react';

const DocumentLibrary = ({ onSelectDocument }) => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await getLibraryDocuments();
        if (response.status === 'success') {
          setDocuments(response.data);
        }
      } catch (err) {
        setError('Failed to load library');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocs();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full premium-card p-6 flex flex-col items-center justify-center min-h-[200px]">
        <Loader2 className="animate-spin text-neutral-400 mb-2" size={24} />
        <p className="text-sm text-neutral-500 font-medium">Loading Library...</p>
      </div>
    );
  }

  return (
    <div className="w-full premium-card overflow-hidden flex flex-col">
      <div className="px-6 py-4 bg-white flex items-center gap-3 border-b border-neutral-200">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <BookMarked size={20} />
        </div>
        <h4 className="font-bold text-lg text-neutral-900 tracking-tight">Your Library</h4>
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[400px] custom-scrollbar bg-neutral-50/50">
        {documents.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            No previous documents found.
          </div>
        ) : (
          <div className="flex flex-col p-2">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectDocument(doc.id, doc.filename)}
                className="w-full flex items-start gap-4 p-4 hover:bg-white rounded-xl transition-all text-left group border border-transparent hover:border-neutral-200 hover:shadow-sm"
              >
                <div className="p-2 bg-neutral-100 text-neutral-400 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                  <FileText size={18} />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="font-semibold text-neutral-900 truncate">{doc.filename}</span>
                  <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1 font-medium">
                    <Clock size={12} />
                    {new Date(doc.upload_date).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentLibrary;
