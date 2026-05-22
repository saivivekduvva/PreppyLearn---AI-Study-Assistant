import React from 'react';
import { useNavigate } from 'react-router-dom';
import PdfUploader from '../components/common/PdfUploader';
import { useAppContext } from '../context/AppContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { setUploadedFilename, setExtractedText } = useAppContext();

  const handleUploadSuccess = (filename) => {
    setUploadedFilename(filename);
    setExtractedText(null); // Reset text until extracted
    navigate('/document'); // Navigate to the processing page
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="max-w-3xl w-full text-center mb-16">
        <h1 className="text-6xl md:text-7xl font-extrabold text-neutral-900 tracking-tight mb-6 leading-tight">
          Students,<br/>welcome home.
        </h1>
        <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          PreppyLearn is a toolkit made by students, for students, that puts the focus on you and your learning.
        </p>
      </div>

      <div className="w-full max-w-xl">
        <div className="premium-card p-1">
          <PdfUploader onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
