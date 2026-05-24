import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryGenerator from '../components/study/SummaryGenerator';
import FlashcardGenerator from '../components/study/FlashcardGenerator';
import QuizGenerator from '../components/study/QuizGenerator';
import { useAppContext } from '../context/AppContext';
import { FileText, Layers, HelpCircle, ArrowLeft, Lock } from 'lucide-react';
import FloatingChatWidget from '../components/chat/FloatingChatWidget';

const StudyPage = () => {
  const navigate = useNavigate();
  const { extractedText, uploadedFilename } = useAppContext();
  const [activeTab, setActiveTab] = useState('summary');

  if (!extractedText) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="p-4 bg-neutral-100 rounded-full text-neutral-400 mb-6">
          <Lock size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-bold text-neutral-900 tracking-tight mb-4">Study Area Locked</h2>
        <p className="text-neutral-500 max-w-md mb-8">
          You need to process a document before you can use the study tools. Please go back and select or upload a document.
        </p>
        <button 
          onClick={() => navigate('/document')}
          className="bg-neutral-900 text-white px-6 py-3 rounded-full font-medium hover:bg-neutral-800 transition-colors"
        >
          Go to Documents
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/document')}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Study Area</h1>
          <p className="text-neutral-500 mt-1 flex items-center gap-2">
            Currently studying: <span className="font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded text-sm">{uploadedFilename}</span>
          </p>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-neutral-200 bg-white">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-semibold transition-all ${
              activeTab === 'summary' 
                ? 'text-neutral-900 border-b-2 border-neutral-900 bg-neutral-50/50' 
                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <FileText size={18} />
            Summary
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-semibold transition-all ${
              activeTab === 'cards' 
                ? 'text-neutral-900 border-b-2 border-neutral-900 bg-neutral-50/50' 
                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Layers size={18} />
            Cards
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-semibold transition-all ${
              activeTab === 'quiz' 
                ? 'text-neutral-900 border-b-2 border-neutral-900 bg-neutral-50/50' 
                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <HelpCircle size={18} />
            Quiz
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="bg-neutral-50/30 p-6 md:p-8 min-h-[600px]">
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
