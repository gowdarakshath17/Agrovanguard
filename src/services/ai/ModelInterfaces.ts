import type { ImageQualityResult, AIModelResult, ConfidenceLevel } from '../../types/ai.ts';

// Centralized Confidence Policy Config
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 60,
  LOW: 0
};

export function determineConfidenceLevel(score: number): ConfidenceLevel {
  const val = Number(score);
  const normalized = val > 0 && val <= 1 ? Math.round(val * 100) : Math.round(val);
  if (normalized >= CONFIDENCE_THRESHOLDS.HIGH) return 'HIGH';
  if (normalized >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'MEDIUM';
  return 'LOW';
}

export interface ImageQualityModel {
  analyze(imageBase64: string): Promise<ImageQualityResult>;
}

export interface DiseaseModel {
  predict(imageBase64: string, cropType: string): Promise<AIModelResult>;
}

export interface PestModel {
  predict(imageBase64: string, cropType: string): Promise<AIModelResult>;
}
