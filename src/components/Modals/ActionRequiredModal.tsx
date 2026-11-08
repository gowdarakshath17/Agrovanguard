import React, { useState } from 'react';
import { X, CheckCircle2, Camera, AlertCircle, Sparkles, ShieldAlert, ArrowRight, Check, Microscope } from 'lucide-react';

interface ActionRequiredModalProps {
  onClose: () => void;
  onOpenScanner: () => void;
  onResolve: () => void;
  isResolved?: boolean;
  onEscalateToKVK?: () => void;
}

export default function ActionRequiredModal({ onClose, onOpenScanner, onResolve, isResolved, onEscalateToKVK }: ActionRequiredModalProps) {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Inspect lower foliage on sector North-East for yellow concentric ring spots ("target spots")', done: false },
    { id: 2, text: 'Examine stem collars for dark brown sunken cankers or collar rot', done: false },
    { id: 3, text: 'Confirm drip nozzles are not spraying direct liquid onto lower plant leaves', done: false },
    { id: 4, text: 'Isolate 2-3 leaf samples and scan with the AI multispectral camera', done: false }
  ]);
  const [escalated, setEscalated] = useState(false);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleEscalate = () => {
    setEscalated(true);
    if (onEscalateToKVK) {
      setTimeout(() => {
        onClose();
        onEscalateToKVK();
      }, 900);
    }
  };

  const allCompleted = tasks.every(t => t.done);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-sm">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-gray-900">Urgent Field Inspection Protocol</h3>
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">PRIORITY 1</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Early Blight (Alternaria) Containment Procedure</p>
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
          {/* Situation Brief */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2.5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-900 text-sm">Why this action is required now:</h4>
                <p className="text-blue-800 text-xs mt-1 leading-relaxed">
                  Recent sensor readings detected a canopy relative humidity spike above 80% with temperatures matching the sporulation threshold for Alternaria solani. Catching and pruning infected lower leaves in the first 48 hours reduces spore multiplication by 85%.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Inspection Checklist */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Field Inspection Checklist</h4>
              <span className="text-xs font-semibold text-blue-600">
                {tasks.filter(t => t.done).length} of {tasks.length} Completed
              </span>
            </div>

            <div className="space-y-2.5">
              {tasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 select-none ${
                    task.done ? 'bg-green-50/60 border-green-200' : 'bg-gray-50 border-gray-200 hover:border-blue-200 hover:bg-gray-50/80'
                  }`}
                >
                  <div className={`h-5 w-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    task.done ? 'bg-green-600 text-white' : 'border-2 border-gray-300 bg-white'
                  }`}>
                    {task.done && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                  <span className={`text-xs font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* KVK Escalation Banner */}
          <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-indigo-600 text-white rounded-xl mt-0.5">
                <Microscope className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-indigo-950">Uncertain or Rapidly Spreading Symptoms?</h4>
                <p className="text-[11px] text-indigo-800 mt-0.5">
                  Escalate directly to Krishi Vigyan Kendra (KVK) Agronomist for laboratory diagnosis & referral voucher.
                </p>
              </div>
            </div>
            <button
              onClick={handleEscalate}
              disabled={escalated}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex-shrink-0 ${
                escalated 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              {escalated ? 'Escalated to KVK ✓' : 'Escalate to KVK'}
            </button>
          </div>

          {/* Corrective Prescription Guide */}
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-1.5 text-blue-600" />
              Agronomic Remediation Options
            </h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                <strong className="text-gray-900">Organic Protocol: </strong>
                Spray Copper Oxychloride 50 WP (2.5 g / liter of water) or Bacillus subtilis bio-fungicide during early morning hours.
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                <strong className="text-gray-900">Cultural Sanitation: </strong>
                Manually strip and destroy infected lower leaves. Do not compost infected debris within 100 meters of the field.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button 
            onClick={() => {
              onResolve();
              onClose();
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-1.5 ${
              allCompleted || isResolved
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isResolved ? 'Marked Complete' : 'Mark Action Complete'}</span>
          </button>
          
          <button 
            onClick={() => {
              onClose();
              onOpenScanner();
            }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all hover:shadow-lg active:scale-95"
          >
            <Camera className="h-4 w-4" />
            <span>Scan Suspect Foliage</span>
          </button>
        </div>
      </div>
    </div>
  );
}
