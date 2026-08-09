import { NextResponse } from 'next/server';
import { submitMilestoneForVerification } from '@/app/actions/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const projectId = (body.projectId || '').trim();
    const milestoneId = (body.milestoneId || '').trim();

    if (!projectId || !milestoneId) return NextResponse.json({ error: 'Project ID and milestone ID are required.' }, { status: 400 });

    const result = await submitMilestoneForVerification(projectId, milestoneId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }
}
