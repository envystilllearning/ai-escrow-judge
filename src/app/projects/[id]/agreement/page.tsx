import { SiteShell } from '@/app/components/site-shell';
import { StatusBadge, SectionLabel, criterionTitle } from '@/app/components/status';
import Link from 'next/link';
import { getProject } from '@/app/actions/store';

export default async function ProjectAgreement({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-neutral-700">Project not found.</div>
      </SiteShell>
    );
  }

  const agreement = project.agreement;
  const milestone = project.milestones?.[0];
  const criteria = milestone?.criteria ?? [];

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Link href={`/projects/${project.id}`} className="text-sm text-neutral-500 hover:text-neutral-900">
          ← Project overview
        </Link>

        <div className="mt-4 max-w-3xl">
          <SectionLabel>Agreement</SectionLabel>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Service Agreement</h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={agreement?.status ?? 'draft'} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              AI-generated · Human-reviewable
            </span>
          </div>
        </div>

        <div className="mt-8 max-w-3xl rounded border border-neutral-200 p-6">
          <p className="text-lg leading-relaxed text-neutral-800">{agreement?.statement || 'No agreement text.'}</p>
        </div>

        <div className="mt-10 max-w-3xl">
          <div className="flex items-center gap-3">
            <SectionLabel>AI-extracted requirements</SectionLabel>
            <span className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-neutral-700">
              {criteria.length} criteria identified
            </span>
          </div>
          <p className="mt-2 text-sm text-neutral-600">
            The agreement was converted into explicit, reviewable acceptance criteria. Each criterion can be edited and
            approved before verification.
          </p>

          <div className="mt-4 space-y-3">
            {criteria.length ? criteria.map((criterion, index) => (
              <div key={criterion.id} className="rounded border border-neutral-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-neutral-400">{String(index + 1).padStart(2, '0')}</span>
                      <span className="text-sm font-semibold text-neutral-900">{criterionTitle(criterion.code)}</span>
                    </div>
                    <div className="mt-1 pl-7 text-sm text-neutral-600">{criterion.description}</div>
                    <div className="mt-2 pl-7 text-xs text-neutral-500">
                      Verification: {criterion.verificationType} · Required evidence: {criterion.requiredEvidence.join(', ')}
                    </div>
                  </div>
                  <StatusBadge status={criterion.status} />
                </div>
              </div>
            )) : (
              <div className="rounded border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
                No criteria have been generated yet.
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex h-11 items-center justify-center px-5 bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
            href={`/projects/${project.id}/evidence`}
          >
            Review evidence
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center px-5 border border-indigo-600 text-indigo-700 text-sm font-semibold hover:bg-indigo-50 transition-colors"
            href={`/projects/${project.id}/verification`}
          >
            Open verification
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}