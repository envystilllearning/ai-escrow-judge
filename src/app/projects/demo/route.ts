export const dynamic = 'force-dynamic';
export async function GET() {
  return Response.redirect(new URL('/projects', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}
