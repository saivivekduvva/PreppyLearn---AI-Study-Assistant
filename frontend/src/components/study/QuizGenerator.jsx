import { useState } from 'react';
import { generateMCQs } from '../../services/api';
import { Loader2, HelpCircle, CheckCircle2, XCircle, Trophy } from 'lucide-react';

const QuizGenerator = ({ extractedText }) => {
  const [mcqs, setMcqs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Quiz State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleGenerate = async () => {
    if (!extractedText) {
      setError("Please wait for text to be extracted from the document.");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await generateMCQs(extractedText);
      setMcqs(response.data.mcqs);
      // Reset quiz state
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setIsFinished(false);
    } catch (err) {
      setError(err.message || "Failed to generate quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (option) => {
    if (selectedAnswer !== null) return; // Prevent changing answer
    setSelectedAnswer(option);
    
    if (option === mcqs[currentIndex].correct_answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < mcqs.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col premium-card overflow-hidden bg-neutral-50">
      <div className="px-8 py-6 bg-white border-b border-neutral-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neutral-100 rounded-xl text-neutral-900">
            <HelpCircle size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Smart Quiz</h3>
            <p className="text-sm font-semibold text-neutral-500">AI-Generated MCQs</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center relative">
        {error && <p className="absolute top-4 text-red-500 font-semibold text-center w-full">{error}</p>}

        {mcqs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn w-full">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 text-neutral-500">
                <Loader2 className="animate-spin text-neutral-900" size={48} />
                <p className="font-bold tracking-widest uppercase">Authoring Questions...</p>
              </div>
            ) : (
              <div className="w-full max-w-xl bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-neutral-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <HelpCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2 tracking-tight">Create a Quiz</h3>
                <p className="text-neutral-500 mb-8 max-w-sm">
                  Test your knowledge. We'll automatically generate multiple-choice questions based on your document.
                </p>
                
                <button 
                  onClick={handleGenerate}
                  disabled={!extractedText}
                  className="w-full py-4 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <HelpCircle size={20} />
                  Generate Quiz
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`w-full max-w-2xl mx-auto flex flex-col h-full animate-fadeIn transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            {!isFinished ? (
              <>
                <div className="flex justify-between items-center mb-8">
                  <span className="font-bold text-neutral-500 uppercase tracking-widest text-sm">
                    Question {currentIndex + 1} of {mcqs.length}
                  </span>
                  <span className="font-bold text-neutral-900 bg-white px-4 py-1.5 rounded-full shadow-sm border border-neutral-200">
                    Score: {score}
                  </span>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm mb-6">
                  <h3 className="text-xl font-bold text-neutral-900 leading-relaxed">
                    {mcqs[currentIndex].question}
                  </h3>
                </div>

                <div className="flex flex-col gap-3 flex-1">
                  {mcqs[currentIndex].options.map((option, idx) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === mcqs[currentIndex].correct_answer;
                    const showCorrectness = selectedAnswer !== null;

                    let buttonClass = "bg-white border-neutral-200 hover:border-neutral-400 text-neutral-700";
                    let Icon = null;

                    if (showCorrectness) {
                      if (isCorrect) {
                        buttonClass = "bg-green-50 border-green-500 text-green-800 font-semibold";
                        Icon = <CheckCircle2 className="text-green-500" />;
                      } else if (isSelected && !isCorrect) {
                        buttonClass = "bg-red-50 border-red-500 text-red-800 font-semibold";
                        Icon = <XCircle className="text-red-500" />;
                      } else {
                        buttonClass = "bg-neutral-50 border-neutral-200 text-neutral-400 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(option)}
                        disabled={selectedAnswer !== null}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex justify-between items-center ${buttonClass}`}
                      >
                        <span className="leading-relaxed">{option}</span>
                        {Icon}
                      </button>
                    );
                  })}
                </div>

                {selectedAnswer !== null && (
                  <button
                    onClick={handleNextQuestion}
                    className="mt-8 w-full py-4 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl transition-colors shadow-md animate-fadeIn"
                  >
                    {currentIndex < mcqs.length - 1 ? 'Next Question' : 'View Results'}
                  </button>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn h-full mt-10">
                <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Trophy size={48} />
                </div>
                <h2 className="text-4xl font-bold text-neutral-900 mb-2 tracking-tight">Quiz Complete!</h2>
                <p className="text-xl font-medium text-neutral-500 mb-8">
                  You scored <span className="text-neutral-900 font-bold">{score}</span> out of <span className="text-neutral-900 font-bold">{mcqs.length}</span>
                </p>
                <button
                  onClick={handleGenerate}
                  className="py-4 px-8 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl transition-colors shadow-md"
                >
                  Generate New Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGenerator;
