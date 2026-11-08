import React, { useState, useEffect } from 'react';
import { Calculator, Sprout, Save } from 'lucide-react';

export default function FertilizerEstimator() {
  const [cropType, setCropType] = useState('Wheat');
  const [area, setArea] = useState('1');
  const [unit, setUnit] = useState('Acre');
  const [soilNitrogen, setSoilNitrogen] = useState('Medium');
  
  const [estimate, setEstimate] = useState<any>(null);

  // Load from cache on mount
  useEffect(() => {
    const cached = localStorage.getItem('fertilizer_estimate');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setCropType(parsed.cropType || 'Wheat');
        setArea(parsed.area || '1');
        setUnit(parsed.unit || 'Acre');
        setSoilNitrogen(parsed.soilNitrogen || 'Medium');
        setEstimate(parsed.estimate || null);
      } catch (e) {}
    }
  }, []);

  const calculate = () => {
    // Simple heuristic offline estimator
    const areaMultiplier = parseFloat(area) || 1;
    const unitMultiplier = unit === 'Hectare' ? 2.47105 : 1;
    const totalAcres = areaMultiplier * unitMultiplier;
    
    let baseN = 50; // kg per acre
    let baseP = 25;
    let baseK = 25;
    
    if (cropType === 'Rice') { baseN = 60; baseP = 30; baseK = 30; }
    if (cropType === 'Corn') { baseN = 75; baseP = 35; baseK = 35; }
    if (cropType === 'Sugarcane') { baseN = 100; baseP = 40; baseK = 40; }
    
    if (soilNitrogen === 'High') { baseN *= 0.7; }
    if (soilNitrogen === 'Low') { baseN *= 1.3; }

    const result = {
      n: Math.round(baseN * totalAcres),
      p: Math.round(baseP * totalAcres),
      k: Math.round(baseK * totalAcres),
      urea: Math.round((baseN * totalAcres) / 0.46), // Urea is 46% N
      dap: Math.round((baseP * totalAcres) / 0.46),  // Simplified DAP 
      mop: Math.round((baseK * totalAcres) / 0.60)   // Simplified MOP
    };

    setEstimate(result);
    
    // Save to cache
    localStorage.setItem('fertilizer_estimate', JSON.stringify({
      cropType, area, unit, soilNitrogen, estimate: result
    }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-gray-900 font-bold">
          <Calculator className="h-5 w-5 mr-2 text-green-600" />
          Offline Fertilizer Estimator
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-lg font-medium">Available Offline</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Crop Type</label>
          <select value={cropType} onChange={e => setCropType(e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
            <option>Wheat</option>
            <option>Rice</option>
            <option>Corn</option>
            <option>Sugarcane</option>
            <option>Cotton</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Soil Nitrogen Level</label>
          <select value={soilNitrogen} onChange={e => setSoilNitrogen(e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Farm Area</label>
          <input type="number" value={area} onChange={e => setArea(e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
          <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
            <option>Acre</option>
            <option>Hectare</option>
          </select>
        </div>
      </div>
      
      <button onClick={calculate} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-xl transition-colors mb-4 text-sm shadow-sm">
        Calculate Requirements
      </button>

      {estimate && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
            <Sprout className="h-4 w-4 mr-2 text-green-600" /> Estimated Needs
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="bg-white p-2 rounded border shadow-sm">
              <div className="text-xs text-gray-500">Nitrogen (N)</div>
              <div className="font-bold text-gray-900">{estimate.n} kg</div>
            </div>
            <div className="bg-white p-2 rounded border shadow-sm">
              <div className="text-xs text-gray-500">Phosphorus (P)</div>
              <div className="font-bold text-gray-900">{estimate.p} kg</div>
            </div>
            <div className="bg-white p-2 rounded border shadow-sm">
              <div className="text-xs text-gray-500">Potassium (K)</div>
              <div className="font-bold text-gray-900">{estimate.k} kg</div>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            <strong>Recommended Commercial Fertilizers:</strong><br/>
            Urea: ~{estimate.urea} kg | DAP: ~{estimate.dap} kg | MOP: ~{estimate.mop} kg
          </div>
        </div>
      )}
    </div>
  );
}
