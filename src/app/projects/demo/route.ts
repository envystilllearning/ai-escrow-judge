export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
export async function GET() {
  const target = new URL('/projects/d3c0b470-0000-4000-8000-000000000001', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
  return NextResponse.redirect(target);
}
