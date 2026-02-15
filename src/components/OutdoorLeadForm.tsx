'use client';

import { FormEvent, useState } from 'react';

type FormState = {
  address: string;
  dimensions: string;
  budget: string;
  phone: string;
  agreed: boolean;
};

const initialState: FormState = {
  address: '',
  dimensions: '',
  budget: '',
  phone: '',
  agreed: false,
};

export default function OutdoorLeadForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    const response = await fetch('/api/outdoor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

    if (!response.ok || !data?.ok) {
      setStatus('error');
      setError(data?.error || 'Не удалось отправить заявку. Попробуйте позже.');
      return;
    }

    setStatus('success');
    setForm(initialState);
  };

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6" id="outdoor-lead-form">
      <label className="block space-y-2">
        <span className="text-sm font-medium">Адрес объекта *</span>
        <input
          required
          type="text"
          value={form.address}
          onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand-red)] dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="Например, г. Ставрополь, ул. Ленина, 15"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Размеры *</span>
        <input
          required
          type="text"
          value={form.dimensions}
          onChange={(e) => setForm((prev) => ({ ...prev, dimensions: e.target.value }))}
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand-red)] dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="Например, 3000 × 1200 мм"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Бюджет</span>
        <input
          type="text"
          value={form.budget}
          onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand-red)] dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="Если есть ориентир по бюджету"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Телефон *</span>
        <input
          required
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand-red)] dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="+7 (___) ___-__-__"
        />
      </label>

      <label className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300">
        <input
          required
          type="checkbox"
          checked={form.agreed}
          onChange={(e) => setForm((prev) => ({ ...prev, agreed: e.target.checked }))}
          className="mt-1 size-4 rounded border-neutral-300 text-[var(--brand-red)] focus:ring-[var(--brand-red)] dark:border-neutral-700"
        />
        <span>Согласен с политикой обработки персональных данных</span>
      </label>

      <button type="submit" className="btn-primary w-full" disabled={status === 'loading'}>
        {status === 'loading' ? 'Отправка...' : 'Отправить заявку'}
      </button>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">Менеджер свяжется с вами для уточнения деталей.</p>
      {status === 'success' ? <p className="text-sm text-green-600">Заявка отправлена. Спасибо!</p> : null}
      {status === 'error' ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
