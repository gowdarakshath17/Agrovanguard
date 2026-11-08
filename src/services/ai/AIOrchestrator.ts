import type { ImageQualityModel, DiseaseModel, PestModel } from './ModelInterfaces.ts';
import { GeminiImageQualityModel, GeminiDiseaseModel, GeminiPestModel, analyzeUnifiedVision } from './GeminiModels.ts';
import type { OrchestratorResponse } from '../../types/ai.ts';
import { db, isDbAvailable } from '../../db/index.ts';
import { farmCases, casePredictions } from '../../db/schema.ts';

export class AIOrchestrator {
  private qualityModel: ImageQualityModel;
  private diseaseModel: DiseaseModel;
  private pestModel: PestModel;

  constructor() {
    this.qualityModel = new GeminiImageQualityModel();
    this.diseaseModel = new GeminiDiseaseModel();
    this.pestModel = new GeminiPestModel();
  }

  async processObservation(
    imageBase64: string, 
    fieldId: number, 
    cropType: string
  ): Promise<OrchestratorResponse> {
    // 1. Unified Single-Turn Multimodal Vision & Pathology Inference
    // Consolidates quality, disease, and pest detection into 1 fast call
    const result = await analyzeUnifiedVision(imageBase64, cropType);
    
    if (!result.imageQuality.isSuitable) {
      return result;
    }

    // 2. Case Creation in background (Digital Farm Passport Loop)
    // Runs without blocking fast response
    (async () => {
      try {
        if (await isDbAvailable()) {
          const [newCase] = await db.insert(farmCases).values({
            fieldId,
            status: result.actionRequired === 'ESCALATE' ? 'REVIEW_REQUESTED' : 'OPEN'
          }).returning();

          if (newCase && result.disease && result.pest) {
            await db.insert(casePredictions).values([
              {
                caseId: newCase.id,
                modelType: 'DISEASE',
                prediction: result.disease.primaryPrediction,
                confidence: String(result.disease.confidenceScore),
                severity: result.disease.severity,
                explanation: result.disease.explanation,
                evidenceLevel: 'AI_INFERENCE'
              },
              {
                caseId: newCase.id,
                modelType: 'PEST',
                prediction: result.pest.primaryPrediction,
                confidence: String(result.pest.confidenceScore),
                severity: result.pest.severity,
                explanation: result.pest.explanation,
                evidenceLevel: 'AI_INFERENCE'
              }
            ]);
          }
        }
      } catch (dbErr) {
        // Silently preserve inference result if DB write fails
      }
    })();

    return result;
  }
}
