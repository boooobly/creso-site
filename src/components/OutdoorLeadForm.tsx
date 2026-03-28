'use client';

import { FormEvent, useMemo, useState } from 'react';
import PhoneInput, { getPhoneDigits } from '@/components/ui/PhoneInput';
import { publicFormStyles } from '@/lib/public-form-styles';

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

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'outdoor',
          name: form.address.trim(),
          phone: getPhoneDigits(form.phone),
          comment: `Размеры: ${form.dimensions.trim() || '—'}\nБюджет: ${form.budget.trim() || '—'}`,
          extras: {
            address: form.address.trim(),
            dimensions: form.dimensions.trim(),
            budget: form.budget.trim() || undefined,
            agreed: form.agreed,
          },
        }),
      });

      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !data?.ok) {
        setStatus('error');
        setError(data?.error || 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.');
        return;
      }

      setStatus('success');
      setForm(initialState);
      setTouched({});
      setErrors({});
    } catch {
      setStatus('error');
      setError('Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.');
    }
  };

  const inputClass = (field: keyof FormState) =>
    [
      publicFormStyles.inputBase,
      touched[field] && errors[field] ? publicFormStyles.inputInvalid : ''
    ].join(' ');

  return (
    <form onSubmit={onSubmit} className={`${publicFormStyles.shell} space-y-4`} id="outdoor-lead-form" noValidate>
      <label className="block space-y-2">
        <span className="t-label">Адрес объекта *</span>
        <input
          required
          type="text"
          value={form.address}
          onBlur={() => onBlurField('address')}
          onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
          className={inputClass('address')}
          placeholder="Например, г. Ставрополь, ул. Ленина, 15"
        />
        {touched.address && errors.address ? <p className="t-small text-red-500">{errors.address}</p> : null}
      </label>

      <label className="block space-y-2">
        <span className="t-label">Размеры *</span>
        <input
          required
          type="text"
          value={form.dimensions}
          onBlur={() => onBlurField('dimensions')}
          onChange={(e) => setForm((prev) => ({ ...prev, dimensions: e.target.value }))}
          className={inputClass('dimensions')}
          placeholder="Например, 3000 × 1200 мм"
        />
        {touched.dimensions && errors.dimensions ? <p className="t-small text-red-500">{errors.dimensions}</p> : null}
      </label>

      <label className="block space-y-2">
        <span className="t-label">Бюджет</span>
        <input
          type="text"
          value={form.budget}
          onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
          className={inputClass('budget')}
          placeholder="Если есть ориентир по бюджету"
        />
      </label>

      <label className="block space-y-2">
        <span className="t-label">Телефон *</span>
        <PhoneInput
          required
          value={form.phone}
          onBlur={() => onBlurField('phone')}
          onChange={(phone) => setForm((prev) => ({ ...prev, phone }))}
          className={inputClass('phone')}
          placeholder="+7 (___) ___-__-__"
        />
        {touched.phone && errors.phone ? <p className="t-small text-red-500">{errors.phone}</p> : null}
      </label>

      <label className={publicFormStyles.consent}>
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
      {touched.agreed && errors.agreed ? <p className="t-small -mt-2 text-red-500">{errors.agreed}</p> : null}

      <p className="t-body text-neutral-700 dark:text-neutral-200">Ответим и уточним детали в ближайшее время.</p>
      <button type="submit" className="btn-primary t-button w-full ring-1 ring-red-400/80 shadow-[0_0_24px_rgba(239,68,68,0.2)]" disabled={isSubmitDisabled}>
        {status === 'loading' ? 'Отправка...' : 'Получить расчет'}
      </button>
      <p className="t-helper">Без спама. Только по заявке.</p>
      {status === 'success' ? (
        <p className="t-body text-green-600">Заявка отправлена. Менеджер свяжется с вами в ближайшее время.</p>
      ) : null}
      {status === 'error' ? <p className="t-body text-red-600">{error}</p> : null}
    </form>
  );
}
