import React from 'react';
import { Mic, X } from 'lucide-react';

export default function VoiceHelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl overflow-hidden text-center p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        <div className="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Mic className="h-10 w-10 text-green-600 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Voice Help Active</h3>
        <p className="text-gray-500 mb-6">Speak your question clearly. The AI is listening to provide audio assistance.</p>
        <button className="bg-red-50 text-red-600 font-bold py-3 px-6 rounded-xl hover:bg-red-100" onClick={onClose}>
          End Voice Session
        </button>
      </div>
    </div>
  );
}
