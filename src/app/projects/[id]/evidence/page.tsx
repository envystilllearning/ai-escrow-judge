import { SiteShell } from '@/app/components/site-shell';
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
      <SiteShell>
        <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-neutral-700">Project or milestone not found.</div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <EvidenceWorkflow projectId={id} milestone={milestone} criteria={criteria} evidence={evidence} />
    </SiteShell>
  );
}