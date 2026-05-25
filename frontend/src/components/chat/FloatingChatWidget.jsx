import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import ChatInterface from './ChatInterface';

const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window Overlay */}
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-32px)] sm:w-[380px] h-[600px] max-h-[calc(100vh-100px)] sm:max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col animate-fadeIn origin-bottom-right">
          <div className="bg-neutral-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} />
              <span className="font-semibold text-sm">AI Study Assistant</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-neutral-800 rounded-md transition-colors text-neutral-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatInterface />
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
          isOpen ? 'bg-neutral-800 text-white scale-90' : 'bg-neutral-900 text-white hover:scale-105 hover:bg-blue-600'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

    </div>
  );
};

export default FloatingChatWidget;
