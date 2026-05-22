import React, { createContext, useState, useContext } from 'react';

// Create the context
const AppContext = createContext();

// Create the provider component
export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  
  // Global Document State
  const [uploadedFilename, setUploadedFilename] = useState(null);
  const [extractedText, setExtractedText] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [chunkMetadata, setChunkMetadata] = useState(null);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = {
    theme,
    toggleTheme,
    // Document state
    uploadedFilename,
    setUploadedFilename,
    extractedText,
    setExtractedText,
    chunks,
    setChunks,
    chunkMetadata,
    setChunkMetadata
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to easily use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
