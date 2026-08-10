import { SiteShell } from '@/app/components/site-shell';
import { StatusBadge, LifecycleSteps, SectionLabel } from '@/app/components/status';
import Link from 'next/link';
import { getProject, DEMO_PROJECT_ID } from '@/app/actions/store';

export default async function ProjectOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h1 className="text-3xl font-semibold tracking-tight">Project not found</h1>
          <Link
            className="mt-6 inline-flex h-11 items-center justify-center px-5 border border-indigo-600 text-indigo-700 hover:bg-indigo-50 transition-colors"
            href="/projects"
          >
            Back to projects
          </Link>
        </div>
      </SiteShell>
    );
  }

  const agreement = project.agreement;
  const milestone = project.milestones?.[0];
  const decisions = project.decisions?.length ?? 0;
  const hasVerification = Boolean(milestone?.verification);
  const evidenceCount = milestone?.evidence?.length ?? 0;
  const criteriaCount = milestone?.criteria?.length ?? 0;
  const step = decisions > 0 ? 5 : hasVerification ? 4 : evidenceCount > 0 ? 3 : 2;

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Link href="/projects" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← Projects
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Project</div>
              {project.id === DEMO_PROJECT_ID ? (
                <span className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
                  Interactive Demo
                </span>
              ) : null}
            </div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-900">{project.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
              {typeof project.budget === 'number' ? (
                <span className="font-medium text-neutral-900">${project.budget.toLocaleString()}</span>
              ) : null}
              {milestone ? <span>{milestone.title}</span> : null}
            </div>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="mt-10">
          <SectionLabel>Project lifecycle</SectionLabel>
          <div className="mt-3"><LifecycleSteps current={step} /></div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-neutral-200 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Acceptance criteria</div>
            <div className="mt-2 text-3xl font-semibold text-neutral-900">{criteriaCount}</div>
            <div className="mt-1 text-xs text-neutral-500">explicit criteria from the agreement</div>
          </div>
          <div className="rounded border border-neutral-200 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Evidence items</div>
            <div className="mt-2 text-3xl font-semibold text-neutral-900">{evidenceCount}</div>
            <div className="mt-1 text-xs text-neutral-500">submitted by the freelancer</div>
          </div>
          <div className="rounded border border-neutral-200 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Verification</div>
            <div className="mt-2">
              {hasVerification && milestone?.verification ? (
                <StatusBadge status={milestone.verification.summary.overallStatus} />
              ) : (
                <StatusBadge status={milestone?.status ?? 'UNVERIFIED'} />
              )}
            </div>
            <div className="mt-1 text-xs text-neutral-500">{hasVerification ? 'AI assessment complete' : 'Not yet run'}</div>
          </div>
          <div className="rounded border border-neutral-200 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Human decision</div>
            <div className="mt-2 text-3xl font-semibold text-neutral-900">{decisions > 0 ? decisions : '—'}</div>
            <div className="mt-1 text-xs text-neutral-500">{decisions > 0 ? 'decision recorded' : 'pending'}</div>
          </div>
        </div>

        <div className="mt-10">
          <SectionLabel>Agreement</SectionLabel>
          <div className="mt-3 rounded border border-neutral-200 p-5">
            <p className="text-neutral-800 leading-relaxed">{agreement?.statement || 'No agreement yet.'}</p>
            <div className="mt-2 text-xs text-neutral-500">
              AI-generated · Human-reviewable · Status: {agreement?.status || 'draft'}
            </div>
          </div>
        </div>

        {milestone ? (
          <div className="mt-10">
            <SectionLabel>Milestone</SectionLabel>
            <div className="mt-3 rounded border border-neutral-200 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{milestone.title}</div>
                  <div className="mt-1 text-sm text-neutral-600">{milestone.description}</div>
                </div>
                <StatusBadge status={milestone.status} />
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            className="inline-flex h-11 items-center justify-center px-5 border border-indigo-600 text-indigo-700 text-sm font-semibold hover:bg-indigo-50 transition-colors"
            href={`/projects/${project.id}/evidence`}
          >
            Review evidence
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center px-5 bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
            href={`/projects/${project.id}/verification`}
          >
            Open verification
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}