import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PdfPreview from '../components/common/PdfPreview';
import DocumentLibrary from '../components/common/DocumentLibrary';
import ChunkVisualizer from '../components/common/ChunkVisualizer';
import EmbeddingDebugger from '../components/common/EmbeddingDebugger';
import VectorDbDebugPanel from '../components/debug/VectorDbDebugPanel';
import { useAppContext } from '../context/AppContext';
import { getDocumentText } from '../services/api';
import { Loader2, ArrowRight } from 'lucide-react';

const DocumentPage = () => {
  const navigate = useNavigate();
  const { 
    uploadedFilename, setUploadedFilename, 
    extractedText, setExtractedText,
    chunks, setChunks,
    chunkMetadata, setChunkMetadata
  } = useAppContext();

  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);

  const handleTextExtracted = (text) => {
    setExtractedText(text);
  };

  const handleChunksGenerated = (generatedChunks, metadata) => {
    setChunks(generatedChunks);
    setChunkMetadata(metadata);
  };

  const handleSelectLibraryDocument = async (id, filename) => {
    try {
      setIsLibraryLoading(true);
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
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Document Data</h1>
          <p className="text-neutral-500 mt-1">Manage, extract, and process your study materials.</p>
        </div>
        
        {extractedText && (
          <button 
            onClick={() => navigate('/study')}
            className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-full font-medium hover:bg-neutral-800 transition-colors"
          >
            Go to Study Area <ArrowRight size={18} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Pipeline */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <DocumentLibrary onSelectDocument={handleSelectLibraryDocument} />

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
              
              {extractedText && (
                <ChunkVisualizer 
                  extractedText={extractedText} 
                  onChunksGenerated={handleChunksGenerated} 
                />
              )}

              {chunks && chunks.length > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowDebugger(!showDebugger)}
                      className="text-sm font-medium text-neutral-500 hover:text-neutral-800 transition-colors"
                    >
                      {showDebugger ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                    </button>
                  </div>
                  {showDebugger && (
                    <EmbeddingDebugger 
                      chunks={chunks}
                      onEmbeddingsGenerated={() => {}}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Database */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
             <VectorDbDebugPanel />
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentPage;
