import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, FileText, Send, Building2, 
  MapPin, Phone, User, Calendar, Microscope, QrCode, ArrowLeft, Download, 
  Search, Filter, Check, Eye, Clock, Sparkles, Radio, Activity
} from 'lucide-react';

export interface EscalatedCase {
  id: string;
  farmerName: string;
  phone: string;
  village: string;
  crop: string;
  acreage: string;
  suspectedPathology: string;
  aiConfidence: number;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  timestamp: string;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'LAB_REFERRED' | 'RESOLVED';
  sensorSnapshot: {
    canopyTemp: string;
    humidity: string;
    leafWetness: string;
    soilPh: string;
  };
  notes: string;
  labReferral?: {
    slipId: string;
    targetLab: string;
    prescribedTest: string;
    priority: string;
    date: string;
  };
}

const INITIAL_CASES: EscalatedCase[] = [
  {
    id: 'KVK-2026-8421',
    farmerName: 'Ramesh G. Gowda',
    phone: '+91 98450 12384',
    village: 'Dharwad Rural (Cluster 4)',
    crop: 'Cotton (BT Cotton)',
    acreage: '3.5 Acres',
    suspectedPathology: 'Pink Bollworm (Pectinophora gossypiella) - Cry2Ab resistance flag',
    aiConfidence: 74,
    severity: 'CRITICAL',
    timestamp: '28m ago',
    status: 'PENDING_REVIEW',
    sensorSnapshot: {
      canopyTemp: '27.8°C',
      humidity: '82%',
      leafWetness: '91%',
      soilPh: '6.4'
    },
    notes: 'Farmer observed square drop and rosette flowers with premature boll opening.'
  },
  {
    id: 'KVK-2026-8422',
    farmerName: 'Anand Patil',
    phone: '+91 94481 99231',
    village: 'Hebballi North',
    crop: 'Tomato (Hybrid Arka)',
    acreage: '1.8 Acres',
    suspectedPathology: 'Alternaria solani (Early Blight) + Secondary Stem Canker',
    aiConfidence: 91,
    severity: 'HIGH',
    timestamp: '1h 10m ago',
    status: 'VERIFIED',
    sensorSnapshot: {
      canopyTemp: '25.2°C',
      humidity: '88%',
      leafWetness: '96%',
      soilPh: '6.1'
    },
    notes: 'Concentric target spots spanning 30% of lower foliar canopy.'
  },
  {
    id: 'KVK-2026-8423',
    farmerName: 'Basavaraj Marad',
    phone: '+91 97312 44589',
    village: 'Navalgund Agro Sector',
    crop: 'Paddy (BPT 5204)',
    acreage: '4.2 Acres',
    suspectedPathology: 'Pyricularia oryzae (Neck Blast during panicle emergence)',
    aiConfidence: 86,
    severity: 'CRITICAL',
    timestamp: '3h ago',
    status: 'LAB_REFERRED',
    sensorSnapshot: {
      canopyTemp: '29.1°C',
      humidity: '92%',
      leafWetness: '98%',
      soilPh: '6.8'
    },
    notes: 'Dark necrosis at panicle base. High risk of complete chaffy grain loss.',
    labReferral: {
      slipId: 'LAB-REF-99214',
      targetLab: 'ICAR-KVK Regional Plant Pathology Laboratory, Dharwad',
      prescribedTest: 'Fungal Isolate PCR Sequencing & Fungicide Sensitivity Assay',
      priority: 'EMERGENCY_24H',
      date: '28 Sep 2026'
    }
  }
];

export default function KVKExtensionOfficerPortal({ onBackToFarmer }: { onBackToFarmer: () => void }) {
  const [cases, setCases] = useState<EscalatedCase[]>(INITIAL_CASES);
  const [selectedCase, setSelectedCase] = useState<EscalatedCase>(INITIAL_CASES[0]);
  const [activeTab, setActiveTab] = useState<'triage' | 'lab_slips' | 'bulletins'>('triage');
  const [verificationNote, setVerificationNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleVerifyCase = (caseId: string) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return { ...c, status: 'VERIFIED', notes: c.notes + ' [Officer Verified: Confirmed diagnosis and biological treatment plan]' };
      }
      return c;
    }));
    setSelectedCase(curr => curr.id === caseId ? { ...curr, status: 'VERIFIED' } : curr);
    showToast(`Case ${caseId} verified. Farmer notified with authenticated agronomic prescription.`);
  };

  const handleIssueLabReferral = (caseId: string) => {
    const slipId = `LAB-REF-${Math.floor(100000 + Math.random() * 900000)}`;
    const referral = {
      slipId,
      targetLab: 'ICAR-KVK Regional Plant Pathology & Soil Testing Laboratory',
      prescribedTest: 'Culture Plate Isolation & Molecular DNA Strain Resistance Confirmation',
      priority: 'URGENT_48H',
      date: 'Today, 28 Sep 2026'
    };

    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return { ...c, status: 'LAB_REFERRED', labReferral: referral };
      }
      return c;
    }));
    setSelectedCase(curr => curr.id === caseId ? { ...curr, status: 'LAB_REFERRED', labReferral: referral } : curr);
    showToast(`Official Lab Referral Slip ${slipId} generated and dispatched to farmer!`);
  };

  const handleBroadcastDistrictAlert = () => {
    showToast('🚨 Regional KVK Bulletin Dispatched: 412 nearby farmers alerted about spore multiplication conditions.');
  };

  const filteredCases = cases.filter(c => 
    c.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.suspectedPathology.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 border border-emerald-500 animate-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-200" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Officer Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap justify-between items-center gap-3">
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={onBackToFarmer}
              className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Farmer View</span>
            </button>
            
            <div className="h-5 w-px bg-slate-700" />

            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                    KVK Extension Officer & Lab Referral Hub
                  </h1>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    SIH26131 Mandate
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Krishi Vigyan Kendra (ICAR) & Agricultural University Tele-Diagnosis Station
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-2 text-right text-xs pr-2 border-r border-slate-700 text-slate-300">
              <User className="h-4 w-4 text-emerald-400" />
              <div>
                <span className="font-bold block text-white">Dr. S. Kulkarni (Senior Agronomist)</span>
                <span className="text-[10px] text-slate-400">Jurisdiction: 38 Village Clusters</span>
              </div>
            </div>
            
            <button
              onClick={handleBroadcastDistrictAlert}
              className="flex items-center space-x-1.5 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl transition shadow-sm"
              title="Broadcast alert to all registered smallholders in region"
            >
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span>Broadcast Regional Bulletin</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Sub Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('triage')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'triage'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Microscope className="h-4 w-4 text-emerald-400" />
              <span>Escalated Cases Triage Queue ({cases.filter(c => c.status === 'PENDING_REVIEW').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('lab_slips')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'lab_slips'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileText className="h-4 w-4 text-blue-400" />
              <span>Issued Lab Referral Slips ({cases.filter(c => c.status === 'LAB_REFERRED').length})</span>
            </button>
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Search farmer, crop, symptom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {activeTab === 'triage' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Queue (5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                <span>Incoming Priority Queue</span>
                <span>{filteredCases.length} Cases</span>
              </div>

              {filteredCases.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedCase(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    selectedCase.id === item.id 
                      ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          item.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.severity}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{item.id}</span>
                        <span className="text-[10px] text-slate-400">• {item.timestamp}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-1">{item.farmerName}</h4>
                      <div className="flex items-center text-xs text-slate-500 mt-0.5">
                        <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                        <span>{item.village} • {item.crop} ({item.acreage})</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                        item.status === 'PENDING_REVIEW' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        item.status === 'LAB_REFERRED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      <div className="text-[11px] font-extrabold text-slate-700 mt-1">
                        AI Conf: {item.aiConfidence}%
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-xl line-clamp-2">
                    {item.suspectedPathology}
                  </p>
                </div>
              ))}
            </div>

            {/* Right Case Detail & Triage Actions (7 Cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                
                <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-400">{selectedCase.id}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        selectedCase.status === 'PENDING_REVIEW' ? 'bg-orange-100 text-orange-800' :
                        selectedCase.status === 'LAB_REFERRED' ? 'bg-blue-100 text-blue-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {selectedCase.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mt-1">{selectedCase.farmerName}</h3>
                    <p className="text-xs text-slate-500">
                      {selectedCase.village} • Phone: <a href={`tel:${selectedCase.phone}`} className="text-emerald-700 font-bold underline">{selectedCase.phone}</a>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-right">
                    <span className="text-xs text-slate-500 uppercase font-bold block">Target Crop</span>
                    <span className="text-sm font-black text-slate-900">{selectedCase.crop}</span>
                    <span className="text-xs text-slate-600 block">{selectedCase.acreage}</span>
                  </div>
                </div>

                {/* Pathology Summary */}
                <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl mb-4">
                  <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider">AI Symptom Detection & Flag</span>
                  <h4 className="text-base font-extrabold text-rose-950 mt-0.5">{selectedCase.suspectedPathology}</h4>
                  <p className="text-xs text-rose-900 mt-1 leading-relaxed">{selectedCase.notes}</p>
                </div>

                {/* Digital Twin Sensor Snapshot at Time of Incident */}
                <div className="mb-5">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center">
                    <Activity className="h-3.5 w-3.5 text-emerald-600 mr-1.5" />
                    Microclimate Telemetry at Infection Time
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-500 block font-bold">Canopy Temp</span>
                      <span className="text-sm font-black text-slate-800">{selectedCase.sensorSnapshot.canopyTemp}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-500 block font-bold">Humidity</span>
                      <span className="text-sm font-black text-slate-800">{selectedCase.sensorSnapshot.humidity}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-500 block font-bold">Leaf Wetness</span>
                      <span className="text-sm font-black text-slate-800">{selectedCase.sensorSnapshot.leafWetness}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-500 block font-bold">Soil pH</span>
                      <span className="text-sm font-black text-slate-800">{selectedCase.sensorSnapshot.soilPh}</span>
                    </div>
                  </div>
                </div>

                {/* If Lab Referral exists */}
                {selectedCase.labReferral && (
                  <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <QrCode className="h-5 w-5 text-blue-600" />
                        <span className="text-xs font-black text-blue-900 uppercase">
                          Official Diagnostic Lab Voucher Issued
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold bg-white text-blue-800 px-2 py-0.5 rounded-lg border border-blue-200">
                        {selectedCase.labReferral.slipId}
                      </span>
                    </div>
                    <p className="text-xs text-blue-800">
                      <strong>Facility:</strong> {selectedCase.labReferral.targetLab}
                    </p>
                    <p className="text-xs text-blue-800 mt-0.5">
                      <strong>Prescribed Lab Assay:</strong> {selectedCase.labReferral.prescribedTest}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-blue-700">
                      <span>Priority: {selectedCase.labReferral.priority}</span>
                      <span>Dispatched: {selectedCase.labReferral.date}</span>
                    </div>
                  </div>
                )}

                {/* Action Decision Buttons */}
                <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-3">
                  
                  <button
                    onClick={() => handleVerifyCase(selectedCase.id)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-sm"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verify & Push IPM Prescription</span>
                  </button>

                  <button
                    onClick={() => handleIssueLabReferral(selectedCase.id)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-sm"
                  >
                    <Microscope className="h-4 w-4" />
                    <span>Issue Lab Referral Slip (SIH26131)</span>
                  </button>
                  
                </div>

              </div>
            </div>

          </div>
        ) : (
          /* Issued Lab Slips Tab */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Official Diagnostic Laboratory Referral Vouchers</h3>
                <p className="text-xs text-slate-500">
                  Government subsidized tissue pathology & soil microbiology referral records (ICAR-KVK Chain of Custody)
                </p>
              </div>
              <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200">
                100% Traceable Digital Slips
              </span>
            </div>

            <div className="space-y-3">
              {cases.filter(c => c.labReferral).map(item => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-3 bg-blue-600 text-white rounded-xl flex-shrink-0 mt-0.5">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {item.labReferral?.slipId}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          {item.farmerName} ({item.village})
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mt-1">
                        Crop: {item.crop} • Test: {item.labReferral?.prescribedTest}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Lab Destination: {item.labReferral?.targetLab}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button 
                      onClick={() => showToast(`Downloaded printable PDF Slip for ${item.labReferral?.slipId}`)}
                      className="flex items-center space-x-1.5 text-xs bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded-xl border border-slate-200 transition"
                    >
                      <Download className="h-4 w-4 text-slate-500" />
                      <span>Print Referral Slip</span>
                    </button>
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-2 rounded-xl border border-emerald-200">
                      Dispatched to Farmer
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
