import React from 'react';
import { X, ShieldAlert, Bug, AlertTriangle, Crosshair, ArrowRight, ShieldCheck, ThermometerSun, Droplets } from 'lucide-react';

interface PestRiskModalProps {
  onClose: () => void;
  onOpenScanner: () => void;
}

export default function PestRiskModal({ onClose, onOpenScanner }: PestRiskModalProps) {
  const quadrants = [
    { name: 'North-East Sector (Plot A)', risk: '78%', status: 'Critical', color: 'bg-red-500' },
    { name: 'North-West Sector', risk: '44%', status: 'Elevated', color: 'bg-orange-500' },
    { name: 'South-East Sector', risk: '32%', status: 'Moderate', color: 'bg-amber-500' },
    { name: 'South-West Sector', risk: '15%', status: 'Low Risk', color: 'bg-emerald-500' },
  ];

  const pestVectors = [
    {
      name: 'Early Blight (Alternaria solani)',
      type: 'Fungal Pathogen',
      severity: 'High',
      vectorCondition: 'Prolonged dew > 4 hours & 24-28°C temperatures',
      recommendation: 'Targeted biological Bacillus subtilis foliar spray before rain onset.'
    },
    {
      name: 'Whitefly Infestation (Bemisia tabaci)',
      type: 'Sucking Insect',
      severity: 'Medium',
      vectorCondition: 'High dry canopy temperatures with low wind',
      recommendation: 'Deploy yellow sticky traps (15 traps/acre) & 5% Neem seed kernel extract.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-600 text-white rounded-2xl shadow-sm">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-gray-900">Pest Infestation Threat Analysis</h3>
                <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">HIGH THREAT</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Real-time biological vector detection & microclimate susceptibility</p>
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
          {/* Outbreak Probability Warning */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-900 text-sm">Spore Dispersion Window Active</h4>
              <p className="text-red-700 text-xs mt-1 leading-relaxed">
                Relative humidity of 82% combined with current 27°C soil canopy temperatures creates an optimal incubation window for foliar blight spores over the next 24 hours.
              </p>
            </div>
          </div>

          {/* Microclimate Spore Conditions */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Droplets className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-medium">Canopy Humidity</span>
                  <div className="text-lg font-black text-gray-900">82%</div>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-md">Critical</span>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <ThermometerSun className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-medium">Zone Temperature</span>
                  <div className="text-lg font-black text-gray-900">27.4°C</div>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">Optimal for Pest</span>
            </div>
          </div>

          {/* Sector Risk Breakdown */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
                <Crosshair className="h-4 w-4 mr-1 text-red-600" />
                Sector Vulnerability Heatmap
              </span>
              <span className="text-xs text-red-600 font-bold">North-East Sector Priority</span>
            </div>
            <div className="space-y-2.5">
              {quadrants.map((q, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-3 w-3 rounded-full ${q.color}`} />
                    <span className="text-xs font-bold text-gray-800">{q.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-gray-900">{q.risk}</span>
                    <span className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">{q.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detected Biological Threats */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Identified Biological Vectors</h4>
            <div className="space-y-3">
              {pestVectors.map((v, i) => (
                <div key={i} className="p-4 rounded-2xl border border-gray-200 bg-white shadow-xs">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h5 className="font-bold text-gray-900 text-sm">{v.name}</h5>
                      <span className="text-xs text-gray-500">{v.type}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${v.severity === 'High' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                      {v.severity} Severity
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="font-semibold text-gray-700">Recommended Action: </span>
                    {v.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Dismiss
          </button>
          <button 
            onClick={() => {
              onClose();
              onOpenScanner();
            }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-red-700 transition-all hover:shadow-lg active:scale-95"
          >
            <Bug className="h-4 w-4" />
            <span>Scan Sector for Pests</span>
          </button>
        </div>
      </div>
    </div>
  );
}
