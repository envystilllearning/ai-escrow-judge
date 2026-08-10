import { SiteShell } from '@/app/components/site-shell';
import { StatusBadge } from '@/app/components/status';
import type { Project } from '@/types';
import Link from 'next/link';
import { getProjects, DEMO_PROJECT_ID } from '@/app/actions/store';

export default async function ProjectsPage() {
  let projects: Project[] = [];
  try {
    projects = await getProjects();
  } catch {
    return (
      <SiteShell>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-2 text-neutral-600">Unable to load projects right now. Please try again later.</p>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Projects</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Projects</h1>
            <p className="mt-2 text-neutral-600">Select a project or create a new one.</p>
          </div>
          <Link
            className="inline-flex items-center justify-center h-11 px-5 border border-indigo-600 text-indigo-700 text-sm font-semibold hover:bg-indigo-50 transition-colors"
            href="/projects/new"
          >
            Create Project
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const milestone = project.milestones?.[0];
            const isDemo = project.id === DEMO_PROJECT_ID;
            return (
              <Link
                key={project.id}
                href={isDemo ? '/projects/demo' : `/projects/${project.id}`}
                className="group block rounded border border-neutral-200 p-5 hover:border-indigo-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="text-sm font-medium text-neutral-500">Project</div>
                  {isDemo ? (
                    <span className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
                      Demo
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-lg font-semibold text-neutral-900">{project.title}</div>
                {milestone ? (
                  <div className="mt-1 text-xs text-neutral-500">{milestone.title}</div>
                ) : null}
                <div className="mt-3 flex items-center justify-between">
                  {typeof project.budget === 'number' ? (
                    <div className="text-sm font-medium text-neutral-700">${project.budget.toLocaleString()}</div>
                  ) : (
                    <span />
                  )}
                  <StatusBadge status={project.status} />
                </div>
                <div className="mt-3 border-t border-neutral-100 pt-3 text-[11px] text-neutral-400 group-hover:text-neutral-600 transition-colors">
                  Open project →
                </div>
              </Link>
            );
          })}
          {!projects.length ? (
            <div className="col-span-full rounded border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
              No projects yet. Create the first one.
            </div>
          ) : null}
        </div>
      </div>
    </SiteShell>
  );
}