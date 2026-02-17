'use client';

import { FormEvent, useMemo, useState } from 'react';

type FormValues = {
  name: string;
  phone: string;
  email: string;
  width: string;
  height: string;
  comment: string;
  website: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const PHONE_PATTERN = /^(\+7\d{10}|8\d{10})$/;

const defaultValues: FormValues = {
  name: '',
  phone: '',
  email: '',
  width: '',
  height: '',
  comment: '',
  website: '',
};

export default function OrderWideFormatForm() {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const bagetHref = useMemo(() => {
    const params = new URLSearchParams();
    if (values.width.trim()) params.set('width', values.width.trim());
    if (values.height.trim()) params.set('height', values.height.trim());
    const query = params.toString();
    return query ? `/baget?${query}` : '/baget';
  }, [values.height, values.width]);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!values.name.trim()) nextErrors.name = 'Укажите имя';

    const phone = values.phone.replace(/[^\d+]/g, '');
    if (!phone) {
      nextErrors.phone = 'Укажите телефон';
    } else if (!PHONE_PATTERN.test(phone)) {
      nextErrors.phone = 'Формат: +7XXXXXXXXXX или 8XXXXXXXXXX';
    }

    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Проверьте email';
    }

    const dimensions: Array<'width' | 'height'> = ['width', 'height'];
    dimensions.forEach((key) => {
      const value = values[key].trim();
      if (!value) return;
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        nextErrors[key] = 'Введите число больше 0';
      }
    });

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage('');
    setFormError('');

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSending(true);

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => formData.append(key, value));
      if (file) formData.append('file', file);

      const response = await fetch('/api/wide-format-order', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Не удалось отправить заявку');
      }

      setSuccessMessage('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
      setValues(defaultValues);
      setFile(null);
      setErrors({});
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Ошибка отправки. Попробуйте позже.');
    } finally {
      setIsSending(false);
    }
  };

  const inputClass = (field: keyof FormValues) => `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-red-200 ${
    errors[field] ? 'border-red-500 bg-red-50' : 'border-neutral-200 bg-white'
  }`;

  return (
    <div id="wide-format-order-form" className="card p-6 shadow-sm md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Рассчитать стоимость</h2>
        <p className="mt-2 text-sm text-neutral-600">Оставьте контактные данные и параметры макета — подготовим расчёт.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Имя *</span>
            <input className={inputClass('name')} value={values.name} onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))} />
            {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Телефон *</span>
            <input className={inputClass('phone')} placeholder="+7XXXXXXXXXX" value={values.phone} onChange={(e) => setValues((prev) => ({ ...prev, phone: e.target.value }))} />
            {errors.phone && <span className="text-xs text-red-600">{errors.phone}</span>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input className={inputClass('email')} type="email" value={values.email} onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))} />
            {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Загрузка файла</span>
            <input
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Ширина (мм)</span>
            <input className={inputClass('width')} inputMode="numeric" value={values.width} onChange={(e) => setValues((prev) => ({ ...prev, width: e.target.value }))} />
            {errors.width && <span className="text-xs text-red-600">{errors.width}</span>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Высота (мм)</span>
            <input className={inputClass('height')} inputMode="numeric" value={values.height} onChange={(e) => setValues((prev) => ({ ...prev, height: e.target.value }))} />
            {errors.height && <span className="text-xs text-red-600">{errors.height}</span>}
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-sm font-medium">Комментарий</span>
          <textarea className={inputClass('comment')} rows={4} value={values.comment} onChange={(e) => setValues((prev) => ({ ...prev, comment: e.target.value }))} />
        </label>

        <input
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => setValues((prev) => ({ ...prev, website: e.target.value }))}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <button
            type="submit"
            disabled={isSending}
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? 'Отправка…' : 'Отправить заявку'}
          </button>
          <a href={bagetHref} className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02]">
            Оформить в багет
          </a>
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}
        {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}
      </form>
    </div>
  );
}
