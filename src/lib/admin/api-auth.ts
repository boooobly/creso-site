import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';

function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getForwardedOrigin(request: NextRequest): string | null {
  const forwardedHost = request.headers.get('x-forwarded-host')?.trim();
  if (!forwardedHost) return null;

  const forwardedProto = request.headers.get('x-forwarded-proto')?.trim() || 'https';
  return normalizeOrigin(`${forwardedProto}://${forwardedHost}`);
}

function getTrustedOrigins(request: NextRequest): Set<string> {
  const trusted = new Set<string>();

  const requestOrigin = normalizeOrigin(request.nextUrl.origin);
  if (requestOrigin) trusted.add(requestOrigin);

  const forwardedOrigin = getForwardedOrigin(request);
  if (forwardedOrigin) trusted.add(forwardedOrigin);

  const publicBaseOrigin = normalizeOrigin(process.env.PUBLIC_BASE_URL);
  if (publicBaseOrigin) trusted.add(publicBaseOrigin);

  return trusted;
}

function isAdminMutationRequest(request: NextRequest): boolean {
  return request.method.toUpperCase() !== 'GET';
}

export function requireTrustedAdminMutationOrigin(request: NextRequest): NextResponse | null {
  if (!isAdminMutationRequest(request)) {
    return null;
  }

  const requestOrigin = normalizeOrigin(request.headers.get('origin'));
  if (!requestOrigin) {
    return NextResponse.json({ ok: false, error: 'Недопустимый источник запроса.' }, { status: 403 });
  }

  const trustedOrigins = getTrustedOrigins(request);

  if (!trustedOrigins.has(requestOrigin)) {
    return NextResponse.json({ ok: false, error: 'Недопустимый источник запроса.' }, { status: 403 });
  }

  return null;
}

export async function requireAdminApiAuth(request: NextRequest): Promise<NextResponse | null> {
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!(await verifyAdminSessionToken(sessionCookie))) {
    return NextResponse.json({ ok: false, error: 'Требуется авторизация администратора.' }, { status: 401 });
  }

  return requireTrustedAdminMutationOrigin(request);
}
