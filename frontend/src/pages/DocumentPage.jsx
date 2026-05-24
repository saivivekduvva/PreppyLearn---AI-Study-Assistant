import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PdfPreview from '../components/common/PdfPreview';
import DocumentUploader from '../components/common/DocumentUploader';
import DocumentLibrary from '../components/common/DocumentLibrary';
import { useAppContext } from '../context/AppContext';
import { getDocumentText } from '../services/api';
import { Loader2, ArrowRight, Settings2, CheckCircle, AlertCircle } from 'lucide-react';
import useVectorProcessing from '../hooks/useVectorProcessing';

const DocumentPage = () => {
  const navigate = useNavigate();
  const { 
    uploadedFilename, setUploadedFilename, 
    extractedText, setExtractedText
  } = useAppContext();

  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [isNewUpload, setIsNewUpload] = useState(false);
  
  // Custom hook automates vector DB processing for new uploads
  const { status: processingStatus, error: processingError } = useVectorProcessing(extractedText, uploadedFilename, isNewUpload);

  const handleTextExtracted = (text) => {
    setExtractedText(text);
  };

  const handleSelectLibraryDocument = async (id, filename) => {
    try {
      setIsLibraryLoading(true);
      setIsNewUpload(false);
      setUploadedFilename(filename);
      const response = await getDocumentText(id);
      if (response.status === 'success') {
        setExtractedText(response.data.text);
      }
    } catch (err) {
      console.error("Failed to load library document", err);
      alert("Failed to load document text.");
    } finally {
      setIsLibraryLoading(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Document Data</h1>
            <Link to="/debug" className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
              <Settings2 size={14} /> Advanced Processing
            </Link>
          </div>
          <p className="text-neutral-500 mt-1">Manage, extract, and process your study materials.</p>
        </div>
        
        {processingStatus === 'success' && (
          <button 
            onClick={() => navigate('/study')}
            className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-full font-medium hover:bg-neutral-800 transition-colors"
          >
            Go to Study Area <ArrowRight size={18} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <div className="premium-card p-1 w-full">
          <DocumentUploader onUploadSuccess={(filename) => {
            setIsNewUpload(true);
            setUploadedFilename(filename);
            setExtractedText(null);
          }} />
        </div>

        <DocumentLibrary key={uploadedFilename} onSelectDocument={handleSelectLibraryDocument} />

        {isLibraryLoading && (
          <div className="w-full premium-card p-10 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-700 font-medium">Loading Document...</p>
          </div>
        )}

        {uploadedFilename && !isLibraryLoading && (
          <div className="animate-fadeIn w-full flex flex-col gap-6">
            <PdfPreview 
              filename={uploadedFilename} 
              onTextExtracted={handleTextExtracted} 
            />
            
            {/* Automatic Processing State */}
            {extractedText && (
              <div className="premium-card p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  {processingStatus === 'error' ? (
                    <div className="p-3 bg-red-100 text-red-600 rounded-full">
                      <AlertCircle size={24} />
                    </div>
                  ) : processingStatus === 'success' ? (
                    <div className="p-3 bg-teal-100 text-teal-600 rounded-full">
                      <CheckCircle size={24} />
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                      <Loader2 size={24} className="animate-spin" />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900">
                      {processingStatus === 'error' ? 'Processing Failed' : 
                       processingStatus === 'success' ? 'Document Ready for AI' : 
                       'Processing Document for AI...'}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      {processingStatus === 'chunking' && 'Analyzing and chunking text...'}
                      {processingStatus === 'embedding' && 'Generating mathematical vector embeddings...'}
                      {processingStatus === 'storing' && 'Saving context to Vector Database...'}
                      {processingStatus === 'success' && 'You can now go to the Study Area.'}
                      {processingStatus === 'error' && processingError}
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPage;
