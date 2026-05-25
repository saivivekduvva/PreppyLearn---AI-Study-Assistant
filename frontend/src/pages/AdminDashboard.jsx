import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiClient } from '../services/api';
import { Users, FileText, Activity, ShieldAlert, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/users/all');
        setUsersData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  if (user?.username !== 'admin') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">Access Denied</h2>
        <p className="text-neutral-500">You do not have permission to view the Admin Dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 animate-fadeIn">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center shadow-md">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-neutral-500 mt-1 flex items-center gap-2">
            System overview and user management
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Total Users</p>
            <h3 className="text-3xl font-bold text-neutral-900">{usersData.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
            <FileText size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Total Documents</p>
            <h3 className="text-3xl font-bold text-neutral-900">
              {usersData.reduce((acc, curr) => acc + curr.document_count, 0)}
            </h3>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Activity size={20} /> User Directory
          </h3>
        </div>
        
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-neutral-500 gap-4">
            <Loader2 className="animate-spin text-neutral-900" size={40} />
            <p className="font-semibold uppercase tracking-widest text-sm">Loading Data...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 font-semibold">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-neutral-200">
                  <th className="p-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">ID</th>
                  <th className="p-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Username</th>
                  <th className="p-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Documents Uploaded</th>
                  <th className="p-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {usersData.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="p-4 px-6 text-sm font-medium text-neutral-500">#{u.id}</td>
                    <td className="p-4 px-6 font-bold text-neutral-900">{u.username}</td>
                    <td className="p-4 px-6 text-sm font-semibold text-neutral-600">
                      <span className="bg-neutral-100 px-3 py-1 rounded-full">{u.document_count}</span>
                    </td>
                    <td className="p-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                      </span>
                    </td>
                  </tr>
                ))}
                {usersData.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-neutral-500 font-semibold">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
