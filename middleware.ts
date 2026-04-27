import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';

async function isRequestAuthenticated(request: NextRequest) {
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(sessionCookie);
}

function getCanonicalHost(): string | null {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  if (!isProduction) return null;

  const baseUrl = process.env.PUBLIC_BASE_URL?.trim();
  if (!baseUrl) return null;

  try {
    const parsed = new URL(baseUrl);
    return parsed.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const canonicalHost = getCanonicalHost();
  const requestHost = request.nextUrl.hostname.toLowerCase();

  if (canonicalHost && requestHost !== canonicalHost && requestHost === `www.${canonicalHost}`) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.hostname = canonicalHost;
    redirectUrl.protocol = 'https:';
    return NextResponse.redirect(redirectUrl, 308);
  }

  if (pathname === '/api/admin' || pathname.startsWith('/api/admin/')) {
    if (!(await isRequestAuthenticated(request))) {
      return NextResponse.json({ ok: false, error: 'Требуется авторизация администратора.' }, { status: 401 });
    }

    return NextResponse.next();
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const isLoginPage = pathname === '/admin/login';
    const isAuthenticated = await isRequestAuthenticated(request);

    if (!isAuthenticated && !isLoginPage) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAuthenticated && isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin', '/api/admin/:path*']
};
