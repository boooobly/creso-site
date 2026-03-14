import { cookies } from 'next/headers';

export const ADMIN_SESSION_COOKIE = 'admin_session';

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

function getEnvValue(key: 'ADMIN_PASSWORD' | 'ADMIN_SESSION_SECRET', fallback: string) {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : fallback;
}

export function getAdminPassword() {
  return getEnvValue('ADMIN_PASSWORD', 'change-me-admin-password');
}

export function getAdminSessionSecret() {
  return getEnvValue('ADMIN_SESSION_SECRET', 'change-me-admin-secret');
}

export async function isAdminAuthenticated() {
  const cookieStore = cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === getAdminSessionSecret();
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
