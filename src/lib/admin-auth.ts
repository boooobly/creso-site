import { cookies } from 'next/headers';

export const ADMIN_SESSION_COOKIE = 'admin_session';

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

function getEnvValue(key: 'ADMIN_PASSWORD' | 'ADMIN_SESSION_SECRET', fallback: string) {
  const value = process.env[key]?.trim();

  if (value && value.length > 0) {
    return value;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`[env] ${key} must be configured in production.`);
  }

  return fallback;
}

export function getAdminPassword() {
  return getEnvValue('ADMIN_PASSWORD', 'change-me-admin-password');
}

export function getAdminSessionSecret() {
  return getEnvValue('ADMIN_SESSION_SECRET', 'change-me-admin-secret');
}

export function isValidAdminSession(value: string | undefined) {
  return value === getAdminSessionSecret();
}

export async function isAdminAuthenticated() {
  const cookieStore = cookies();
  return isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function createAdminSession() {
  const cookieStore = cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, getAdminSessionSecret(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ONE_DAY_IN_SECONDS
  });
}

export async function clearAdminSession() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
