import React, { useState, useEffect } from 'react';
import { getLibraryDocuments, deleteDocument } from '../../services/api';
import { BookMarked, FileText, Loader2, Clock, Trash2 } from 'lucide-react';

const DocumentLibrary = ({ onSelectDocument, showDelete = true }) => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const [isSlowLoading, setIsSlowLoading] = useState(false);

  const fetchDocs = async () => {
    setIsLoading(true);
    setError('');
    // Trigger slow loading message if it takes more than 5 seconds
    const slowLoadingTimer = setTimeout(() => {
      setIsSlowLoading(true);
    }, 5000);

    try {
      const response = await getLibraryDocuments();
      if (response.status === 'success') {
        setDocuments(response.data);
      }
    } catch (err) {
      setError('Failed to connect to the backend. Please try refreshing the page.');
    } finally {
      clearTimeout(slowLoadingTimer);
      setIsLoading(false);
      setIsSlowLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (e, docId) => {
    e.stopPropagation(); // Prevent triggering the select document click
    setDeletingId(docId);
    try {
      await deleteDocument(docId);
      // Remove from UI immediately upon success
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
    } catch (err) {
      console.error("Failed to delete document", err);
      // Optional: Add a toast notification here
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full premium-card p-6 flex flex-col items-center justify-center min-h-[200px]">
        <Loader2 className="animate-spin text-neutral-400 mb-4" size={24} />
        <p className="text-sm text-neutral-600 font-medium mb-1">Loading Library...</p>
        {isSlowLoading && (
          <p className="text-xs text-blue-500 animate-pulse text-center max-w-xs mt-2">
            Waking up the server.<br/>This can take up to 60 seconds on the free tier.
          </p>
        )}
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
        {error ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <p className="text-red-500 font-medium text-sm mb-4">{error}</p>
            <button 
              onClick={fetchDocs}
              className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm hover:bg-neutral-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            No previous documents found.
          </div>
        ) : (
          <div className="flex flex-col p-2">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className="w-full flex items-center justify-between p-4 hover:bg-white rounded-xl transition-all group border border-transparent hover:border-neutral-200 hover:shadow-sm"
              >
                <button
                  onClick={() => onSelectDocument(doc.id, doc.filename)}
                  className="flex-1 flex items-start gap-4 text-left min-w-0"
                >
                  <div className="p-2 bg-neutral-100 text-neutral-400 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                    <span className="font-semibold text-neutral-900 truncate block w-full">{doc.filename}</span>
                    <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1 font-medium">
                      <Clock size={12} />
                      {new Date(doc.upload_date).toLocaleDateString()}
                    </div>
                  </div>
                </button>
                
                {showDelete && (
                  <button
                    onClick={(e) => handleDelete(e, doc.id)}
                    disabled={deletingId === doc.id}
                    className={`p-2 rounded-lg transition-colors ml-2 flex-shrink-0 ${
                      deletingId === doc.id 
                        ? 'text-neutral-400 bg-neutral-100' 
                        : 'text-neutral-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                    title="Delete Document"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentLibrary;
