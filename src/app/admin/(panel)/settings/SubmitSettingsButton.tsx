'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitSettingsButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
    >
      {pending ? 'Сохраняем изменения…' : 'Сохранить настройки'}
    </button>
  );
}
