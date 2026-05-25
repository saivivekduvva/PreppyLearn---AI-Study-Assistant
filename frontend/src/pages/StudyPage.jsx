import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryGenerator from '../components/study/SummaryGenerator';
import FlashcardGenerator from '../components/study/FlashcardGenerator';
import QuizGenerator from '../components/study/QuizGenerator';
import { useAppContext } from '../context/AppContext';
import { FileText, Layers, HelpCircle, ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import FloatingChatWidget from '../components/chat/FloatingChatWidget';
import DocumentLibrary from '../components/common/DocumentLibrary';
import { getDocumentText } from '../services/api';

const StudyPage = () => {
  const navigate = useNavigate();
  const { extractedText, uploadedFilename, setUploadedFilename, setExtractedText } = useAppContext();
  const [activeTab, setActiveTab] = useState('summary');
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);

  const handleSelectLibraryDocument = async (id, filename) => {
    try {
      setIsDocumentLoading(true);
      const response = await getDocumentText(id);
      if (response.status === 'success') {
        setUploadedFilename(filename);
        setExtractedText(response.data.text);
      }
    } catch (err) {
      console.error("Failed to load library document", err);
      alert("Failed to load document text.");
    } finally {
      setIsDocumentLoading(false);
    }
  };

  if (!extractedText) {
    return (
      <div className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Background Blur Effect */}
        <div className="absolute inset-0 bg-neutral-50/50 backdrop-blur-sm z-0"></div>
        
        {/* Floating Modal Window */}
        <div className="z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden animate-fadeIn transform transition-all">
          <div className="p-6 text-center bg-gradient-to-b from-blue-50 to-white border-b border-neutral-100">
            <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
              <BookOpen size={24} />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-1">Select a Document</h2>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto">
              Choose a document to start studying.
            </p>
          </div>
          
          <div className="bg-neutral-50/30">
            {isDocumentLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-neutral-700 font-medium">Opening document...</p>
                <p className="text-sm text-neutral-500 mt-1">Fetching your study materials</p>
              </div>
            ) : (
              <DocumentLibrary onSelectDocument={handleSelectLibraryDocument} showDelete={false} isCompact={true} />
            )}
          </div>
          
          <div className="p-3 bg-white border-t border-neutral-100 text-center">
            <button 
              onClick={() => navigate('/document')}
              className="text-xs text-neutral-500 hover:text-neutral-900 font-medium transition-colors"
            >
              Need to upload a new one? Go to Uploads
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 md:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 md:mb-8">
        <button 
          onClick={() => navigate('/document')}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 self-start sm:self-auto"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">Study Area</h1>
          <p className="text-neutral-500 mt-1 flex items-center gap-2 text-sm">
            Currently studying: <span className="font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded truncate max-w-[200px] sm:max-w-xs">{uploadedFilename}</span>
          </p>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-neutral-200 bg-white">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-6 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'summary' 
                ? 'text-neutral-900 border-b-2 border-neutral-900 bg-neutral-50/50' 
                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <FileText size={18} className="shrink-0" />
            <span>Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-6 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'cards' 
                ? 'text-neutral-900 border-b-2 border-neutral-900 bg-neutral-50/50' 
                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Layers size={18} className="shrink-0" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-6 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'quiz' 
                ? 'text-neutral-900 border-b-2 border-neutral-900 bg-neutral-50/50' 
                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <HelpCircle size={18} className="shrink-0" />
            <span>Quiz</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="bg-neutral-50/30 p-4 sm:p-6 md:p-8 min-h-[500px] md:min-h-[600px]">
          {activeTab === 'summary' && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
              <SummaryGenerator extractedText={extractedText} />
            </div>
          )}
          
          {activeTab === 'cards' && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
              <FlashcardGenerator extractedText={extractedText} />
            </div>
          )}
          
          {activeTab === 'quiz' && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
              <QuizGenerator extractedText={extractedText} />
            </div>
          )}
        </div>
      </div>
      
      {/* AI Assistant is only available in the Study Area */}
      <FloatingChatWidget />
    </div>
  );
};

export default StudyPage;
