import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Escrow Judge',
  description: 'Verify the work before you approve the milestone.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        {children}
      </body>
    </html>
  );
}
