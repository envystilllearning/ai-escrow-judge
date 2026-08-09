export type AgreementStatus = 'draft' | 'analyzed' | 'approved';

export interface Agreement {
  id: string;
  projectId: string;
  title: string;
  statement: string;
  rawText: string;
  version: number;
  status: AgreementStatus;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type MilestoneStatus = 'pending' | 'submitted' | 'EVIDENCE_SUBMITTED' | 'READY_FOR_VERIFICATION' | 'VERIFIED' | 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED';
export type CriterionStatus = 'draft' | 'approved' | 'archived';
export type VerificationType = 'direct' | 'demonstration' | 'subjective';
export type EvidenceType = 'TEXT' | 'URL' | 'IMAGE' | 'REPOSITORY_URL';
export type EvidenceStatus = 'DRAFT' | 'SUBMITTED';

export type VerificationOutcome = 'PASS' | 'PARTIAL' | 'FAIL' | 'UNVERIFIED' | 'REVIEW_REQUIRED';
export type MilestoneVerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'REVIEW_REQUIRED';

export interface VerificationResult {
  criterionId: string;
  status: VerificationOutcome;
  confidence: number;
  evidenceIds: string[];
  reason: string;
  missingEvidence: string[];
  humanReviewRequired: boolean;
  createdAt: string;
}

export interface VerificationSummary {
  overallStatus: VerificationOutcome;
  verifiedCount: number;
  partialCount: number;
  failedCount: number;
  unverifiedCount: number;
  reviewRequiredCount: number;
  summary: string;
  humanReviewFlags: string[];
  verifiedAt?: string;
}

export interface MilestoneVerification {
  id: string;
  milestoneId: string;
  criteriaVersionHash: string;
  status: MilestoneVerificationStatus;
  results: VerificationResult[];
  summary: VerificationSummary;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  order: number;
  deliverables: Deliverable[];
  criteria: Criterion[];
  evidence: Evidence[];
  verification?: MilestoneVerification;
  createdAt: string;
  updatedAt: string;
}

export interface Deliverable {
  id: string;
  milestoneId: string;
  title: string;
  description: string;
  constraints: string[];
}

export interface CriterionVersion {
  version: number;
  description: string;
  verificationType: VerificationType;
  requiredEvidence: string[];
  ambiguityFlag: boolean;
  updatedAt: string;
}

export interface Criterion {
  id: string;
  milestoneId: string;
  deliverableId: string;
  code: string;
  description: string;
  verificationType: VerificationType;
  requiredEvidence: string[];
  ambiguityFlag: boolean;
  humanReviewRequired: boolean;
  version: number;
  status: CriterionStatus;
  versions: CriterionVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  milestoneId: string;
  type: EvidenceType;
  content: string;
  description?: string;
  submittedBy?: string;
  criterionIds: string[];
  status: EvidenceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Verification {
  id: string;
  evidenceId: string;
  recommendation: 'pass' | 'fail' | 'review-needed';
  reasoning: string;
  confidence: number;
  verifiedAt: string;
}

export type DecisionType = 'APPROVE' | 'REQUEST_REVISION' | 'REJECT';

export interface Decision {
  id: string;
  milestoneId: string;
  decision: DecisionType;
  comment?: string;
  decidedBy: string;
  createdAt: string;
  verificationId: string;
  criteriaVersion: string;
}

export type SimulatedNetwork = 'solana-devnet';

export type SettlementStatus = 'pending' | 'simulated-release' | 'simulated-refund';

export interface SettlementSimulation {
  id: string;
  decisionId: string;
  simulatedAmount: number;
  currency: string;
  simulatedNetwork: SimulatedNetwork;
  status: SettlementStatus;
  simulatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  freelancerName?: string;
  budget?: number;
  deadline?: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
  agreement: Agreement;
  milestones: Milestone[];
  decisions: Decision[];
  settlementSimulations: SettlementSimulation[];
}
