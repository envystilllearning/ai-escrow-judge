'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight">Milestone Verify</div>
          <nav className="flex items-center gap-6 text-sm">
            <Link className="text-neutral-600 hover:text-neutral-900" href="/projects">Projects</Link>
            <Link className="text-neutral-600 hover:text-neutral-900" href="/#how-it-works">How it works</Link>
            <Link
              className="inline-flex items-center justify-center h-9 px-4 bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
              href="/projects/demo"
            >
              Try Demo
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-24">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Verify the work before you approve the milestone.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-600">
            Milestone Verify turns project agreements into explicit acceptance criteria, assesses submitted evidence, and keeps the final decision with the client.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-12 items-center justify-center px-6 bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
              href="/projects/demo"
            >
              Try Interactive Demo
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center px-6 border border-indigo-600 text-indigo-700 hover:bg-indigo-50 transition-colors text-sm"
              href="/projects"
            >
              View Projects
            </Link>
          </div>

          <div id="how-it-works" className="mt-24 max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">How it works</div>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded border border-neutral-200 p-5">
                <div className="text-xs font-semibold text-neutral-500">01</div>
                <div className="mt-1 text-sm font-semibold text-neutral-900">Agreement</div>
                <div className="mt-1 text-sm text-neutral-600">Turn project agreements into explicit requirements.</div>
              </div>
              <div className="rounded border border-neutral-200 p-5">
                <div className="text-xs font-semibold text-neutral-500">02</div>
                <div className="mt-1 text-sm font-semibold text-neutral-900">Evidence</div>
                <div className="mt-1 text-sm text-neutral-600">Submit evidence against each acceptance criterion.</div>
              </div>
              <div className="rounded border border-neutral-200 p-5">
                <div className="text-xs font-semibold text-neutral-500">03</div>
                <div className="mt-1 text-sm font-semibold text-neutral-900">Verification</div>
                <div className="mt-1 text-sm text-neutral-600">AI assesses the evidence and highlights uncertainty.</div>
              </div>
              <div className="rounded border border-neutral-200 p-5">
                <div className="text-xs font-semibold text-neutral-500">04</div>
                <div className="mt-1 text-sm font-semibold text-neutral-900">Decision</div>
                <div className="mt-1 text-sm text-neutral-600">The client makes the final milestone decision.</div>
              </div>
            </div>
            <div className="mt-6 text-xs text-neutral-500">AI recommends. Humans decide.</div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between text-xs text-neutral-500">
          <div>Demo environment. No wallet or payment is required.</div>
          <div className="uppercase tracking-wide">Milestone Verify</div>
        </div>
      </footer>
    </div>
  );
}