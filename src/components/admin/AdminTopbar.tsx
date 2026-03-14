'use client';

import { LogOut } from 'lucide-react';
import { logoutAdmin } from '@/app/admin/actions';

type AdminTopbarProps = {
  title: string;
  subtitle?: string;
};

export default function AdminTopbar({ title, subtitle }: AdminTopbarProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>

      <form action={logoutAdmin}>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <LogOut size={16} />
          Выйти
        </button>
      </form>
    </header>
  );
}
