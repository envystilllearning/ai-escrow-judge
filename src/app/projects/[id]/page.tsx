import { SiteShell } from '@/app/components/site-shell';
import type { Project } from '@/types';
import Link from 'next/link';
import { getProject } from '@/app/actions/store';

export default async function ProjectOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Project not found</h1>
        <Link className="mt-4 inline-flex h-10 px-4 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors" href="/projects">Back to projects</Link>
      </div>
    );
  }

  const agreement = project.agreement || {};
  const latestMilestone = project.milestones?.[0];

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight">
            <Link className="hover:text-neutral-600" href="/">AI Escrow Judge</Link>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link className="text-neutral-600 hover:text-neutral-900" href="/projects">Projects</Link>
            <Link className="inline-flex items-center justify-center h-10 px-4 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors" href={`/projects/${project.id}/evidence`}>Evidence</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
              <p className="mt-1 text-neutral-600">{project.description}</p>
            </div>
            <div className="text-xs text-neutral-500">Status: {project.status}</div>
          </div>

          <section className="mt-10">
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Agreement</h2>
            <p className="mt-2 text-neutral-800 leading-relaxed">{agreement.statement || 'No agreement yet.'}</p>
            <div className="mt-2 text-xs text-neutral-500">Status: {agreement.status || 'draft'} {agreement.approvedAt ? `• Approved at ${agreement.approvedAt}` : ''}</div>
            <div className="mt-4">
              <Link className="inline-flex items-center justify-center h-10 px-4 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors" href={`/projects/${project.id}/agreement`}>
                {agreement.status === 'analyzed' || agreement.status === 'approved' ? 'Review agreement' : 'Analyze agreement'}
              </Link>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Milestones</h2>
            <div className="mt-4 space-y-4">
              {latestMilestone ? (
                <div className="rounded border border-neutral-200 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium">{latestMilestone.title}</div>
                      <div className="mt-1 text-sm text-neutral-600">{latestMilestone.description}</div>
                    </div>
                    <div className="text-xs text-neutral-500">{latestMilestone.status}</div>
                  </div>

                  <div className="mt-5">
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Criteria</div>
                    <ul className="mt-2 space-y-2">
                      {latestMilestone.criteria?.map((criterion: any) => (
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
                  </div>

                  <div className="mt-5">
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Evidence</div>
                    {latestMilestone.evidence?.length ? (
                      <ul className="mt-2 space-y-2 text-sm text-neutral-700">
                        {latestMilestone.evidence.map((item: any) => (
                          <li key={item.id}>{item.type}: {item.description || item.content}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-2 text-sm text-neutral-500">No evidence submitted yet.</div>
                    )}
                  </div>
                </div>
              ) : <div className="text-sm text-neutral-500">No milestones yet.</div>}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Settlement Simulation</h2>
            {project.settlementSimulations?.length ? (
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                {project.settlementSimulations.map((sim: any) => (
                  <li key={sim.id}>{sim.simulatedNetwork} {sim.currency} {sim.simulatedAmount} — {sim.status}</li>
                ))}
              </ul>
            ) : (
              <div className="mt-2 text-sm text-neutral-500">No settlement simulation yet.</div>
            )}
          </section>
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
