'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight">
            <Link className="hover:text-neutral-600" href="/">AI Escrow Judge</Link>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link className="text-neutral-600 hover:text-neutral-900" href="/projects">Projects</Link>
            <Link className="text-neutral-600 hover:text-neutral-900" href="#how-it-works">How it works</Link>
            <Link
              className="inline-flex items-center justify-center h-9 px-4 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
              href="/projects/demo"
            >
              Try Demo
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="border-b border-neutral-200">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  AI-Assisted Milestone Verification
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                  Verify the work.
                  <br />
                  Before you approve the milestone.
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">
                  Turn project agreements into explicit acceptance criteria, evaluate submitted evidence, and make better
                  milestone decisions with AI-assisted verification.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    className="inline-flex items-center justify-center h-12 px-6 bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
                    href="/projects/demo"
                  >
                    Try Interactive Demo
                  </Link>
                  <Link
                    className="inline-flex items-center justify-center h-12 px-6 border border-neutral-900 text-neutral-900 text-sm font-semibold hover:bg-neutral-900 hover:text-white transition-colors"
                    href="#how-it-works"
                  >
                    How it works
                  </Link>
                </div>
                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                  <span>AI-Assisted</span>
                  <span>Evidence-Based</span>
                  <span>Human-in-the-Loop</span>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded border border-neutral-200 bg-neutral-50 p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Milestone Verification</div>
                    <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                      Partial
                    </span>
                  </div>
                  <div className="mt-6 flex items-end gap-2">
                    <div className="text-5xl font-semibold tracking-tight text-neutral-900">4</div>
                    <div className="pb-1 text-sm text-neutral-600">of 5 criteria verified</div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">Hero section</span>
                      <span className="text-green-700 font-medium">Pass</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">Pricing</span>
                      <span className="text-green-700 font-medium">Pass</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">Testimonials</span>
                      <span className="text-green-700 font-medium">Pass</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">Mobile responsiveness</span>
                      <span className="text-amber-700 font-medium">Partial</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">Production deployment</span>
                      <span className="text-green-700 font-medium">Pass</span>
                    </div>
                  </div>
                  <div className="mt-6 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
                    The AI evaluates evidence and flags uncertainty. The client makes the final decision.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="border-b border-neutral-200">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">How it works</div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: '01', title: 'Agreement', body: 'Define what was promised.' },
                { step: '02', title: 'Criteria', body: 'Turn the agreement into explicit acceptance criteria.' },
                { step: '03', title: 'Evidence', body: 'Submit evidence that demonstrates completion.' },
                { step: '04', title: 'Verification', body: 'AI evaluates the evidence and highlights uncertainty.' },
              ].map((item) => (
                <div key={item.step} className="rounded border border-neutral-200 p-5">
                  <div className="text-xs font-semibold text-neutral-400">{item.step}</div>
                  <div className="mt-2 text-base font-semibold text-neutral-900">{item.title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-600">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 rounded border border-neutral-900 bg-neutral-900 px-6 py-8 text-center">
              <div className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">AI recommends. Humans decide.</div>
              <p className="mt-2 text-sm text-neutral-300">
                The system is a verification assistant. It never approves, releases, or decides on its own.
              </p>
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