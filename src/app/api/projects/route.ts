import { NextResponse } from 'next/server';
import { getProjects, createProject } from '@/app/actions/store';
import type { Project } from '@/types';

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Project> & { agreement?: string; freelancerName?: string; budget?: number; deadline?: string };
  const title = (body.title || '').trim();
  if (!title) return NextResponse.json({ error: 'Project title is required.' }, { status: 400 });

  const now = new Date().toISOString();
  const project = await createProject({
    title,
    description: title,
    freelancerName: body.freelancerName?.trim() || undefined,
    budget: body.budget ?? undefined,
    deadline: body.deadline?.trim() || undefined,
    status: 'active',
    agreement: {
      id: crypto.randomUUID(),
      projectId: '',
      title: 'Service Agreement',
      statement: body.agreement || 'Build a responsive landing page with hero, pricing, testimonials, mobile layout and production deployment.',
      rawText: body.agreement || '',
      version: 1,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    },
    milestones: [],
    decisions: [],
    settlementSimulations: [],
  });

  return NextResponse.json(project, { status: 201 });
}
