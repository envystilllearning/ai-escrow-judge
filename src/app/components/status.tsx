import type { ReactNode } from 'react';

const STATUS_STYLES: Record<string, string> = {
  PASS: 'border-green-300 bg-green-50 text-green-800',
  PARTIAL: 'border-amber-300 bg-amber-50 text-amber-800',
  FAIL: 'border-red-300 bg-red-50 text-red-800',
  UNVERIFIED: 'border-neutral-300 bg-neutral-50 text-neutral-600',
  REVIEW_REQUIRED: 'border-blue-300 bg-blue-50 text-blue-800',
  APPROVED: 'border-green-300 bg-green-50 text-green-800',
  VERIFIED: 'border-green-300 bg-green-50 text-green-800',
  READY_FOR_VERIFICATION: 'border-blue-300 bg-blue-50 text-blue-800',
  REVISION_REQUESTED: 'border-amber-300 bg-amber-50 text-amber-800',
  REJECTED: 'border-red-300 bg-red-50 text-red-800',
  active: 'border-green-300 bg-green-50 text-green-800',
  draft: 'border-neutral-300 bg-neutral-50 text-neutral-600',
  completed: 'border-neutral-300 bg-neutral-50 text-neutral-600',
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'border-neutral-300 bg-neutral-50 text-neutral-600';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${style}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

const STEP_LABELS = ['AGREEMENT', 'CRITERIA', 'EVIDENCE', 'VERIFICATION', 'DECISION'] as const;

export function LifecycleSteps({ current }: { current: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {STEP_LABELS.map((label, index) => {
        const step = index + 1;
        const isDone = step < current;
        const isCurrent = step === current;
        return (
          <div
            key={label}
            className={`rounded border px-3 py-2.5 text-center ${
              isCurrent
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : isDone
                  ? 'border-neutral-300 bg-neutral-50 text-neutral-700'
                  : 'border-neutral-200 bg-white text-neutral-400'
            }`}
          >
            <div className={`text-[10px] font-semibold uppercase tracking-wider ${isCurrent ? 'text-neutral-300' : isDone ? 'text-neutral-500' : 'text-neutral-400'}`}>
              {isDone ? 'Done' : isCurrent ? 'Now' : 'Next'}
            </div>
            <div className="mt-0.5 text-xs font-semibold">{label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{children}</div>;
}

export const CRITERION_TITLES: Record<string, string> = {
  'C-001': 'Hero Section',
  'C-002': 'Pricing',
  'C-003': 'Testimonials',
  'C-004': 'Mobile Responsiveness',
  'C-005': 'Production Deployment',
};

export function criterionTitle(code: string): string {
  return CRITERION_TITLES[code] ?? code;
}