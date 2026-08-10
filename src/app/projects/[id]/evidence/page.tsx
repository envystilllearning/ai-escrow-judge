import { SiteShell } from '@/app/components/site-shell';
import Link from 'next/link';
import { EvidenceWorkflow } from './evidence-workflow';
import { getProject } from '@/app/actions/store';

export default async function ProjectEvidence({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  const milestone = project?.milestones?.[0] || null;
  const criteria = milestone?.criteria || [];
  const evidence = milestone?.evidence || [];

  if (!project || !milestone) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-neutral-900">
        <header className="border-b border-neutral-200">
          <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
            <div className="text-sm font-semibold tracking-tight">
              <Link className="hover:text-neutral-600" href="/">AI Escrow Judge</Link>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <Link className="text-neutral-600 hover:text-neutral-900" href="/projects">Projects</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-neutral-700">Project or milestone not found.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight">
            <Link className="hover:text-neutral-600" href="/">AI Escrow Judge</Link>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link className="text-neutral-600 hover:text-neutral-900" href="/projects">Projects</Link>
            <Link className="inline-flex items-center justify-center h-10 px-4 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors" href={`/projects/${id}`}>Project</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <EvidenceWorkflow projectId={id} milestone={milestone} criteria={criteria} evidence={evidence} />
      </main>
    </div>
  );
}
