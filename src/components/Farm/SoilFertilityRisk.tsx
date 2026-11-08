import React, { useState } from 'react';
import { Sprout, AlertTriangle, TrendingDown, TrendingUp, CheckCircle, Droplets, FlaskConical, TestTube, Info } from 'lucide-react';
import SoilNutrientModal, { SoilNutrientInfo } from '../Modals/SoilNutrientModal.tsx';

export default function SoilFertilityRisk() {
  const [selectedNutrient, setSelectedNutrient] = useState<SoilNutrientInfo | null>(null);

  // Mock live IoT soil data
  const soilData = {
    nitrogen: 28, // Low (Ideal: 40-50)
    phosphorus: 45, // Good
    potassium: 35, // Low
    ph: 5.2, // Acidic (High Risk)
    moisture: 42 // Good
  };

  const isHighRisk = soilData.ph < 5.5 || soilData.nitrogen < 30;

  const nutrientDetails: Record<string, SoilNutrientInfo> = {
    nitrogen: {
      name: 'Available Nitrogen (N)',
      symbol: 'N',
      currentValue: 28,
      unit: 'mg/kg',
      idealRange: '40 – 50 mg/kg',
      status: 'Deficient',
      statusColor: 'text-red-700',
      statusBg: 'bg-red-100',
      description: 'Nitrogen is the cornerstone of vegetative chlorophyll synthesis and vegetative canopy growth. Current levels are in the critical deficit zone, causing leaf chlorosis and stunting vegetative expansion.',
      symptoms: [
        'Pale light-green to yellowish discoloration of older lower leaves (interveinal chlorosis)',
        'Premature leaf senescence and shedding from the bottom canopy upward',
        'Stunted internodal expansion and slender, fibrous stem development'
      ],
      remediationPlan: [
        'Apply Neem-coated Urea or Calcium Ammonium Nitrate (CAN) at 35 kg/acre in split dose.',
        'Foliar spray with 1% Urea solution + Bio-stimulant seaweed extract for instant leaf recovery.',
        'Incorporate well-decomposed farmyard manure or vermicompost to build long-term microbial fixation.'
      ]
    },
    phosphorus: {
      name: 'Available Phosphorus (P)',
      symbol: 'P',
      currentValue: 45,
      unit: 'mg/kg',
      idealRange: '35 – 50 mg/kg',
      status: 'Optimal',
      statusColor: 'text-green-700',
      statusBg: 'bg-green-100',
      description: 'Phosphorus drives early root architecture, cellular energy transfer (ATP), and flower square formation. Your current reading is in the ideal physiological sweet spot.',
      symptoms: [
        'Roots are actively branching with vigorous lateral root hair density',
        'Stems display healthy anthocyanin balance without purple purpling stress lines',
        'Early square bud formation is proceeding on target schedule'
      ],
      remediationPlan: [
        'Maintain baseline levels; no immediate chemical phosphate application required.',
        'Inoculate with Phosphate Solubilizing Bacteria (PSB) to prevent fixation in acidic soil pockets.',
        'Re-test in 30 days during active flowering phase.'
      ]
    },
    potassium: {
      name: 'Available Potassium (K)',
      symbol: 'K',
      currentValue: 35,
      unit: 'mg/kg',
      idealRange: '45 – 65 mg/kg',
      status: 'Deficient',
      statusColor: 'text-amber-700',
      statusBg: 'bg-amber-100',
      description: 'Potassium regulates stomatal conductance, water pressure regulation, and disease resistance against fungal blights. Mild deficit increases wilt susceptibility under warm afternoon winds.',
      symptoms: [
        'Marginal leaf scorching and curling along the outer blade margins',
        'Reduced drought resilience during afternoon high evapotranspiration windows',
        'Increased vulnerability to sucking pests and alternaria foliar leaf spots'
      ],
      remediationPlan: [
        'Apply Muriate of Potash (MOP) or Potassium Sulfate at 20 kg/acre.',
        'Foliar spray 0.5% Potassium Nitrate (13-0-45) to enhance osmotic pressure regulation.',
        'Avoid excessive sodium or magnesium saturation that competes with K root uptake channels.'
      ]
    },
    ph: {
      name: 'Soil pH Reaction',
      symbol: 'pH',
      currentValue: 5.2,
      unit: 'pH scale',
      idealRange: '6.2 – 7.2 (Neutral)',
      status: 'Critical Acidic',
      statusColor: 'text-red-700',
      statusBg: 'bg-red-100',
      description: 'At pH 5.2, strong soil acidity causes Aluminum and Manganese toxicity while causing chemical "lockout" of Nitrogen and Phosphorus root uptake even when fertilizers are physically present.',
      symptoms: [
        'Nutrient lockout: Fertilizer applications show diminished vegetative response',
        'Aluminum ion binding suppresses deep taproot penetration',
        'Beneficial soil nitrifying bacteria populations decline sharply in acidic substrate'
      ],
      remediationPlan: [
        'Broadcast Agricultural Dolomitic Lime (CaCO3 + MgCO3) at 350-400 kg/acre prior to next irrigation.',
        'Incorporate wood ash or biochar into topsoil to buffer rhizosphere acidity.',
        'Switch away from ammonium-sulfate based acidifying fertilizers until pH re-establishes above 6.2.'
      ]
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center text-gray-900 font-bold text-lg">
          <Sprout className="h-6 w-6 mr-2 text-amber-700" />
          Soil Fertility Risk
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center shadow-xs ${isHighRisk ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {isHighRisk ? <AlertTriangle className="h-3.5 w-3.5 mr-1" /> : <CheckCircle className="h-3.5 w-3.5 mr-1" />}
          {isHighRisk ? 'High Risk Deficit' : 'Healthy Equilibrium'}
        </span>
      </div>

      {isHighRisk && (
        <div 
          onClick={() => setSelectedNutrient(nutrientDetails.ph)}
          className="bg-red-50/90 border border-red-200 rounded-2xl p-4 mb-5 flex items-start cursor-pointer hover:bg-red-100/80 transition-all group"
        >
          <AlertTriangle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-red-900 text-sm">Critical Nutrient Deficit & Acid Lockout</h4>
              <span className="text-[10px] bg-red-200 text-red-900 font-bold px-2 py-0.5 rounded-full">Click for plan →</span>
            </div>
            <p className="text-red-800 text-xs mt-1 leading-relaxed">
              High acidity (pH 5.2) is chemically locking out Nitrogen absorption. Tap to view the agricultural liming calculation and immediate remediation protocol.
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mb-3 flex items-center">
        <Info className="h-3.5 w-3.5 mr-1 text-gray-400" />
        Tap any nutrient card below for comprehensive root diagnostics and remediation dosages:
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Nitrogen */}
        <div 
          onClick={() => setSelectedNutrient(nutrientDetails.nitrogen)}
          className="p-3.5 border rounded-2xl flex items-center justify-between bg-gray-50/70 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer group shadow-2xs hover:shadow-sm"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl mr-3 group-hover:scale-110 transition-transform">
              <span className="font-black">N</span>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-bold flex items-center space-x-1">
                <span>Nitrogen</span>
              </div>
              <div className="text-lg font-black text-gray-900">{soilData.nitrogen} <span className="text-[10px] text-gray-500 font-normal">mg/kg</span></div>
            </div>
          </div>
          <TrendingDown className="h-5 w-5 text-red-500 group-hover:scale-125 transition-transform" />
        </div>

        {/* Phosphorus */}
        <div 
          onClick={() => setSelectedNutrient(nutrientDetails.phosphorus)}
          className="p-3.5 border rounded-2xl flex items-center justify-between bg-gray-50/70 hover:bg-orange-50/50 hover:border-orange-300 transition-all cursor-pointer group shadow-2xs hover:shadow-sm"
        >
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 text-orange-800 rounded-xl mr-3 group-hover:scale-110 transition-transform">
              <span className="font-black">P</span>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-bold">Phosphorus</div>
              <div className="text-lg font-black text-gray-900">{soilData.phosphorus} <span className="text-[10px] text-gray-500 font-normal">mg/kg</span></div>
            </div>
          </div>
          <CheckCircle className="h-5 w-5 text-green-500 group-hover:scale-125 transition-transform" />
        </div>

        {/* Potassium */}
        <div 
          onClick={() => setSelectedNutrient(nutrientDetails.potassium)}
          className="p-3.5 border rounded-2xl flex items-center justify-between bg-gray-50/70 hover:bg-purple-50/50 hover:border-purple-300 transition-all cursor-pointer group shadow-2xs hover:shadow-sm"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 text-purple-800 rounded-xl mr-3 group-hover:scale-110 transition-transform">
              <span className="font-black">K</span>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-bold">Potassium</div>
              <div className="text-lg font-black text-gray-900">{soilData.potassium} <span className="text-[10px] text-gray-500 font-normal">mg/kg</span></div>
            </div>
          </div>
          <TrendingDown className="h-5 w-5 text-orange-500 group-hover:scale-125 transition-transform" />
        </div>

        {/* pH Level */}
        <div 
          onClick={() => setSelectedNutrient(nutrientDetails.ph)}
          className={`p-3.5 border rounded-2xl flex items-center justify-between transition-all cursor-pointer group shadow-2xs hover:shadow-sm ${
            soilData.ph < 6 
              ? 'bg-red-50/60 border-red-200 hover:bg-red-50 hover:border-red-300' 
              : 'bg-gray-50/70 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-xl mr-3 group-hover:scale-110 transition-transform ${soilData.ph < 6 ? 'bg-red-100' : 'bg-gray-200'}`}>
              <FlaskConical className={`h-5 w-5 ${soilData.ph < 6 ? 'text-red-700' : 'text-gray-700'}`} />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-bold">Soil pH</div>
              <div className="text-lg font-black text-gray-900">{soilData.ph} <span className="text-[10px] text-red-500 font-bold">Acidic</span></div>
            </div>
          </div>
          <AlertTriangle className="h-5 w-5 text-red-500 group-hover:scale-125 transition-transform" />
        </div>
      </div>

      {selectedNutrient && (
        <SoilNutrientModal 
          nutrient={selectedNutrient} 
          onClose={() => setSelectedNutrient(null)} 
        />
      )}
    </div>
  );
}

