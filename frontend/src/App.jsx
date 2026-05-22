import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/common/Header';
import LandingPage from './pages/LandingPage';
import DocumentPage from './pages/DocumentPage';
import StudyPage from './pages/StudyPage';
import FloatingChatWidget from './components/chat/FloatingChatWidget';
import './App.css';

const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-container bg-neutral-50/50" style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/document" element={<DocumentPage />} />
            <Route path="/study" element={<StudyPage />} />
          </Routes>
          <FloatingChatWidget />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
