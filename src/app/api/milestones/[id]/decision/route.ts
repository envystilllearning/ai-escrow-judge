import { NextResponse, NextRequest } from 'next/server';
import { loadProject, createDecision, getDecisions } from '@/app/actions/store';
import type { DecisionType } from '@/types';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: milestoneId } = await context.params;
  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId');
  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required.' }, { status: 400 });
  }

  const project = await loadProject(projectId);
  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  }

  const decisions = await getDecisions(projectId, milestoneId);
  return NextResponse.json({ projectId, milestoneId, decisions });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: milestoneId } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    decision?: string;
    comment?: string;
    decidedBy?: string;
    verificationId?: string;
    criteriaVersion?: string;
  };

  const { projectId, decision, comment, decidedBy, verificationId, criteriaVersion } = body;
  if (!projectId || typeof projectId !== 'string') {
    return NextResponse.json({ error: 'projectId is required.' }, { status: 400 });
  }
  if (!decision || !['APPROVE', 'REQUEST_REVISION', 'REJECT'].includes(decision)) {
    return NextResponse.json({ error: 'Invalid decision. Use APPROVE, REQUEST_REVISION, or REJECT.' }, { status: 400 });
  }
  if (!verificationId || typeof verificationId !== 'string') {
    return NextResponse.json({ error: 'verificationId is required.' }, { status: 400 });
  }
  if (!criteriaVersion || typeof criteriaVersion !== 'string') {
    return NextResponse.json({ error: 'criteriaVersion is required.' }, { status: 400 });
  }

  try {
    const decisionRecord = await createDecision(projectId, milestoneId, {
      decision: decision as DecisionType,
      comment: typeof comment === 'string' ? comment : undefined,
      decidedBy: typeof decidedBy === 'string' ? decidedBy : 'Demo Client',
      verificationId,
      criteriaVersion,
    });

    const project = await loadProject(projectId);
    const milestone = project?.milestones.find((m) => m.id === milestoneId);
    const overallStatus = milestone?.verification?.summary?.overallStatus ?? null;

    return NextResponse.json({
      decision: decisionRecord,
      milestoneId,
      projectId,
      aiRecommendation: overallStatus,
      humanDecision: decision,
      milestoneStatus: milestone?.status ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to record decision.';
    const status = message.includes('verified') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
