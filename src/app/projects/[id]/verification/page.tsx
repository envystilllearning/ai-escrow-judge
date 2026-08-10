import { SiteShell } from '@/app/components/site-shell';
import { ProjectVerificationClient } from '@/app/projects/[id]/verification/verification-client';
import { getProject } from '@/app/actions/store';

export default async function ProjectVerification({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  const milestone = project?.milestones?.[0] ?? null;
  const criteria = milestone?.criteria ?? [];
  const evidence = milestone?.evidence ?? [];
  const verification = milestone?.verification ?? null;
  const decisions = milestone ? (project?.decisions?.filter((d) => d.milestoneId === milestone.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) ?? []) : [];

  if (!project || !milestone) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-neutral-700">Project or milestone not found.</div>
      </SiteShell>
    );
  }

  return (
    <ProjectVerificationClient
      projectId={id}
      milestone={milestone}
      criteria={criteria}
      evidence={evidence}
      verification={verification}
      initialDecisions={decisions}
    />
  );
}