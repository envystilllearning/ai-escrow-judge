import type { AnalysisResult, CriteriaGenerationInput, CriteriaGenerationResult } from '@/types/ai';
import type { Criterion, Evidence, VerificationOutcome, VerificationResult, VerificationSummary } from '@/types';

export type AIProviderMode = 'live' | 'demo';

export interface CriterionVerificationInput {
  criterion: Criterion;
  evidence: Evidence[];
}

export interface VerificationSynthesisInput {
  results: VerificationResult[];
}

export interface AIProvider {
  mode: AIProviderMode;
  analyzeAgreement(agreement: string): Promise<AnalysisResult>;
  generateAcceptanceCriteria(input: CriteriaGenerationInput): Promise<CriteriaGenerationResult>;
  verifyEvidence(input: CriterionVerificationInput): Promise<VerificationResult>;
  synthesizeVerification(input: VerificationSynthesisInput): Promise<VerificationSummary>;
}

function deterministicVerification(criterion: Criterion, evidence: Evidence[]): VerificationResult {
  const now = new Date().toISOString();
  const evidenceIds = evidence.map((e) => e.id);
  const relatedEvidence = evidence.filter((e) => e.criterionIds.includes(criterion.id));
  if (criterion.verificationType === 'subjective' || criterion.humanReviewRequired) {
    return {
      criterionId: criterion.id,
      status: 'REVIEW_REQUIRED',
      confidence: 0.55,
      evidenceIds,
      reason: 'This criterion is subjective or explicitly requires human review.',
      missingEvidence: [],
      humanReviewRequired: true,
      createdAt: now,
    };
  }
  if (criterion.ambiguityFlag) {
    return {
      criterionId: criterion.id,
      status: 'REVIEW_REQUIRED',
      confidence: 0.6,
      evidenceIds,
      reason: 'The criterion is ambiguous and requires human clarification before automated verification.',
      missingEvidence: [],
      humanReviewRequired: true,
      createdAt: now,
    };
  }
  if (!relatedEvidence.length) {
    return {
      criterionId: criterion.id,
      status: 'UNVERIFIED',
      confidence: 0,
      evidenceIds: [],
      reason: 'No evidence is associated with this criterion.',
      missingEvidence: criterion.requiredEvidence,
      humanReviewRequired: false,
      createdAt: now,
    };
  }
  const hasUrl = relatedEvidence.some((e) => e.type === 'URL' || e.type === 'REPOSITORY_URL');
  const hasImage = relatedEvidence.some((e) => e.type === 'IMAGE');
  const hasText = relatedEvidence.some((e) => e.type === 'TEXT');
  if (hasUrl || hasImage) {
    const reasonParts: string[] = [];
    const missing: string[] = [];
    if (criterion.verificationType === 'demonstration' && !hasUrl && !hasImage) {
      reasonParts.push('Demonstration evidence was not sufficiently provided.');
      missing.push(...criterion.requiredEvidence);
    }
    if (hasText && !hasUrl && !hasImage) {
      reasonParts.push('Only textual evidence was provided; it does not fully demonstrate the criterion.');
      missing.push(...criterion.requiredEvidence);
    }
    if (reasonParts.length === 0) {
      return {
        criterionId: criterion.id,
        status: 'PASS',
        confidence: 0.85,
        evidenceIds,
        reason: 'Submitted evidence appears sufficient for direct verification.',
        missingEvidence: [],
        humanReviewRequired: false,
        createdAt: now,
      };
    }
    return {
      criterionId: criterion.id,
      status: 'PARTIAL',
      confidence: 0.7,
      evidenceIds,
      reason: reasonParts.join(' '),
      missingEvidence: missing,
      humanReviewRequired: false,
      createdAt: now,
    };
  }
  if (hasText) {
    return {
      criterionId: criterion.id,
      status: 'PARTIAL',
      confidence: 0.65,
      evidenceIds,
      reason: 'Only textual evidence was submitted; it supports the claim but is not independently verifiable.',
      missingEvidence: criterion.requiredEvidence,
      humanReviewRequired: false,
      createdAt: now,
    };
  }
  return {
    criterionId: criterion.id,
    status: 'UNVERIFIED',
    confidence: 0,
    evidenceIds,
    reason: 'Associated evidence cannot be evaluated in its current form.',
    missingEvidence: criterion.requiredEvidence,
    humanReviewRequired: false,
    createdAt: now,
  };
}

export function createDemoProvider(): AIProvider {
  return {
    mode: 'demo',
    async analyzeAgreement() {
      return {
        deliverables: [
          { id: 'D-001', title: 'Hero section', description: 'Landing page must contain a hero section.', constraints: [] },
          { id: 'D-002', title: 'Pricing section', description: 'Landing page must contain a pricing section.', constraints: [] },
          { id: 'D-003', title: 'Testimonials', description: 'Landing page must contain a testimonials section.', constraints: [] },
          { id: 'D-004', title: 'Mobile responsive layout', description: 'Landing page must be responsive on mobile.', constraints: [] },
          { id: 'D-005', title: 'Production deployment', description: 'Landing page must be deployed to production.', constraints: [] },
        ],
        constraints: [],
        deadline: null,
        dependencies: [],
        ambiguities: [],
        criteria: [],
        mode: 'demo',
      };
    },
    async generateAcceptanceCriteria(_input: CriteriaGenerationInput) {
      return {
        criteria: [
          { id: 'C-001', deliverableId: 'D-001', description: 'Hero section exists.', verificationType: 'direct', requiredEvidence: ['Live URL or screenshot'], ambiguityFlag: false, humanReviewRequired: false },
          { id: 'C-002', deliverableId: 'D-002', description: 'Pricing section exists.', verificationType: 'direct', requiredEvidence: ['Live URL or screenshot'], ambiguityFlag: false, humanReviewRequired: false },
          { id: 'C-003', deliverableId: 'D-003', description: 'Testimonials section exists.', verificationType: 'direct', requiredEvidence: ['Live URL or screenshot'], ambiguityFlag: false, humanReviewRequired: false },
          { id: 'C-004', deliverableId: 'D-004', description: 'Mobile responsive behavior is demonstrated.', verificationType: 'demonstration', requiredEvidence: ['Mobile screenshot or accessible live URL'], ambiguityFlag: false, humanReviewRequired: false },
          { id: 'C-005', deliverableId: 'D-005', description: 'Production deployment is accessible.', verificationType: 'demonstration', requiredEvidence: ['Production URL'], ambiguityFlag: false, humanReviewRequired: false },
        ],
      };
    },
    async verifyEvidence(input: CriterionVerificationInput): Promise<VerificationResult> {
      const criterion = input.criterion;
      const evidence = input.evidence;
      const relatedEvidence = evidence.filter((e) => e.criterionIds.includes(criterion.id));
      if (criterion.id === 'C-004') {
        const evidenceIds = relatedEvidence.map((e) => e.id);
        const hasMobileImage = relatedEvidence.some((e) => e.type === 'IMAGE');
        const hasMobileUrl = relatedEvidence.some((e) => e.type === 'URL' || e.type === 'REPOSITORY_URL');
        if (!hasMobileImage && !hasMobileUrl) {
          return {
            criterionId: criterion.id,
            status: 'UNVERIFIED',
            confidence: 0,
            evidenceIds,
            reason: 'No mobile-specific evidence was provided.',
            missingEvidence: criterion.requiredEvidence,
            humanReviewRequired: false,
            createdAt: new Date().toISOString(),
          };
        }
        return {
          criterionId: criterion.id,
          status: 'PARTIAL',
          confidence: 0.8,
          evidenceIds,
          reason: 'Mobile evidence is present, but only partial mobile behavior is demonstrated.',
          missingEvidence: ['Accessible mobile test result or full device coverage'],
          humanReviewRequired: false,
          createdAt: new Date().toISOString(),
        };
      }
      return deterministicVerification(criterion, relatedEvidence);
    },
    async synthesizeVerification(input: VerificationSynthesisInput): Promise<VerificationSummary> {
      const results = input.results;
      const counts = {
        verifiedCount: 0,
        partialCount: 0,
        failedCount: 0,
        unverifiedCount: 0,
        reviewRequiredCount: 0,
      };
      for (const result of results) {
        if (result.status === 'PASS') counts.verifiedCount += 1;
        else if (result.status === 'PARTIAL') counts.partialCount += 1;
        else if (result.status === 'FAIL') counts.failedCount += 1;
        else if (result.status === 'UNVERIFIED') counts.unverifiedCount += 1;
        else if (result.status === 'REVIEW_REQUIRED') counts.reviewRequiredCount += 1;
      }
      const humanReviewFlags = results.filter((r) => r.humanReviewRequired).map((r) => `${r.criterionId}: ${r.reason}`);
      const allUnverified = results.length > 0 && counts.verifiedCount === 0 && counts.partialCount === 0 && counts.failedCount === 0 && counts.reviewRequiredCount === 0;
      const anyReviewRequired = counts.reviewRequiredCount > 0;
      let overallStatus: VerificationOutcome = 'UNVERIFIED';
      if (counts.failedCount > 0 && counts.verifiedCount > 0) overallStatus = 'REVIEW_REQUIRED';
      else if (counts.failedCount > 0) overallStatus = 'FAIL';
      else if (anyReviewRequired) overallStatus = 'REVIEW_REQUIRED';
      else if (counts.unverifiedCount > 0 && counts.verifiedCount === 0) overallStatus = 'UNVERIFIED';
      else if (counts.unverifiedCount > 0 || counts.partialCount > 0) overallStatus = 'PARTIAL';
      else if (counts.verifiedCount > 0) overallStatus = 'PASS';
      if (allUnverified) overallStatus = 'UNVERIFIED';
      const summaryParts: string[] = [];
      if (counts.verifiedCount > 0) summaryParts.push(`${counts.verifiedCount} criteria are sufficiently supported`);
      if (counts.partialCount > 0) summaryParts.push(`${counts.partialCount} criteria are only partially verified`);
      if (counts.failedCount > 0) summaryParts.push(`${counts.failedCount} criteria failed verification`);
      if (counts.unverifiedCount > 0) summaryParts.push(`${counts.unverifiedCount} criteria are unverified`);
      if (counts.reviewRequiredCount > 0) summaryParts.push(`${counts.reviewRequiredCount} criteria require human review`);
      const summary = summaryParts.join(', ') || 'No verification results were produced.';
      return {
        overallStatus,
        verifiedCount: counts.verifiedCount,
        partialCount: counts.partialCount,
        failedCount: counts.failedCount,
        unverifiedCount: counts.unverifiedCount,
        reviewRequiredCount: counts.reviewRequiredCount,
        summary,
        humanReviewFlags,
        verifiedAt: new Date().toISOString(),
      };
    },
  };
}

export function createLiveProvider(): AIProvider {
  throw new Error('Live provider is not configured. Set AI_API_KEY to enable live mode.');
}

export function resolveProvider(): AIProvider {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return createDemoProvider();
  return createLiveProvider();
}
