'use server';

import { loadStore, saveStore, getProject, createProject } from '@/app/actions/store';
import { resolveProvider } from '@/lib/ai/provider';
import type { Project, Agreement, Milestone, Deliverable, Criterion, CriterionVersion, VerificationType } from '@/types';

const VAGUE_PATTERNS = [
  /\bprofessional\b/i,
  /\bmodern\b/i,
  /\bhigh quality\b/i,
  /\bfast\b/i,
  /\buser friendly\b/i,
  /\beasy to use\b/i,
  /\bnice\b/i,
  /\bpolished\b/i,
  /\bclean\b/i,
];

function isVague(text: string): boolean {
  return VAGUE_PATTERNS.some((pattern) => pattern.test(text));
}

export async function analyzeAgreement(projectId: string, rawText: string) {
  if (!rawText?.trim()) throw new Error('Agreement text is required.');
  if (rawText.trim().length < 10) throw new Error('Agreement text is too short.');
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found.');

  const provider = resolveProvider();
  const analysis = await provider.analyzeAgreement(rawText);
  const criteriaResult = await provider.generateAcceptanceCriteria({
    deliverables: analysis.deliverables,
    constraints: analysis.constraints,
    ambiguities: analysis.ambiguities,
  });

  const now = new Date().toISOString();
  const milestoneId = crypto.randomUUID();
  const deliverables: Deliverable[] = analysis.deliverables.map((d) => ({
    id: d.id,
    milestoneId,
    title: d.title,
    description: d.description,
    constraints: d.constraints,
  }));

  const criteria: Criterion[] = [];
  let seq = 1;
  for (const c of criteriaResult.criteria) {
    const description = c.description || c.id;
    const ambiguityFlag = c.ambiguityFlag || isVague(description);
    const verificationType = ambiguityFlag ? 'subjective' : c.verificationType;
    const humanReviewRequired = ambiguityFlag || c.humanReviewRequired;
    const criterionId = crypto.randomUUID();
    criteria.push({
      id: criterionId,
      milestoneId,
      deliverableId: c.deliverableId,
      code: c.id,
      description,
      verificationType,
      requiredEvidence: c.requiredEvidence,
      ambiguityFlag,
      humanReviewRequired,
      version: 1,
      status: 'draft',
      versions: [
        {
          version: 1,
          description,
          verificationType,
          requiredEvidence: c.requiredEvidence,
          ambiguityFlag,
          updatedAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    });
    seq += 1;
  }

  const milestone: Milestone = {
    id: milestoneId,
    projectId,
    title: 'Agreement criteria',
    description: 'Acceptance criteria generated from agreement analysis.',
    status: 'pending',
    order: 1,
    deliverables,
    criteria,
    evidence: [],
    createdAt: now,
    updatedAt: now,
  };

  const agreement: Agreement = {
    id: project.agreement.id,
    projectId,
    title: project.agreement.title || 'Service Agreement',
    statement: project.agreement.statement,
    rawText,
    version: project.agreement.version + 1,
    status: 'analyzed',
    createdAt: project.agreement.createdAt,
    updatedAt: now,
  };

  const store = await loadStore();
  const idx = store.projects.findIndex((p) => p.id === projectId);
  if (idx >= 0) {
    store.projects[idx] = {
      ...store.projects[idx],
      agreement,
      milestones: [...store.projects[idx].milestones, milestone],
      updatedAt: now,
    };
    await saveStore(store);
  }

  return {
    mode: provider.mode,
    deliverables,
    criteria,
    milestoneId,
    agreement,
  };
}

export async function updateCriterion(projectId: string, milestoneId: string, criterionId: string, patch: Partial<Pick<Criterion, 'description' | 'verificationType' | 'requiredEvidence'>>) {
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found.');

  const now = new Date().toISOString();
  const store = await loadStore();
  const idx = store.projects.findIndex((p) => p.id === projectId);
  if (idx < 0) throw new Error('Project not found.');

  const milestone = store.projects[idx].milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new Error('Milestone not found.');

  const criterion = milestone.criteria.find((c) => c.id === criterionId);
  if (!criterion) throw new Error('Criterion not found.');
  if (criterion.status === 'approved') throw new Error('Approved criteria cannot be edited. Create a new version instead.');

  const updated = {
    description: patch.description ?? criterion.description,
    verificationType: patch.verificationType ?? criterion.verificationType,
    requiredEvidence: patch.requiredEvidence ?? criterion.requiredEvidence,
  };

  const newVersion: CriterionVersion = {
    version: criterion.version + 1,
    description: updated.description,
    verificationType: updated.verificationType,
    requiredEvidence: updated.requiredEvidence,
    ambiguityFlag: criterion.ambiguityFlag,
    updatedAt: now,
  };

  const updatedCriterion: Criterion = {
    ...criterion,
    ...updated,
    ambiguityFlag: updated.description ? isVague(updated.description) : criterion.ambiguityFlag,
    humanReviewRequired: (updated.description ? isVague(updated.description) : criterion.ambiguityFlag) || updated.verificationType === 'subjective',
    version: newVersion.version,
    status: 'draft',
    versions: [...criterion.versions, newVersion],
    updatedAt: now,
  };

  milestone.criteria = milestone.criteria.map((c) => (c.id === criterionId ? updatedCriterion : c));
  store.projects[idx] = { ...store.projects[idx], milestones: [...store.projects[idx].milestones], updatedAt: now };
  await saveStore(store);

  return updatedCriterion;
}

export async function removeCriterion(projectId: string, milestoneId: string, criterionId: string) {
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found.');

  const store = await loadStore();
  const idx = store.projects.findIndex((p) => p.id === projectId);
  if (idx < 0) throw new Error('Project not found.');

  const milestone = store.projects[idx].milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new Error('Milestone not found.');

  milestone.criteria = milestone.criteria.filter((c) => c.id !== criterionId);
  store.projects[idx] = { ...store.projects[idx], milestones: [...store.projects[idx].milestones], updatedAt: new Date().toISOString() };
  await saveStore(store);
}

export async function addCriterion(projectId: string, milestoneId: string, input: { code?: string; description: string; verificationType?: VerificationType; requiredEvidence?: string[] }) {
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found.');

  const now = new Date().toISOString();
  const description = input.description.trim();
  if (!description) throw new Error('Criterion description is required.');
  const ambiguityFlag = isVague(description);
  const verificationType = ambiguityFlag ? 'subjective' : (input.verificationType || 'direct');
  const humanReviewRequired = ambiguityFlag || verificationType === 'subjective';

  const store = await loadStore();
  const idx = store.projects.findIndex((p) => p.id === projectId);
  if (idx < 0) throw new Error('Project not found.');

  const milestone = store.projects[idx].milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new Error('Milestone not found.');

  const criterionId = crypto.randomUUID();
  const version: CriterionVersion = {
    version: 1,
    description,
    verificationType,
    requiredEvidence: input.requiredEvidence || [],
    ambiguityFlag,
    updatedAt: now,
  };

  milestone.criteria.push({
    id: criterionId,
    milestoneId,
    deliverableId: milestone.deliverables[0]?.id || '',
    code: input.code || `C-${String(milestone.criteria.length + 1).padStart(3, '0')}`,
    description,
    verificationType,
    requiredEvidence: input.requiredEvidence || [],
    ambiguityFlag,
    humanReviewRequired,
    version: 1,
    status: 'draft',
    versions: [version],
    createdAt: now,
    updatedAt: now,
  });

  store.projects[idx] = { ...store.projects[idx], milestones: [...store.projects[idx].milestones], updatedAt: now };
  await saveStore(store);

  return milestone.criteria[milestone.criteria.length - 1];
}

export async function approveCriteria(projectId: string, milestoneId: string) {
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found.');

  const store = await loadStore();
  const idx = store.projects.findIndex((p) => p.id === projectId);
  if (idx < 0) throw new Error('Project not found.');

  const milestone = store.projects[idx].milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new Error('Milestone not found.');

  const now = new Date().toISOString();
  milestone.criteria = milestone.criteria.map((c) => {
    if (c.status === 'approved') return c;
    const version: CriterionVersion = {
      version: c.version + 1,
      description: c.description,
      verificationType: c.verificationType,
      requiredEvidence: c.requiredEvidence,
      ambiguityFlag: c.ambiguityFlag,
      updatedAt: now,
    };
    return {
      ...c,
      status: 'approved',
      version: version.version,
      versions: [...c.versions, version],
      updatedAt: now,
    };
  });

  store.projects[idx] = { ...store.projects[idx], milestones: [...store.projects[idx].milestones], updatedAt: now };
  await saveStore(store);

  return {
    milestoneId,
    approvedAt: now,
    criteriaVersion: milestone.criteria[0]?.version ?? 1,
  };
}
