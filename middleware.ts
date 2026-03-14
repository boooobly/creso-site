import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';

async function isRequestAuthenticated(request: NextRequest) {
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(sessionCookie);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
