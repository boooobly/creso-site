'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import ImageDropzone from '@/components/ImageDropzone';
import PhoneInput, { getPhoneDigits } from '@/components/ui/PhoneInput';
import { publicFormStyles, publicInputClass } from '@/lib/public-form-styles';
import {
  MUGS_ALLOWED_EXTENSIONS,
  MUGS_ALLOWED_MIME_TYPES,
  MUGS_MAX_UPLOAD_SIZE_MB,
} from '@/lib/pricing-config/mugs';

const sizes = Array.from({ length: 29 }, (_, index) => String(index + 32));

const tshirtSourceOptions = [
  { value: 'ours', label: 'Наша' },
  { value: 'client', label: 'Ваша' },
] as const;

const fabricOptions = [
  { value: 'synthetic', label: 'Синтетика' },
  { value: 'cotton', label: 'ХБ' },
] as const;

const colorOptions = [
  { value: 'white', label: 'Белая' },
  { value: 'colored', label: 'Цветная' },
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
  fabric: string;
  color: string;
  transferType: string;
  side: string;
  comment: string;
  consent: boolean;
  website: string;
};

type FormErrors = Partial<Record<keyof FormValues | 'file', string>>;

const defaultValues: FormValues = {
  name: '',
  phone: '',
  size: '',
  tshirtSource: tshirtSourceOptions[0].value,
  fabric: '',
  color: '',
  transferType: transferTypeOptions[0].value,
  side: '',
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
    () => `Растровые: PNG, JPG, JPEG, WEBP. Векторные: PDF, CDR, AI, EPS, DXF, SVG. 1 файл, до ${MUGS_MAX_UPLOAD_SIZE_MB} МБ.`,
    [],
  );

  const technologyRecommendation = useMemo(() => {
    if (values.fabric === 'synthetic' && values.color === 'white') {
      return 'Для белой синтетической ткани доступна полноцветная печать методом сублимации.';
    }

    if (values.fabric === 'cotton') {
      return 'Для хлопковой ткани рекомендуем термотрансферные пленки (монохром или цветная печать).';
    }

    return '';
  }, [values.color, values.fabric]);

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
      formData.set('size', values.size);
      formData.set('tshirtSource', values.tshirtSource);
      formData.set('fabric', values.fabric);
      formData.set('color', values.color);
      formData.set('transferType', values.transferType);
      formData.set('side', values.side);
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(220,38,38,0.08),transparent_45%)]" aria-hidden="true" />

      <div className="relative">
        <h2 className="text-2xl font-bold md:text-3xl">Оставьте заявку</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Заполните форму — менеджер уточнит детали, стоимость и сроки после проверки макета.</p>

        <form className={`mt-6 ${publicFormStyles.fieldsStack}`} onSubmit={handleSubmit} noValidate>
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
              <span className="text-sm font-semibold">Тип ткани</span>
              <select className={inputClass('fabric')} value={values.fabric} onChange={(e) => setValues((prev) => ({ ...prev, fabric: e.target.value }))}>
                <option value="">Не выбрано</option>
                {fabricOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold">Цвет ткани</span>
              <select className={inputClass('color')} value={values.color} onChange={(e) => setValues((prev) => ({ ...prev, color: e.target.value }))}>
                <option value="">Не выбрано</option>
                {colorOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {technologyRecommendation && (
                <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-200">
                  {technologyRecommendation}
                </p>
              )}
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

          <div className={`${publicFormStyles.summaryCard} space-y-2`}>
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
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Файл не обязателен — можно описать задачу в комментарии.</p>
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
            <p>Технология печати подбирается в зависимости от типа ткани.</p>
            <p className="mt-1">Это позволяет сохранить яркость цвета и долговечность изображения.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
