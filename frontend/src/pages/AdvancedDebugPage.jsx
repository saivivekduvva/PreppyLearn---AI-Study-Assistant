import React, { useState } from 'react';
import ChunkVisualizer from '../components/common/ChunkVisualizer';
import VectorDbDebugPanel from '../components/debug/VectorDbDebugPanel';
import DocumentLibrary from '../components/common/DocumentLibrary';
import { getDocumentText } from '../services/api';
import { Loader2 } from 'lucide-react';

const AdvancedDebugPage = () => {
  const [extractedText, setExtractedText] = useState(null);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);

  const handleSelectLibraryDocument = async (id) => {
    try {
      setIsLibraryLoading(true);
      setExtractedText(null); // Reset
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Advanced Vector DB Debugger</h1>
        <p className="text-neutral-500 mt-1">Select a previously uploaded document to inspect how it is chunked and embedded in the Vector Database.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Selection and Visualization */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <DocumentLibrary onSelectDocument={handleSelectLibraryDocument} />

          {isLibraryLoading && (
            <div className="w-full premium-card p-10 flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
              <p className="text-slate-700 font-medium">Loading Document...</p>
            </div>
          )}

          {extractedText && !isLibraryLoading && (
            <ChunkVisualizer text={extractedText} />
          )}
        </div>

        {/* Right Column: Database Panel */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
             <VectorDbDebugPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDebugPage;
