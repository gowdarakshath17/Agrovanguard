import React from 'react';
import { 
  Award, CheckCircle2, X, ExternalLink, Sparkles, Database, Microscope, 
  Leaf, Radio, CloudRain, Cpu, ShieldCheck, ArrowRight, BookOpen, Layers
} from 'lucide-react';

interface SIHEvaluationHubModalProps {
  onClose: () => void;
  onOpenScanner: () => void;
  onOpenAdvisories: () => void;
  onOpenKVKPortal: () => void;
  onOpenScheduler: () => void;
  onOpenDigitalTwin: () => void;
}

export default function SIHEvaluationHubModal({
  onClose,
  onOpenScanner,
  onOpenAdvisories,
  onOpenKVKPortal,
  onOpenScheduler,
  onOpenDigitalTwin
}: SIHEvaluationHubModalProps) {

  const criteria = [
    {
      id: 'crit-1',
      title: 'Multimodal Early Disease & Pest Diagnostic Engine',
      description: 'Integrates high-resolution multispectral image analysis, spore sporulation incubation models, and disease vector probability.',
      status: 'Implemented & Verified',
      badge: 'Vision AI & Gemini Flash',
      actionText: 'Launch Crop Scanner',
      action: () => { onClose(); onOpenScanner(); }
    },
    {
      id: 'crit-2',
      title: 'Zero-Connectivity Rural Resilience (IndexedDB)',
      description: 'Offline-first architecture storing pre-seeded & personalized crop pathology advisories locally in IndexedDB with local Kannada/Hindi audio.',
      status: 'Implemented & Verified',
      badge: 'Native IndexedDB + PWA',
      actionText: 'Open Offline Vault',
      action: () => { onClose(); onOpenAdvisories(); }
    },
    {
      id: 'crit-3',
      title: 'KVK Extension Worker & Lab Referral Workflow',
      description: 'Human-in-the-loop expert escalation channel where KVK agronomists review high-risk flags and issue official digital laboratory sample referral slips.',
      status: 'Implemented & Verified',
      badge: 'KVK & ICAR Tele-Diagnosis',
      actionText: 'Launch KVK Officer Portal',
      action: () => { onClose(); onOpenKVKPortal(); }
    },
    {
      id: 'crit-4',
      title: 'Safe Input Usage & Integrated Pest Management (IPM)',
      description: 'Acreage-based dosage calculations, bio-pesticide alternatives (Neem, Trichoderma), and microclimate chemical drift wind lockouts.',
      status: 'Implemented & Verified',
      badge: 'Safe Input & PHI Tracking',
      actionText: 'View Eco-Pesticide Scheduler',
      action: () => { onClose(); onOpenScheduler(); }
    },
    {
      id: 'crit-5',
      title: 'IoT Digital Twin & Geospatial Hotspot Mapping',
      description: 'Real-time telemetry ingestion (leaf wetness, canopy temp, soil moisture) coupled with regional outbreak contagion mapping.',
      status: 'Implemented & Verified',
      badge: 'IoT Sensors + Hotspot Radius',
      actionText: 'Inspect Digital Twin',
      action: () => { onClose(); onOpenDigitalTwin(); }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header with Smart India Hackathon Badge */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex justify-between items-start flex-shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-amber-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center shadow-xs">
                <Award className="h-3.5 w-3.5 mr-1" />
                SIH 2026 Evaluation Hub
              </span>
              <span className="bg-white/20 text-white font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
                SIH26131
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
              Early Detection & Management of Crop Diseases and Pest Infestations
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200 mt-1">
              Agro Vanguard Evaluation Matrix for the SIH 2026 Jury Panel
            </p>
          </div>

          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Executive Summary */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 mb-1 flex items-center">
              <Sparkles className="h-4 w-4 text-emerald-600 mr-1.5" />
              Executive Solution Overview
            </h3>
            <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
              <strong>Agro Vanguard</strong> addresses SIH26131 by providing an end-to-end digital ecosystem for smallholder farmers and agricultural extension workers (KVK). It bridges early visual detection, microclimate spore incubation forecasting, zero-bandwidth offline resilience via IndexedDB, and official laboratory sample referral pathways with guaranteed chain-of-custody tracking.
            </p>
          </div>

          {/* Interactive Criteria Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-extrabold text-gray-500 uppercase tracking-wider">
              <span>Core Requirements Checklist</span>
              <span>5 of 5 Fulfilled</span>
            </div>

            {criteria.map((item, index) => (
              <div 
                key={item.id}
                className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-emerald-300 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <h4 className="text-sm font-extrabold text-gray-900">{item.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 pl-7 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center space-x-2 pl-7 sm:pl-0 flex-shrink-0">
                  <button
                    onClick={item.action}
                    className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition shadow-2xs group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600"
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Role Switching for Judges */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center">
                <Layers className="h-4 w-4 mr-1.5 text-emerald-400" />
                Live Multi-Stakeholder Demonstrator
              </span>
              <span className="text-[11px] text-emerald-400 font-bold">
                Zero Re-login Needed
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Judges can seamlessly evaluate both the Smallholder Farmer interface and the Agricultural Extension Worker (KVK Officer) interface:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button 
                onClick={onClose}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-left border border-slate-700 transition"
              >
                🌾 <strong>Farmer Experience:</strong> Scouting, AI Scanner, Offline Vault, Hands-Free Voice
              </button>
              <button 
                onClick={() => { onClose(); onOpenKVKPortal(); }}
                className="p-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-xs font-bold text-left border border-emerald-600 transition"
              >
                🔬 <strong>KVK Officer Experience:</strong> Triage Queue, Verify Diagnosis, Issue Lab Slips
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
          <span className="text-xs text-gray-500 font-medium">
            Agro Vanguard &bull; SIH26131 Submission
          </span>
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Close Evaluation Matrix
          </button>
        </div>

      </div>
    </div>
  );
}
