'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge, SectionLabel, criterionTitle } from '@/app/components/status';

const EVIDENCE_TYPES = [
  { value: 'TEXT', label: 'Text', placeholder: 'Enter evidence text.' },
  { value: 'URL', label: 'URL', placeholder: 'https://example.com' },
  { value: 'REPOSITORY_URL', label: 'Repository URL', placeholder: 'https://github.com/owner/repo' },
  { value: 'IMAGE', label: 'Image', placeholder: 'Paste image URL or file reference.' },
];

const TYPE_LABELS: Record<string, string> = {
  TEXT: 'Text',
  URL: 'Production URL',
  REPOSITORY_URL: 'Repository',
  IMAGE: 'Screenshot',
};

type FormState = {
  type: string;
  description: string;
  content: string;
  criterionIds: string[];
  submittedBy: string;
};

const emptyForm: FormState = {
  type: 'TEXT',
  description: '',
  content: '',
  criterionIds: [],
  submittedBy: 'freelancer',
};

interface EvidenceRecord {
  id: string;
  type: string;
  content: string;
  description?: string;
  submittedBy?: string;
  criterionIds: string[];
  status: string;
}

interface CriterionRecord {
  id: string;
  code: string;
  description: string;
  verificationType: string;
  requiredEvidence: string[];
  ambiguityFlag: boolean;
}

interface MilestoneRecord {
  id: string;
  title: string;
  status: string;
}

interface Props {
  projectId: string;
  milestone: MilestoneRecord;
  criteria: CriterionRecord[];
  evidence: EvidenceRecord[];
}

export function EvidenceWorkflow({ projectId, milestone, criteria, evidence }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setMessage(null);
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const content = form.content.trim();
    if (!content) next.content = 'Content is required.';
    if (form.type === 'URL' || form.type === 'REPOSITORY_URL') {
      try { new URL(content); } catch { next.content = 'Enter a valid URL.'; }
    }
    if (!form.criterionIds.length) next.criterionIds = 'Select at least one criterion.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setLoading(true);
    setMessage(null);
    try {
      const payload = { projectId, milestoneId: milestone.id, ...form };
      if (editingId) {
        const res = await fetch(`/api/evidence/${encodeURIComponent(editingId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Update failed.');
        setMessage('Evidence updated.');
        setSavedFlash('Evidence updated.');
        setForm(emptyForm);
        setEditingId(null);
      } else {
        const res = await fetch('/api/evidence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Submission failed.');
        setMessage('Evidence added.');
        setSavedFlash('Evidence added.');
        setForm(emptyForm);
      }
      setErrors({});
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: EvidenceRecord) => {
    setForm({
      type: item.type,
      description: item.description || '',
      content: item.content,
      criterionIds: item.criterionIds,
      submittedBy: item.submittedBy || 'freelancer',
    });
    setEditingId(item.id);
    setErrors({});
    setMessage(null);
  };

  const removeItem = async (evidenceId: string) => {
    if (!confirm('Delete this evidence?')) return;
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/evidence/${encodeURIComponent(evidenceId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, milestoneId: milestone.id, evidenceId }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(json.error || 'Delete failed.');
      return;
    }
    setMessage('Evidence deleted.');
    if (editingId === evidenceId) reset();
  };

  const submitForVerification = async () => {
    setLoading(true);
    setMessage(null);
    const res = await fetch('/api/milestones/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, milestoneId: milestone.id }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(json.error || 'Submission failed.');
      return;
    }
    setMessage('Evidence submitted. Ready for verification.');
  };

  const isLocked = ['verified', 'approved', 'READY_FOR_VERIFICATION', 'VERIFIED', 'APPROVED'].includes(milestone.status);

  const codeFor = (criterionId: string) => criteria.find((c) => c.id === criterionId)?.code ?? criterionId.slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <SectionLabel>Evidence</SectionLabel>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{milestone.title}</h1>
          <div className="mt-2"><StatusBadge status={milestone.status} /></div>
        </div>
      </div>

      <div className="mt-8 rounded border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
        <span className="font-semibold text-neutral-900">Claims describe what was completed.</span>{' '}
        Evidence demonstrates it. Every evidence item is tied to the criteria it supports.
      </div>

      <section className="mt-10">
        <SectionLabel>Submitted evidence</SectionLabel>
        <div className="mt-4 space-y-4">
          {evidence.length ? evidence.map((item, index) => {
            const codes = item.criterionIds.map((cid) => codeFor(cid)).join(', ');
            return (
              <div key={item.id} className="rounded border border-neutral-200 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center justify-center rounded border border-neutral-300 bg-white px-2 py-0.5 font-mono text-xs font-semibold text-neutral-800">
                        E-{String(index + 1).padStart(3, '0')}
                      </span>
                      <span className="text-sm font-medium text-neutral-900">{TYPE_LABELS[item.type] ?? item.type}</span>
                      <StatusBadge status={item.status === 'DRAFT' ? 'draft' : item.status} />
                    </div>
                    <div className="mt-2 text-sm font-medium text-neutral-900">{item.description || 'No description'}</div>
                    <div className="mt-1 break-all font-mono text-xs text-neutral-500">{item.content}</div>
                    <div className="mt-3 text-xs text-neutral-600">
                      Supports: <span className="font-medium text-neutral-800">{codes || 'None'}</span>
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      Submitted by {item.submittedBy || 'freelancer'}
                    </div>
                  </div>
                  {!isLocked ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <button onClick={() => startEdit(item)} className="inline-flex h-9 items-center justify-center px-3 border border-neutral-300 text-neutral-700 hover:border-neutral-900 transition-colors text-sm">Edit</button>
                      <button onClick={() => removeItem(item.id)} className="inline-flex h-9 items-center justify-center px-3 border border-neutral-300 text-neutral-700 hover:border-red-300 hover:text-red-800 transition-colors text-sm">Delete</button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          }) : (
            <div className="rounded border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
              No supporting evidence has been submitted yet.
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <SectionLabel>{editingId ? 'Edit evidence' : 'Add evidence'}</SectionLabel>
        <div className="mt-4 rounded border border-neutral-200 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm">
              <span className="block text-xs text-neutral-500">Evidence type</span>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="mt-1 w-full h-10 rounded border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:border-neutral-900"
              >
                {EVIDENCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="block text-xs text-neutral-500">Description</span>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full h-10 rounded border border-neutral-300 px-3 text-sm focus:outline-none focus:border-neutral-900"
                placeholder="Short description of evidence"
              />
            </label>
          </div>

          <label className="mt-4 block text-sm">
            <span className="block text-xs text-neutral-500">Content</span>
            {form.type === 'TEXT' ? (
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"
                rows={4}
                placeholder={EVIDENCE_TYPES.find((x) => x.value === form.type)?.placeholder}
              />
            ) : (
              <input
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                className="mt-1 w-full h-10 rounded border border-neutral-300 px-3 text-sm focus:outline-none focus:border-neutral-900"
                placeholder={EVIDENCE_TYPES.find((x) => x.value === form.type)?.placeholder}
              />
            )}
            {errors.content ? <div className="mt-1 text-xs text-red-700">{errors.content}</div> : null}
          </label>

          <label className="mt-4 block text-sm">
            <span className="block text-xs text-neutral-500">Related criteria</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {criteria.map((c) => {
                const selected = form.criterionIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, criterionIds: selected ? f.criterionIds.filter((id) => id !== c.id) : [...f.criterionIds, c.id] }))}
                    className={`inline-flex h-9 items-center rounded border px-3 text-xs font-medium transition-colors ${selected ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 text-neutral-700 hover:border-neutral-900'}`}
                  >
                    {c.code} · {criterionTitle(c.code)}
                  </button>
                );
              })}
            </div>
            {errors.criterionIds ? <div className="mt-1 text-xs text-red-700">{errors.criterionIds}</div> : null}
          </label>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={save}
              disabled={loading || isLocked}
              className="inline-flex h-10 items-center justify-center px-4 border border-neutral-900 text-neutral-900 text-sm font-semibold hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-60"
            >
              {loading ? 'Saving...' : editingId ? 'Update evidence' : 'Add evidence'}
            </button>
            {editingId ? (
              <button onClick={reset} className="inline-flex h-10 items-center justify-center px-4 border border-neutral-300 text-neutral-700 hover:border-neutral-900 transition-colors text-sm">Cancel</button>
            ) : null}
            {savedFlash ? <span className="text-xs text-green-700">{savedFlash}</span> : null}
          </div>
        </div>
      </section>

      {message && message !== savedFlash ? <div className="mt-6 text-sm text-neutral-800">{message}</div> : null}

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <SectionLabel>Milestone action</SectionLabel>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={submitForVerification} disabled={loading || isLocked} className="inline-flex h-10 items-center justify-center px-4 border border-neutral-900 text-neutral-900 text-sm font-semibold hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit for verification'}
          </button>
          <Link className="inline-flex h-10 items-center justify-center px-4 bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors" href={`/projects/${projectId}/verification`}>
            Go to verification
          </Link>
          {isLocked ? <div className="text-xs text-neutral-500">This milestone is already submitted or verified.</div> : null}
        </div>
      </section>
    </div>
  );
}