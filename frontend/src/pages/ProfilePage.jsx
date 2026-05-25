import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/users/me');
        if (response.data?.status === 'success') {
          setProfileData(response.data.data);
        }
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/')}
          className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Your Profile</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden animate-fadeIn">
        <div className="p-8 sm:p-10 flex flex-col items-center border-b border-neutral-100 bg-neutral-50/50">
          <div className="w-24 h-24 bg-neutral-900 text-white rounded-full flex items-center justify-center shadow-lg mb-4">
            <User size={48} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">{user?.username}</h2>
          <p className="text-neutral-500">Member</p>
        </div>

        <div className="p-8 sm:p-10">
          <h3 className="text-lg font-bold text-neutral-900 mb-6">Account Statistics</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-neutral-400" size={32} />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4 bg-red-50 rounded-xl">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-500">Documents Uploaded</p>
                  <p className="text-2xl font-bold text-neutral-900">{profileData?.document_count || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
