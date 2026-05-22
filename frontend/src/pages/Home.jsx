import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import { checkHealth } from '../services/api';

const Home = () => {
  const [backendStatus, setBackendStatus] = useState('Checking connection...');

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
        
        <div className="glass-panel" style={{ padding: '1.5rem 3rem', display: 'inline-block' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>System Status</h3>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.1rem' }}>{backendStatus}</p>
        </div>
      </main>
    </div>
  );
};

export default Home;
