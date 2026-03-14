import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

export function requireAdminApiAuth(request: NextRequest): NextResponse | null {
  const env = getServerEnv();
  const headerToken = request.headers.get('x-admin-token');

  if (headerToken !== env.ADMIN_TOKEN) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  return null;
}
