import React from 'react';
import Home from './pages/Home';
import { AppProvider } from './context/AppContext';
import './App.css'; // Make sure this exists, or remove if not using default Vite CSS

const App = () => {
  return (
    <AppProvider>
      <div className="app-container" style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
        <Home />
      </div>
    </AppProvider>
  );
};

export default App;
