import React from 'react';
import { X, FlaskConical, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, Sparkles, Scale } from 'lucide-react';

export interface SoilNutrientInfo {
  name: string;
  symbol: string;
  currentValue: string | number;
  unit: string;
  idealRange: string;
  status: 'Deficient' | 'Optimal' | 'Excessive' | 'Critical Acidic' | 'Alkaline';
  statusColor: string;
  statusBg: string;
  description: string;
  symptoms: string[];
  remediationPlan: string[];
}

interface SoilNutrientModalProps {
  nutrient: SoilNutrientInfo;
  onClose: () => void;
}

export default function SoilNutrientModal({ nutrient, onClose }: SoilNutrientModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-amber-700 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-sm">
              {nutrient.symbol}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-gray-900">{nutrient.name} Profile</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${nutrient.statusBg} ${nutrient.statusColor}`}>
                  {nutrient.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Soil bioavailability and root assimilation diagnostics</p>
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
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Gauge */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-medium">Current Sensor Reading</span>
              <div className="text-3xl font-black text-gray-900 mt-0.5">
                {nutrient.currentValue} <span className="text-sm font-normal text-gray-500">{nutrient.unit}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 font-medium">Target Agronomic Benchmark</span>
              <div className="text-sm font-bold text-emerald-600 mt-0.5">
                {nutrient.idealRange}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
            {nutrient.description}
          </p>

          {/* Plant Symptoms */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-600" />
              Observed Crop Symptoms
            </h4>
            <div className="space-y-1.5">
              {nutrient.symptoms.map((s, idx) => (
                <div key={idx} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-700 flex items-start">
                  <span className="text-amber-500 mr-2 font-bold">•</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Corrective Prescription */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-1.5 text-emerald-600" />
              Recommended Agronomic Correction
            </h4>
            <div className="space-y-1.5">
              {nutrient.remediationPlan.map((r, idx) => (
                <div key={idx} className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-gray-800 transition-all active:scale-95"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
