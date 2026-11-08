import React, { useState } from 'react';
import { Leaf, Wind, CloudRain, Sun, CalendarClock, ShieldCheck, Droplets, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

export default function EcoPesticideScheduler() {
  const [scheduled, setScheduled] = useState<string | null>(null);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center text-gray-900 font-bold text-lg">
          <Leaf className="h-6 w-6 mr-2 text-green-600" />
          Eco-Pesticide Scheduler
        </div>
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-lg font-bold flex items-center">
          <ShieldCheck className="h-3 w-3 mr-1" /> AI Optimized
        </span>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 flex items-start">
        <Droplets className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-blue-900 text-sm">Target: Early Blight (Fungal)</h4>
          <p className="text-blue-800 text-xs mt-1">
            Cross-referencing disease analysis with local weather. To prevent chemical run-off and ensure absorption, spraying requires &lt;10km/h wind and no rain for 24 hours.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
          <Wind className="h-5 w-5 mx-auto text-green-500 mb-1" />
          <div className="text-xs font-bold text-gray-700">Wind</div>
          <div className="text-[10px] text-gray-500">8 km/h (Low Drift)</div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
          <CloudRain className="h-5 w-5 mx-auto text-green-500 mb-1" />
          <div className="text-xs font-bold text-gray-700">Rain</div>
          <div className="text-[10px] text-gray-500">Clear 48h (No Run-off)</div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
          <Sun className="h-5 w-5 mx-auto text-orange-500 mb-1" />
          <div className="text-xs font-bold text-gray-700">Temp</div>
          <div className="text-[10px] text-gray-500">22°C (Optimal)</div>
        </div>
      </div>

      <h4 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wider flex items-center">
        <CalendarClock className="h-4 w-4 mr-1 text-gray-400" /> Recommended Spray Windows
      </h4>
      
      <div className="space-y-3">
        {/* Slot 1: Optimal */}
        <div className={`p-4 border rounded-xl transition-all ${scheduled === 'slot1' ? 'bg-green-50 border-green-300' : 'bg-white border-green-200 hover:border-green-300'}`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center">
                <span className="font-bold text-gray-900">Tomorrow, 06:00 AM</span>
                <span className="ml-2 bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">98% Eco-Safe</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Perfect conditions. High absorption, zero run-off risk.</p>
            </div>
          </div>
          {scheduled === 'slot1' ? (
            <div className="mt-3 text-sm font-bold text-green-700 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Scheduled
            </div>
          ) : (
            <button onClick={() => setScheduled('slot1')} className="mt-2 text-sm font-bold text-green-600 hover:text-green-700 flex items-center transition-colors">
              Schedule Application <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>

        {/* Slot 2: Moderate */}
        <div className={`p-4 border rounded-xl transition-all ${scheduled === 'slot2' ? 'bg-green-50 border-green-300' : 'bg-white border-yellow-200 hover:border-yellow-300'}`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center">
                <span className="font-bold text-gray-900">Today, 06:30 PM</span>
                <span className="ml-2 bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">82% Eco-Safe</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Moderate wind (12km/h). Slight risk of chemical drift.</p>
            </div>
          </div>
          {scheduled === 'slot2' ? (
            <div className="mt-3 text-sm font-bold text-green-700 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Scheduled
            </div>
          ) : (
            <button onClick={() => setScheduled('slot2')} className="mt-2 text-sm font-bold text-yellow-600 hover:text-yellow-700 flex items-center transition-colors">
              Schedule Application <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>

        {/* Slot 3: Do Not Spray */}
        <div className="p-4 border border-red-200 bg-red-50 rounded-xl opacity-75">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <span className="font-bold text-gray-900 line-through">Tomorrow, 02:00 PM</span>
                <span className="ml-2 bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" /> Do Not Spray
                </span>
              </div>
              <p className="text-xs text-red-600 mt-1">High temp (31°C) will cause leaf burn. Rain expected at 4 PM (100% run-off risk).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
