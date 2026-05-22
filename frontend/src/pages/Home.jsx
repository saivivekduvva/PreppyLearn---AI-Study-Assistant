import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import PdfUploader from '../components/common/PdfUploader';
import PdfPreview from '../components/common/PdfPreview';
import VectorDbDebugPanel from '../components/debug/VectorDbDebugPanel';
import { checkHealth } from '../services/api';

const Home = () => {
  const [backendStatus, setBackendStatus] = useState('Checking connection...');
  const [uploadedFilename, setUploadedFilename] = useState('');

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const data = await checkHealth();
        if (data.status === 'ok') {
          setBackendStatus('Connected to Backend ✅');
        } else {
          setBackendStatus('Connection Issue ⚠️');
        }
      } catch (error) {
        setBackendStatus('Not Connected ❌ (Is FastAPI running on port 8000?)');
      }
    };
    
    verifyConnection();
  }, []);

  return (
    <div className="home-page">
      <Header />
      <main className="main-content">
        <div className="text-center max-w-4xl mx-auto mt-24 mb-16">
          <h2 className="text-6xl md:text-8xl font-bold text-neutral-900 mb-6 tracking-tighter leading-none">
            AI Study Assistant
          </h2>
        </div>

        <div className="w-full flex justify-center mb-20">
          <div className="w-full max-w-2xl transform transition-transform hover:scale-[1.01] duration-500">
            <PdfUploader onUploadSuccess={(filename) => setUploadedFilename(filename)} />
          </div>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-xl md:text-2xl text-neutral-600 leading-relaxed tracking-tight">
            Upload your textbooks, notes, or research papers in PDF format. We turn messy documents into structured records — with AI agents that help you query them instantly.
          </p>
        </div>

        <div className="flex justify-center mb-24">
          <div className="px-6 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-center flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest m-0">System Status: <span className="text-neutral-900">{backendStatus}</span></p>
          </div>
        </div>

        <div className="w-full mx-auto flex flex-col gap-16" style={{ animation: 'fadeIn 0.4s ease-out 0.2s both' }}>
          
          {uploadedFilename && (
            <div className="animate-fadeIn w-full flex flex-col gap-6" style={{ animationDelay: '0.1s' }}>
              <PdfPreview filename={uploadedFilename} />
            </div>
          )}

          <div className="w-full mt-2">
            <VectorDbDebugPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
