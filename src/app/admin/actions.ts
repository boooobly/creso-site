'use server';

import { redirect } from 'next/navigation';
import {
  clearAdminSession,
  createAdminSession,
  getAdminPassword
} from '@/lib/admin-auth';

export type LoginFormState = {
  error?: string;
};

export async function loginAdmin(
  _: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const password = formData.get('password');
  const nextPath = formData.get('next');

  if (typeof password !== 'string' || password.length === 0) {
    return { error: 'Введите пароль администратора.' };
  }

  if (password !== getAdminPassword()) {
    return { error: 'Неверный пароль. Попробуйте еще раз.' };
  }

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
