'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge, SectionLabel, criterionTitle } from '@/app/components/status';

interface CriterionRow {
  id: string;
  code: string;
  description: string;
  verificationType: string;
  requiredEvidence: string[];
  ambiguityFlag: boolean;
  humanReviewRequired: boolean;
  status: string;
}

interface EvidenceRow {
  id: string;
  type: string;
  description?: string;
  content: string;
  submittedBy?: string;
  criterionIds: string[];
  status: string;
}

interface VerificationResultRow {
  criterionId: string;
  status: string;
  confidence: number;
  evidenceIds: string[];
  reason: string;
  missingEvidence: string[];
  humanReviewRequired: boolean;
  createdAt: string;
}

interface VerificationSummaryRow {
  overallStatus: string;
  verifiedCount: number;
  partialCount: number;
  failedCount: number;
  unverifiedCount: number;
  reviewRequiredCount: number;
  summary: string;
  humanReviewFlags: string[];
  verifiedAt?: string;
}

interface MilestoneVerificationRow {
  id: string;
  milestoneId: string;
  criteriaVersionHash: string;
  status: string;
  results: VerificationResultRow[];
  summary: VerificationSummaryRow;
  createdAt: string;
  updatedAt: string;
}

interface MilestoneRow {
  id: string;
  title: string;
  status: string;
}

interface DecisionRecord {
  id: string;
  milestoneId: string;
  decision: string;
  comment?: string;
  decidedBy: string;
  createdAt: string;
  verificationId: string;
  criteriaVersion: string;
}

type PendingDecision = {
  type: 'APPROVE' | 'REQUEST_REVISION' | 'REJECT';
  comment: string;
};

interface Props {
  projectId: string;
  milestone: MilestoneRow;
  criteria: CriterionRow[];
  evidence: EvidenceRow[];
  verification: MilestoneVerificationRow | null;
  initialDecisions: DecisionRecord[];
}

const DECISION_LABEL: Record<string, string> = {
  APPROVE: 'Approve',
  REQUEST_REVISION: 'Request revision',
  REJECT: 'Reject',
};

export function ProjectVerificationClient({ projectId, milestone, criteria, evidence, verification, initialDecisions }: Props) {
  const [decisions, setDecisions] = useState<DecisionRecord[]>(initialDecisions);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decisionComment, setDecisionComment] = useState('');
  const [currentVerification, setCurrentVerification] = useState<MilestoneVerificationRow | null>(verification);
  const [currentMilestone, setCurrentMilestone] = useState<MilestoneRow>(milestone);
  const [lastDecision, setLastDecision] = useState<DecisionRecord | null>(initialDecisions[0] ?? null);

  const status = currentMilestone.status;

  const evidenceCodeFor = (evidenceId: string) => {
    const index = evidence.findIndex((e) => e.id === evidenceId);
    return index >= 0 ? `E-${String(index + 1).padStart(3, '0')}` : evidenceId.slice(0, 8);
  };

  const runVerification = async () => {
    if (!projectId || !currentMilestone?.id) return;
    setRunning(true);
    setError(null);
    try {
      const verifyUrl = '/api/milestones/' + encodeURIComponent(currentMilestone.id) + '/verify';
      const res = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Verification failed.');
      }
      const next: MilestoneVerificationRow = {
        id: typeof json.verificationId === 'string' ? json.verificationId : `verification-${json.milestoneId}`,
        milestoneId: json.milestoneId,
        criteriaVersionHash: json.criteriaVersionHash,
        status: 'VERIFIED',
        results: json.results,
        summary: json.summary,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentVerification(next);
      setCurrentMilestone((prev) => ({ ...prev, status: json.milestoneStatus }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setRunning(false);
    }
  };

  const openConfirm = (type: PendingDecision['type']) => {
    if (!verification && !currentVerification) return;
    setDecisionComment('');
    setPendingDecision({ type, comment: '' });
    setConfirming(true);
  };

  const submitDecision = async () => {
    const targetVerification = currentVerification;
    if (!targetVerification || !pendingDecision) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/milestones/' + encodeURIComponent(currentMilestone.id) + '/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          milestoneId: currentMilestone.id,
          decision: pendingDecision.type,
          comment: decisionComment || undefined,
          decidedBy: 'Client',
          verificationId: targetVerification.id,
          criteriaVersion: targetVerification.criteriaVersionHash,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Decision failed.');
      }
      const record: DecisionRecord = json.decision;
      setDecisions((prev) => [record, ...prev]);
      setLastDecision(record);
      setCurrentMilestone((prev) => ({ ...prev, status: record.decision === 'APPROVE' ? 'APPROVED' : record.decision === 'REQUEST_REVISION' ? 'REVISION_REQUESTED' : 'REJECTED' }));
      setConfirming(false);
      setPendingDecision(null);
      setDecisionComment('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const overall = currentVerification?.summary;
  const criteriaTotal = criteria.length;
  const verifiedCount = overall?.verifiedCount ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight">
            <Link className="hover:text-neutral-600" href="/">AI Escrow Judge</Link>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link className="text-neutral-600 hover:text-neutral-900" href="/projects">Projects</Link>
            <Link className="inline-flex items-center justify-center h-9 px-4 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors" href={`/projects/${projectId}/evidence`}>Evidence</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <SectionLabel>Milestone verification</SectionLabel>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">{currentMilestone.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
                <StatusBadge status={status} />
              </div>
            </div>
            <Link className="inline-flex h-10 items-center justify-center px-4 border border-neutral-300 text-neutral-700 hover:border-neutral-900 transition-colors text-sm" href={`/projects/${projectId}`}>
              ← Project overview
            </Link>
          </div>

          {error ? <div className="mt-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div> : null}

          {!currentVerification ? (
            <section className="mt-10 rounded border border-dashed border-neutral-300 p-10 text-center">
              <SectionLabel>Verification not run yet</SectionLabel>
              <div className="mt-2 text-sm text-neutral-600">
                Verification requires at least one submitted evidence item.
              </div>
              <button
                onClick={runVerification}
                disabled={running}
                className="mt-6 inline-flex h-11 items-center justify-center px-5 bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-60"
              >
                {running ? 'Running verification...' : 'Run verification'}
              </button>
            </section>
          ) : (
            <>
              {/* OVERALL RESULT */}
              <section className="mt-10 rounded border border-neutral-200 p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <SectionLabel>Overall result</SectionLabel>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="text-5xl font-semibold tracking-tight">{overall?.overallStatus ?? '—'}</div>
                      <div className="text-sm text-neutral-600">
                        <div className="font-medium text-neutral-900">{verifiedCount} of {criteriaTotal} criteria verified</div>
                        <div className="mt-1 max-w-md">{overall?.summary ?? ''}</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <div className="rounded border border-neutral-200 p-3 text-center">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Pass</div>
                      <div className="mt-1 text-xl font-semibold">{overall?.verifiedCount ?? 0}</div>
                    </div>
                    <div className="rounded border border-neutral-200 p-3 text-center">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Partial</div>
                      <div className="mt-1 text-xl font-semibold">{overall?.partialCount ?? 0}</div>
                    </div>
                    <div className="rounded border border-neutral-200 p-3 text-center">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Failed</div>
                      <div className="mt-1 text-xl font-semibold">{overall?.failedCount ?? 0}</div>
                    </div>
                    <div className="rounded border border-neutral-200 p-3 text-center">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Unverified</div>
                      <div className="mt-1 text-xl font-semibold">{overall?.unverifiedCount ?? 0}</div>
                    </div>
                    <div className="rounded border border-neutral-200 p-3 text-center">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Review</div>
                      <div className="mt-1 text-xl font-semibold">{overall?.reviewRequiredCount ?? 0}</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* PER-CRITERION RESULTS */}
              <section className="mt-10">
                <SectionLabel>Criterion assessment</SectionLabel>
                <div className="mt-4 space-y-4">
                  {currentVerification.results.map((result, index) => {
                    const criterion = criteria.find((c) => c.id === result.criterionId);
                    const code = criterion?.code ?? result.criterionId.slice(0, 8);
                    const title = criterionTitle(code);
                    const evidenceRefs = result.evidenceIds.map(evidenceCodeFor).join(', ');
                    return (
                      <div key={result.criterionId} className="rounded border border-neutral-200 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs text-neutral-400">{String(index + 1).padStart(2, '0')}</span>
                              <span className="text-sm font-semibold text-neutral-900">{title}</span>
                            </div>
                            <div className="mt-1 pl-7 text-sm text-neutral-600">{criterion?.description ?? ''}</div>
                          </div>
                          <StatusBadge status={result.status} />
                        </div>
                        <div className="mt-4 space-y-2 pl-7 text-sm">
                          <div className="flex flex-wrap gap-2">
                            {result.evidenceIds.length ? (
                              <span className="inline-flex items-center gap-1 rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700">
                                Evidence: <span className="font-mono font-semibold">{evidenceRefs}</span>
                              </span>
                            ) : null}
                            <span className="inline-flex items-center rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-500">
                              Confidence: {Math.round((result.confidence ?? 0) * 100)}%
                            </span>
                          </div>
                          <p className="text-neutral-700">{result.reason}</p>
                          {result.missingEvidence?.length ? (
                            <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                              <span className="font-semibold">Missing evidence:</span> {result.missingEvidence.join(', ')}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* AI RECOMMENDATION + HUMAN DECISION */}
              <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded border border-neutral-200 p-6">
                  <SectionLabel>AI recommendation</SectionLabel>
                  <div className="mt-3 flex items-center gap-4">
                    <StatusBadge status={overall?.overallStatus ?? '—'} />
                    <div className="text-sm text-neutral-600">
                      {verifiedCount} of {criteriaTotal} criteria verified.
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                    This is a machine assessment of submitted evidence. It does not approve, release, or finalize anything.
                  </p>
                </div>

                <div className="rounded border border-neutral-900 p-6">
                  <SectionLabel>Human decision</SectionLabel>
                  {lastDecision ? (
                    <div className="mt-3">
                      <StatusBadge status={lastDecision.decision} />
                      <div className="mt-3 rounded border border-neutral-200 bg-neutral-50 p-4 text-sm">
                        <div className="font-semibold text-neutral-900">Decision recorded</div>
                        <div className="mt-1 text-neutral-700">{DECISION_LABEL[lastDecision.decision] ?? lastDecision.decision}</div>
                        {lastDecision.comment ? <div className="mt-1 text-neutral-600">Reason: {lastDecision.comment}</div> : null}
                        <div className="mt-2 text-xs text-neutral-500">
                          Decision maker: {lastDecision.decidedBy || 'Client'} · {new Date(lastDecision.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-sm">
                      <StatusBadge status="pending" />
                      <p className="mt-3 text-neutral-600">The client reviews the recommendation and records the final decision.</p>
                    </div>
                  )}

                  {!confirming ? (
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button onClick={() => openConfirm('APPROVE')} className="inline-flex h-11 items-center justify-center px-5 bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors">
                        Approve
                      </button>
                      <button onClick={() => openConfirm('REQUEST_REVISION')} className="inline-flex h-11 items-center justify-center px-5 border border-amber-400 text-amber-800 text-sm font-semibold hover:bg-amber-50 transition-colors">
                        Request revision
                      </button>
                      <button onClick={() => openConfirm('REJECT')} className="inline-flex h-11 items-center justify-center px-5 border border-red-300 text-red-800 text-sm font-semibold hover:bg-red-50 transition-colors">
                        Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              </section>

              {confirming ? (
                <section className="mt-6 rounded border border-neutral-200 p-5">
                  <div className="text-sm font-semibold text-neutral-900">
                    Record {DECISION_LABEL[pendingDecision?.type ?? 'APPROVE']}
                  </div>
                  <textarea
                    value={decisionComment}
                    onChange={(e) => setDecisionComment(e.target.value)}
                    placeholder="Optional reason"
                    className="mt-3 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"
                    rows={3}
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button onClick={submitDecision} disabled={submitting} className="inline-flex h-10 items-center justify-center px-5 bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-60">
                      {submitting ? 'Recording...' : 'Confirm decision'}
                    </button>
                    <button onClick={() => setConfirming(false)} className="inline-flex h-10 items-center justify-center px-5 border border-neutral-300 text-neutral-700 hover:border-neutral-900 transition-colors text-sm">
                      Cancel
                    </button>
                  </div>
                </section>
              ) : null}

              {/* DECISION HISTORY */}
              <section className="mt-10">
                <SectionLabel>Decision history</SectionLabel>
                <div className="mt-4 space-y-3">
                  {decisions.length ? decisions.map((decision) => (
                    <div key={decision.id} className="rounded border border-neutral-200 p-4 text-sm">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <StatusBadge status={decision.decision} />
                          <span className="text-neutral-700">{decision.comment || DECISION_LABEL[decision.decision]}</span>
                        </div>
                        <div className="text-xs text-neutral-500">
                          {new Date(decision.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-neutral-500">
                        Decision maker: {decision.decidedBy || 'Client'}
                      </div>
                    </div>
                  )) : (
                    <div className="rounded border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
                      No decisions have been recorded yet.
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          <div className="mt-10">
            <Link className="inline-flex h-10 items-center justify-center px-4 border border-neutral-300 text-neutral-700 hover:border-neutral-900 transition-colors text-sm" href={`/projects/${projectId}/evidence`}>Back to evidence</Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between text-xs text-neutral-500">
          <div>Demo environment. No wallet or payment is required.</div>
          <div className="uppercase tracking-wide">AI Escrow Judge</div>
        </div>
      </footer>
    </div>
  );
}