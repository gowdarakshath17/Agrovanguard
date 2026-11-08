import React, { useState } from 'react';
import { Bug, AlertTriangle, MapPin, ShieldCheck, Activity, Search, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MOCK_PESTS = [
  { id: 1, name: 'Pink Bollworm (गुलाबी बोंडअळी)', distance: '0.8 km away', severity: 'High', date: '1 hour ago', status: 'Approaching' },
  { id: 2, name: 'Fall Armyworm (लष्करी अळी)', distance: '2.1 km away', severity: 'High', date: '3 hours ago', status: 'Detected' },
  { id: 3, name: 'Cotton Whitefly (पांढरी माशी)', distance: '4.2 km away', severity: 'Moderate', date: 'Yesterday', status: 'Contained' }
];

export default function PestInfestationTracker() {
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const handleReport = () => {
    setReporting(true);
    setTimeout(() => {
      setReporting(false);
      setReported(true);
      setTimeout(() => setReported(false), 3000);
    }, 1500);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mt-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center text-gray-900 font-bold text-lg">
            <Bug className="h-6 w-6 mr-2 text-red-600" />
            Pest Infestation Radar
          </div>
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-lg font-bold flex items-center">
            <Activity className="h-3 w-3 mr-1 animate-pulse" /> Live
          </span>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-5 flex items-start">
          <AlertTriangle className="h-6 w-6 text-orange-600 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-orange-900 text-sm">High Risk Warning</h4>
            <p className="text-orange-800 text-xs mt-1">
              Current weather conditions (high humidity, warm temperatures) are optimal for <b>Fall Armyworm</b> breeding in your area. Preventative spraying is recommended within 48 hours.
            </p>
          </div>
        </div>

        <h4 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wider flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-gray-400" /> Nearby Reports
        </h4>
        
        <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-2">
          {MOCK_PESTS.map((pest) => (
            <div key={pest.id} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex justify-between items-center">
              <div>
                <div className="flex items-center">
                  <span className="font-bold text-gray-900 text-sm">{pest.name}</span>
                  {pest.severity === 'High' || pest.severity === 'Severe' ? (
                    <span className="ml-2 bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">{pest.severity}</span>
                  ) : (
                    <span className="ml-2 bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">{pest.severity}</span>
                  )}
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <MapPin className="h-3 w-3 mr-1" /> {pest.distance} • {pest.date}
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold ${pest.status === 'Contained' ? 'text-green-600' : 'text-orange-600'}`}>
                  {pest.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3 border-t border-gray-100 pt-5">
          <button 
            onClick={handleReport}
            disabled={reporting || reported}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center disabled:opacity-50"
          >
            {reporting ? (
              <span className="flex items-center"><Activity className="h-4 w-4 animate-spin mr-2" /> Submitting...</span>
            ) : reported ? (
              <span className="flex items-center text-green-700"><ShieldCheck className="h-4 w-4 mr-2" /> Reported!</span>
            ) : (
              <span className="flex items-center"><AlertTriangle className="h-4 w-4 mr-2" /> Report Sighting</span>
            )}
          </button>
          <button 
            onClick={() => setShowHeatmap(true)}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center"
          >
            <Search className="h-4 w-4 mr-2 text-gray-500" />
            View Heatmap
          </button>
        </div>
      </div>

      {showHeatmap && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] overflow-hidden flex flex-col shadow-2xl relative">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 relative shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-red-600" />
                Regional Pest Heatmap
              </h3>
              <button 
                onClick={() => setShowHeatmap(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 relative w-full h-full">
              <MapContainer 
                center={[20.9374, 77.7796]} 
                zoom={12} 
                style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {/* Pink Bollworm & Fall Armyworm - High Risk Area */}
                <Circle 
                  center={[20.9474, 77.7896]} 
                  pathOptions={{ fillColor: '#ef4444', color: '#ef4444', fillOpacity: 0.4 }} 
                  radius={1500} 
                />
                
                {/* Cotton Whitefly & Aphids - Moderate Risk Area */}
                <Circle 
                  center={[20.9174, 77.7596]} 
                  pathOptions={{ fillColor: '#f97316', color: '#f97316', fillOpacity: 0.4 }} 
                  radius={900} 
                />
                
                <Marker position={[20.9374, 77.7796]}>
                  <Popup>
                    <strong>Your Farm (Vidarbha Agro Twin)</strong><br/>
                    Drip system active &bull; Monitoring perimeter.
                  </Popup>
                </Marker>
                
                <Marker position={[20.9474, 77.7896]}>
                  <Popup>
                    <strong>Pink Bollworm (गुलाबी बोंडअळी)</strong><br/>
                    High Severity Outbreak (North Sector)
                  </Popup>
                </Marker>
                
                <Marker position={[20.9174, 77.7596]}>
                  <Popup>
                    <strong>Cotton Whitefly & Aphids</strong><br/>
                    Moderate Vector Alert (South Sector)
                  </Popup>
                </Marker>
              </MapContainer>
              
              {/* Floating Legend */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur p-4 rounded-xl border border-gray-200 shadow-lg text-sm z-[400] pointer-events-none">
                <div className="font-bold text-gray-900 mb-3">Severity Legend</div>
                <div className="flex items-center mb-2"><div className="w-4 h-4 rounded-full bg-red-500 mr-3 opacity-80"></div> High Risk (Outbreak)</div>
                <div className="flex items-center mb-2"><div className="w-4 h-4 rounded-full bg-orange-500 mr-3 opacity-80"></div> Moderate (Contained)</div>
                <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-blue-600 mr-3"></div> Your Farm</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
