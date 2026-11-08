import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, AlertTriangle, Clock } from 'lucide-react';
import { WeatherData } from '../../types/weather.ts';
import { useAuth } from '../../context/AuthContext.tsx';

export default function WeatherAIManager({ lat = 19.0760, lon = 72.8777 }: { lat?: number, lon?: number }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    let mounted = true;
    
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const res = await fetch(`/api/weather/context?lat=${lat}&lon=${lon}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch weather data');
        
        const data = await res.json();
        if (mounted) setWeather(data);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Weather unavailable');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchWeather();
    return () => { mounted = false; };
  }, [lat, lon, getToken]);

  const getFreshnessColor = (state: string) => {
    switch (state) {
      case 'LIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'RECENT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CACHED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'STALE': return 'bg-red-100 text-red-800 border-red-200';
      case 'SIMULATED': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse flex h-48">
        <div className="w-full h-full bg-gray-50 rounded-xl"></div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-orange-50 rounded-2xl p-6 shadow-sm border border-orange-100 flex items-start">
        <AlertTriangle className="h-6 w-6 text-orange-500 mt-1" />
        <div className="ml-3">
          <h3 className="text-lg font-medium text-orange-900">Weather Unavailable</h3>
          <p className="mt-1 text-sm text-orange-700">Continuing risk assessment with reduced confidence. {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with Freshness Engine */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center space-x-2">
          <Cloud className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-bold text-gray-900">Predictive Weather AI</h3>
        </div>
        <div className={`px-2.5 py-1 rounded-md border text-xs font-semibold tracking-wider flex items-center ${getFreshnessColor(weather.freshness)}`}>
          {weather.freshness === 'SIMULATED' ? <Sun className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
          {weather.freshness}
        </div>
      </div>

      <div className="p-6">
        {/* Current State */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-end">
              <span className="text-5xl font-extrabold text-gray-900">{Math.round(weather.temperature)}°</span>
              <span className="text-xl text-gray-500 mb-1 ml-1">C</span>
            </div>
            <p className="text-gray-600 font-medium mt-1">{weather.condition}</p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <div className="flex items-center text-gray-700">
              <Droplets className="h-5 w-5 text-blue-500 mr-2" />
              <span className="font-medium">{weather.humidity}% Humidity</span>
            </div>
            <div className="flex items-center text-gray-700">
              <CloudRain className="h-5 w-5 text-indigo-500 mr-2" />
              <span className="font-medium">{weather.rainfallProbability}% Rain Risk</span>
            </div>
          </div>
        </div>

        {/* Forecast / Risk Trajectory Input */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">5-Day Environmental Risk Trajectory</h4>
          <div className="grid grid-cols-5 gap-2">
            {weather.forecast.map((day) => (
              <div key={day.dayOffset} className="bg-gray-50 rounded-xl p-3 text-center flex flex-col items-center">
                <span className="text-xs font-semibold text-gray-500 mb-2">Day +{day.dayOffset}</span>
                {day.rainfallProbability > 50 ? (
                  <CloudRain className="h-6 w-6 text-blue-500 mb-2" />
                ) : (
                  <Sun className="h-6 w-6 text-yellow-500 mb-2" />
                )}
                <span className="text-sm font-bold text-gray-900">{Math.round(day.temperature)}°</span>
                <span className="text-xs text-blue-600 font-medium mt-1">{day.rainfallProbability}%</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-400 flex justify-between">
          <span>Source: {weather.source}</span>
          <span>Updated: {new Date(weather.lastUpdated).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
