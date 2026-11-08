import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { MapPin, Sprout, Calendar, Loader2 } from 'lucide-react';

export default function FarmOnboarding({ onComplete }: { onComplete: () => void }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    farmName: '',
    crop: '',
    variety: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = await getToken();
      
      // We simulate GPS location for this phase
      const simulatedLocation = { lat: 19.0760, lon: 72.8777 }; 

      const res = await fetch('/api/farms/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          location: simulatedLocation,
          sowingDate: new Date().toISOString()
        })
      });

      if (!res.ok) throw new Error('Failed to save farm passport');
      
      onComplete();
    } catch (err) {
      console.error(err);
      alert('Failed to initialize farm. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Sprout className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome to Agro Vanguard</h2>
          <p className="mt-2 text-lg text-gray-600">Let's set up your Maharashtra Digital Farm Passport to get highly accurate risk predictions.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Farm Name (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.farmName}
                onChange={(e) => setFormData({...formData, farmName: e.target.value})}
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg transition-colors"
                placeholder="e.g. North Valley Farm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Crop</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Sprout className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={formData.crop}
                onChange={(e) => setFormData({...formData, crop: e.target.value})}
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg appearance-none transition-colors"
                required
              >
                <option value="" disabled>Select a crop...</option>
                <option value="Cotton">Cotton</option>
                <option value="Tomato">Tomato</option>
                <option value="Paddy">Paddy / Rice</option>
                <option value="Soybean">Soybean</option>
                <option value="Wheat">Wheat</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Crop Variety (Optional)</label>
            <input
              type="text"
              value={formData.variety}
              onChange={(e) => setFormData({...formData, variety: e.target.value})}
              className="block w-full px-4 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg transition-colors"
              placeholder="e.g. BT Cotton, Roma"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-xl font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Initialize Farm Passport'}
          </button>
        </form>
      </div>
    </div>
  );
}
