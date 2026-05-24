import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DocumentUploader from '../components/common/DocumentUploader';
import { useAppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { setUploadedFilename, setExtractedText } = useAppContext();
  const { user } = useContext(AuthContext);

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

      <div className="w-full max-w-xl flex justify-center">
        {user ? (
          <div className="premium-card p-1 w-full">
              <DocumentUploader onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <Link to="/register" className="group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Get Started for Free
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
