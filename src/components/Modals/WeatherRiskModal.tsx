import React from 'react';
import { X, CloudRain, Wind, Sun, AlertTriangle, Droplets, Compass, CheckCircle2 } from 'lucide-react';

interface WeatherRiskModalProps {
  onClose: () => void;
}

export default function WeatherRiskModal({ onClose }: WeatherRiskModalProps) {
  const weatherPoints = [
    { label: '48h Precipitation Likelihood', value: '65%', desc: 'Scattered thunderstorms expected tomorrow evening', icon: CloudRain, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Surface Wind Velocity', value: '14.2 km/h', desc: 'Slight chemical spray drift risk between 12:00 PM and 4:00 PM', icon: Wind, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Evapotranspiration Index', value: '4.8 mm/d', desc: 'Moderate foliar moisture loss rate', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Solar UV Stress Rating', value: '6.4 (Moderate)', desc: 'Peak leaf thermal stress from 1:00 PM to 3:00 PM', icon: Sun, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const hourlyForecast = [
    { time: '12 PM', temp: '29°C', rain: '10%', wind: '12 km/h' },
    { time: '3 PM', temp: '31°C', rain: '20%', wind: '15 km/h' },
    { time: '6 PM', temp: '28°C', rain: '45%', wind: '14 km/h' },
    { time: '9 PM', temp: '25°C', rain: '65%', wind: '11 km/h' },
    { time: '6 AM', temp: '23°C', rain: '30%', wind: '7 km/h' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-amber-50 to-yellow-50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-yellow-500 text-white rounded-2xl shadow-sm">
              <CloudRain className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-gray-900">Weather & Microclimate Advisory</h3>
                <span className="text-xs bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded-full">MODERATE RISK</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">High-precision local forecast for crop spraying & field operations</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Weather Advisory Notice */}
          <div className="bg-yellow-50/80 border border-yellow-200 rounded-2xl p-4 flex items-start">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-yellow-900 text-sm">Rainfall & Spray Drift Caution</h4>
              <p className="text-yellow-800 text-xs mt-1 leading-relaxed">
                Elevated winds this afternoon exceed the 10 km/h threshold for chemical spraying. Postpone foliar spraying until early morning (06:00 AM) when wind settles to 7 km/h.
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {weatherPoints.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/70 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${item.bg} ${item.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-gray-700">{item.label}</span>
                  </div>
                  <div className="text-2xl font-black text-gray-900 mb-1">{item.value}</div>
                  <p className="text-[11px] text-gray-500 leading-snug">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Microclimate Hourly Timeline */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Field Microclimate Forecast</h4>
            <div className="grid grid-cols-5 gap-2">
              {hourlyForecast.map((hour, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center flex flex-col items-center">
                  <span className="text-[11px] font-bold text-gray-500">{hour.time}</span>
                  <span className="text-sm font-black text-gray-900 my-1">{hour.temp}</span>
                  <div className="flex items-center space-x-1 text-[10px] text-blue-600 font-bold">
                    <CloudRain className="h-3 w-3" />
                    <span>{hour.rain}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">{hour.wind}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Practical Farm Guidelines */}
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Field Management Guidelines</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <strong>Clear Field Drainage: </strong> Ensure secondary furrows are clear to prevent waterlogging during the evening rain band.
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <strong>Automated Irrigation: </strong> Soil sensors will automatically delay pump scheduling if precipitation totals reach &gt; 8 mm.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-gray-800 transition-all active:scale-95"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
