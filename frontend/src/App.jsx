import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Header from './components/common/Header';
import LandingPage from './pages/LandingPage';
import DocumentPage from './pages/DocumentPage';
import StudyPage from './pages/StudyPage';
import AdvancedDebugPage from './pages/AdvancedDebugPage';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <div className="app-container bg-neutral-50/50" style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
            <Header />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/document" element={
                <ProtectedRoute>
                  <DocumentPage />
                </ProtectedRoute>
              } />
              <Route path="/study" element={
                <ProtectedRoute>
                  <StudyPage />
                </ProtectedRoute>
              } />
              <Route path="/debug" element={
                <ProtectedRoute>
                  <AdvancedDebugPage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
