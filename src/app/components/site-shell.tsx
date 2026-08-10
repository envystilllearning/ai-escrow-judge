'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight">
            <Link className="hover:text-neutral-600" href="/">
              AI Escrow Judge
            </Link>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                className={pathname === item.href ? 'text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
            <Link
              className="inline-flex items-center justify-center h-9 px-4 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
              href="/projects/demo"
            >
              Try Demo
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between text-xs text-neutral-500">
          <div>Demo environment. No wallet or payment is required.</div>
          <div className="uppercase tracking-wide">AI Escrow Judge</div>
        </div>
      </footer>
    </div>
  );
}