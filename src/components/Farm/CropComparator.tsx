import React, { useState } from 'react';
import { Scale, Droplets, ShieldAlert, Bug, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface CropComparisonData {
  name: string;
  diseaseResistance: string;
  waterRequirements: string;
  pesticideSchedule: string;
}

interface CompareResponse {
  crop1: CropComparisonData;
  crop2: CropComparisonData;
}

const CROP_OPTIONS = [
  'Wheat', 'Rice', 'Corn', 'Cotton', 'Sugarcane', 
  'Tomato', 'Potato', 'Soybean', 'Onion', 'Mango'
];

export default function CropComparator() {
  const { getToken } = useAuth();
  const [crop1, setCrop1] = useState('Wheat');
  const [crop2, setCrop2] = useState('Rice');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (crop1 === crop2) {
      setError("Please select two different crops to compare.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/ai/compare-crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ crop1, crop2 })
      });
      
      if (!res.ok) throw new Error("Failed to fetch comparison");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError("Could not load comparison. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center text-gray-900 font-bold text-lg">
          <Scale className="h-6 w-6 mr-2 text-indigo-600" />
          AI Crop Comparator
        </div>
        <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-lg font-medium">Gemini AI</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Crop 1</label>
          <select 
            value={crop1} 
            onChange={e => setCrop1(e.target.value)} 
            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            {CROP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Crop 2</label>
          <select 
            value={crop2} 
            onChange={e => setCrop2(e.target.value)} 
            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            {CROP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

      <button 
        onClick={handleCompare} 
        disabled={loading}
        className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Scale className="h-5 w-5 mr-2" />}
        {loading ? "Analyzing..." : "Compare Crops"}
      </button>

      {result && !loading && (
        <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-gray-200 bg-gray-50 border-b border-gray-200">
            <div className="p-3 text-center font-bold text-indigo-900 text-lg">{result.crop1.name}</div>
            <div className="p-3 text-center font-bold text-indigo-900 text-lg">{result.crop2.name}</div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {/* Disease Resistance */}
            <div className="p-4">
              <h4 className="flex items-center text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                <ShieldAlert className="h-4 w-4 mr-2 text-orange-500" /> Disease Resistance
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm text-gray-600 pr-2 border-r border-gray-100">{result.crop1.diseaseResistance}</div>
                <div className="text-sm text-gray-600 pl-2">{result.crop2.diseaseResistance}</div>
              </div>
            </div>

            {/* Water Requirements */}
            <div className="p-4 bg-gray-50/50">
              <h4 className="flex items-center text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                <Droplets className="h-4 w-4 mr-2 text-blue-500" /> Water Requirements
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm text-gray-600 pr-2 border-r border-gray-100">{result.crop1.waterRequirements}</div>
                <div className="text-sm text-gray-600 pl-2">{result.crop2.waterRequirements}</div>
              </div>
            </div>

            {/* Pesticide Schedule */}
            <div className="p-4">
              <h4 className="flex items-center text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                <Bug className="h-4 w-4 mr-2 text-green-600" /> Optimal Pesticide Schedule
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm text-gray-600 pr-2 border-r border-gray-100">{result.crop1.pesticideSchedule}</div>
                <div className="text-sm text-gray-600 pl-2">{result.crop2.pesticideSchedule}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
