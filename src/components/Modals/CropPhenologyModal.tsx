import React from 'react';
import { X, Sprout, Calendar, Clock, Award, Droplets, Sun, Sparkles, ChevronRight } from 'lucide-react';

interface CropPhenologyModalProps {
  cropName: string;
  variety?: string;
  stage: string;
  onClose: () => void;
}

export default function CropPhenologyModal({ cropName, variety, stage, onClose }: CropPhenologyModalProps) {
  const stages = [
    { name: 'Germination & Emergence', duration: 'Days 1–10', completed: true, current: false },
    { name: 'Vegetative Canopy Growth', duration: 'Days 11–45', completed: true, current: false },
    { name: 'Active Branching & Squaring', duration: 'Days 46–70', completed: false, current: true },
    { name: 'Peak Flowering & Boll Setting', duration: 'Days 71–105', completed: false, current: false },
    { name: 'Boll Maturation & Harvest', duration: 'Days 106–145', completed: false, current: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-green-600 text-white rounded-2xl shadow-sm">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-gray-900">{cropName} {variety ? `(${variety})` : ''}</h3>
                <span className="text-xs bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">{stage}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Phenological Growth Stage Tracking & Thermal Units</p>
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
          {/* Key Agronomic Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-center">
              <span className="text-[11px] text-gray-500 font-medium">Days in Field</span>
              <div className="text-2xl font-black text-gray-900 mt-0.5">Day 48</div>
              <span className="text-[10px] text-green-600 font-semibold">On Schedule</span>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-center">
              <span className="text-[11px] text-gray-500 font-medium">Accumulated GDD</span>
              <div className="text-2xl font-black text-emerald-600 mt-0.5">640</div>
              <span className="text-[10px] text-gray-400">Target: 1,200 GDD</span>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-center">
              <span className="text-[11px] text-gray-500 font-medium">Next Milestone</span>
              <div className="text-sm font-black text-blue-600 mt-1.5">Squaring Peak</div>
              <span className="text-[10px] text-blue-500">In ~11 Days</span>
            </div>
          </div>

          {/* Phenological Timeline */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-1.5 text-green-600" />
              Growth Cycle Timeline
            </h4>
            <div className="space-y-2.5">
              {stages.map((stg, i) => (
                <div 
                  key={i} 
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    stg.current 
                      ? 'bg-green-50/80 border-green-300 ring-2 ring-green-500/20' 
                      : stg.completed 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-white border-dashed border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      stg.completed 
                        ? 'bg-green-600 text-white' 
                        : stg.current 
                        ? 'bg-emerald-500 text-white animate-pulse' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {stg.completed ? '✓' : i + 1}
                    </div>
                    <div>
                      <h5 className={`text-xs font-bold ${stg.current ? 'text-green-900' : 'text-gray-800'}`}>{stg.name}</h5>
                      <span className="text-[10px] text-gray-500">{stg.duration}</span>
                    </div>
                  </div>
                  {stg.current && (
                    <span className="text-[10px] font-bold bg-green-600 text-white px-2.5 py-1 rounded-full shadow-xs">
                      CURRENT STAGE
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Targeted Care for This Stage */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-1.5 text-emerald-600" />
              Stage-Specific Agronomy Guidance
            </h4>
            <ul className="space-y-1.5 text-xs text-emerald-800">
              <li>• <strong>Nutrient Demand: </strong> Nitrogen uptake is at maximum demand. Top-dress split urea or apply compost extract.</li>
              <li>• <strong>Moisture Management: </strong> Avoid moisture stress during square initiation to prevent bud shedding.</li>
              <li>• <strong>Pest Scouting: </strong> Check terminal shoots twice weekly for aphids and jassids.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-gray-800 transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
