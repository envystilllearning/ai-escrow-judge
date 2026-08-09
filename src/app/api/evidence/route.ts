import { NextResponse } from 'next/server';
import { addEvidence } from '@/app/actions/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const projectId = (body.projectId || '').trim();
    const milestoneId = (body.milestoneId || '').trim();
    const type = (body.type || '').trim().toUpperCase();
    const content = (body.content || '').trim();
    const description = (body.description || '').trim();
    const submittedBy = (body.submittedBy || '').trim() || undefined;
    const criterionIds = Array.isArray(body.criterionIds) ? body.criterionIds : [];

    if (!projectId || !milestoneId) return NextResponse.json({ error: 'Project ID and milestone ID are required.' }, { status: 400 });
    if (!['TEXT', 'URL', 'IMAGE', 'REPOSITORY_URL'].includes(type)) return NextResponse.json({ error: 'Invalid evidence type.' }, { status: 400 });

    if (type === 'URL' || type === 'REPOSITORY_URL') {
      try { new URL(content); } catch { return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 }); }
    }

    if (type === 'TEXT' && !content) {
      return NextResponse.json({ error: 'Text evidence cannot be empty.' }, { status: 400 });
    }

    if (!criterionIds.length) {
      return NextResponse.json({ error: 'Evidence must be associated with at least one criterion.' }, { status: 400 });
    }

    const evidence = await addEvidence(projectId, milestoneId, { type: type as any, content, description, submittedBy, criterionIds });
    return NextResponse.json({ evidence }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
