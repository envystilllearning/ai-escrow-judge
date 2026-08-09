import Link from 'next/link';
import { ProjectVerificationClient } from '@/app/projects/[id]/verification/verification-client';

export default async function ProjectVerification({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
  const res = await fetch(`${base}/api/projects`, { next: { revalidate: 0 }, cache: 'no-store' });
  const data = await res.json();
  const project = (data.projects ?? []).find((p: any) => p.id === id) ?? null;
  const milestone = project?.milestones?.[0] ?? null;
  const criteria = milestone?.criteria ?? [];
  const evidence = milestone?.evidence ?? [];
  const verification = milestone?.verification ?? null;

  let decisions = [];
  if (milestone?.id) {
    const dRes = await fetch(`${base}/api/milestones/${encodeURIComponent(milestone.id)}/decision?projectId=${encodeURIComponent(id)}`, { next: { revalidate: 0 } });
    if (dRes.ok) {
      const dJson = await dRes.json();
      decisions = dJson.decisions ?? [];
    }
  }

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
