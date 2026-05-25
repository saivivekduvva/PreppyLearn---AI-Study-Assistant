import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, User, LogOut, Menu, X, Wifi, WifiOff } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { AuthContext } from '../../context/AuthContext';
import { checkHealth } from '../../services/api';

const Header = () => {
  const location = useLocation();
  const { uploadedFilename } = useAppContext();
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        await checkHealth();
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      }
    };
    
    verifyConnection();
    const intervalId = setInterval(verifyConnection, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? "text-neutral-900 font-semibold" : "text-neutral-500 hover:text-neutral-900";
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-neutral-900 text-white p-1.5 rounded-lg group-hover:bg-blue-600 transition-colors">
            <GraduationCap size={20} />
          </div>
          <span className="text-lg font-bold text-neutral-900 tracking-tight">PreppyLearn</span>
        </Link>

        {/* Navigation Links (Center) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={`text-sm transition-colors ${isActive('/')}`}>
            Home
          </Link>
          {user && (
            <>
              <Link to="/document" className={`text-sm transition-colors ${isActive('/document')}`}>
                My Library
              </Link>
              <Link to="/study" className={`text-sm transition-colors ${isActive('/study')}`}>
                Study Area
              </Link>
              {user.username === 'admin' && (
                <Link to="/admin" className={`text-sm font-semibold transition-colors flex items-center gap-1 ${isActive('/admin')}`}>
                  <User size={14} /> Admin Panel
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Action Buttons (Right) */}
        <div className="flex items-center gap-4">
          <span className={`text-xs font-medium px-2 py-1 rounded-md border hidden sm:flex items-center gap-1.5 transition-colors ${
            isConnected 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {isConnected ? (
              <><Wifi size={12} /> Connected</>
            ) : (
              <><WifiOff size={12} /> Offline</>
            )}
          </span>
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                <User size={16} /> {user.username || 'User'}
              </Link>
              <button onClick={logout} className="text-sm font-medium text-neutral-500 hover:text-red-600 transition-colors hidden sm:flex items-center gap-1 px-2">
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                Login
              </Link>
              <Link to="/register" className="text-sm font-medium bg-neutral-900 text-white px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-neutral-600 hover:text-neutral-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white absolute top-[100%] left-0 w-full shadow-lg flex flex-col p-4 gap-4 animate-fadeIn z-50">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`text-base font-medium px-4 py-2 rounded-lg ${isActive('/')}`}>
            Home
          </Link>
          {user ? (
            <>
              <Link to="/document" onClick={() => setIsMobileMenuOpen(false)} className={`text-base font-medium px-4 py-2 rounded-lg ${isActive('/document')}`}>
                My Library
              </Link>
              <Link to="/study" onClick={() => setIsMobileMenuOpen(false)} className={`text-base font-medium px-4 py-2 rounded-lg ${isActive('/study')}`}>
                Study Area
              </Link>
              {user.username === 'admin' && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className={`text-base font-medium px-4 py-2 rounded-lg text-blue-600 bg-blue-50 flex items-center gap-2 ${isActive('/admin')}`}>
                  <User size={18} /> Admin Panel
                </Link>
              )}
              <div className="h-px bg-neutral-100 my-2"></div>
              <button 
                onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
                className="text-base font-medium text-red-600 flex items-center gap-2 px-4 py-2"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium px-4 py-2 text-neutral-700">
                Login
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium px-4 py-2 bg-neutral-900 text-white rounded-lg text-center">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;

