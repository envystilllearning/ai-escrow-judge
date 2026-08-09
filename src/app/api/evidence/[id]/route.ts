import { NextResponse } from 'next/server';
import { updateEvidence, removeEvidence } from '@/app/actions/store';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const projectId = (body.projectId || '').trim();
    const milestoneId = (body.milestoneId || '').trim();
    const evidenceId = (body.evidenceId || '').trim();
    const patch: any = {};

    if (body.type) patch.type = String(body.type).toUpperCase();
    if (body.content !== undefined) patch.content = String(body.content).trim();
    if (body.description !== undefined) patch.description = String(body.description).trim();
    if (body.criterionIds) patch.criterionIds = Array.isArray(body.criterionIds) ? body.criterionIds : [];

    if (!projectId || !milestoneId || !evidenceId) return NextResponse.json({ error: 'projectId, milestoneId, and evidenceId are required.' }, { status: 400 });

    const evidence = await updateEvidence(projectId, milestoneId, evidenceId, patch);
    return NextResponse.json({ evidence });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const projectId = (body.projectId || '').trim();
    const milestoneId = (body.milestoneId || '').trim();
    const evidenceId = (body.evidenceId || '').trim();

    if (!projectId || !milestoneId || !evidenceId) return NextResponse.json({ error: 'projectId, milestoneId, and evidenceId are required.' }, { status: 400 });

    await removeEvidence(projectId, milestoneId, evidenceId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
