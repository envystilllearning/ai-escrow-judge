'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

export function ProjectVerificationClient({ projectId, milestone, criteria, evidence, verification, initialDecisions }: Props) {
  const [decisions, setDecisions] = useState<DecisionRecord[]>(initialDecisions);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decisionComment, setDecisionComment] = useState('');

  const status = milestone.status;

  const runVerification = async () => {
    console.log('[AIJ][DEBUG] runVerification called', { projectId, milestoneId: milestone?.id });
    if (!projectId || !milestone?.id) return;
    setRunning(true);
    setError(null);
    try {
      const verifyUrl = '/api/milestones/' + encodeURIComponent(milestone.id) + '/verify';
      console.log('[AIJ][DEBUG] runVerification fetch', verifyUrl);
      const res = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      console.log('[AIJ][DEBUG] runVerification response status', res.status, res.statusText);
      const json = await res.json();
      console.log('[AIJ][DEBUG] runVerification response json', json);
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
      console.log('[AIJ][DEBUG] runVerification setting state', next);
      setCurrentVerification(next);
      setCurrentMilestone((prev) => ({ ...prev, status: json.milestoneStatus }));
    } catch (e) {
      console.log('[AIJ][DEBUG] runVerification error', e);
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      console.log('[AIJ][DEBUG] runVerification finally');
      setRunning(false);
    }
  };

  const openConfirm = (type: PendingDecision['type']) => {
    if (!verification) return;
    setDecisionComment('');
    setPendingDecision({ type, comment: '' });
    setConfirming(true);
  };

  const submitDecision = async () => {
    if (!verification || !pendingDecision) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/milestones/' + encodeURIComponent(milestone.id) + '/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          milestoneId: milestone.id,
          decision: pendingDecision.type,
          comment: decisionComment || undefined,
          decidedBy: 'Demo Client',
          verificationId: verification.id,
          criteriaVersion: verification.criteriaVersionHash,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Decision failed.');
      }
      setDecisions((prev) => [json.decision, ...prev]);
      setConfirming(false);
      setPendingDecision(null);
      setDecisionComment('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const [currentVerification, setCurrentVerification] = useState<MilestoneVerificationRow | null>(verification);
  const [currentMilestone, setCurrentMilestone] = useState<MilestoneRow>(milestone);

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight">
            <Link className="hover:text-neutral-600" href="/">AI Escrow Judge</Link>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link className="text-neutral-600 hover:text-neutral-900" href="/projects">Projects</Link>
            <Link className="inline-flex h-10 items-center justify-center px-4 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors" href={`/projects/${projectId}/evidence`}>Evidence</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-neutral-500 uppercase tracking-wide">Verification</div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">{currentMilestone.title || 'Verification'}</h1>
              <div className="mt-1 text-sm text-neutral-600">Status: {currentMilestone.status}</div>
            </div>
            <div className="text-xs text-neutral-500">Project: {projectId}</div>
          </div>

          {error ? <div className="mt-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div> : null}

          <section className="mt-8">
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Criteria</h2>
            <ul className="mt-2 space-y-2">
              {criteria.map((criterion) => (
                <li key={criterion.id} className="flex items-start justify-between text-sm">
                  <div>
                    <span className="font-mono text-neutral-700">{criterion.code}</span>
                    <span className="ml-2 text-neutral-600">{criterion.description}</span>
                    {criterion.ambiguityFlag ? <span className="ml-2 text-xs text-neutral-500">Ambiguous</span> : null}
                  </div>
                  <span className="text-neutral-500">{criterion.status}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Evidence</h2>
            {evidence.length ? (
              <ul className="mt-2 space-y-2 text-sm text-neutral-700">
                {evidence.map((item) => (
                  <li key={item.id}>{item.type}: {item.description || item.content}</li>
                ))}
              </ul>
            ) : (
              <div className="mt-2 text-sm text-neutral-500">No evidence submitted yet.</div>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">AI Verification</h2>
            {!currentVerification ? (
              <div className="mt-4">
                <button
                  onClick={runVerification}
                  disabled={running}
                  className="inline-flex items-center justify-center h-10 px-4 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-50"
                >
                  {running ? 'Running verification...' : 'Run Verification'}
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="text-sm text-neutral-700">Verification ID: <span className="font-mono text-xs">{currentVerification.id}</span></div>
                <div className="text-sm text-neutral-700">Status: <span className="font-mono text-xs">{currentVerification.status}</span></div>
                <div className="text-xs text-neutral-500">Criteria version: <span className="font-mono text-xs">{currentVerification.criteriaVersionHash}</span></div>
                <div className="text-xs text-neutral-500">Verified at: <span className="font-mono text-xs">{currentVerification.summary.verifiedAt ?? currentVerification.createdAt}</span></div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <div className="rounded border border-neutral-200 p-3">
                    <div className="text-xs text-neutral-500">Verified</div>
                    <div className="mt-1 text-lg font-semibold">{currentVerification.summary.verifiedCount}</div>
                  </div>
                  <div className="rounded border border-neutral-200 p-3">
                    <div className="text-xs text-neutral-500">Partial</div>
                    <div className="mt-1 text-lg font-semibold">{currentVerification.summary.partialCount}</div>
                  </div>
                  <div className="rounded border border-neutral-200 p-3">
                    <div className="text-xs text-neutral-500">Failed</div>
                    <div className="mt-1 text-lg font-semibold">{currentVerification.summary.failedCount}</div>
                  </div>
                  <div className="rounded border border-neutral-200 p-3">
                    <div className="text-xs text-neutral-500">Unverified</div>
                    <div className="mt-1 text-lg font-semibold">{currentVerification.summary.unverifiedCount}</div>
                  </div>
                  <div className="rounded border border-neutral-200 p-3">
                    <div className="text-xs text-neutral-500">Review</div>
                    <div className="mt-1 text-lg font-semibold">{currentVerification.summary.reviewRequiredCount}</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {currentVerification.results.map((result) => (
                    <div key={result.criterionId} className="rounded border border-neutral-200 p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-neutral-700">{result.criterionId}</span>
                          <span className="ml-2 text-neutral-600">{result.reason}</span>
                        </div>
                        <span className="text-xs text-neutral-500">{result.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded border border-neutral-200 p-4 text-sm text-neutral-700">{currentVerification.summary.summary}</div>

                {!confirming ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button onClick={() => openConfirm('APPROVE')} className="inline-flex h-10 px-4 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors">Approve</button>
                    <button onClick={() => openConfirm('REQUEST_REVISION')} className="inline-flex h-10 px-4 border border-neutral-300 text-neutral-700 hover:border-neutral-900 transition-colors">Request Revision</button>
                    <button onClick={() => openConfirm('REJECT')} className="inline-flex h-10 px-4 border border-red-200 text-red-800 hover:bg-red-50 transition-colors">Reject</button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={decisionComment}
                      onChange={(e) => setDecisionComment(e.target.value)}
                      placeholder="Comment"
                      className="w-full rounded border border-neutral-200 p-3 text-sm"
                    />
                    <div className="flex gap-3">
                      <button onClick={submitDecision} disabled={submitting} className="inline-flex h-10 px-4 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-50">
                        {submitting ? 'Submitting...' : 'Submit decision'}
                      </button>
                      <button onClick={() => setConfirming(false)} className="inline-flex h-10 px-4 border border-neutral-300 text-neutral-700 hover:border-neutral-900 transition-colors">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="mt-10">
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Decision History</h2>
            {decisions.length ? (
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                {decisions.map((decision) => (
                  <li key={decision.id} className="rounded border border-neutral-200 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-xs text-neutral-500">{decision.decision}</span>
                        <span className="ml-2">{decision.comment || 'No comment'}</span>
                      </div>
                      <div className="text-xs text-neutral-500">{new Date(decision.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">By {decision.decidedBy || 'unknown'} • verification {decision.verificationId}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-2 text-sm text-neutral-500">No decisions yet.</div>
            )}
          </section>

          <div className="mt-10">
            <Link className="inline-flex h-10 items-center justify-center px-4 border border-neutral-300 text-neutral-700 hover:border-neutral-900 transition-colors" href={`/projects/${projectId}/evidence`}>Back to evidence</Link>
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
