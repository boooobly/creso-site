'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  clearAdminSession,
  createAdminSession,
  getAdminPassword
} from '@/lib/admin-auth';
import {
  isAdminLoginLocked,
  registerAdminLoginFailure,
  resetAdminLoginFailures,
} from '@/lib/admin/login-rate-limit';
import { logger } from '@/lib/logger';
import { getClientIpFromHeaders } from '@/lib/utils/request';

export type LoginFormState = {
  error?: string;
};

const GENERIC_LOGIN_ERROR = 'Не удалось выполнить вход. Проверьте данные и попробуйте позже.';

export async function loginAdmin(
  _: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const requestHeaders = await headers();
  const ip = getClientIpFromHeaders(requestHeaders);
  const password = formData.get('password');
  const nextPath = formData.get('next');

  if (isAdminLoginLocked(ip)) {
    logger.warn('admin.login.locked', { ip });
    return { error: GENERIC_LOGIN_ERROR };
  }

  if (typeof password !== 'string' || password.length === 0 || password !== getAdminPassword()) {
    const failureState = registerAdminLoginFailure(ip);
    if (failureState.locked) {
      logger.warn('admin.login.locked_after_failures', { ip, failuresInWindow: failureState.failuresInWindow });
    } else {
      logger.warn('admin.login.failed', { ip, failuresInWindow: failureState.failuresInWindow });
    }

    return { error: GENERIC_LOGIN_ERROR };
  }

  resetAdminLoginFailures(ip);
  await createAdminSession();

  if (typeof nextPath === 'string' && nextPath.startsWith('/admin')) {
    redirect(nextPath);
  }

  redirect('/admin');
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect('/admin/login');
}
