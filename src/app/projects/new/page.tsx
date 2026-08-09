'use client';

import type { FormEvent } from 'react';
import { SiteShell } from '@/app/components/site-shell';
import { useState } from 'react';
import Link from 'next/link';

const DEFAULT_AGREEMENT = 'Build a responsive landing page with hero, pricing, testimonials, mobile layout and production deployment.';

export async function createProjectDirect(title: string) {
  const res = await fetch(`/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, agreement: DEFAULT_AGREEMENT }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export default function NewProjectPage() {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setError(null);
    try {
      const trimmed = title.trim();
      if (!trimmed) throw new Error('Project title is required.');
      const result = await createProjectDirect(trimmed);
      setCreatedId(result.id);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    }
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-6 py-16">
        {!createdId ? (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight">Create project</h1>
            <p className="mt-2 text-neutral-600">Define the project scope. Demo criteria and sample milestone are added automatically.</p>
            <form className="mt-8 space-y-6" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm font-medium" htmlFor="title">Project title</label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="AI SaaS Landing Page"
                  className="mt-2 w-full h-11 rounded border border-neutral-300 px-3 text-sm focus:outline-none focus:border-neutral-900"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={status === 'saving'}
                  className="inline-flex items-center justify-center h-11 px-5 bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-60 transition-colors"
                >
                  {status === 'saving' ? 'Creating...' : 'Create project'}
                </button>
                <Link className="inline-flex items-center justify-center h-11 px-5 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors" href="/projects">
                  Cancel
                </Link>
              </div>
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
            </form>
          </div>
        ) : (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight">Project created</h1>
            <p className="mt-2 text-neutral-600">Demo criteria and a sample milestone were added.</p>
            <div className="mt-6">
              <Link className="inline-flex items-center justify-center h-11 px-5 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors" href={`/projects/${createdId}`}>
                Open project
              </Link>
            </div>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
