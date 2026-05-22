import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import PdfUploader from '../components/common/PdfUploader';
import PdfPreview from '../components/common/PdfPreview';
import DocumentLibrary from '../components/common/DocumentLibrary';
import ChunkVisualizer from '../components/common/ChunkVisualizer';
import EmbeddingDebugger from '../components/common/EmbeddingDebugger';
import VectorDbDebugPanel from '../components/debug/VectorDbDebugPanel';
import ChatInterface from '../components/chat/ChatInterface';
import SummaryGenerator from '../components/study/SummaryGenerator';
import FlashcardGenerator from '../components/study/FlashcardGenerator';
import QuizGenerator from '../components/study/QuizGenerator';
import { checkHealth, getDocumentText } from '../services/api';
import { MessageSquare, FileText, Layers, HelpCircle, Loader2 } from 'lucide-react';

const Home = () => {
  const [backendStatus, setBackendStatus] = useState('Checking connection...');
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [chunks, setChunks] = useState([]);
  const [chunkMetadata, setChunkMetadata] = useState(null);
  const [showDebugger, setShowDebugger] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const data = await checkHealth();
        if (data.status === 'ok') {
          setBackendStatus('Connected to Backend ✅');
        } else {
          setBackendStatus('Connection Issue ⚠️');
        }
      } catch (error) {
        setBackendStatus('Not Connected ❌ (Is FastAPI running on port 8000?)');
      }
    };
    
    verifyConnection();
  }, []);

  const handleTextExtracted = (text) => setExtractedText(text);
  const handleChunksGenerated = (generatedChunks, metadata) => {
    setChunks(generatedChunks);
    setChunkMetadata(metadata);
  };
  const handleEmbeddingsGenerated = () => {};

  const handleSelectLibraryDocument = async (id, filename) => {
    try {
      setIsLibraryLoading(true);
      setUploadedFilename(filename);
      // Fetch full text from DB
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
    <div className="home-page">
      <Header />
      <main className="main-content">
        <div className="text-center max-w-4xl mx-auto mt-24 mb-16">
          <h2 className="text-6xl md:text-8xl font-bold text-neutral-900 mb-6 tracking-tighter leading-none">
            AI Study Assistant
          </h2>
        </div>

        <div className="w-full flex justify-center mb-20">
          <div className="w-full max-w-2xl transform transition-transform hover:scale-[1.01] duration-500">
            <PdfUploader onUploadSuccess={(filename) => setUploadedFilename(filename)} />
          </div>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-xl md:text-2xl text-neutral-600 leading-relaxed tracking-tight">
            Upload your textbooks, notes, or research papers in PDF format. We turn messy documents into structured records — with AI agents that help you query them instantly.
          </p>
        </div>

        <div className="flex justify-center mb-24">
          <div className="px-6 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-center flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest m-0">System Status: <span className="text-neutral-900">{backendStatus}</span></p>
          </div>
        </div>

        <div className="w-full mx-auto" style={{ animation: 'fadeIn 0.4s ease-out 0.2s both' }}>
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Column: Document Pipeline */}
            <div className="flex flex-col gap-12 w-full">
              
              <div className="w-full">
                <DocumentLibrary onSelectDocument={handleSelectLibraryDocument} />
              </div>

              {isLibraryLoading && (
                <div className="w-full premium-card p-10 flex flex-col items-center justify-center min-h-[300px]">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                  <p className="text-slate-700 font-medium">Loading Document...</p>
                </div>
              )}

              {uploadedFilename && !isLibraryLoading && (
                <div className="animate-fadeIn w-full flex flex-col gap-6" style={{ animationDelay: '0.1s' }}>
                  <PdfPreview 
                    filename={uploadedFilename} 
                    onTextExtracted={handleTextExtracted}
                  />
                  
                  {extractedText && (
                    <ChunkVisualizer 
                      text={extractedText} 
                      onChunksGenerated={handleChunksGenerated}
                      showDebugger={showDebugger}
                      setShowDebugger={setShowDebugger}
                    />
                  )}
                  
                  {showDebugger && chunks.length > 0 && (
                    <EmbeddingDebugger 
                      chunks={chunks}
                      chunkMetadata={chunkMetadata}
                      onEmbeddingsGenerated={handleEmbeddingsGenerated}
                    />
                  )}
                </div>
              )}

              <div className="w-full">
                <VectorDbDebugPanel />
              </div>
            </div>

            {/* Right Column: Study Panel (Tabs) */}
            <div className="flex flex-col w-full h-[800px] sticky top-8">
               
               {/* Tab Navigation */}
               <div className="flex bg-white rounded-t-3xl border border-neutral-200 border-b-0 overflow-hidden shadow-sm shrink-0">
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold text-sm transition-all ${activeTab === 'chat' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'}`}
                  >
                    <MessageSquare size={16} /> Chat
                  </button>
                  <button 
                    onClick={() => setActiveTab('summary')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold text-sm transition-all border-l border-neutral-100 ${activeTab === 'summary' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'}`}
                  >
                    <FileText size={16} /> Summary
                  </button>
                  <button 
                    onClick={() => setActiveTab('flashcards')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold text-sm transition-all border-l border-neutral-100 ${activeTab === 'flashcards' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'}`}
                  >
                    <Layers size={16} /> Cards
                  </button>
                  <button 
                    onClick={() => setActiveTab('quiz')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold text-sm transition-all border-l border-neutral-100 ${activeTab === 'quiz' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'}`}
                  >
                    <HelpCircle size={16} /> Quiz
                  </button>
               </div>

               {/* Tab Content Area */}
               <div className="flex-1 overflow-hidden rounded-b-3xl border border-neutral-200 shadow-xl bg-white">
                 {activeTab === 'chat' && <ChatInterface />}
                 {activeTab === 'summary' && <SummaryGenerator extractedText={extractedText} />}
                 {activeTab === 'flashcards' && <FlashcardGenerator extractedText={extractedText} />}
                 {activeTab === 'quiz' && <QuizGenerator extractedText={extractedText} />}
               </div>
               
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
