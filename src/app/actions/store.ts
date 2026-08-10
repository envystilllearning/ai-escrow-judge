
import { createHash } from 'node:crypto';
import type { Project, Evidence, MilestoneStatus, MilestoneVerification, Decision, DecisionType } from '@/types';

export type Store = {
  projects: Project[];
};

export const DEMO_PROJECT_ID = 'd3c0b470-0000-4000-8000-000000000001';

function defaultStore(): Store {
  return {
    projects: [seedDemoProject()],
  };
}

function uid(): string {
  return crypto.randomUUID();
}

function seedUuid(seed: string): string {
  const hash = createHash('sha1').update(seed).digest('hex');
  // UUID v5-style shape: 8-4-4-4-12, version nibble 5, variant 8.
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(12, 15)}-8${hash.slice(15, 18)}-${hash.slice(18, 30)}`;
}

function now(): string {
  return new Date().toISOString();
}

function makeCriterion(milestoneId: string, code: string, description: string, verificationType: 'direct' | 'demonstration', requiredEvidence: string[]): import('@/types').Criterion {
  return {
    id: uid(),
    milestoneId,
    deliverableId: '',
    code,
    description,
    versions: [{ version: 1, description, verificationType, requiredEvidence, ambiguityFlag: false, updatedAt: now() }],
    verificationType,
    requiredEvidence,
    ambiguityFlag: false,
    humanReviewRequired: false,
    version: 1,
    status: 'approved',
    createdAt: now(),
    updatedAt: now(),
  };
}

function seedDemoProject(): Project {
  const projectId = DEMO_PROJECT_ID;
  const n = now();
  const milestoneId = uid();
  const criteria = [
    makeCriterion(milestoneId, 'C-001', 'Hero section is implemented with headline, subheadline, and CTA.', 'direct', ['Live URL or screenshot']),
    makeCriterion(milestoneId, 'C-002', 'Pricing section presents plan tiers and comparison.', 'direct', ['Live URL or screenshot']),
    makeCriterion(milestoneId, 'C-003', 'Testimonials section displays customer quotes with attribution.', 'direct', ['Live URL or screenshot']),
    makeCriterion(milestoneId, 'C-004', 'Mobile responsive layout is validated at 320px width and above.', 'demonstration', ['Mobile screenshot or accessible live URL']),
    makeCriterion(milestoneId, 'C-005', 'Production deployment URL resolves and loads successfully.', 'demonstration', ['Production URL']),
  ];

  const evidenceList = [
    {
      id: uid(),
      milestoneId,
      type: 'URL' as const,
      content: 'https://northstar-labs.vercel.app',
      description: 'Production landing page',
      submittedBy: 'freelancer',
      criterionIds: [criteria[0].id, criteria[1].id, criteria[2].id, criteria[4].id],
      status: 'SUBMITTED' as const,
      createdAt: n,
      updatedAt: n,
    },
    {
      id: uid(),
      milestoneId,
      type: 'IMAGE' as const,
      content: 'Demo screenshot evidence',
      description: 'Demo screenshot evidence — deterministic mock, not a real hosted image.',
      submittedBy: 'freelancer',
      criterionIds: [criteria[3].id],
      status: 'SUBMITTED' as const,
      createdAt: n,
      updatedAt: n,
    },
    {
      id: uid(),
      milestoneId,
      type: 'REPOSITORY_URL' as const,
      content: 'https://github.com/northstar-labs/saas-landing-page',
      description: 'Frontend repository',
      submittedBy: 'freelancer',
      criterionIds: [criteria[4].id],
      status: 'SUBMITTED' as const,
      createdAt: n,
      updatedAt: n,
    },
  ];

  const verification: import('@/types').MilestoneVerification = {
    id: 'demo-verification-01',
    milestoneId,
    criteriaVersionHash: 'demo-criteria-v1',
    status: 'VERIFIED',
    results: [
      {
        criterionId: criteria[0].id,
        status: 'PASS',
        confidence: 0.85,
        evidenceIds: [evidenceList[0].id],
        reason: 'The submitted evidence demonstrates that the required hero section is present.',
        missingEvidence: [],
        humanReviewRequired: false,
        createdAt: n,
      },
      {
        criterionId: criteria[1].id,
        status: 'PASS',
        confidence: 0.85,
        evidenceIds: [evidenceList[0].id],
        reason: 'The pricing section is visible and corresponds to the agreed requirement.',
        missingEvidence: [],
        humanReviewRequired: false,
        createdAt: n,
      },
      {
        criterionId: criteria[2].id,
        status: 'PASS',
        confidence: 0.85,
        evidenceIds: [evidenceList[0].id],
        reason: 'The required testimonials section is present.',
        missingEvidence: [],
        humanReviewRequired: false,
        createdAt: n,
      },
      {
        criterionId: criteria[3].id,
        status: 'PARTIAL',
        confidence: 0.75,
        evidenceIds: [evidenceList[1].id],
        reason: 'Desktop and tablet states are demonstrated, but mobile behavior cannot be fully verified.',
        missingEvidence: ['Mobile verification evidence'],
        humanReviewRequired: false,
        createdAt: n,
      },
      {
        criterionId: criteria[4].id,
        status: 'PASS',
        confidence: 0.85,
        evidenceIds: [evidenceList[0].id, evidenceList[2].id],
        reason: 'A production deployment URL has been provided.',
        missingEvidence: [],
        humanReviewRequired: false,
        createdAt: n,
      },
    ],
    summary: {
      overallStatus: 'PARTIAL',
      verifiedCount: 4,
      partialCount: 1,
      failedCount: 0,
      unverifiedCount: 0,
      reviewRequiredCount: 0,
      summary: '4 criteria are sufficiently supported, 1 criterion is only partially verified.',
      humanReviewFlags: [],
      verifiedAt: n,
    },
    createdAt: n,
    updatedAt: n,
  };

  const milestone: import('@/types').Milestone = {
    id: milestoneId,
    projectId,
    title: 'Website Launch — Milestone 01',
    description: 'Deliver the agreed landing page implementation with structured acceptance criteria.',
    status: 'READY_FOR_VERIFICATION',
    order: 1,
    deliverables: [
      {
        id: uid(),
        milestoneId,
        title: 'Production-ready landing page',
        description: 'Responsive landing page bundle ready for review.',
        constraints: [],
      },
    ],
    criteria,
    evidence: evidenceList,
    verification,
    createdAt: n,
    updatedAt: n,
  };

  return {
    id: projectId,
    title: 'AI SaaS Landing Page',
    description: 'AI SaaS Landing Page',
    status: 'active',
    budget: 500,
    createdAt: n,
    updatedAt: n,
    agreement: {
      id: seedUuid(projectId + ':agreement'),
      projectId,
      title: 'Service Agreement',
      statement: 'Build a responsive landing page with hero, pricing, testimonials, mobile layout, and production deployment.',
      rawText: 'Build a responsive landing page with hero, pricing, testimonials, mobile layout, and production deployment.',
      version: 1,
      status: 'draft',
      createdAt: n,
      updatedAt: n,
    },
    milestones: [milestone],
    decisions: [],
    settlementSimulations: [],
  };
}

let store: Store | undefined;

export async function loadStore(): Promise<Store> {
  if (!store) {
    store = defaultStore();
  }
  return store;
}

export async function saveStore(next: Store): Promise<void> {
  store = next;
}

export async function getProjects() {
  const store = await loadStore();
  return store.projects;
}

export async function getProject(id: string) {
  const store = await loadStore();
  return store.projects.find((p) => p.id === id) ?? null;
}

export async function createProject(partial: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Project> {
  const store = await loadStore();
  const n = now();
  const project: Project = {
    ...partial,
    id: partial.id ?? crypto.randomUUID(),
    createdAt: n,
    updatedAt: n,
  };
  store.projects.push(project);
  await saveStore(store);
  return project;
}

export async function addEvidence(projectId: string, milestoneId: string, input: {
  type: 'TEXT' | 'URL' | 'IMAGE' | 'REPOSITORY_URL';
  content: string;
  description?: string;
  submittedBy?: string;
  criterionIds: string[];
}) {
  const store = await loadStore();
  const projectIdx = store.projects.findIndex((p) => p.id === projectId);
  if (projectIdx < 0) throw new Error('Project not found.');

  const milestone = store.projects[projectIdx].milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new Error('Milestone not found.');

  const n = now();
  const evidence = {
    id: crypto.randomUUID(),
    milestoneId,
    type: input.type,
    content: input.content,
    description: input.description?.trim() || undefined,
    submittedBy: input.submittedBy?.trim() || 'freelancer',
    criterionIds: input.criterionIds.filter((id) => milestone.criteria.some((c) => c.id === id)),
    status: 'DRAFT' as const,
    createdAt: n,
    updatedAt: n,
  };

  if (!evidence.criterionIds.length) {
    throw new Error('Evidence must be associated with at least one criterion.');
  }

  milestone.evidence = [...milestone.evidence, evidence];
  store.projects[projectIdx] = { ...store.projects[projectIdx], milestones: [...store.projects[projectIdx].milestones], updatedAt: n };
  await saveStore(store);
  return evidence;
}

export async function updateEvidence(projectId: string, milestoneId: string, evidenceId: string, patch: Partial<Pick<Evidence, 'type' | 'content' | 'description' | 'criterionIds'>>) {
  const store = await loadStore();
  const projectIdx = store.projects.findIndex((p) => p.id === projectId);
  if (projectIdx < 0) throw new Error('Project not found.');

  const milestone = store.projects[projectIdx].milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new Error('Milestone not found.');

  const evidence = milestone.evidence.find((e) => e.id === evidenceId);
  if (!evidence) throw new Error('Evidence not found.');

  const updated = {
    ...evidence,
    ...patch,
    criterionIds: patch.criterionIds ? patch.criterionIds.filter((id) => milestone.criteria.some((c) => c.id === id)) : evidence.criterionIds,
    updatedAt: new Date().toISOString(),
  };

  if (!updated.criterionIds.length) {
    throw new Error('Evidence must be associated with at least one criterion.');
  }

  milestone.evidence = milestone.evidence.map((e) => (e.id === evidenceId ? updated : e));
  store.projects[projectIdx] = { ...store.projects[projectIdx], milestones: [...store.projects[projectIdx].milestones], updatedAt: new Date().toISOString() };
  await saveStore(store);
  return updated;
}

export async function removeEvidence(projectId: string, milestoneId: string, evidenceId: string) {
  const store = await loadStore();
  const projectIdx = store.projects.findIndex((p) => p.id === projectId);
  if (projectIdx < 0) throw new Error('Project not found.');

  const milestone = store.projects[projectIdx].milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new Error('Milestone not found.');

  milestone.evidence = milestone.evidence.filter((e) => e.id !== evidenceId);
  store.projects[projectIdx] = { ...store.projects[projectIdx], milestones: [...store.projects[projectIdx].milestones], updatedAt: new Date().toISOString() };
  await saveStore(store);
}

export async function submitMilestoneForVerification(projectId: string, milestoneId: string) {
  const store = await loadStore();
  const projectIdx = store.projects.findIndex((p) => p.id === projectId);
  if (projectIdx < 0) throw new Error('Project not found.');

  const milestone = store.projects[projectIdx].milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new Error('Milestone not found.');

  if (!milestone.evidence.length) {
    throw new Error('Submit at least one evidence item before requesting verification.');
  }

  const invalid = milestone.evidence.find((e) => !e.criterionIds.length);
  if (invalid) {
    throw new Error('Each evidence item must be associated with at least one criterion.');
  }

  const n = now();
  milestone.status = 'READY_FOR_VERIFICATION' as MilestoneStatus;
  milestone.evidence = milestone.evidence.map((e) => (e.status === 'DRAFT' ? { ...e, status: 'SUBMITTED' as const, updatedAt: n } : e));
  store.projects[projectIdx] = { ...store.projects[projectIdx], milestones: [...store.projects[projectIdx].milestones], updatedAt: n };
  await saveStore(store);

  return {
    milestoneId,
    status: milestone.status,
    evidenceCount: milestone.evidence.length,
  };
}

export async function loadProject(projectId: string): Promise<Project | null> {
  const store = await loadStore();
  return store.projects.find((p) => p.id === projectId) ?? null;
}

export async function saveVerificationResult(projectId: string, milestoneId: string, verification: MilestoneVerification) {
  const store = await loadStore();
  const projectIdx = store.projects.findIndex((p) => p.id === projectId);
  if (projectIdx < 0) throw new Error('Project not found.');

  const milestone = store.projects[projectIdx].milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new Error('Milestone not found.');

  const n = now();
  milestone.status = 'VERIFIED' as MilestoneStatus;
  milestone.verification = {
    ...verification,
    milestoneId,
    createdAt: verification.createdAt ?? n,
    updatedAt: n,
  };
  store.projects[projectIdx] = { ...store.projects[projectIdx], milestones: [...store.projects[projectIdx].milestones], updatedAt: n };
  await saveStore(store);
  return milestone;
}

export async function getDecisions(projectId: string, milestoneId: string): Promise<Decision[]> {
  const store = await loadStore();
  const project = store.projects.find((p) => p.id === projectId);
  if (!project) return [];
  const milestone = project.milestones.find((m) => m.id === milestoneId);
  if (!milestone) return [];
  return project.decisions.filter((d) => d.milestoneId === milestoneId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createDecision(projectId: string, milestoneId: string, input: {
  decision: DecisionType;
  comment?: string;
  decidedBy?: string;
  verificationId: string;
  criteriaVersion: string;
}): Promise<Decision> {
  const store = await loadStore();
  const projectIdx = store.projects.findIndex((p) => p.id === projectId);
  if (projectIdx < 0) throw new Error('Project not found.');

  const milestone = store.projects[projectIdx].milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new Error('Milestone not found.');

  if (!milestone.verification) {
    throw new Error('Milestone must be verified before a decision can be recorded.');
  }

  const valid: DecisionType[] = ['APPROVE', 'REQUEST_REVISION', 'REJECT'];
  if (!valid.includes(input.decision)) {
    throw new Error('Invalid decision. Use APPROVE, REQUEST_REVISION, or REJECT.');
  }

  const statusMap: Record<DecisionType, MilestoneStatus> = {
    APPROVE: 'APPROVED',
    REQUEST_REVISION: 'REVISION_REQUESTED',
    REJECT: 'REJECTED',
  };

  const n = now();
  const exactDuplicate = store.projects[projectIdx].decisions.find((d) => d.milestoneId === milestoneId && d.verificationId === input.verificationId && d.criteriaVersion === input.criteriaVersion);
  if (exactDuplicate) {
    throw new Error('A decision has already been recorded for this verification. Start a new verification to record another decision.');
  }
  const decision: Decision = {
    id: crypto.randomUUID(),
    milestoneId,
    decision: input.decision,
    comment: input.comment?.trim() || undefined,
    decidedBy: input.decidedBy?.trim() || 'Demo Client',
    createdAt: n,
    verificationId: input.verificationId,
    criteriaVersion: input.criteriaVersion,
  };

  milestone.status = statusMap[input.decision];
  store.projects[projectIdx] = {
    ...store.projects[projectIdx],
    milestones: [...store.projects[projectIdx].milestones],
    decisions: [...store.projects[projectIdx].decisions, decision],
    updatedAt: n,
  };
  await saveStore(store);
  return decision;
}
