import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Header = () => {
  const location = useLocation();
  const { uploadedFilename } = useAppContext();

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
          <Link to="/document" className={`text-sm transition-colors ${isActive('/document')}`}>
            Document Data
          </Link>
          <Link to="/study" className={`text-sm transition-colors ${isActive('/study')}`}>
            Study Area
          </Link>
        </nav>

        {/* Action Buttons (Right) */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-md border border-green-200 hidden sm:inline-block">
            Connected
          </span>
          {uploadedFilename ? (
             <Link to="/study" className="text-sm font-medium bg-neutral-900 text-white px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors flex items-center gap-2">
               Study Now <ArrowRight size={16} />
             </Link>
          ) : (
             <Link to="/" className="text-sm font-medium bg-neutral-900 text-white px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors">
               Upload PDF
             </Link>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
