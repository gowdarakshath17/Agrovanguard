import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Database, Search, Filter, ShieldAlert, CheckCircle2, AlertTriangle, 
  Volume2, VolumeX, Sparkles, CloudRain, Sprout, FlaskConical, Droplets, 
  Leaf, RefreshCw, Calendar, Tag, ChevronDown, ChevronUp, Download, Check
} from 'lucide-react';
import { StoredAdvisory, getAllStoredAdvisories, ensurePreseededAdvisories, deleteStoredAdvisory } from '../../lib/advisoryDB.ts';

interface OfflineAdvisoryVaultModalProps {
  onClose: () => void;
  initialCrop?: string;
}

export default function OfflineAdvisoryVaultModal({ onClose, initialCrop }: OfflineAdvisoryVaultModalProps) {
  const [advisories, setAdvisories] = useState<StoredAdvisory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCrop, setSelectedCrop] = useState<string>(initialCrop || 'ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Load advisories from IndexedDB
  const loadAdvisories = async () => {
    setLoading(true);
    try {
      await ensurePreseededAdvisories();
      const items = await getAllStoredAdvisories();
      setAdvisories(items);
      if (items.length > 0 && !expandedId) {
        setExpandedId(items[0].id);
      }
    } catch (err) {
      console.error('Failed to load advisories from IndexedDB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvisories();
  }, []);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (advisory: StoredAdvisory) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Speech synthesis is not supported on this device.');
      return;
    }

    if (speakingId === advisory.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingId(advisory.id);

    const speechText = advisory.audioAdviceText || 
      `${advisory.cropType} advisory. ${advisory.primaryPrediction}. ${advisory.explanation}. Precautions: ${advisory.precautionaryMeasures}. Treatment: ${advisory.pesticideSuggestions || 'Follow standard organic measures.'}`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteStoredAdvisory(id);
      setAdvisories(prev => prev.filter(a => a.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error('Failed to delete advisory:', err);
    }
  };

  // Distinct crops list for filtering
  const cropList = useMemo(() => {
    const set = new Set<string>();
    advisories.forEach(a => set.add(a.cropType));
    return ['ALL', ...Array.from(set)];
  }, [advisories]);

  // Filtered advisories
  const filteredAdvisories = useMemo(() => {
    return advisories.filter(item => {
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Crop filter
      if (selectedCrop !== 'ALL' && !item.cropType.toLowerCase().includes(selectedCrop.toLowerCase()) && item.cropType !== 'All Crops') {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCrop = item.cropType.toLowerCase().includes(q);
        const matchesDiagnosis = item.primaryPrediction.toLowerCase().includes(q);
        const matchesExp = item.explanation.toLowerCase().includes(q);
        const matchesTreat = item.pesticideSuggestions?.toLowerCase().includes(q) || false;
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(q));
        return matchesTitle || matchesCrop || matchesDiagnosis || matchesExp || matchesTreat || matchesTags;
      }
      return true;
    });
  }, [advisories, selectedCategory, selectedCrop, searchQuery]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MODERATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-sm">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-gray-900">Offline Agricultural Advisory Vault</h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                  INDEXEDDB ACTIVE
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5 flex items-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse" />
                Permanent local storage • Zero internet connectivity required
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-3.5 bg-gray-50 border-b border-gray-200 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search advisories by crop, disease, chemical or symptom..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Crop Selector */}
            <div className="sm:w-48">
              <select
                value={selectedCrop}
                onChange={e => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {cropList.map(c => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? '🌾 All Crops' : `🌱 ${c}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                selectedCategory === 'ALL' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              All Advisories ({advisories.length})
            </button>
            <button
              onClick={() => setSelectedCategory('DISEASE_DIAGNOSIS')}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                selectedCategory === 'DISEASE_DIAGNOSIS' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              🦠 Crop Diseases
            </button>
            <button
              onClick={() => setSelectedCategory('PEST_MANAGEMENT')}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                selectedCategory === 'PEST_MANAGEMENT' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              🐛 Pest Protocols
            </button>
            <button
              onClick={() => setSelectedCategory('SOIL_NUTRIENTS')}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                selectedCategory === 'SOIL_NUTRIENTS' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              🌱 Soil & Nutrients
            </button>
            <button
              onClick={() => setSelectedCategory('WEATHER_SPRAY')}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                selectedCategory === 'WEATHER_SPRAY' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              🌤️ Spray Windows
            </button>
          </div>
        </div>

        {/* Advisory List and Details */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center text-gray-500">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-emerald-600 mb-3" />
              <p className="text-sm font-medium">Opening local IndexedDB storage...</p>
            </div>
          ) : filteredAdvisories.length === 0 ? (
            <div className="py-16 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Database className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-bold text-gray-700">No cached advisories found</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No local advisories match your search or filter criteria. Clear your search or scan a new crop leaf with the camera to add more.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setSelectedCrop('ALL'); }}
                className="mt-4 px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredAdvisories.map(advisory => {
              const isExpanded = expandedId === advisory.id;
              const isSpeaking = speakingId === advisory.id;

              return (
                <div 
                  key={advisory.id}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all shadow-xs ${
                    isExpanded ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Card Header (Always Visible) */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : advisory.id)}
                    className="p-4 sm:p-5 flex items-start justify-between cursor-pointer select-none bg-white hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center">
                          <Leaf className="h-3 w-3 mr-1 text-emerald-600" />
                          {advisory.cropType}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getSeverityBadge(advisory.severity)}`}>
                          {advisory.severity} PRIORITY
                        </span>
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          {advisory.dateFormatted}
                        </span>
                        <span className="text-[10px] text-gray-500 hidden sm:inline-block">
                          Source: {advisory.source}
                        </span>
                      </div>
                      
                      <h4 className="text-base font-bold text-gray-900 leading-snug">
                        {advisory.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {advisory.explanation}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak(advisory);
                        }}
                        title={isSpeaking ? "Stop Speaking" : "Read Advisory Aloud (Offline)"}
                        className={`p-2 rounded-xl border transition-all ${
                          isSpeaking 
                            ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                        }`}
                      >
                        {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>

                      <div className="text-gray-400 p-1">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Advisory Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-gray-50/60 space-y-4 text-xs sm:text-sm">
                      
                      {/* Diagnostic Summary */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-600 mr-1.5" />
                            Confirmed Pathology & Diagnosis
                          </h5>
                          {advisory.confidenceScore && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {advisory.confidenceScore}% Diagnostic Confidence
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {advisory.explanation}
                        </p>
                      </div>

                      {/* Actionable Precautionary Protocols */}
                      <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200">
                        <h5 className="font-bold text-amber-900 text-xs uppercase tracking-wider mb-2 flex items-center">
                          <ShieldAlert className="h-3.5 w-3.5 text-amber-600 mr-1.5" />
                          Immediate Cultural & Preventive Steps
                        </h5>
                        <div className="text-amber-950 whitespace-pre-line leading-relaxed">
                          {advisory.precautionaryMeasures}
                        </div>
                      </div>

                      {/* Pesticide & Chemical Treatment */}
                      {advisory.pesticideSuggestions && (
                        <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200">
                          <h5 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-1.5 flex items-center">
                            <FlaskConical className="h-3.5 w-3.5 text-blue-600 mr-1.5" />
                            Targeted Chemical Treatment & Dosage
                          </h5>
                          <p className="text-blue-950 leading-relaxed font-medium">
                            {advisory.pesticideSuggestions}
                          </p>
                        </div>
                      )}

                      {/* Organic / Bio-Control Remedies */}
                      {advisory.organicRemedies && (
                        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                          <h5 className="font-bold text-emerald-900 text-xs uppercase tracking-wider mb-1.5 flex items-center">
                            <Sprout className="h-3.5 w-3.5 text-emerald-600 mr-1.5" />
                            Organic & Biological Alternatives
                          </h5>
                          <p className="text-emerald-950 leading-relaxed">
                            {advisory.organicRemedies}
                          </p>
                        </div>
                      )}

                      {/* Grid for Soil, Irrigation, and Weather */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {advisory.soilFertilityAdvice && (
                          <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                            <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-1 flex items-center">
                              <Sprout className="h-3.5 w-3.5 text-green-600 mr-1.5" />
                              Soil & Fertilizer Guidance
                            </h5>
                            <p className="text-gray-600 text-xs leading-relaxed">
                              {advisory.soilFertilityAdvice}
                            </p>
                          </div>
                        )}

                        {advisory.irrigationAdvice && (
                          <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                            <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-1 flex items-center">
                              <Droplets className="h-3.5 w-3.5 text-cyan-600 mr-1.5" />
                              Irrigation Timing & Drainage
                            </h5>
                            <p className="text-gray-600 text-xs leading-relaxed">
                              {advisory.irrigationAdvice}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Best Weather Suitability */}
                      {advisory.bestSuitableWeather && (
                        <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                          <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-1 flex items-center">
                            <CloudRain className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
                            Microclimate Suitability for Application
                          </h5>
                          <p className="text-gray-600 text-xs leading-relaxed">
                            {advisory.bestSuitableWeather}
                          </p>
                        </div>
                      )}

                      {/* Multi-language regional translations */}
                      {(advisory.marathiTranslation || advisory.hindiTranslation || advisory.kannadaTranslation) && (
                        <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
                          <span className="font-bold block uppercase tracking-wider text-[10px] text-purple-800">
                            Regional Languages (प्रादेशिक भाषा):
                          </span>
                          {advisory.marathiTranslation && (
                            <p className="font-medium"><strong>मराठी (Maharashtra):</strong> {advisory.marathiTranslation}</p>
                          )}
                          {advisory.hindiTranslation && (
                            <p className="font-medium"><strong>हिंदी:</strong> {advisory.hindiTranslation}</p>
                          )}
                          {advisory.kannadaTranslation && (
                            <p className="font-medium"><strong>ಕನ್ನಡ:</strong> {advisory.kannadaTranslation}</p>
                          )}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-200/60 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                            <Check className="h-3 w-3 mr-1" /> Available 100% Offline
                          </span>
                          {advisory.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                          <button
                            onClick={() => handleSpeak(advisory)}
                            className="text-emerald-700 font-bold hover:underline flex items-center mr-3"
                          >
                            <Volume2 className="h-3.5 w-3.5 mr-1" />
                            {isSpeaking ? 'Stop Voice' : 'Listen Offline'}
                          </button>
                          {advisory.id.startsWith('scan_') && (
                            <button
                              onClick={(e) => handleDelete(advisory.id, e)}
                              className="text-red-500 hover:text-red-700 hover:underline"
                            >
                              Delete Cached Scan
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-3">
          <div className="flex items-center">
            <Database className="h-4 w-4 text-emerald-600 mr-2 flex-shrink-0" />
            <span>
              All {advisories.length} agricultural advisories are permanently stored locally in your browser's IndexedDB.
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-xs"
          >
            Close Vault
          </button>
        </div>

      </div>
    </div>
  );
}
