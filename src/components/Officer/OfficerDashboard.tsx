import React, { useState } from 'react';
import { 
  Building2, ShieldAlert, Users, MapPin, Send, CheckCircle2, 
  FileText, AlertTriangle, ArrowRight, Search, Filter, Phone, 
  Download, Eye, Check, X, Bell, RefreshCw, Sparkles, Sprout
} from 'lucide-react';

interface TalukaOutbreak {
  taluka: string;
  activeCases: number;
  primaryPathogen: string;
  affectedCrops: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  trend: 'RISING' | 'STABLE' | 'DECLINING';
  registeredFarmers: number;
}

interface FarmerEscalationCase {
  id: string;
  farmerName: string;
  village: string;
  taluka: string;
  crop: string;
  aiDiagnosis: string;
  confidence: number;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  timestamp: string;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'DISPATCHED';
  officerNotes?: string;
  phone: string;
}

const TALUKA_DATA: TalukaOutbreak[] = [
  {
    taluka: 'Niphad',
    activeCases: 148,
    primaryPathogen: 'Grape Downy Mildew (Plasmopara viticola)',
    affectedCrops: 'Grapes (Thompson Seedless, Sonaka)',
    riskLevel: 'CRITICAL',
    trend: 'RISING',
    registeredFarmers: 1840
  },
  {
    taluka: 'Dindori',
    activeCases: 92,
    primaryPathogen: 'Early & Late Blight (Phytophthora)',
    affectedCrops: 'Tomato, Potato, Grapes',
    riskLevel: 'HIGH',
    trend: 'STABLE',
    registeredFarmers: 1210
  },
  {
    taluka: 'Malegaon',
    activeCases: 114,
    primaryPathogen: 'Pink Bollworm (Pectinophora gossypiella)',
    affectedCrops: 'Cotton, Pomegranate',
    riskLevel: 'CRITICAL',
    trend: 'RISING',
    registeredFarmers: 2150
  },
  {
    taluka: 'Sinnar',
    activeCases: 65,
    primaryPathogen: 'Thrips & Yellow Mite Vector',
    affectedCrops: 'Chilli, Onion, Vegetables',
    riskLevel: 'MODERATE',
    trend: 'DECLINING',
    registeredFarmers: 980
  },
  {
    taluka: 'Yeola',
    activeCases: 58,
    primaryPathogen: 'Soybean Rust / Blight',
    affectedCrops: 'Soybean, Maize',
    riskLevel: 'MODERATE',
    trend: 'STABLE',
    registeredFarmers: 890
  },
  {
    taluka: 'Chandwad',
    activeCases: 32,
    primaryPathogen: 'Bacterial Blight (Xanthomonas)',
    affectedCrops: 'Pomegranate, Onion',
    riskLevel: 'LOW',
    trend: 'DECLINING',
    registeredFarmers: 740
  }
];

const INITIAL_ESCALATIONS: FarmerEscalationCase[] = [
  {
    id: 'MH-NSK-2026-8421',
    farmerName: 'Ramesh Patil',
    village: 'Dindori Khurd',
    taluka: 'Dindori',
    crop: 'Grapes (Thompson)',
    aiDiagnosis: 'Grape Downy Mildew (Sporulation Phase)',
    confidence: 72,
    severity: 'CRITICAL',
    timestamp: '25m ago',
    status: 'PENDING_REVIEW',
    phone: '+91 98765 43210'
  },
  {
    id: 'MH-NSK-2026-8395',
    farmerName: 'Sunil Shinde',
    village: 'Ozar',
    taluka: 'Niphad',
    crop: 'Tomato (Abhinav)',
    aiDiagnosis: 'Alternaria Leaf Blight with Secondary Bacterial Spot',
    confidence: 68,
    severity: 'HIGH',
    timestamp: '1h ago',
    status: 'PENDING_REVIEW',
    phone: '+91 94222 18940'
  },
  {
    id: 'MH-NSK-2026-8380',
    farmerName: 'Kailas Jadhav',
    village: 'Saykheda',
    taluka: 'Niphad',
    crop: 'Grapes',
    aiDiagnosis: 'Powdery Mildew / Anthracnose overlap',
    confidence: 65,
    severity: 'CRITICAL',
    timestamp: '3h ago',
    status: 'PENDING_REVIEW',
    phone: '+91 98230 45112'
  },
  {
    id: 'MH-NSK-2026-8312',
    farmerName: 'Bhausaheb More',
    village: 'Deola Rural',
    taluka: 'Malegaon',
    crop: 'Cotton',
    aiDiagnosis: 'Pink Bollworm Square Penetration',
    confidence: 89,
    severity: 'CRITICAL',
    timestamp: '6h ago',
    status: 'VERIFIED',
    officerNotes: 'Diagnosis confirmed by KVK Nashik. Issued Pheromone Trap alert & bio-agent Trichogramma schedule.',
    phone: '+91 99210 77301'
  }
];

interface OfficerDashboardProps {
  onSwitchToFarmer: () => void;
}

export default function OfficerDashboard({ onSwitchToFarmer }: OfficerDashboardProps) {
  const [talukas] = useState<TalukaOutbreak[]>(TALUKA_DATA);
  const [escalations, setEscalations] = useState<FarmerEscalationCase[]>(INITIAL_ESCALATIONS);
  const [selectedTaluka, setSelectedTaluka] = useState<string>('All');
  const [selectedCase, setSelectedCase] = useState<FarmerEscalationCase | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [broadcastTaluka, setBroadcastTaluka] = useState('Niphad');
  const [broadcastMessage, setBroadcastMessage] = useState(
    'ALERT [Dept of Agriculture Nashik]: Dense fog overnight has increased Downy Mildew spore risk. Grape farmers in Niphad are advised to apply preventative bio-fungicide (Trichoderma viride or Copper Hydroxide) within 24 hours.'
  );
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleVerifyCase = (caseId: string, action: 'VERIFIED' | 'DISPATCHED') => {
    setEscalations(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          status: action,
          officerNotes: reviewNotes.trim() || (action === 'VERIFIED' 
            ? 'Verified by Krishi Adhikari. Recommended bio-spray protocol approved.' 
            : 'Krishi Sevak dispatched for physical soil & foliar sample testing.')
        };
      }
      return c;
    }));
    setSelectedCase(null);
    setReviewNotes('');
  };

  const handleSendBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 5000);
  };

  const filteredEscalations = selectedTaluka === 'All' 
    ? escalations 
    : escalations.filter(c => c.taluka.toLowerCase() === selectedTaluka.toLowerCase());

  const totalActiveCases = talukas.reduce((acc, t) => acc + t.activeCases, 0);
  const pendingCasesCount = escalations.filter(e => e.status === 'PENDING_REVIEW').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Officer Header / Command Banner */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Government of Maharashtra • Dept. of Agriculture
                </span>
                <span className="text-xs text-slate-400 font-mono">SIH26131 Surveillance Grid</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Krishi Adhikari &amp; KVK Epidemic Command Center
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Nashik District Surveillance Division • Pilot Agro-Ecosystem (Grapes, Tomato, Pomegranate, Cotton)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-200">Dr. S. R. Patil</span>
              <span className="text-[11px] text-emerald-400">Senior Plant Pathologist, KVK Nashik</span>
            </div>
            <button
              onClick={onSwitchToFarmer}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-md group"
            >
              <Sprout className="h-4 w-4 mr-1.5 group-hover:scale-110 transition-transform" />
              Switch to Farmer Mode
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Scans (7 Days)</span>
              <span className="p-2 bg-blue-500/20 text-blue-400 rounded-xl"><FileText className="h-4 w-4" /></span>
            </div>
            <div className="text-3xl font-black text-white mt-2">509</div>
            <div className="text-xs text-emerald-400 font-semibold mt-1">▲ +14% week-on-week surveillance</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Disease Clusters</span>
              <span className="p-2 bg-red-500/20 text-red-400 rounded-xl"><ShieldAlert className="h-4 w-4" /></span>
            </div>
            <div className="text-3xl font-black text-red-400 mt-2">{totalActiveCases}</div>
            <div className="text-xs text-red-300 font-semibold mt-1">Niphad &amp; Malegaon in Critical Zone</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending KVK Escalations</span>
              <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl"><AlertTriangle className="h-4 w-4" /></span>
            </div>
            <div className="text-3xl font-black text-amber-400 mt-2">{pendingCasesCount}</div>
            <div className="text-xs text-amber-300 font-semibold mt-1">Requires official agronomist review</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Concordance Rate</span>
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl"><CheckCircle2 className="h-4 w-4" /></span>
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-2">94.8%</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Evaluated against lab PCR assays</div>
          </div>
        </div>

        {/* Section 1: Taluka Cluster Aggregation */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Taluka Aggregated Outbreak Matrix (Nashik District)</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time epidemic density aggregated from farmer diagnostics and field extension data
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setReportGenerated(true)}
                className="inline-flex items-center text-xs font-bold bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 px-3.5 py-2 rounded-xl transition"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export Epidemic Report (PDF)
              </button>
            </div>
          </div>

          {reportGenerated && (
            <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs text-emerald-200">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>
                  <strong>Official Dossier Compiled:</strong> "Nashik_District_Epidemic_Surveillance_W39_2026.pdf" prepared for the Divisional Joint Director of Agriculture.
                </span>
              </div>
              <button 
                onClick={() => setReportGenerated(false)}
                className="text-emerald-400 hover:text-white underline font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700/80 bg-slate-900/50">
                <tr>
                  <th className="py-3 px-4">Taluka</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Active Cases</th>
                  <th className="py-3 px-4">Primary Pathogen</th>
                  <th className="py-3 px-4">Vulnerable Crops</th>
                  <th className="py-3 px-4">Spread Trend</th>
                  <th className="py-3 px-4 text-right">Registered Farmers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {talukas.map((t) => (
                  <tr key={t.taluka} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                      <span>{t.taluka}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        t.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        t.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        t.riskLevel === 'MODERATE' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {t.riskLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {t.activeCases}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {t.primaryPathogen}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {t.affectedCrops}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-xs">
                      {t.trend === 'RISING' ? <span className="text-red-400">▲ Rising</span> :
                       t.trend === 'DECLINING' ? <span className="text-emerald-400">▼ Declining</span> :
                       <span className="text-yellow-400">■ Stable</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                      {t.registeredFarmers.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Escalation Queue & Taluka Broadcast Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Farmer Escalations & Triage Queue (2 Cols) */}
          <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">Farmer Escalations &amp; Low-Confidence Triage Queue</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submissions requiring agronomist verification or KVK referral before field intervention
                </p>
              </div>

              {/* Taluka Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={selectedTaluka}
                  onChange={(e) => setSelectedTaluka(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Talukas</option>
                  <option value="Niphad">Niphad</option>
                  <option value="Dindori">Dindori</option>
                  <option value="Malegaon">Malegaon</option>
                </select>
              </div>
            </div>

            <div className="space-y-3.5">
              {filteredEscalations.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-2xl border transition-all ${
                    item.status === 'PENDING_REVIEW' 
                      ? 'bg-slate-900/80 border-amber-500/30 hover:border-amber-500/60' 
                      : 'bg-slate-900/40 border-slate-700/60 opacity-90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {item.id}
                        </span>
                        <span className="text-sm font-bold text-white">{item.farmerName}</span>
                        <span className="text-xs text-slate-400">({item.village}, {item.taluka} Taluka)</span>
                        <span className="text-[10px] text-slate-500">• {item.timestamp}</span>
                      </div>

                      <div className="mt-2 text-xs">
                        <span className="text-slate-400">Crop:</span> <strong className="text-slate-200">{item.crop}</strong>
                        <span className="text-slate-600 mx-2">|</span>
                        <span className="text-slate-400">AI Pathology:</span> <strong className="text-amber-300">{item.aiDiagnosis}</strong>
                        <span className="text-slate-600 mx-2">|</span>
                        <span className="text-slate-400">Confidence:</span> <strong className="text-slate-200">{item.confidence}%</strong>
                      </div>

                      {item.officerNotes && (
                        <div className="mt-2 text-xs bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5 text-emerald-200">
                          <strong className="text-emerald-400">Officer Decision:</strong> {item.officerNotes}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'PENDING_REVIEW' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
                        item.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>

                      {item.status === 'PENDING_REVIEW' && (
                        <button
                          onClick={() => setSelectedCase(item)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
                        >
                          Review &amp; Validate →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Emergency Taluka Broadcast Tool */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Send className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Emergency Taluka Broadcast</h3>
              </div>
              <p className="text-xs text-slate-400 mb-5">
                Issue instant agronomist spray alerts &amp; biocontrol directives to registered farmers in target talukas via Push/SMS
              </p>

              {broadcastSent && (
                <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Broadcast transmitted successfully to 1,840 farmers in {broadcastTaluka}!</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Target Taluka Sector
                  </label>
                  <select
                    value={broadcastTaluka}
                    onChange={(e) => setBroadcastTaluka(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Niphad">Niphad (1,840 Farmers - Critical)</option>
                    <option value="Dindori">Dindori (1,210 Farmers - High)</option>
                    <option value="Malegaon">Malegaon (2,150 Farmers - Critical)</option>
                    <option value="Sinnar">Sinnar (980 Farmers)</option>
                    <option value="Yeola">Yeola (890 Farmers)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Official Advisory Directives
                  </label>
                  <textarea
                    rows={5}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                    placeholder="Enter official plant protection instructions..."
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/80">
              <button
                onClick={handleSendBroadcast}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl transition shadow-lg flex items-center justify-center space-x-2 text-sm"
              >
                <Send className="h-4 w-4" />
                <span>Transmit Broadcast to {broadcastTaluka}</span>
              </button>
              <p className="text-[11px] text-slate-500 text-center mt-2">
                Certified under Maharashtra Agricultural Extension Service Regulations
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Review & Validate Modal for Krishi Adhikari */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 shadow-2xl text-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                  KVK Agronomist Action Required
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Review Diagnosis: Case #{selectedCase.id}</h3>
                <p className="text-xs text-slate-400">Farmer: {selectedCase.farmerName} • {selectedCase.village}, {selectedCase.taluka}</p>
              </div>
              <button 
                onClick={() => setSelectedCase(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Crop Variety:</span>
                <strong className="text-white">{selectedCase.crop}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI Pathology Prediction:</span>
                <strong className="text-amber-400">{selectedCase.aiDiagnosis}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI Model Confidence:</span>
                <span className="font-bold text-slate-200">{selectedCase.confidence}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Farmer Contact:</span>
                <a href={`tel:${selectedCase.phone}`} className="text-emerald-400 font-bold hover:underline">
                  {selectedCase.phone}
                </a>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Official Validation Remarks &amp; Regimen Notes
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Confirm or correct diagnosis and specify approved dosage (e.g. Copper Hydroxide @ 2.5g/L or Trichoderma @ 5g/L)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleVerifyCase(selectedCase.id, 'DISPATCHED')}
                className="py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition"
              >
                Dispatch Krishi Sevak
              </button>
              <button
                onClick={() => handleVerifyCase(selectedCase.id, 'VERIFIED')}
                className="py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md"
              >
                Approve &amp; Issue KVK Stamp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
