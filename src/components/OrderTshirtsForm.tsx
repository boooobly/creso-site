'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import ImageDropzone from '@/components/ImageDropzone';
import PhoneInput, { getPhoneDigits } from '@/components/ui/PhoneInput';
import { publicFormStyles, publicInputClass } from '@/lib/public-form-styles';
import { reachGoal } from '@/lib/analytics/yandexMetrica';
import {
  MUGS_ALLOWED_EXTENSIONS,
  MUGS_ALLOWED_MIME_TYPES,
  MUGS_MAX_UPLOAD_SIZE_MB,
} from '@/lib/pricing-config/mugs';

type FormValues = {
  name: string;
  phone: string;
  comment: string;
  consent: boolean;
  website: string;
};

type FormErrors = Partial<Record<keyof FormValues | 'file', string>>;

const defaultValues: FormValues = {
  name: '',
  phone: '',
  comment: '',
  consent: false,
  website: '',
};

export default function OrderTshirtsForm() {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  const inputClass = (name: keyof FormValues) => publicInputClass(Boolean(errors[name]));

  const helperText = useMemo(
    () => `PNG, JPG, JPEG, WEBP, PDF, CDR, AI, EPS, DXF, SVG. 1 файл, до ${MUGS_MAX_UPLOAD_SIZE_MB} МБ.`,
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

    if (!values.consent) {
      nextErrors.consent = 'Необходимо согласие на обработку персональных данных';
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
      formData.set('comment', values.comment.trim());
      formData.set('consent', values.consent ? 'true' : 'false');
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

      reachGoal('tshirts_order_submit_success');
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
    <div className={`relative overflow-hidden ${publicFormStyles.shell}`}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-red-50/40 via-transparent to-transparent dark:from-red-950/20" aria-hidden="true" />

      <div className="relative">
        <p className="t-eyebrow">Заявка на печать</p>
        <h2 className="mt-2 text-2xl font-bold md:text-3xl">Оставьте заявку</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Уточним детали, согласуем стоимость и сроки перед запуском.</p>

        <form className={`mt-6 space-y-5 ${publicFormStyles.fieldsStack}`} onSubmit={handleSubmit} noValidate>
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

          <label className="block space-y-2">
            <span className="text-sm font-semibold">Комментарий</span>
            <textarea className={`${inputClass('comment')} min-h-[120px] py-3`} rows={4} value={values.comment} onChange={(e) => setValues((prev) => ({ ...prev, comment: e.target.value }))} />
          </label>

          <div className={`${publicFormStyles.uploadCard} space-y-2.5`}>
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
              className={publicFormStyles.uploadZone}
              helperTextClassName="mt-1 text-xs text-muted-foreground"
              icon={<Upload className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
            />
            {errors.file && <p className="text-xs text-red-600">{errors.file}</p>}
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Файл не обязателен: задачу можно описать в комментарии.</p>
          </div>

          <input className="hidden" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => setValues((prev) => ({ ...prev, website: e.target.value }))} aria-hidden="true" />

          <label className={publicFormStyles.consent}>
            <input
              type="checkbox"
              checked={values.consent}
              onChange={(e) => setValues((prev) => ({ ...prev, consent: e.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500 dark:border-neutral-700"
            />
            <span>
              Я согласен с{' '}
              <Link href="/privacy" className="underline hover:no-underline">
                политикой обработки персональных данных
              </Link>
              .
            </span>
          </label>
          {errors.consent && <p className="text-xs text-red-600">{errors.consent}</p>}

          <button type="submit" disabled={isSending} className={`${publicFormStyles.submitButton} hover:scale-[1.02]`}>
            {isSending ? 'Отправка…' : 'Отправить заявку'}
          </button>

          {formError && <p className="text-sm text-red-600">{formError}</p>}
          {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}

          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 px-4 py-3 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-300">
            Технологию нанесения подбираем по ткани и задаче, чтобы сохранить цвет и стойкость принта.
          </div>
        </form>
      </div>
    </div>
  );
}
