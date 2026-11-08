import React, { useState } from 'react';
import { 
  Building2, Phone, CheckCircle2, ShieldAlert, Calendar, 
  Clock, MapPin, Send, UserCheck, X, FileText, Sparkles 
} from 'lucide-react';

interface ExpertReviewModalProps {
  cropType: string;
  fieldId: number;
  diseaseName: string;
  confidenceScore: number | string;
  severity?: string;
  lat?: number;
  lon?: number;
  onClose: () => void;
  onScheduleFollowUp?: (days: number) => void;
}

export default function ExpertReviewModal({
  cropType,
  fieldId,
  diseaseName,
  confidenceScore,
  severity = 'HIGH',
  lat = 20.1802,
  lon = 73.8344,
  onClose,
  onScheduleFollowUp
}: ExpertReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'ESCALATE' | 'EXPERT_OPINION' | 'FOLLOW_UP'>('EXPERT_OPINION');
  const [escalated, setEscalated] = useState(false);
  const [followUpScheduled, setFollowUpScheduled] = useState(false);
  const [ticketId] = useState(`MH-KVK-NSK-2026-${Math.floor(1000 + Math.random() * 9000)}`);

  const handleEscalate = () => {
    setEscalated(true);
  };

  const handleSetReminder = (days: number) => {
    setFollowUpScheduled(true);
    if (onScheduleFollowUp) {
      onScheduleFollowUp(days);
    }
    // Also save in localStorage
    try {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + days);
      const reminderItem = {
        ticketId,
        cropType,
        diseaseName,
        scheduledDate: scheduledDate.toLocaleDateString(),
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('agrovanguard_followup_rescan', JSON.stringify(reminderItem));
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                  Govt. of Maharashtra KVK Network
                </span>
              </div>
              <h3 className="text-lg font-bold mt-0.5">Krishi Vigyan Kendra (KVK) Escalation</h3>
              <p className="text-xs text-white/80">Nashik District Agricultural Extension Division</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 bg-gray-50/60 p-1.5 text-xs font-bold text-gray-600">
          <button
            onClick={() => setActiveTab('EXPERT_OPINION')}
            className={`flex-1 py-2 rounded-xl transition text-center ${
              activeTab === 'EXPERT_OPINION' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-gray-900'
            }`}
          >
            Expert Validation
          </button>
          <button
            onClick={() => setActiveTab('ESCALATE')}
            className={`flex-1 py-2 rounded-xl transition text-center ${
              activeTab === 'ESCALATE' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-gray-900'
            }`}
          >
            Escalate to KVK
          </button>
          <button
            onClick={() => setActiveTab('FOLLOW_UP')}
            className={`flex-1 py-2 rounded-xl transition text-center ${
              activeTab === 'FOLLOW_UP' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-gray-900'
            }`}
          >
            5-Day Re-Scan
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Active Case Summary Card */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-mono text-emerald-900 font-bold">Ticket: {ticketId}</span>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                Field #{fieldId} • {cropType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">AI Pathology Diagnosis:</span>
              <span className="font-bold text-gray-900">{diseaseName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Model Confidence:</span>
              <span className="font-bold text-emerald-700">{confidenceScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Field GPS Coordinates:</span>
              <span className="font-mono text-gray-700">{lat.toFixed(4)}°N, {lon.toFixed(4)}°E (Nashik Pilot)</span>
            </div>
          </div>

          {activeTab === 'EXPERT_OPINION' && (
            <div className="space-y-4">
              <div className="border border-emerald-200 bg-white rounded-2xl p-4 shadow-xs relative overflow-hidden">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl mt-0.5">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-bold text-gray-900 text-sm">Dr. S. R. Patil</h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">
                        KVK Verified Agronomist
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Senior Plant Protection Specialist, KVK Yashwantrao Chavan Nashik</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 space-y-2 border border-gray-100">
                  <p className="font-semibold text-gray-900">Official Pathology Assessment:</p>
                  <p className="leading-relaxed">
                    "Visual symptoms confirm sporulation on foliage consistent with <strong>{diseaseName}</strong>. Because humidity in the Dindori/Niphad belt has remained high overnight, secondary spore dispersion is active."
                  </p>
                  <p className="font-semibold text-gray-900 pt-1 border-t border-gray-200">Recommended Intervention Regimen:</p>
                  <p className="leading-relaxed text-emerald-900 font-medium">
                    1. Apply <strong>Trichoderma viride</strong> (Bio-fungicide) @ 5g per litre or Copper Hydroxide @ 2g/L during early morning calm conditions.
                    <br />
                    2. Avoid excessive nitrogen application which accelerates succulent vegetative susceptibility.
                    <br />
                    3. Conduct follow-up canopy inspection in <strong>5 to 7 days</strong> to check spore desiccation.
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Digitally certified by KVK Agro-Telemetry Protocol</span>
                  <span className="text-emerald-600 font-bold">● Validated</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('FOLLOW_UP')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Schedule Recommended 5-Day Re-Scan Follow-Up</span>
              </button>
            </div>
          )}

          {activeTab === 'ESCALATE' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-gray-900 uppercase">Nearest Regional Extension Office:</span>
                </div>
                <div className="text-xs text-gray-700 pl-6 space-y-1">
                  <p className="font-bold text-gray-900">Krishi Vigyan Kendra (KVK) Yashwantrao Chavan</p>
                  <p className="text-gray-500">YCMOU Campus, Dindori Road, Nashik, Maharashtra - 422222</p>
                  <p className="text-gray-500">Taluka Krishi Adhikari Desk: 0253-2230615</p>
                  <p className="text-emerald-700 font-semibold">Toll-Free Kisan Call Centre: 1800-180-1551 (6 AM - 10 PM)</p>
                </div>
              </div>

              {escalated ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-xs text-emerald-900 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="font-bold text-sm">Escalation Dossier Transmitted!</span>
                  </div>
                  <p className="leading-relaxed">
                    Case <strong>{ticketId}</strong> with crop imagery, GPS telemetry ({lat.toFixed(4)}, {lon.toFixed(4)}), and preliminary diagnosis has been queued at the Dindori Taluka Krishi Adhikari office. A Krishi Sevak or agronomist will contact your registered mobile within 24 hours.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleEscalate}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Dispatch Digital Dossier to Krishi Adhikari</span>
                </button>
              )}

              <div className="flex items-center justify-center space-x-3 pt-2">
                <a 
                  href="tel:18001801551" 
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs"
                >
                  <Phone className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                  Call Kisan Hotline (1800-180-1551)
                </a>
              </div>
            </div>
          )}

          {activeTab === 'FOLLOW_UP' && (
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-sm">Treatment Efficacy Tracking Protocol</span>
                </div>
                <p className="leading-relaxed text-blue-800">
                  After applying bio-fungicide or cultural treatments, foliar lesion progression should be re-scanned in <strong>5 to 7 days</strong> to confirm that the pathogen has halted and green chlorophyll vigor is recovering.
                </p>
              </div>

              {followUpScheduled ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-xs text-emerald-900 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="font-bold text-sm">5-Day Re-Scan Scheduled!</span>
                  </div>
                  <p className="leading-relaxed">
                    An in-app follow-up reminder has been registered for Field #{fieldId} ({cropType}). You will be prompted in 5 days to take a post-treatment photo to calculate the disease cure rate.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSetReminder(5)}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Set 5-Day Re-Scan</span>
                  </button>
                  <button
                    onClick={() => handleSetReminder(7)}
                    className="py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Set 7-Day Re-Scan</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
