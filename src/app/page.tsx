'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight">AI Escrow Judge</div>
          <nav className="flex items-center gap-6 text-sm">
            <Link className="text-neutral-600 hover:text-neutral-900" href="/projects/demo">
              Projects
            </Link>
            <Link
              className="inline-flex items-center justify-center h-10 px-4 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
              href="/projects/new"
            >
              Create Project
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">
              Turn project agreements into verifiable milestones.
            </h1>
            <p className="mt-4 text-lg text-neutral-600 leading-relaxed">
              AI Escrow Judge adds an evidence-based verification layer to project handoffs. Structured acceptance criteria, evidence evaluation, and a machine recommendation before any payment decision.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                className="inline-flex items-center justify-center h-11 px-5 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                href="/projects/demo"
              >
                Try Demo
              </Link>
              <Link
                className="inline-flex items-center justify-center h-11 px-5 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
                href="/projects/new"
              >
                Create Project
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between text-xs text-neutral-500">
          <div>Demo environment. No wallet or payment is required.</div>
          <div className="uppercase tracking-wide">AI Escrow Judge</div>
        </div>
      </footer>
    </div>
  );
}
