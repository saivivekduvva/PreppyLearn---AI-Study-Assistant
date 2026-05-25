import { useState } from 'react';
import { generateSummary } from '../../services/api';
import { Loader2, FileText, AlignLeft, BookOpen, FileCheck } from 'lucide-react';

const SummaryGenerator = ({ extractedText }) => {
  const [summaryType, setSummaryType] = useState('short');
  const [summaries, setSummaries] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!extractedText) {
      setError("Please wait for text to be extracted from the document.");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await generateSummary(extractedText, summaryType);
      setSummaries(prev => ({ ...prev, [summaryType]: response.data.summary }));
    } catch (err) {
      setError(err.message || "Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  };

  const hasAnySummary = Object.keys(summaries).length > 0;

  return (
    <div className="w-full h-full min-h-[500px] md:min-h-[600px] flex flex-col premium-card overflow-hidden bg-neutral-50">
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-neutral-200 flex items-center gap-4 shrink-0">
        <div className="p-3 bg-neutral-100 rounded-xl text-neutral-900">
          <FileText size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Smart Summary</h3>
          <p className="text-sm font-semibold text-neutral-500">AI-Generated Notes</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar flex flex-col h-full relative">
        
        {/* Empty State / Loading State / Initial Controls */}
        {!hasAnySummary ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 text-neutral-500">
                <Loader2 className="animate-spin text-neutral-900" size={48} />
                <p className="font-bold tracking-widest uppercase">Generating Summary...</p>
              </div>
            ) : (
              <div className="w-full max-w-xl bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-neutral-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <FileText size={32} />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2 tracking-tight">Create a Summary</h3>
                <p className="text-neutral-500 mb-8 max-w-sm text-sm sm:text-base">
                  Condense your document into bite-sized knowledge. Choose a format below to get started.
                </p>

                <div className="w-full flex flex-col gap-3">
                  {[
                    { id: 'short', label: 'Brief Summary', icon: <AlignLeft size={18}/> },
                    { id: 'detailed', label: 'Detailed Notes', icon: <BookOpen size={18}/> },
                    { id: 'exam', label: 'Exam Revision', icon: <FileCheck size={18}/> }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSummaryType(type.id)}
                      className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all font-semibold w-full text-sm sm:text-base ${
                        summaryType === type.id 
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-md' 
                        : 'border-neutral-100 bg-neutral-50/50 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {type.icon}
                        <span>{type.label}</span>
                      </div>
                      {summaryType === type.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={!extractedText || isLoading}
                  className="mt-8 w-full py-4 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl transition-colors shadow-md disabled:opacity-50"
                >
                  {isLoading ? 'Generating...' : 'Generate Now'}
                </button>
                {error && <p className="text-red-500 mt-4 text-sm font-semibold">{error}</p>}
              </div>
            )}
          </div>
        ) : (
          /* Results State */
          <div className="flex flex-col gap-6 animate-fadeIn w-full max-w-4xl mx-auto">
            {/* Inline Controls Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-sm gap-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 sm:pb-0 hide-scrollbar">
                {[
                  { id: 'short', label: 'Brief Summary' },
                  { id: 'detailed', label: 'Detailed Notes' },
                  { id: 'exam', label: 'Exam Revision' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSummaryType(type.id)}
                    disabled={isLoading}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap flex-1 text-center sm:flex-none ${
                      summaryType === type.id 
                      ? 'bg-neutral-900 text-white shadow-sm' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm font-semibold text-center">{error}</p>}

            {/* Content Body */}
            <div className={`bg-white p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-neutral-200 shadow-sm transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
              <h4 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 sm:mb-6 tracking-tight capitalize border-b border-neutral-100 pb-3 sm:pb-4">
                {summaryType} Summary
              </h4>
              
              {summaries[summaryType] ? (
                <div className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed font-sans whitespace-pre-wrap text-sm sm:text-base">
                  {summaries[summaryType]}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mb-4">
                    <FileText size={32} />
                  </div>
                  <h5 className="text-lg font-bold text-neutral-900 mb-2">Not Generated Yet</h5>
                  <p className="text-neutral-500 mb-6 max-w-xs text-sm">
                    Click the button below to generate a {summaryType} summary.
                  </p>
                  <button 
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="px-6 py-3 bg-neutral-900 hover:bg-black text-white font-semibold rounded-xl transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                    {isLoading ? 'Generating...' : `Generate ${summaryType} Summary`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryGenerator;
