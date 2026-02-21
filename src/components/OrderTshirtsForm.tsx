'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Upload } from 'lucide-react';
import ImageDropzone from '@/components/ImageDropzone';
import PhoneInput, { getPhoneDigits } from '@/components/ui/PhoneInput';
import {
  MUGS_ALLOWED_EXTENSIONS,
  MUGS_ALLOWED_MIME_TYPES,
  MUGS_MAX_UPLOAD_SIZE_MB,
} from '@/lib/pricing-config/mugs';

const sizes = Array.from({ length: 29 }, (_, index) => String(index + 32));

const tshirtSourceOptions = [
  { value: 'ours', label: 'Наша' },
  { value: 'client', label: 'Клиента' },
] as const;

const transferTypeOptions = [
  { value: 'a4', label: 'Полноцвет A4 (250 ₽/сторона)' },
  { value: 'film', label: 'Термоплёнка (расчёт менеджером)' },
] as const;

const sideOptions = [
  { value: 'front', label: 'Перед' },
  { value: 'back', label: 'Спина' },
  { value: 'sleeve', label: 'Рукав' },
] as const;

type FormValues = {
  name: string;
  phone: string;
  size: string;
  tshirtSource: string;
  transferType: string;
  side: string;
  comment: string;
  website: string;
};

type FormErrors = Partial<Record<keyof FormValues | 'file', string>>;

const defaultValues: FormValues = {
  name: '',
  phone: '',
  size: '',
  tshirtSource: tshirtSourceOptions[0].value,
  transferType: transferTypeOptions[0].value,
  side: '',
  comment: '',
  website: '',
};

export default function OrderTshirtsForm() {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  const inputClass = (name: keyof FormValues) => [
    'h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 shadow-sm transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500',
    errors[name] ? 'border-red-500 ring-2 ring-red-500/20' : '',
  ].join(' ');

  const helperText = useMemo(
    () => `Растровые: PNG, JPG, JPEG, WEBP. Векторные: PDF, CDR, AI, EPS, DXF, SVG. 1 файл, до ${MUGS_MAX_UPLOAD_SIZE_MB} МБ.`,
    [],
  );

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!values.name.trim()) nextErrors.name = 'Укажите имя';

    const phoneDigits = getPhoneDigits(values.phone);
    if (phoneDigits.length === 0) {
      nextErrors.phone = 'Укажите телефон';
    } else if (phoneDigits.length !== 11 || !phoneDigits.startsWith('7')) {
      nextErrors.phone = 'Формат: +7 (999) 999-99-99';
    }

    if (!values.transferType.trim()) {
      nextErrors.transferType = 'Выберите тип переноса';
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage('');
    setFormError('');

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.set('name', values.name.trim());
      formData.set('phone', getPhoneDigits(values.phone));
      formData.set('size', values.size);
      formData.set('tshirtSource', values.tshirtSource);
      formData.set('transferType', values.transferType);
      formData.set('side', values.side);
      formData.set('comment', values.comment.trim());
      formData.set('website', values.website);
      if (file) formData.set('file', file, file.name);

      const response = await fetch('/api/requests/tshirts', {
        method: 'POST',
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !payload?.ok) {
        setFormError(payload?.error || 'Не удалось отправить заявку. Попробуйте позже.');
        return;
      }

      setSuccessMessage('Спасибо! Мы свяжемся с вами в ближайшее время.');
      setValues(defaultValues);
      setFile(null);
      setErrors({});
    } catch {
      setFormError('Не удалось отправить заявку. Попробуйте позже.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(220,38,38,0.08),transparent_45%)]" aria-hidden="true" />

      <div className="relative">
        <h2 className="text-2xl font-bold md:text-3xl">Оставьте заявку</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Заполните форму — менеджер уточнит детали, стоимость и сроки после проверки макета.</p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Имя *</span>
              <input className={inputClass('name')} value={values.name} onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))} />
              {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold">Телефон *</span>
              <PhoneInput value={values.phone} onChange={(phone) => setValues((prev) => ({ ...prev, phone }))} className={inputClass('phone')} />
              {errors.phone && <span className="text-xs text-red-600">{errors.phone}</span>}
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Размер (32–60)</span>
              <select className={inputClass('size')} value={values.size} onChange={(e) => setValues((prev) => ({ ...prev, size: e.target.value }))}>
                <option value="">Не выбрано</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold">Футболка</span>
              <select className={inputClass('tshirtSource')} value={values.tshirtSource} onChange={(e) => setValues((prev) => ({ ...prev, tshirtSource: e.target.value }))}>
                {tshirtSourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Тип переноса *</span>
              <select className={inputClass('transferType')} value={values.transferType} onChange={(e) => setValues((prev) => ({ ...prev, transferType: e.target.value }))}>
                {transferTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.transferType && <span className="text-xs text-red-600">{errors.transferType}</span>}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold">Сторона</span>
              <select className={inputClass('side')} value={values.side} onChange={(e) => setValues((prev) => ({ ...prev, side: e.target.value }))}>
                <option value="">Не выбрано</option>
                {sideOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">Комментарий</span>
            <textarea className={`${inputClass('comment')} min-h-[120px] py-3`} rows={4} value={values.comment} onChange={(e) => setValues((prev) => ({ ...prev, comment: e.target.value }))} />
          </label>

          <div className="space-y-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
            <ImageDropzone
              value={file}
              onChange={setFile}
              title="Файл (необязательно)"
              accept={MUGS_ALLOWED_EXTENSIONS.join(',')}
              helperText={helperText}
              allowedMimeTypes={[...MUGS_ALLOWED_MIME_TYPES]}
              allowedExtensions={[...MUGS_ALLOWED_EXTENSIONS]}
              invalidTypeMessage="Разрешены только png, jpg, jpeg, webp, pdf, cdr, ai, eps, dxf, svg."
              maxSizeMb={MUGS_MAX_UPLOAD_SIZE_MB}
              className="border-2 border-dashed rounded-xl p-3 md:p-4 bg-muted/30 hover:border-red-400 transition"
              helperTextClassName="mt-1 text-xs text-muted-foreground"
              icon={<Upload className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
            />
            {errors.file && <p className="text-xs text-red-600">{errors.file}</p>}
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Файл не обязателен — можно описать задачу в комментарии.</p>
          </div>

          <input className="hidden" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => setValues((prev) => ({ ...prev, website: e.target.value }))} aria-hidden="true" />

          <button
            type="submit"
            disabled={isSending}
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 md:min-w-[200px]"
          >
            {isSending ? 'Отправка…' : 'Отправить заявку'}
          </button>

          {formError && <p className="text-sm text-red-600">{formError}</p>}
          {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}
        </form>
      </div>
    </div>
  );
}
