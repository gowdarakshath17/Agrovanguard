export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ImageQualityResult {
  isSuitable: boolean;
  issues: string[]; // e.g., "Blurry", "Too dark", "No leaf detected"
  score: number;
}

export interface PredictionDetail {
  label: string;
  probability: number;
}

export interface AIModelResult {
  primaryPrediction: string;
  confidenceScore: number;
  confidenceLevel: ConfidenceLevel;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | null;
  alternatives: PredictionDetail[];
  explanation: string; // e.g., "Brown circular lesions identified"
  precautionaryMeasures?: string;
  pesticideSuggestions?: string;
  soilFertilityAdvice?: string;
  irrigationAdvice?: string;
  bestSuitableWeather?: string;
  relatedDiseaseToOtherCrop?: string;
  marathiTranslation?: string;
  kannadaTranslation?: string;
  heatmapAvailable: boolean;
  modelVersion: string;
  supportedScope: string[];
}

export interface OrchestratorResponse {
  imageQuality: ImageQualityResult;
  disease?: AIModelResult;
  pest?: AIModelResult;
  actionRequired: 'ADVISE' | 'CLARIFY' | 'ESCALATE';
  caseId?: number; // DB reference for the created case
}

export const AI_TYPES_DEFINED = true;
export default {};
