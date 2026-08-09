import { NextResponse, NextRequest } from 'next/server';
import { resolveProvider } from '@/lib/ai/provider';
import { loadProject, saveVerificationResult } from '@/app/actions/store';
import type { Criterion, Evidence, VerificationResult, VerificationSummary, MilestoneVerification } from '@/types';

function validateVerificationResult(result: unknown): result is VerificationResult {
  if (!result || typeof result !== 'object') return false;
  const obj = result as Record<string, unknown>;
  if (typeof obj.criterionId !== 'string') return false;
  const allowedStatuses = new Set(['PASS', 'PARTIAL', 'FAIL', 'UNVERIFIED', 'REVIEW_REQUIRED']);
  if (typeof obj.status !== 'string' || !allowedStatuses.has(obj.status)) return false;
  if (typeof obj.confidence !== 'number') return false;
  if (!Array.isArray(obj.evidenceIds) || obj.evidenceIds.some((id) => typeof id !== 'string')) return false;
  if (typeof obj.reason !== 'string') return false;
  if (!Array.isArray(obj.missingEvidence) || obj.missingEvidence.some((item) => typeof item !== 'string')) return false;
  if (typeof obj.humanReviewRequired !== 'boolean') return false;
  return true;
}

function hashObject(obj: unknown): string {
  return JSON.stringify(obj);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: milestoneId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const projectId = typeof body.projectId === 'string' ? body.projectId.trim() : '';
    if (!projectId || !milestoneId) {
      return NextResponse.json({ error: 'Project ID and milestone ID are required.' }, { status: 400 });
    }

    const project = await loadProject(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found.' }, { status: 404 });
    }

    if (milestone.status !== 'READY_FOR_VERIFICATION') {
      return NextResponse.json({ error: `Verification is not allowed from status: ${milestone.status}` }, { status: 409 });
    }

    if (milestone.verification) {
      return NextResponse.json({ error: 'This milestone has already been verified.' }, { status: 409 });
    }

    const approvedCriteria = milestone.criteria.filter((c) => c.status === 'approved');
    if (!approvedCriteria.length) {
      return NextResponse.json({ error: 'No approved criteria were found for this milestone.' }, { status: 422 });
    }

    const submittedEvidence = milestone.evidence.filter((e) => e.status === 'SUBMITTED');
    if (!submittedEvidence.length) {
      return NextResponse.json({ error: 'No submitted evidence was found.' }, { status: 422 });
    }

    const criteriaVersionHash = hashObject(approvedCriteria.map((c) => ({ id: c.id, version: c.version, description: c.description })));
    const provider = resolveProvider();
    const results: VerificationResult[] = [];
    const now = new Date().toISOString();

    for (const criterion of approvedCriteria) {
      const relatedEvidence = submittedEvidence.filter((e) => e.criterionIds.includes(criterion.id));
      if (!relatedEvidence.length) {
        results.push({
          criterionId: criterion.id,
          status: 'UNVERIFIED',
          confidence: 0,
          evidenceIds: [],
          reason: 'No evidence is associated with this criterion.',
          missingEvidence: criterion.requiredEvidence,
          humanReviewRequired: false,
          createdAt: now,
        });
        continue;
      }

      if (criterion.verificationType === 'subjective' || criterion.humanReviewRequired) {
        results.push({
          criterionId: criterion.id,
          status: 'REVIEW_REQUIRED',
          confidence: 0.55,
          evidenceIds: relatedEvidence.map((e) => e.id),
          reason: 'This criterion is subjective or explicitly requires human review.',
          missingEvidence: [],
          humanReviewRequired: true,
          createdAt: now,
        });
        continue;
      }

      if (criterion.ambiguityFlag) {
        results.push({
          criterionId: criterion.id,
          status: 'REVIEW_REQUIRED',
          confidence: 0.6,
          evidenceIds: relatedEvidence.map((e) => e.id),
          reason: 'The criterion is ambiguous and requires human clarification before automated verification.',
          missingEvidence: [],
          humanReviewRequired: true,
          createdAt: now,
        });
        continue;
      }

      const aiResult = await provider.verifyEvidence({ criterion, evidence: relatedEvidence });
      const validated = validateVerificationResult(aiResult) ? aiResult : {
        criterionId: criterion.id,
        status: 'UNVERIFIED' as const,
        confidence: 0,
        evidenceIds: relatedEvidence.map((e) => e.id),
        reason: 'The AI produced a malformed verification response and could not be trusted.',
        missingEvidence: criterion.requiredEvidence,
        humanReviewRequired: true,
        createdAt: now,
      };
      results.push(validated);
    }

    const rawSummary = await provider.synthesizeVerification({ results });
    const summary: VerificationSummary = {
      overallStatus: rawSummary.overallStatus,
      verifiedCount: typeof rawSummary.verifiedCount === 'number' ? rawSummary.verifiedCount : results.filter((r) => r.status === 'PASS').length,
      partialCount: typeof rawSummary.partialCount === 'number' ? rawSummary.partialCount : results.filter((r) => r.status === 'PARTIAL').length,
      failedCount: typeof rawSummary.failedCount === 'number' ? rawSummary.failedCount : results.filter((r) => r.status === 'FAIL').length,
      unverifiedCount: typeof rawSummary.unverifiedCount === 'number' ? rawSummary.unverifiedCount : results.filter((r) => r.status === 'UNVERIFIED').length,
      reviewRequiredCount: typeof rawSummary.reviewRequiredCount === 'number' ? rawSummary.reviewRequiredCount : results.filter((r) => r.status === 'REVIEW_REQUIRED').length,
      summary: typeof rawSummary.summary === 'string' ? rawSummary.summary : 'Verification completed.',
      humanReviewFlags: Array.isArray(rawSummary.humanReviewFlags) ? rawSummary.humanReviewFlags : [],
      verifiedAt: typeof rawSummary.verifiedAt === 'string' ? rawSummary.verifiedAt : now,
    };

    const verification: MilestoneVerification = {
      id: crypto.randomUUID(),
      milestoneId,
      criteriaVersionHash,
      status: 'VERIFIED',
      results,
      summary,
      createdAt: now,
      updatedAt: now,
    };

    await saveVerificationResult(projectId, milestoneId, verification);

    return NextResponse.json({
      projectId,
      milestoneId,
      milestoneStatus: 'VERIFIED',
      verificationId: verification.id,
      criteriaVersionHash,
      results,
      summary,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Verification failed.' }, { status: 500 });
  }
}
