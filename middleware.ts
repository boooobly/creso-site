import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';

function isAdminApiAuthorized(request: NextRequest) {
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (isValidAdminSession(sessionCookie)) {
    return true;
  }

  const adminToken = process.env.ADMIN_TOKEN?.trim();
  const headerToken = request.headers.get('x-admin-token')?.trim();

  return Boolean(adminToken && headerToken === adminToken);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/admin')) {
    if (!isAdminApiAuthorized(request)) {
      return NextResponse.json({ ok: false, error: 'Требуется авторизация администратора.' }, { status: 401 });
    }

    return NextResponse.next();
  }

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === '/admin/login';
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthenticated = isValidAdminSession(sessionCookie);

  if (!isAuthenticated && !isLoginPage) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
