import React from 'react';
import { CalendarCheck, X, CheckCircle2 } from 'lucide-react';

export default function ViewActionModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-2">
            <CalendarCheck className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold">Action Plan</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start">
            <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-blue-900">Today's Priority</p>
              <p className="text-sm text-blue-700 mt-1">Inspect lower leaves today for suspected early blight symptoms.</p>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start">
            <div className="h-5 w-5 rounded-full border-2 border-gray-300 mr-3 mt-0.5 flex-shrink-0"></div>
            <div>
              <p className="font-bold text-gray-900">Irrigation Cycle</p>
              <p className="text-sm text-gray-500 mt-1">Scheduled for tomorrow morning based on moisture levels.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
