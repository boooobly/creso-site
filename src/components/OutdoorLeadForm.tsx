'use client';

import { FormEvent, useMemo, useState } from 'react';
import PhoneInput, { getPhoneDigits } from '@/components/ui/PhoneInput';

type FormState = {
  address: string;
  dimensions: string;
  budget: string;
  phone: string;
  agreed: boolean;
};

type Errors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  address: '',
  dimensions: '',
  budget: '',
  phone: '',
  agreed: false,
};

const requiredFields: Array<keyof Pick<FormState, 'address' | 'dimensions' | 'phone'>> = ['address', 'dimensions', 'phone'];

function getFieldError(field: keyof FormState, value: string | boolean) {
  if (field === 'agreed') {
    return value ? '' : 'Необходимо согласие на обработку персональных данных.';
  }

  const text = String(value).trim();

  if (requiredFields.includes(field as 'address' | 'dimensions' | 'phone') && !text) {
    return 'Поле обязательно для заполнения.';
  }

  if (field === 'phone' && text) {
    const normalized = getPhoneDigits(text);
    if (normalized.length !== 11 || !normalized.startsWith('7')) {
      return 'Укажите телефон в формате +7 (999) 999-99-99.';
    }
  }

  return '';
}

export default function OutdoorLeadForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [errors, setErrors] = useState<Errors>({});

  const validateAll = (next: FormState) => {
    const nextErrors: Errors = {};
    (Object.keys(next) as Array<keyof FormState>).forEach((field) => {
      const fieldError = getFieldError(field, next[field]);
      if (fieldError) nextErrors[field] = fieldError;
    });
    return nextErrors;
  };

  const isSubmitDisabled = useMemo(() => status === 'loading', [status]);

  const onBlurField = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => {
      const nextError = getFieldError(field, form[field]);
      return { ...prev, [field]: nextError || undefined };
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors = validateAll(form);
    setErrors(nextErrors);
    setTouched({ address: true, dimensions: true, phone: true, agreed: true });

    if (Object.keys(nextErrors).length) return;

    try {
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
      setTouched({});
      setErrors({});
    } catch {
      setStatus('error');
      setError('Не удалось отправить заявку. Попробуйте позже.');
    }
  };

  const inputClass = (field: keyof FormState) =>
    [
      'w-full rounded-xl border bg-white px-4 py-3 outline-none transition',
      'dark:border-neutral-700 dark:bg-neutral-900',
      touched[field] && errors[field] ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-[var(--brand-red)]',
    ].join(' ');

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6" id="outdoor-lead-form" noValidate>
      <label className="block space-y-2">
        <span className="text-sm font-medium">Адрес объекта *</span>
        <input
          required
          type="text"
          value={form.address}
          onBlur={() => onBlurField('address')}
          onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
          className={inputClass('address')}
          placeholder="Например, г. Ставрополь, ул. Ленина, 15"
        />
        {touched.address && errors.address ? <p className="text-xs text-red-500">{errors.address}</p> : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Размеры *</span>
        <input
          required
          type="text"
          value={form.dimensions}
          onBlur={() => onBlurField('dimensions')}
          onChange={(e) => setForm((prev) => ({ ...prev, dimensions: e.target.value }))}
          className={inputClass('dimensions')}
          placeholder="Например, 3000 × 1200 мм"
        />
        {touched.dimensions && errors.dimensions ? <p className="text-xs text-red-500">{errors.dimensions}</p> : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Бюджет</span>
        <input
          type="text"
          value={form.budget}
          onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
          className={inputClass('budget')}
          placeholder="Если есть ориентир по бюджету"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Телефон *</span>
        <PhoneInput
          required
          value={form.phone}
          onBlur={() => onBlurField('phone')}
          onChange={(phone) => setForm((prev) => ({ ...prev, phone }))}
          className={inputClass('phone')}
          placeholder="+7 (___) ___-__-__"
        />
        {touched.phone && errors.phone ? <p className="text-xs text-red-500">{errors.phone}</p> : null}
      </label>

      <label className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300">
        <input
          required
          type="checkbox"
          checked={form.agreed}
          onBlur={() => onBlurField('agreed')}
          onChange={(e) => setForm((prev) => ({ ...prev, agreed: e.target.checked }))}
          className="mt-1 size-4 rounded border-neutral-300 text-[var(--brand-red)] focus:ring-[var(--brand-red)] dark:border-neutral-700"
        />
        <span>Согласен с политикой обработки персональных данных</span>
      </label>
      {touched.agreed && errors.agreed ? <p className="-mt-2 text-xs text-red-500">{errors.agreed}</p> : null}

      <button type="submit" className="btn-primary w-full ring-1 ring-red-400/80 shadow-[0_0_24px_rgba(239,68,68,0.2)]" disabled={isSubmitDisabled}>
        {status === 'loading' ? 'Отправка...' : 'Отправить заявку'}
      </button>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">Менеджер свяжется с вами для уточнения деталей.</p>
      {status === 'success' ? (
        <p className="text-sm text-green-600">Заявка отправлена. Менеджер свяжется с вами в ближайшее время.</p>
      ) : null}
      {status === 'error' ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
