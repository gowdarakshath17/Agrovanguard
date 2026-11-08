import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './context/AuthContext.tsx';
import AuthContainer from './components/Auth/AuthContainer.tsx';
import WeatherAIManager from './components/Weather/WeatherAIManager.tsx';
import FarmOnboarding from './components/Farm/FarmOnboarding.tsx';
import DataQualityWidget from './components/Farm/DataQualityWidget.tsx';
import ScannerWidget from './components/AI/ScannerWidget.tsx';
import UserProfile from './components/Profile/UserProfile.tsx';
import IoTControlPanel from './components/IoT/IoTControlPanel.tsx';
import FertilizerEstimator from './components/Farm/FertilizerEstimator.tsx';
import PushNotificationManager from './components/Notifications/PushNotificationManager.tsx';
import CropComparator from './components/Farm/CropComparator.tsx';
import PestInfestationTracker from './components/Farm/PestInfestationTracker.tsx';
import EcoPesticideScheduler from './components/Farm/EcoPesticideScheduler.tsx';
import SoilFertilityChart from './components/Farm/SoilFertilityChart.tsx';
import SoilFertilityRisk from './components/Farm/SoilFertilityRisk.tsx';
import AssistantModal from './components/AI/AssistantModal.tsx';
import VoiceHelpModal from './components/AI/VoiceHelpModal.tsx';
import ViewActionModal from './components/AI/ViewActionModal.tsx';
import CropHealthModal from './components/Modals/CropHealthModal.tsx';
import PestRiskModal from './components/Modals/PestRiskModal.tsx';
import WeatherRiskModal from './components/Modals/WeatherRiskModal.tsx';
import ActionRequiredModal from './components/Modals/ActionRequiredModal.tsx';
import CropPhenologyModal from './components/Modals/CropPhenologyModal.tsx';
import AdminDashboard from './components/Admin/AdminDashboard.tsx';
import { PWAInstallButton } from './components/PWA/PWAInstallButton.tsx';
import { OfflineIndicator } from './components/PWA/OfflineIndicator.tsx';
import { LogOut, User, Leaf, ShieldAlert, CloudRain, Bell, Loader2, Camera, Sprout, Bot, Mic, CheckCircle2, ChevronRight, Activity, Sparkles } from 'lucide-react';

export default function AppContent() {
  const { user, logout, getToken } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [passport, setPassport] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [showViewAction, setShowViewAction] = useState(false);

  // Immersive dynamic popup states
  const [showCropHealth, setShowCropHealth] = useState(false);
  const [showPestRisk, setShowPestRisk] = useState(false);
  const [showWeatherRisk, setShowWeatherRisk] = useState(false);
  const [showActionRequired, setShowActionRequired] = useState(false);
  const [showCropPhenology, setShowCropPhenology] = useState(false);
  const [actionResolved, setActionResolved] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const token = await getToken();
      if (!token) return;

      const [profileRes, passportRes] = await Promise.all([
        fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/farms/passport', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      } else {
        setProfile({
          id: 1,
          fullName: user.displayName || user.email?.split('@')[0] || 'Farmer',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          preferredLanguage: 'English',
          role: 'FARMER',
          profileEditsLeft: 3,
        });
      }

      if (passportRes.ok) {
        const passportData = await passportRes.json();
        setPassport(passportData);
      }
    } catch (err) {
      console.warn('Network notice while fetching initial data (using cached state):', err);
      if (!profile) {
        setProfile({
          id: 1,
          fullName: user.displayName || user.email?.split('@')[0] || 'Farmer',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          preferredLanguage: 'English',
          role: 'FARMER',
          profileEditsLeft: 3,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, getToken, profile]);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, fetchData]);

  if (!user) {
    return <AuthContainer />;
  }

  // Admin routing
  if (profile?.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
      </div>
    );
  }

  // Cold-Start Strategy: Force onboarding if no passport
  if (passport && passport.length === 0) {
    return <FarmOnboarding onComplete={fetchData} />;
  }

  const activeFarm = passport?.[0];
  const activeField = activeFarm?.fields?.[0];
  const activeCrop = activeField?.cropCycles?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <OfflineIndicator />
      
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-emerald-600" />
              <div className="ml-2.5">
                <span className="text-xl font-black text-gray-900 tracking-tight block leading-tight">Agro Vanguard</span>
                <span className="text-[10px] font-semibold text-emerald-700 tracking-wider uppercase block">Maharashtra Agronomic Twin</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <PWAInstallButton />
              <span className="hidden sm:inline-block text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {profile?.role || 'FARMER'}
              </span>
              <button 
                onClick={() => setShowProfile(true)}
                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                title="Profile"
              >
                <User className="h-6 w-6" />
              </button>
              <button 
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard / Farm Home */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {activeFarm?.name || 'My Farm'}
            </h1>
            <div 
              onClick={() => setShowCropPhenology(true)}
              className="mt-2 inline-flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-700 shadow-2xs hover:border-green-300 hover:shadow-xs cursor-pointer transition-all group"
              title="Click to view full Crop Phenology & Growth Stage Passport"
            >
              <Sprout className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
              <span>Active Crop: <strong className="text-gray-900 font-bold">{activeCrop?.crop || 'Cotton (BT Cotton)'} {activeCrop?.variety ? `(${activeCrop.variety})` : ''}</strong></span>
              <span className="text-gray-300">•</span>
              <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                {activeCrop?.status || 'VEGETATIVE'}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-100/80 px-3 py-1.5 rounded-xl">
            <Activity className="h-3.5 w-3.5 text-green-600" />
            <span>Telemetry Active • Real-time Agronomic AI</span>
          </div>
        </div>

        {/* Status Cards - Interactive Deep-Dive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Crop Health Card */}
          <div 
            onClick={() => setShowCropHealth(true)}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md cursor-pointer transition-all duration-200 group relative overflow-hidden active:scale-[0.99]"
            title="Click to view Crop Health & Biomass Diagnostic Report"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <p className="text-sm font-bold text-gray-500">Crop Health</p>
                  <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    Inspect ↗
                  </span>
                </div>
                <p className="text-3xl font-black text-gray-900 mt-1">84<span className="text-lg text-gray-400 font-normal">/100</span></p>
                <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">● Optimal Vigor</span>
              </div>
              <div className="h-14 w-14 bg-green-50 group-hover:bg-green-100 rounded-2xl flex items-center justify-center transition-colors">
                <Leaf className="h-7 w-7 text-green-600 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 group-hover:text-green-700">
              <span>Foliar chlorophyll report</span>
              <span>Tap for details →</span>
            </div>
          </div>
          
          {/* Pest Risk Card */}
          <div 
            onClick={() => setShowPestRisk(true)}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-red-300 hover:shadow-md cursor-pointer transition-all duration-200 group relative overflow-hidden active:scale-[0.99]"
            title="Click to view Pest Threat & Outbreak Vector Analysis"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <p className="text-sm font-bold text-gray-500">Pest Risk</p>
                  <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    Inspect ↗
                  </span>
                </div>
                <p className="text-3xl font-black text-red-600 mt-1">HIGH</p>
                <span className="text-xs text-red-700 font-semibold mt-1 inline-block">● Early Blight Vector</span>
              </div>
              <div className="h-14 w-14 bg-red-50 group-hover:bg-red-100 rounded-2xl flex items-center justify-center transition-colors">
                <ShieldAlert className="h-7 w-7 text-red-600 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 group-hover:text-red-700">
              <span>Microclimate spore window</span>
              <span>Tap for details →</span>
            </div>
          </div>

          {/* Weather Risk Card */}
          <div 
            onClick={() => setShowWeatherRisk(true)}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-yellow-300 hover:shadow-md cursor-pointer transition-all duration-200 group relative overflow-hidden active:scale-[0.99]"
            title="Click to view 48h Weather Advisory & Spray Windows"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <p className="text-sm font-bold text-gray-500">Weather Risk</p>
                  <span className="text-[10px] text-yellow-600 font-bold bg-yellow-50 px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    Inspect ↗
                  </span>
                </div>
                <p className="text-3xl font-black text-yellow-600 mt-1">MODERATE</p>
                <span className="text-xs text-yellow-700 font-semibold mt-1 inline-block">● Wind Drift Advisory</span>
              </div>
              <div className="h-14 w-14 bg-yellow-50 group-hover:bg-yellow-100 rounded-2xl flex items-center justify-center transition-colors">
                <CloudRain className="h-7 w-7 text-yellow-600 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 group-hover:text-yellow-700">
              <span>48-hour spray window</span>
              <span>Tap for details →</span>
            </div>
          </div>
        </div>

        {/* Action Required Banner - Interactive Protocol Banner */}
        <div 
          onClick={() => setShowActionRequired(true)}
          className={`border rounded-2xl p-5 mb-8 flex items-center justify-between transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group active:scale-[0.99] ${
            actionResolved 
              ? 'bg-green-50/80 border-green-200' 
              : 'bg-blue-50/90 border-blue-200 hover:bg-blue-100/70'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl flex-shrink-0 ${
              actionResolved ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 group-hover:scale-110 transition-transform'
            }`}>
              {actionResolved ? <CheckCircle2 className="h-6 w-6" /> : <Bell className="h-6 w-6 animate-bounce" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`text-base font-bold ${actionResolved ? 'text-green-900' : 'text-blue-900'}`}>
                  {actionResolved ? 'Inspection Task Completed' : 'Action Required: Field Inspection Protocol'}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  actionResolved ? 'bg-green-200 text-green-900' : 'bg-blue-200 text-blue-900'
                }`}>
                  {actionResolved ? 'Resolved' : 'High Priority'}
                </span>
              </div>
              <p className={`text-xs mt-1 leading-relaxed ${actionResolved ? 'text-green-700' : 'text-blue-800'}`}>
                {actionResolved 
                  ? 'Foliage inspection checklist complete. Next scheduled routine inspection in 48 hours.'
                  : 'Inspect lower leaves today for suspected early blight symptoms. Tap here to open the step-by-step checklist.'
                }
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <button 
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                actionResolved 
                  ? 'bg-white text-green-800 border border-green-200' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {actionResolved ? 'View Protocol' : 'Execute Checklist →'}
            </button>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => setShowScanner(true)}
            className="bg-green-600 text-white rounded-2xl p-5 flex flex-col items-center justify-center font-bold text-base hover:bg-green-700 transition-all shadow-md hover:shadow-lg active:scale-95 group"
          >
            <div className="p-2.5 bg-green-500/50 rounded-xl mb-2 group-hover:scale-110 transition-transform">
              <Camera className="h-6 w-6" />
            </div>
            <span>SCAN CROP</span>
            <span className="text-[10px] font-normal text-green-100 mt-0.5">AI Disease Diagnostic</span>
          </button>
          <button 
            onClick={() => setShowAssistant(true)}
            className="bg-white text-gray-900 border border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center font-bold text-base hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs hover:shadow-md active:scale-95 group"
          >
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl mb-2 group-hover:scale-110 transition-transform">
              <Bot className="h-6 w-6" />
            </div>
            <span>ASK ASSISTANT</span>
            <span className="text-[10px] font-normal text-gray-500 mt-0.5">Gemini Agronomist</span>
          </button>
          <button 
            onClick={() => setShowActionRequired(true)}
            className="bg-white text-gray-900 border border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center font-bold text-base hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs hover:shadow-md active:scale-95 group"
          >
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mb-2 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <span>ACTION PROTOCOL</span>
            <span className="text-[10px] font-normal text-gray-500 mt-0.5">Interactive Field Steps</span>
          </button>
          <button 
            onClick={() => setShowVoiceHelp(true)}
            className="bg-white text-gray-900 border border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center font-bold text-base hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs hover:shadow-md active:scale-95 group"
          >
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl mb-2 group-hover:scale-110 transition-transform">
              <Mic className="h-6 w-6" />
            </div>
            <span>VOICE HELP</span>
            <span className="text-[10px] font-normal text-gray-500 mt-0.5">Hands-Free Audio</span>
          </button>
        </div>

        <PushNotificationManager />

        {/* Environmental Context / Digital Twin Feed & IoT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <SoilFertilityRisk />
            <FertilizerEstimator />
            <CropComparator />
          </div>
          <div>
            {activeField && <IoTControlPanel fieldId={activeField.id} />}
            <PestInfestationTracker />
            <EcoPesticideScheduler />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeatherAIManager 
            lat={activeFarm?.latitude ? parseFloat(activeFarm.latitude) : undefined}
            lon={activeFarm?.longitude ? parseFloat(activeFarm.longitude) : undefined}
          />
          <DataQualityWidget passport={passport || []} />
        </div>
        
        <div className="grid grid-cols-1 gap-6 mt-8">
          <SoilFertilityChart />
        </div>

      </main>

      {/* Overlays */}
      {showScanner && (
        <ScannerWidget 
          fieldId={activeField?.id || 1} 
          cropType={activeCrop?.crop || 'Tomato'} 
          onClose={() => setShowScanner(false)} 
          lat={activeFarm?.latitude ? parseFloat(activeFarm.latitude) : undefined}
          lon={activeFarm?.longitude ? parseFloat(activeFarm.longitude) : undefined}
        />
      )}
      
      {showProfile && (
        <UserProfile 
          profile={profile} 
          onUpdate={fetchData} 
          onClose={() => setShowProfile(false)} 
        />
      )}

      {showAssistant && <AssistantModal onClose={() => setShowAssistant(false)} />}
      {showVoiceHelp && <VoiceHelpModal onClose={() => setShowVoiceHelp(false)} />}
      {showViewAction && <ViewActionModal onClose={() => setShowViewAction(false)} />}

      {/* Dynamic Immersive Modals */}
      {showCropHealth && (
        <CropHealthModal 
          score={84}
          cropName={activeCrop?.crop || 'Cotton (BT Cotton)'}
          onClose={() => setShowCropHealth(false)}
          onOpenScanner={() => setShowScanner(true)}
        />
      )}

      {showPestRisk && (
        <PestRiskModal 
          onClose={() => setShowPestRisk(false)}
          onOpenScanner={() => setShowScanner(true)}
        />
      )}

      {showWeatherRisk && (
        <WeatherRiskModal 
          onClose={() => setShowWeatherRisk(false)}
        />
      )}

      {showActionRequired && (
        <ActionRequiredModal 
          onClose={() => setShowActionRequired(false)}
          onOpenScanner={() => setShowScanner(true)}
          onResolve={() => setActionResolved(true)}
          isResolved={actionResolved}
        />
      )}

      {showCropPhenology && (
        <CropPhenologyModal 
          cropName={activeCrop?.crop || 'Cotton'}
          variety={activeCrop?.variety || 'BT Cotton'}
          stage={activeCrop?.status || 'VEGETATIVE'}
          onClose={() => setShowCropPhenology(false)}
        />
      )}
    </div>
  );
}
