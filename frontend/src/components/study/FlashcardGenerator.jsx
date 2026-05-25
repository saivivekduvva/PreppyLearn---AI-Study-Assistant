import { useState } from 'react';
import { generateFlashcards } from '../../services/api';
import { Loader2, Layers, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

const FlashcardGenerator = ({ extractedText }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleGenerate = async () => {
    if (!extractedText) {
      setError("Please wait for text to be extracted from the document.");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await generateFlashcards(extractedText);
      setFlashcards(response.data.flashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      setError(err.message || "Failed to generate flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, flashcards.length - 1));
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }, 150);
  };

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col premium-card overflow-hidden bg-neutral-50">
      <div className="px-8 py-6 bg-white border-b border-neutral-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neutral-100 rounded-xl text-neutral-900">
            <Layers size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Smart Flashcards</h3>
            <p className="text-sm font-semibold text-neutral-500">AI-Generated Deck</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center relative">
        {error && <p className="absolute top-4 text-red-500 font-semibold">{error}</p>}

        {flashcards.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn w-full">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 text-neutral-500">
                <Loader2 className="animate-spin text-neutral-900" size={48} />
                <p className="font-bold tracking-widest uppercase">Building your deck...</p>
              </div>
            ) : (
              <div className="w-full max-w-xl bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-neutral-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <Layers size={32} />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2 tracking-tight">Create Flashcards</h3>
                <p className="text-neutral-500 mb-8 max-w-sm">
                  Automatically generate an interactive study deck based on the key concepts in your document.
                </p>
                
                <button 
                  onClick={handleGenerate}
                  disabled={!extractedText}
                  className="w-full py-4 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Layers size={20} />
                  Generate Deck
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`w-full max-w-lg flex flex-col items-center gap-8 animate-fadeIn transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            
            <div className="flex items-center justify-between w-full text-neutral-500 font-bold uppercase tracking-widest text-sm">
              <span>Card {currentIndex + 1} of {flashcards.length}</span>
              <button 
                onClick={handleGenerate} 
                className="flex items-center gap-1 hover:text-neutral-900 transition-colors"
                title="Regenerate Deck"
              >
                {isLoading ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />} 
                New Deck
              </button>
            </div>

            {/* Flashcard 3D Container */}
            <div 
              className="relative w-full aspect-[4/3] cursor-pointer"
              style={{ perspective: '1000px' }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div 
                className="w-full h-full relative transition-all duration-500 shadow-xl rounded-3xl"
                style={{ 
                  transformStyle: 'preserve-3d', 
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
                }}
              >
                {/* Front (Question) */}
                <div 
                  className="absolute inset-0 w-full h-full bg-white border border-neutral-200 rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-sm backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="absolute top-6 left-6 text-xs font-bold text-blue-500 uppercase tracking-widest">Question</span>
                  <h3 className="text-2xl font-bold text-neutral-900 leading-tight">
                    {flashcards[currentIndex].question}
                  </h3>
                  <p className="absolute bottom-6 text-neutral-400 text-sm font-semibold tracking-wide">Click to reveal answer</p>
                </div>

                {/* Back (Answer) */}
                <div 
                  className="absolute inset-0 w-full h-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-sm backface-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)' 
                  }}
                >
                  <span className="absolute top-6 left-6 text-xs font-bold text-green-400 uppercase tracking-widest">Answer</span>
                  <p className="text-xl font-medium text-white leading-relaxed">
                    {flashcards[currentIndex].answer}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-4 rounded-full bg-white border border-neutral-200 shadow-sm text-neutral-900 hover:bg-neutral-50 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={handleNext}
                disabled={currentIndex === flashcards.length - 1}
                className="p-4 rounded-full bg-white border border-neutral-200 shadow-sm text-neutral-900 hover:bg-neutral-50 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardGenerator;
