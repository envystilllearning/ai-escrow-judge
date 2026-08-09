import type { VerificationType } from './index';

export interface AnalyzedDeliverable {
  id: string;
  title: string;
  description: string;
  constraints: string[];
}

export interface AnalyzedCriterion {
  id: string;
  deliverableId: string;
  description: string;
  verificationType: VerificationType;
  requiredEvidence: string[];
  ambiguityFlag: boolean;
  humanReviewRequired: boolean;
}

export interface AnalysisResult {
  deliverables: AnalyzedDeliverable[];
  constraints: string[];
  deadline: string | null;
  dependencies: string[];
  ambiguities: string[];
  criteria: AnalyzedCriterion[];
  mode: 'live' | 'demo';
}

export interface CriteriaGenerationInput {
  deliverables: AnalyzedDeliverable[];
  constraints: string[];
  ambiguities: string[];
}

export interface CriteriaGenerationResult {
  criteria: AnalyzedCriterion[];
}
