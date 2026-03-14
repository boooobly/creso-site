import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';

export async function requireAdminApiAuth(request: NextRequest): Promise<NextResponse | null> {
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (await verifyAdminSessionToken(sessionCookie)) {
    return null;
  }

  return NextResponse.json({ ok: false, error: 'Требуется авторизация администратора.' }, { status: 401 });
}
