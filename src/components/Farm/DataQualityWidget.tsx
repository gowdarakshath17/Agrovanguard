import React from 'react';
import { Database, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

interface DataQualityWidgetProps {
  passport: any[];
}

export default function DataQualityWidget({ passport }: DataQualityWidgetProps) {
  // Calculate completeness score based on SIH requirements
  const calculateScore = () => {
    if (!passport || passport.length === 0) return { score: 0, level: 'LOW', issues: ['No farm registered'] };
    
    let points = 20; // Base points for having a farm
    const issues = [];
    const farm = passport[0];
    const field = farm?.fields?.[0];
    const cycle = field?.cropCycles?.[0];
    const soil = field?.soilTests?.[0];

    if (farm?.latitude && farm?.longitude) points += 20;
    else issues.push('Missing GPS location coordinates');

    if (cycle?.crop) points += 20;
    else issues.push('Missing active crop information');

    if (cycle?.sowingDate) points += 10;
    else issues.push('Missing precise sowing date (affects crop stage AI)');

    if (soil) {
      if (soil.confidence === 'HIGH') points += 30; // Lab test
      else {
        points += 15; // Visual estimate
        issues.push('Using estimated soil values. Consider lab testing.');
      }
    } else {
      issues.push('No soil data available. Fertility risk unknown.');
    }

    let level = 'LOW';
    if (points >= 80) level = 'HIGH';
    else if (points >= 50) level = 'MODERATE';

    return { score: points, level, issues };
  };

  const quality = calculateScore();

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-green-100 text-green-800';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-bold text-gray-900">Data Quality Score</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${getBadgeColor(quality.level)}`}>
          {quality.level} CONFIDENCE
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-end mb-4">
          <span className="text-5xl font-extrabold text-gray-900">{quality.score}</span>
          <span className="text-xl text-gray-500 mb-1 ml-1">/100</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className={`h-2.5 rounded-full ${quality.score >= 80 ? 'bg-green-500' : quality.score >= 50 ? 'bg-yellow-500' : 'bg-orange-500'}`} 
            style={{ width: `${quality.score}%` }}
          ></div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">AI Prediction Reliability Factors</h4>
          <ul className="space-y-3">
            {quality.issues.length === 0 ? (
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">Digital Twin is fully hydrated. Maximum AI prediction accuracy enabled.</span>
              </li>
            ) : (
              quality.issues.map((issue, idx) => (
                <li key={idx} className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">{issue}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
