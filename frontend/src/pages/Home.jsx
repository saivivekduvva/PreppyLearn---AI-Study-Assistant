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
      <main className="main-content" style={{ justifyContent: 'center' }}>
        <h2 className="hero-title" style={{ fontSize: '3rem' }}>AI Study Assistant</h2>
        <p className="hero-subtitle" style={{ marginBottom: '2rem' }}>
          Your learning environment is ready.
        </p>
        
        <div className="glass-panel" style={{ padding: '1.5rem 3rem', display: 'inline-block', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>System Status</h3>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>{backendStatus}</p>
        </div>

        <div className="w-full max-w-4xl mx-auto flex flex-col gap-10" style={{ animation: 'fadeIn 0.8s ease-out 0.2s both' }}>
          <div className="glass-panel p-10 text-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Knowledge Base</h3>
            <p className="text-slate-600 mb-8">Upload your textbooks, notes, or research papers in PDF format to start querying them with AI.</p>
            <div className="max-w-xl mx-auto">
              <PdfUploader onUploadSuccess={(filename) => setUploadedFilename(filename)} />
            </div>
          </div>
          
          {uploadedFilename && (
            <div className="animate-fadeIn w-full" style={{ animationDelay: '0.1s' }}>
              <PdfPreview filename={uploadedFilename} />
            </div>
          )}

          <div className="w-full mt-4">
            <VectorDbDebugPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
