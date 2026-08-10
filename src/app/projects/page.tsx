import { SiteShell } from '@/app/components/site-shell';
import type { Project } from '@/types';
import Link from 'next/link';
import { getProjects } from '@/app/actions/store';

export default async function ProjectsPage() {
  let projects: Project[] = [];
  try {
    projects = await getProjects();
  } catch {
    return (
      <SiteShell>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-4 text-sm text-neutral-700">Unable to load projects right now. Please try again later.</p>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="mt-2 text-neutral-600">Select a project or create a new one.</p>
          </div>
          <Link className="inline-flex items-center justify-center h-10 px-4 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors" href="/projects/new">
            Create Project
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block rounded border border-neutral-200 p-5 hover:border-neutral-400 transition-colors">
              <div className="text-sm font-medium text-neutral-500">Project</div>
              <div className="mt-1 text-lg font-semibold">{project.title}</div>
              <div className="mt-2 text-xs text-neutral-500">Status: {project.status}</div>
            </Link>
          ))}
          {!projects.length ? (
            <div className="col-span-full text-neutral-600">No projects yet.</div>
          ) : null}
        </div>
      </div>
    </SiteShell>
  );
}
