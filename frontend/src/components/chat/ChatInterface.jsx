import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Database, ChevronDown, ChevronUp } from 'lucide-react';
import { sendChatQuery } from '../../services/api';

const MessageBubble = ({ message }) => {
  const isAi = message.role === 'ai';
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={`flex w-full ${isAi ? 'justify-start' : 'justify-end'} mb-6`}>
      <div className={`flex max-w-[85%] sm:max-w-[75%] gap-4 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${isAi ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-800'}`}>
          {isAi ? <Bot size={20} /> : <User size={20} />}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
          <div className={`px-6 py-4 rounded-3xl shadow-sm ${
            isAi 
              ? 'bg-white border border-neutral-200 rounded-tl-sm text-neutral-800' 
              : 'bg-neutral-900 text-white rounded-tr-sm'
          }`}>
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-sans">
              {message.content}
            </p>
          </div>

          {/* Sources Dropdown (Only for AI) */}
          {isAi && message.sources && message.sources.length > 0 && (
            <div className="mt-3 w-full">
              <button 
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest hover:text-neutral-900 transition-colors px-2"
              >
                <Database size={14} />
                Sources Used ({message.sources.length})
                {showSources ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {showSources && (
                <div className="mt-3 flex flex-col gap-3 pr-4">
                  {message.sources.map((source, idx) => (
                    <div key={idx} className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 text-sm text-neutral-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-mono font-bold text-neutral-500">ID: {source.id}</span>
                        <span className="text-xs font-bold text-neutral-400">Score: {source.similarity_score?.toFixed(3) || 'N/A'}</span>
                      </div>
                      <p className="italic leading-relaxed">{source.document}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am ready to answer questions based on your uploaded documents. What would you like to know?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userQuery = inputValue.trim();
    setInputValue('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setIsLoading(true);

    try {
      const response = await sendChatQuery(userQuery);
      
      if (response.status === 'success') {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: response.data.answer,
          sources: response.data.sources
        }]);
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `Error: ${error.message || "Failed to get response from AI."}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-neutral-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 custom-scrollbar">
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}
        
        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex w-full justify-start mb-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-neutral-900 text-white">
                <Bot size={20} />
              </div>
              <div className="px-6 py-5 rounded-3xl shadow-sm bg-white border border-neutral-200 rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-white border-t border-neutral-200 shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Message AI..."
            className="w-full pl-4 pr-12 py-3 bg-neutral-100 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all shadow-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-1 p-2 bg-neutral-900 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
