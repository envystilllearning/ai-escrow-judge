import { NextResponse } from 'next/server';
import { updateCriterion, removeCriterion, addCriterion, approveCriteria } from '@/app/actions/agreement';

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { projectId, milestoneId, criterionId, patch } = body as Record<string, any>;
  if (!projectId || !milestoneId || !criterionId || !patch) {
    return NextResponse.json({ error: 'projectId, milestoneId, criterionId, and patch are required.' }, { status: 400 });
  }
  try {
    const updated = await updateCriterion(projectId, milestoneId, criterionId, patch);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Update failed.' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({}));
  const projectId = (body.projectId as string | undefined)?.trim();
  const milestoneId = (body.milestoneId as string | undefined)?.trim();
  const criterionId = (body.criterionId as string | undefined)?.trim();
  if (!projectId || !milestoneId || !criterionId) {
    return NextResponse.json({ error: 'projectId, milestoneId, and criterionId are required.' }, { status: 400 });
  }
  try {
    await removeCriterion(projectId, milestoneId, criterionId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Delete failed.' }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { projectId, milestoneId, input } = body as Record<string, any>;
  if (!projectId || !milestoneId || !input) {
    return NextResponse.json({ error: 'projectId, milestoneId, and input are required.' }, { status: 400 });
  }
  try {
    const criterion = await addCriterion(projectId, milestoneId, input);
    return NextResponse.json(criterion, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Add failed.' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { projectId, milestoneId } = body as Record<string, any>;
  if (!projectId || !milestoneId) {
    return NextResponse.json({ error: 'projectId and milestoneId are required.' }, { status: 400 });
  }
  try {
    const result = await approveCriteria(projectId, milestoneId);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Approval failed.' }, { status: 400 });
  }
}
