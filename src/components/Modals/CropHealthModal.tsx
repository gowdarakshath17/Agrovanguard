import React from 'react';
import { X, Leaf, Activity, Sparkles, CheckCircle2, ChevronRight, Camera, ArrowUpRight, TrendingUp } from 'lucide-react';

interface CropHealthModalProps {
  score: number;
  cropName: string;
  onClose: () => void;
  onOpenScanner: () => void;
}

export default function CropHealthModal({ score, cropName, onClose, onOpenScanner }: CropHealthModalProps) {
  const metrics = [
    { label: 'Canopy Density Index', value: '88%', status: 'Optimal', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Chlorophyll Bio-Absorption', value: '81%', status: 'Good', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Root Zone Respiration', value: '79%', status: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Stem Vascular Vigor', value: '87%', status: 'Optimal', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const historicalTrend = [
    { day: 'Mon', score: 81 },
    { day: 'Tue', score: 82 },
    { day: 'Wed', score: 85 },
    { day: 'Thu', score: 83 },
    { day: 'Fri', score: 86 },
    { day: 'Sat', score: 85 },
    { day: 'Today', score: 84 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-50/80 to-green-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-sm">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-gray-900">Crop Health Diagnostic</h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Live Telemetry</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Multispectral plant health report for {cropName}</p>
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
          {/* Main Score Hero */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-100 font-bold">Overall Vitality Score</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-5xl font-black">{score}</span>
                  <span className="text-xl text-emerald-100 font-medium">/ 100</span>
                </div>
                <p className="text-xs text-emerald-100 mt-2 max-w-xs">
                  Standing vigor is strong with high chlorophyll activity. Minor foliar stress noted in lower canopy.
                </p>
              </div>
              <div className="h-20 w-20 rounded-full border-4 border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                <Activity className="h-10 w-10 text-white animate-pulse" />
              </div>
            </div>
          </div>

          {/* 7-Day Trajectory */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-emerald-600" />
                7-Day Health Trajectory
              </span>
              <span className="text-xs text-emerald-700 font-semibold">+3% vs last week</span>
            </div>
            <div className="grid grid-cols-7 gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              {historicalTrend.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-full bg-gray-200 h-16 rounded-lg flex flex-col justify-end p-1 overflow-hidden">
                    <div 
                      className={`w-full rounded-md transition-all ${item.day === 'Today' ? 'bg-emerald-600' : 'bg-emerald-400'}`}
                      style={{ height: `${(item.score / 100) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-700 mt-1.5">{item.score}</span>
                  <span className="text-[10px] text-gray-400">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Sensor Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Canopy Biomass Breakdown</h4>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((m, i) => (
                <div key={i} className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 font-medium">{m.label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${m.bg} ${m.color}`}>
                      {m.status}
                    </span>
                  </div>
                  <div className="text-xl font-black text-gray-900">{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommended Actions */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center mb-2">
              <Sparkles className="h-4 w-4 mr-1.5 text-emerald-600" />
              Agronomist Action Checklist
            </h4>
            <ul className="space-y-2 text-xs text-emerald-800">
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                Apply 0.2% Zinc + Magnesium micronutrient foliar spray to elevate chlorophyll synthesis in lower leaves.
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                Maintain regular 6:00 AM drip cycles to stabilize root zone oxygenation.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Close
          </button>
          <button 
            onClick={() => {
              onClose();
              onOpenScanner();
            }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-emerald-700 transition-all hover:shadow-lg active:scale-95"
          >
            <Camera className="h-4 w-4" />
            <span>Launch Optical Scan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
