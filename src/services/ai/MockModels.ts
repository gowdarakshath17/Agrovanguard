import { determineConfidenceLevel, type ImageQualityModel, type DiseaseModel, type PestModel } from './ModelInterfaces.ts';
import type { ImageQualityResult, AIModelResult } from '../../types/ai.ts';

/**
 * Deterministic Mock Models for SIH Phase 3 Evaluation.
 * Ensures consistent, zero-flicker demonstrations without relying on brittle APIs.
 */

export class MockImageQualityModel implements ImageQualityModel {
  async analyze(imageBase64: string): Promise<ImageQualityResult> {
    await new Promise(r => setTimeout(r, 400));
    
    // Simulate image quality check based on payload length
    if (imageBase64.length < 100) {
      return { isSuitable: false, issues: ['Image is too small or corrupted'], score: 12 };
    }
    
    return { isSuitable: true, issues: [], score: 92 };
  }
}

export class MockDiseaseModel implements DiseaseModel {
  async predict(imageBase64: string, cropType: string): Promise<AIModelResult> {
    await new Promise(r => setTimeout(r, 800));
    
    // Deterministic simulation based on crop type
    if (cropType.toLowerCase() === 'tomato') {
      return {
        primaryPrediction: 'Early Blight',
        confidenceScore: 87,
        confidenceLevel: determineConfidenceLevel(87),
        severity: 'HIGH',
        alternatives: [{ label: 'Septoria Leaf Spot', probability: 12 }],
        explanation: 'The system noticed brown circular lesions with concentric rings and surrounding yellowing on lower leaves.',
        heatmapAvailable: true,
        modelVersion: 'v1.4.2-mock',
        supportedScope: ['Tomato', 'Potato', 'Early Blight', 'Late Blight']
      };
    } else if (cropType.toLowerCase() === 'cotton') {
      return {
        primaryPrediction: 'Bacterial Blight',
        confidenceScore: 65,
        confidenceLevel: determineConfidenceLevel(65),
        severity: 'MODERATE',
        alternatives: [{ label: 'Alternaria Leaf Spot', probability: 30 }],
        explanation: 'Detected angular, dark green water-soaked spots bounded by leaf veins.',
        heatmapAvailable: true,
        modelVersion: 'v1.4.2-mock',
        supportedScope: ['Cotton', 'Bacterial Blight', 'Alternaria']
      };
    }
    
    // Unknown class pathway
    return {
      primaryPrediction: 'UNKNOWN',
      confidenceScore: 30,
      confidenceLevel: determineConfidenceLevel(30),
      severity: null,
      alternatives: [],
      explanation: 'Symptoms do not strongly match supported diseases for this crop. Visual pattern is anomalous.',
      heatmapAvailable: false,
      modelVersion: 'v1.4.2-mock',
      supportedScope: []
    };
  }
}

export class MockPestModel implements PestModel {
  async predict(imageBase64: string, cropType: string): Promise<AIModelResult> {
    await new Promise(r => setTimeout(r, 600));
    
    return {
      primaryPrediction: 'No visible pest detected',
      confidenceScore: 95,
      confidenceLevel: determineConfidenceLevel(95),
      severity: 'LOW',
      alternatives: [],
      explanation: 'No surface-level insects or characteristic pest damage (frass, entry holes, chewing) detected in the image.',
      heatmapAvailable: false,
      modelVersion: 'v0.9-mock',
      supportedScope: ['Aphids', 'Whitefly', 'Stem Borer']
    };
  }
}
