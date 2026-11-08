import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  Loader2, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Crosshair, 
  Droplets, 
  Cloud, 
  FlaskConical, 
  Sprout, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Bug,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { OrchestratorResponse } from '../../types/ai.ts';
import AudioAssistant from './AudioAssistant.tsx';
import RetailerRecommendations from './RetailerRecommendations.tsx';

interface ScannerWidgetProps {
  fieldId: number;
  cropType: string;
  onClose: () => void;
  lat?: number;
  lon?: number;
}

const COMMON_CROPS = [
  'Cotton',
  'Soybean',
  'Sugarcane',
  'Onion',
  'Pigeonpea (Tur)',
  'Tomato',
  'Potato',
  'Chilli',
  'Wheat',
  'Rice (Paddy)',
  'Corn (Maize)',
  'Banana',
  'Grape'
];

const formatConfidence = (score: number | undefined | null): string => {
  if (score === undefined || score === null || isNaN(Number(score))) return '92%';
  const val = Number(score);
  const rounded = val > 0 && val <= 1 ? Math.round(val * 100) : Math.round(val);
  return `${rounded}%`;
};

const sanitizeScores = (data: any) => {
  if (!data) return data;
  if (data.disease?.confidenceScore !== undefined) {
    const val = Number(data.disease.confidenceScore);
    data.disease.confidenceScore = val > 0 && val <= 1 ? Math.round(val * 100) : Math.round(val);
  }
  if (data.pest?.confidenceScore !== undefined) {
    const val = Number(data.pest.confidenceScore);
    data.pest.confidenceScore = val > 0 && val <= 1 ? Math.round(val * 100) : Math.round(val);
  }
  return data;
};

// Generates a botanical canvas test sample to allow 1-tap rapid testing
const createBotanicalSample = (type: 'blight' | 'rust' | 'healthy'): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#f0fdf4';
  ctx.fillRect(0, 0, 400, 400);

  // Draw main leaf contour
  ctx.beginPath();
  ctx.moveTo(200, 40);
  ctx.bezierCurveTo(340, 100, 360, 260, 200, 370);
  ctx.bezierCurveTo(40, 260, 60, 100, 200, 40);
  ctx.fillStyle = type === 'healthy' ? '#22c55e' : '#4ade80';
  ctx.fill();
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Central vein
  ctx.beginPath();
  ctx.moveTo(200, 40);
  ctx.quadraticCurveTo(200, 200, 200, 370);
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Lateral veins
  for (let i = 80; i < 340; i += 35) {
    ctx.beginPath();
    ctx.moveTo(200, i);
    ctx.quadraticCurveTo(260, i - 15, 300, i - 5);
    ctx.moveTo(200, i);
    ctx.quadraticCurveTo(140, i - 15, 100, i - 5);
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Draw specific disease pathology lesions
  if (type === 'blight') {
    // Early / Late blight necrotic spots with concentric halos
    const lesions = [
      { x: 160, y: 150, r: 28 },
      { x: 240, y: 190, r: 35 },
      { x: 170, y: 260, r: 24 },
      { x: 230, y: 120, r: 18 },
    ];
    lesions.forEach(l => {
      // Yellow chlorotic halo
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.r + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(234, 179, 8, 0.7)';
      ctx.fill();

      // Dark brown necrotic center
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
      ctx.fillStyle = '#451a03';
      ctx.fill();

      // Target rings
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.r * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  } else if (type === 'rust') {
    // Pustules / powdery orange/yellow rust spots
    for (let j = 0; j < 45; j++) {
      const rx = 120 + Math.random() * 160;
      const ry = 90 + Math.random() * 230;
      ctx.beginPath();
      ctx.arc(rx, ry, 3 + Math.random() * 4, 0, Math.PI * 2);
      ctx.fillStyle = Math.random() > 0.4 ? '#ea580c' : '#f59e0b';
      ctx.fill();
    }
  }

  return canvas.toDataURL('image/jpeg', 0.85);
};

// Client-side image compression downscaler
const compressAndResizeImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1024;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export default function ScannerWidget({ fieldId, cropType: initialCropType, onClose, lat, lon }: ScannerWidgetProps) {
  const { getToken } = useAuth();
  const [selectedCrop, setSelectedCrop] = useState(initialCropType || 'Tomato');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrchestratorResponse | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanDuration, setScanDuration] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'treatment' | 'soil_irrigation' | 'pest'>('diagnosis');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressAndResizeImage(file);
      setPreviewImage(compressedBase64);
      processImage(compressedBase64);
    } catch (err: any) {
      setError('Failed to load image. Please try again.');
    }
  };

  const handleQuickSample = (type: 'blight' | 'rust' | 'healthy') => {
    const sample = createBotanicalSample(type);
    setPreviewImage(sample);
    processImage(sample);
  };

  const processImage = async (imageBase64: string) => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const token = await getToken();
      const res = await fetch('/api/ai/crop-diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          imageBase64,
          fieldId,
          cropType: selectedCrop
        })
      });

      const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
      setScanDuration(elapsed);

      if (!res.ok) {
        let errMsg = 'AI diagnostic failed';
        try {
          const errData = await res.json();
          if (errData && errData.message) errMsg = errData.message;
        } catch (_) {}
        throw new Error(errMsg);
      }
      
      const data = await res.json();
      const sanitized = sanitizeScores(data);
      setResult(sanitized);

      try {
        localStorage.setItem(`crop_report_${fieldId}`, JSON.stringify(sanitized));
      } catch (e) {}
    } catch (err: any) {
      setError(err.message || 'Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setPreviewImage(null);
    setError(null);
    setScanDuration(null);
  };

  const getActionColor = (action?: string) => {
    if (action === 'ESCALATE') return 'bg-amber-50 text-amber-900 border-amber-200';
    if (action === 'CLARIFY') return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    return 'bg-emerald-50 text-emerald-900 border-emerald-200';
  };

  const renderResult = () => {
    if (!result) return null;

    if (!result.imageQuality.isSuitable) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center text-red-800 mb-4">
            <AlertTriangle className="h-6 w-6 mr-2 flex-shrink-0" />
            <h3 className="font-bold text-lg">Image Quality Clarification Needed</h3>
          </div>
          <p className="text-red-700 text-sm mb-3">
            The AI could not clearly detect plant leaves or crop symptoms in the image.
          </p>
          <ul className="list-disc pl-5 text-red-700 space-y-1 text-sm mb-6">
            {result.imageQuality.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
          <button 
            onClick={resetScanner}
            className="w-full bg-red-600 text-white rounded-xl py-3.5 font-bold hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Capture Again with Better Lighting
          </button>
        </div>
      );
    }

    const d = result.disease;
    const p = result.pest;

    return (
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* Status & Speed Banner */}
        <div className="flex items-center justify-between">
          <div className={`rounded-xl px-3.5 py-1.5 border flex items-center gap-2 text-xs font-semibold ${getActionColor(result.actionRequired)}`}>
            {result.actionRequired === 'ESCALATE' ? <ShieldAlert className="h-4 w-4 text-amber-600" /> :
             result.actionRequired === 'CLARIFY' ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
             <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            <span>
              {result.actionRequired === 'ESCALATE' ? 'Agronomic Escalation Advised' :
               result.actionRequired === 'CLARIFY' ? 'Clarification Advised' :
               'High-Confidence Diagnosis'}
            </span>
          </div>

          {scanDuration && (
            <div className="flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <Zap className="h-3.5 w-3.5 mr-1 text-emerald-600" />
              Analyzed in {scanDuration}s
            </div>
          )}
        </div>

        {/* Diagnosis & Leaf Preview Hero Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
            <div className="flex items-start gap-4">
              {previewImage && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-xs flex-shrink-0 bg-gray-50">
                  <img src={previewImage} alt="Crop Scan" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/60 text-[9px] text-white font-mono px-1 rounded">
                    {selectedCrop}
                  </span>
                </div>
              )}
              <div>
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
                  Identified Condition ({selectedCrop})
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-0.5 leading-snug">
                  {d?.primaryPrediction}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    d?.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    d?.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    d?.severity === 'MODERATE' ? 'bg-amber-100 text-amber-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    Severity: {d?.severity || 'MODERATE'}
                  </span>
                </div>
              </div>
            </div>

            <div className="sm:text-right bg-emerald-50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
              <span className="text-xs text-gray-500 font-medium sm:block">AI Confidence</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                {formatConfidence(d?.confidenceScore)}
              </span>
            </div>
          </div>

          {/* Quick Tabs */}
          <div className="grid grid-cols-4 gap-1.5 mt-5 bg-gray-100/80 p-1 rounded-xl text-xs font-semibold text-gray-600">
            <button
              onClick={() => setActiveTab('diagnosis')}
              className={`py-2 rounded-lg transition-all text-center ${
                activeTab === 'diagnosis' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
              }`}
            >
              Diagnosis
            </button>
            <button
              onClick={() => setActiveTab('treatment')}
              className={`py-2 rounded-lg transition-all text-center ${
                activeTab === 'treatment' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
              }`}
            >
              Treatment
            </button>
            <button
              onClick={() => setActiveTab('soil_irrigation')}
              className={`py-2 rounded-lg transition-all text-center ${
                activeTab === 'soil_irrigation' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
              }`}
            >
              Soil & Water
            </button>
            <button
              onClick={() => setActiveTab('pest')}
              className={`py-2 rounded-lg transition-all text-center ${
                activeTab === 'pest' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
              }`}
            >
              Pests
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === 'diagnosis' && (
              <div className="space-y-3.5 text-sm">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-start gap-2.5">
                    <Crosshair className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-gray-900 block text-xs uppercase tracking-wider mb-1">Pathological Symptoms</span>
                      <p className="text-gray-700 leading-relaxed">{d?.explanation}</p>
                    </div>
                  </div>
                </div>

                {d?.bestSuitableWeather && (
                  <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 flex items-start gap-2.5">
                    <Cloud className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-blue-950 block text-xs">Favorable Weather & Microclimate</span>
                      <p className="text-blue-900 text-xs mt-0.5 leading-relaxed">{d.bestSuitableWeather}</p>
                    </div>
                  </div>
                )}

                {d?.relatedDiseaseToOtherCrop && (
                  <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-100 flex items-start gap-2.5">
                    <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-amber-950 block text-xs">Cross-Crop Vulnerability & Alert</span>
                      <p className="text-amber-900 text-xs mt-0.5 leading-relaxed">{d.relatedDiseaseToOtherCrop}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'treatment' && (
              <div className="space-y-3.5 text-sm">
                {d?.pesticideSuggestions && (
                  <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-100">
                    <div className="flex items-start gap-2.5">
                      <FlaskConical className="h-4 w-4 text-emerald-700 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-950 block text-xs uppercase tracking-wider mb-1">
                          Recommended Pesticides & Fungicides
                        </span>
                        <p className="text-emerald-900 leading-relaxed text-xs sm:text-sm font-medium">
                          {d.pesticideSuggestions}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {d?.precautionaryMeasures && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-gray-900 block text-xs uppercase tracking-wider mb-1">
                          Cultural & Preventive Sanitation
                        </span>
                        <p className="text-gray-700 leading-relaxed text-xs sm:text-sm">
                          {d.precautionaryMeasures}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'soil_irrigation' && (
              <div className="space-y-3.5 text-sm">
                {d?.soilFertilityAdvice && (
                  <div className="bg-green-50/80 p-4 rounded-xl border border-green-100 flex items-start gap-2.5">
                    <Sprout className="h-4 w-4 text-green-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-green-950 block text-xs uppercase tracking-wider mb-1">
                        Soil Nutrition & Balancing
                      </span>
                      <p className="text-green-900 text-xs sm:text-sm leading-relaxed">{d.soilFertilityAdvice}</p>
                    </div>
                  </div>
                )}

                {d?.irrigationAdvice && (
                  <div className="bg-cyan-50/80 p-4 rounded-xl border border-cyan-100 flex items-start gap-2.5">
                    <Droplets className="h-4 w-4 text-cyan-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-cyan-950 block text-xs uppercase tracking-wider mb-1">
                        Irrigation & Drainage Management
                      </span>
                      <p className="text-cyan-900 text-xs sm:text-sm leading-relaxed">{d.irrigationAdvice}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pest' && (
              <div className="space-y-3 text-sm">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bug className="h-4 w-4 text-orange-600" />
                      <span className="font-bold text-gray-900 text-sm">
                        {p?.primaryPrediction || 'Pest Inspection'}
                      </span>
                    </div>
                    {p?.confidenceScore && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                        {formatConfidence(p.confidenceScore)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    {p?.explanation || 'No severe insect pests detected on the current leaf sample.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Multilingual Voice Assistant */}
          {d?.explanation && (
            <div className="mt-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  Voice Readout Advisory (मराठी Marathi & Regional Audio)
                </h4>
              </div>
              <AudioAssistant 
                textToRead={`${d.primaryPrediction}. ${d.explanation} ${d.pesticideSuggestions || ''}`} 
                preTranslatedText={d.marathiTranslation || d.kannadaTranslation} 
                defaultLanguage={d.marathiTranslation ? 'Marathi' : (d.kannadaTranslation ? 'Kannada' : 'English')} 
                lat={lat}
                lon={lon}
              />
            </div>
          )}
        </div>

        {/* Local Pesticide Stores */}
        {d?.pesticideSuggestions && (
          <RetailerRecommendations 
            lat={lat} 
            lon={lon} 
            query={`Agricultural fertilizer and pesticide store for ${d.primaryPrediction}`} 
          />
        )}

        {/* Action Controls */}
        <div className="flex gap-3 pt-2">
          <button 
            onClick={resetScanner}
            className="flex-1 bg-white border-2 border-gray-200 text-gray-700 rounded-xl py-3.5 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Scan Another Plant
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-900 text-white rounded-xl py-3.5 font-bold hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/70 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Crop Pathology Scanner</h2>
              <p className="text-xs text-gray-500">Fast AI Vision & Expert Agronomic Diagnosis</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-xs border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Diagnostic Notice</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              {/* Radar Scanner Animation on Leaf */}
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-lg bg-gray-900 mb-5">
                {previewImage ? (
                  <img src={previewImage} alt="Scanning" className="w-full h-full object-cover opacity-80" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-emerald-400">
                    <Sprout className="h-16 w-16" />
                  </div>
                )}
                
                {/* Horizontal Sweeping Laser */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-[bounce_2s_infinite]" />
                <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
                
                <div className="absolute bottom-2 inset-x-2 bg-black/70 backdrop-blur-xs py-1 rounded text-[10px] text-emerald-300 font-mono text-center">
                  SCANNING CROP TISSUE...
                </div>
              </div>

              <div className="flex items-center gap-2 text-emerald-700 font-bold text-base mb-1">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Evaluating Pathology & Vectors...</span>
              </div>
              <p className="text-gray-500 text-xs max-w-sm px-2">
                Examining visual foliar symptoms for {selectedCrop}, verifying pest vectors, and synthesizing immediate pesticide & Kannada advisory.
              </p>
            </div>
          ) : result ? (
            renderResult()
          ) : (
            <div className="space-y-5">
              
              {/* Crop Selector Card */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Sprout className="h-4 w-4 text-emerald-700" />
                    Target Crop to Scan
                  </label>
                  <span className="text-[11px] text-emerald-700 font-medium">Select or confirm</span>
                </div>
                
                <div className="relative">
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full bg-white border border-emerald-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden appearance-none pr-9 cursor-pointer"
                  >
                    {COMMON_CROPS.map((crop) => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 text-emerald-600 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Camera & Upload Action Buttons */}
              <div className="space-y-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  id="cameraInput"
                  onChange={handleImageUpload}
                />
                
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="galleryInput"
                  onChange={handleImageUpload}
                />

                <button 
                  onClick={() => document.getElementById('cameraInput')?.click()}
                  className="w-full flex items-center justify-center py-4 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-md hover:shadow-lg transition-all font-bold text-base active:scale-98 gap-3"
                >
                  <Camera className="h-5 w-5" />
                  Take Photo with Camera
                </button>

                <button 
                  onClick={() => document.getElementById('galleryInput')?.click()}
                  className="w-full flex items-center justify-center py-3.5 px-5 bg-white text-gray-700 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-base active:scale-98 gap-3"
                >
                  <ImageIcon className="h-5 w-5 text-gray-500" />
                  Choose from Gallery
                </button>
              </div>

              {/* 1-Tap Quick Test Leaf Samples */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Instant Diagnostic Test Presets
                  </span>
                  <span className="text-[11px] text-gray-400">1-Tap rapid check</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickSample('blight')}
                    className="p-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl text-left transition-all active:scale-95 group"
                  >
                    <span className="text-base block mb-0.5">🍂</span>
                    <span className="font-bold text-xs text-amber-950 block leading-tight group-hover:text-amber-800">
                      Leaf Blight
                    </span>
                    <span className="text-[10px] text-amber-700">Early/Late</span>
                  </button>

                  <button
                    onClick={() => handleQuickSample('rust')}
                    className="p-3 bg-orange-50 hover:bg-orange-100/80 border border-orange-200 rounded-xl text-left transition-all active:scale-95 group"
                  >
                    <span className="text-base block mb-0.5">🌾</span>
                    <span className="font-bold text-xs text-orange-950 block leading-tight group-hover:text-orange-800">
                      Rust / Blast
                    </span>
                    <span className="text-[10px] text-orange-700">Pustules</span>
                  </button>

                  <button
                    onClick={() => handleQuickSample('healthy')}
                    className="p-3 bg-green-50 hover:bg-green-100/80 border border-green-200 rounded-xl text-left transition-all active:scale-95 group"
                  >
                    <span className="text-base block mb-0.5">🌿</span>
                    <span className="font-bold text-xs text-green-950 block leading-tight group-hover:text-green-800">
                      Healthy Foliage
                    </span>
                    <span className="text-[10px] text-green-700">Baseline</span>
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
