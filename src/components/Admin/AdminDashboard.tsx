import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { LogOut, Users, Search, Activity, ShieldCheck, MapPin } from 'lucide-react';
import { OfflineIndicator } from '../PWA/OfflineIndicator.tsx';

export default function AdminDashboard() {
  const { logout, getToken } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logins' | 'searches'>('logins');

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    async function loadAdminData(isInitial = false) {
      try {
        const token = await getToken();
        if (!token) return;

        const [usersRes, statsRes] = await Promise.all([
          fetch('/api/users/all', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/farms/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.logins || []);
        }
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        if (isInitial) setLoading(false);
      }
    }
    
    loadAdminData(true);
    
    // Poll every 3 seconds for real-time updates
    intervalId = setInterval(() => {
      loadAdminData(false);
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [getToken]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <OfflineIndicator />
      
      {/* Header */}
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-700 p-2 rounded-xl">
              <ShieldCheck className="h-6 w-6 text-emerald-100" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Admin Console</h1>
              <p className="text-emerald-200 text-xs font-medium">System Monitoring</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center space-x-2 text-emerald-100 hover:text-white transition-colors"
          >
            <span className="text-sm font-medium hidden sm:block">Sign Out</span>
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Users</h3>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{users.length || 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Farms</h3>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalFarms || 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Searches Logged</h3>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Search className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.recentSearches?.length || 0}</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('logins')}
              className={`flex-1 sm:flex-none px-6 py-4 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors ${
                activeTab === 'logins' 
                  ? 'bg-white border-b-2 border-emerald-600 text-emerald-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Recent Logins</span>
            </button>
            <button
              onClick={() => setActiveTab('searches')}
              className={`flex-1 sm:flex-none px-6 py-4 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors ${
                activeTab === 'searches' 
                  ? 'bg-white border-b-2 border-emerald-600 text-emerald-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>User Data Searched</span>
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : activeTab === 'logins' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User / UID</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email / Phone</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u: any) => (
                      <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{u.uid}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{u.email || u.phoneNumber || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.lastLogin || Date.now()).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                          No recent login activity found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.recentSearches?.map((s: any, idx: number) => (
                  <div key={idx} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-xl bg-gray-50">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shrink-0">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {s.email} triggered {s.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{s.details}</p>
                    </div>
                    <div className="ml-auto text-xs text-gray-400">
                      {new Date(s.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {(!stats?.recentSearches || stats.recentSearches.length === 0) && (
                  <div className="py-8 text-center text-sm text-gray-500">
                    No recent data searches recorded.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
