import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';

export function requireAdminApiAuth(request: NextRequest): NextResponse | null {
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (isValidAdminSession(sessionCookie)) {
    return null;
  }

  const adminToken = process.env.ADMIN_TOKEN?.trim();
  const headerToken = request.headers.get('x-admin-token')?.trim();

  if (adminToken && headerToken === adminToken) {
    return null;
  }

  return NextResponse.json({ ok: false, error: 'Требуется авторизация администратора.' }, { status: 401 });
}
