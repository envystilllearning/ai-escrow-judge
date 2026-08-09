import { NextResponse } from 'next/server';
import { analyzeAgreement } from '@/app/actions/agreement';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const projectId = (body.projectId as string | undefined)?.trim();
  const rawText = (body.rawText as string | undefined)?.trim();
  if (!projectId) return NextResponse.json({ error: 'projectId is required.' }, { status: 400 });
  if (!rawText) return NextResponse.json({ error: 'rawText is required.' }, { status: 400 });

  try {
    const result = await analyzeAgreement(projectId, rawText);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Analysis failed.' }, { status: 400 });
  }
}
