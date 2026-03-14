'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAdmin, type LoginFormState } from '@/app/admin/actions';

const initialState: LoginFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? 'Входим...' : 'Войти в админ-панель'}
    </button>
  );
}

type AdminLoginFormProps = {
  nextPath?: string;
};

export default function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const [state, formAction] = useFormState(loginAdmin, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={nextPath ?? ''} />

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Пароль администратора
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          placeholder="Введите пароль"
          required
        />
      </div>

      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
