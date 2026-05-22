import { useState } from 'react';
import { generateSummary } from '../../services/api';
import { Loader2, FileText, AlignLeft, BookOpen, FileCheck } from 'lucide-react';

const SummaryGenerator = ({ extractedText }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryType, setSummaryType] = useState('short');
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
      setSummary(response.data.summary);
    } catch (err) {
      setError(err.message || "Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col premium-card overflow-hidden bg-neutral-50">
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
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar flex flex-col gap-6">
        
        {/* Controls */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col gap-4">
          <label className="text-sm font-bold text-neutral-900 uppercase tracking-widest">Select Summary Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'short', label: 'Brief Summary', icon: <AlignLeft size={16}/> },
              { id: 'detailed', label: 'Detailed Notes', icon: <BookOpen size={16}/> },
              { id: 'exam', label: 'Exam Revision', icon: <FileCheck size={16}/> }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSummaryType(type.id)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all text-sm font-semibold ${
                  summaryType === type.id 
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-md' 
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50'
                }`}
              >
                {type.icon}
                {type.label}
              </button>
            ))}
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isLoading || !extractedText}
            className="mt-2 w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
            {isLoading ? 'Generating...' : 'Generate Summary'}
          </button>
          
          {error && <p className="text-red-500 text-sm font-semibold text-center">{error}</p>}
        </div>

        {/* Results */}
        {summary && (
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
            <h4 className="text-lg font-bold text-neutral-900 mb-4 tracking-tight capitalize">{summaryType} Summary</h4>
            <div className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed font-sans whitespace-pre-wrap">
              {summary}
            </div>
          </div>
        )}

        {!summary && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 opacity-50 py-12">
            <FileText size={48} className="mb-4" />
            <p className="font-semibold">Generate a summary to see it here.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default SummaryGenerator;
