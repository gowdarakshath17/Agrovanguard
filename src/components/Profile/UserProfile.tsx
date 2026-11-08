import React, { useState } from 'react';
import { User, Phone, Mail, Globe, Save, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import GoogleSheetsSync from './GoogleSheetsSync.tsx';

export default function UserProfile({ profile, onUpdate, onClose }: { profile: any, onUpdate: () => void, onClose: () => void }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    email: profile?.email || '',
    phoneNumber: profile?.phoneNumber || '',
    preferredLanguage: profile?.preferredLanguage || 'English',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((profile?.profileEditsLeft ?? 0) <= 0) {
      setError("No profile edits remaining.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
        
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 flex items-start bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-6 bg-blue-50 text-blue-800 p-4 rounded-xl flex items-center justify-between border border-blue-100">
            <span className="text-sm font-medium">Modifications Remaining:</span>
            <span className="text-xl font-black">{profile?.profileEditsLeft ?? 3}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500"
                  placeholder="Your Name"
                  disabled={(profile?.profileEditsLeft ?? 0) <= 0}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-gray-50"
                  readOnly={!!profile.email} // Usually email from auth shouldn't be easily changeable here unless they signed up via phone
                  disabled={(profile?.profileEditsLeft ?? 0) <= 0 || !!profile.email}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 bg-gray-50"
                  readOnly={!!profile.phoneNumber} // Same here
                  disabled={(profile?.profileEditsLeft ?? 0) <= 0 || !!profile.phoneNumber}
                  placeholder="+1..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => setFormData({...formData, preferredLanguage: e.target.value})}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500"
                  disabled={(profile?.profileEditsLeft ?? 0) <= 0}
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || (profile?.profileEditsLeft ?? 0) <= 0}
                className="w-full flex items-center justify-center py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
          <GoogleSheetsSync userProfile={profile} />
        </div>
      </div>
    </div>
  );
}
