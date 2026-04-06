'use client';

import { FormEvent, useState } from 'react';
import { Upload } from 'lucide-react';
import Link from 'next/link';
import ImageDropzone from '@/components/ImageDropzone';
import PhoneInput, { getPhoneDigits } from '@/components/ui/PhoneInput';
import { publicFormStyles, publicInputClass } from '@/lib/public-form-styles';
import {
  MUGS_ALLOWED_EXTENSIONS,
  MUGS_ALLOWED_MIME_TYPES,
  MUGS_COVERING_OPTIONS,
  MUGS_MAX_UPLOAD_SIZE_MB,
} from '@/lib/pricing-config/mugs';

const complexityLevels = [
  { title: 'I', description: 'Простой текст, логотип или базовый макет без сложной обработки.' },
  { title: 'II', description: 'Комбинация текста и графики, умеренная подготовка и правки.' },
  { title: 'III', description: 'Сложный коллаж, много элементов, детальная допечатная подготовка.' },
];

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Не удалось прочитать файл.'));
    reader.readAsDataURL(file);
  });
}

const checklist = [
  'Нужна цветокоррекция/чистка исходника',
  'Несколько изображений в одном макете',
  'Сложная типографика или много текста',
  'Нестандартная композиция по кругу кружки',
  'Замена фона/ретушь',
  'Подбор фирменных цветов по брендбуку',
  'Срочная подготовка макета',
];

type FormValues = {
  name: string;
  phone: string;
  quantity: string;
  covering: string;
  comment: string;
  consent: boolean;
  website: string;
};

type FormErrors = Partial<Record<keyof FormValues | 'file', string>>;

const defaultValues: FormValues = {
  name: '',
  phone: '',
  quantity: '1',
  covering: MUGS_COVERING_OPTIONS[0]?.value ?? '',
  comment: '',
  consent: false,
  website: '',
};

export default function OrderMugsForm() {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [needsDesign, setNeedsDesign] = useState(false);

  const inputClass = (name: keyof FormValues) => publicInputClass(Boolean(errors[name]));

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (!values.name.trim()) nextErrors.name = 'Укажите имя';

    const phoneDigits = getPhoneDigits(values.phone);
    if (phoneDigits.length === 0) {
      nextErrors.phone = 'Укажите телефон';
    } else if (phoneDigits.length !== 11 || !phoneDigits.startsWith('7')) {
      nextErrors.phone = 'Формат: +7 (999) 999-99-99';
    }

    const quantity = Number(values.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      nextErrors.quantity = 'Количество должно быть не меньше 1';
    }

    if (!values.covering.trim()) {
      nextErrors.covering = 'Выберите покрытие';
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
      formData.set('quantity', values.quantity);
      formData.set('covering', values.covering);
      formData.set('comment', values.comment.trim());
      formData.set('consent', values.consent ? 'true' : 'false');
      formData.set('website', values.website);
      formData.set('needsDesign', needsDesign ? 'true' : 'false');
      if (file) {
        formData.set('file', file, file.name);
        const rawImageDataUrl = await fileToDataUrl(file);
        formData.set('rawImageDataUrl', rawImageDataUrl);
      }

      const response = await fetch('/api/requests/mugs', {
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
      setNeedsDesign(false);
      setErrors({});
    } catch {
      setFormError('Не удалось отправить заявку. Попробуйте позже.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div id="mug-order-form" className={`${publicFormStyles.shell} sm:p-8 md:p-9`}>
      <div className={publicFormStyles.heading}>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Заявка на печать кружек</h2>
        <p className="mt-2 text-sm text-neutral-600">Заполните поля формы для предварительного расчёта.</p>
      </div>

      <form className={`${publicFormStyles.fieldsStack} mt-6`} onSubmit={handleSubmit} noValidate>
        <div className={`${publicFormStyles.summaryCard} sm:p-5`}>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={needsDesign}
              onChange={(event) => {
                const checked = event.target.checked;
                setNeedsDesign(checked);
                if (checked) {
                  requestAnimationFrame(() => {
                    document.getElementById('mug-design-info')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  });
                }
              }}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
            />
            <span>
              <span className="text-sm font-medium text-neutral-900">Нужен дизайн макета для кружки</span>
              <span className="mt-1 block text-xs text-neutral-600">Отметьте, если нужен макет с нуля или доработка исходника.</span>
            </span>
          </label>

          <div
            id="mug-design-info"
            className={needsDesign
              ? 'mt-4 overflow-hidden transition-all duration-300 ease-out opacity-100 max-h-[2000px]'
              : 'mt-0 overflow-hidden transition-all duration-300 ease-out opacity-0 max-h-0 pointer-events-none'}
          >
            <div className="space-y-5 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
              <h3 className="text-xl font-semibold">Дизайн</h3>
              <p className="text-sm text-neutral-700">2 варианта макета входят в стоимость.</p>
              <p className="text-sm text-neutral-700">Также включены 2 правки 1-й категории.</p>

              <div>
                <h4 className="text-lg font-medium">Категории сложности I/II/III</h4>
                <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                  {complexityLevels.map((level) => (
                    <li key={level.title}><span className="font-semibold">{level.title}:</span> {level.description}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium">Чек-лист (+1 за каждый пункт)</h4>
                <ul className="mt-3 grid gap-2 text-sm text-neutral-700 md:grid-cols-2">
                  {checklist.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-neutral-700">Интерпретация: 0–2 → I, 3–5 → II, 6–8 → III.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Имя *</span>
            <input className={inputClass('name')} value={values.name} onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))} />
            {errors.name && <span className="mt-1 text-xs text-red-600">{errors.name}</span>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Телефон *</span>
            <PhoneInput value={values.phone} onChange={(phone) => setValues((prev) => ({ ...prev, phone }))} className={inputClass('phone')} />
            {errors.phone && <span className="mt-1 text-xs text-red-600">{errors.phone}</span>}
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Количество *</span>
            <input type="number" min={1} className={inputClass('quantity')} value={values.quantity} onChange={(e) => setValues((prev) => ({ ...prev, quantity: e.target.value }))} />
            {errors.quantity && <span className="mt-1 text-xs text-red-600">{errors.quantity}</span>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Покрытие *</span>
            <select className={inputClass('covering')} value={values.covering} onChange={(e) => setValues((prev) => ({ ...prev, covering: e.target.value }))}>
              {MUGS_COVERING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.covering && <span className="mt-1 text-xs text-red-600">{errors.covering}</span>}
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-sm font-medium">Комментарий</span>
          <textarea className={`${inputClass('comment')} min-h-[120px] py-3`} rows={4} value={values.comment} onChange={(e) => setValues((prev) => ({ ...prev, comment: e.target.value }))} />
        </label>

        <div className="space-y-2">
          <ImageDropzone
            value={file}
            onChange={setFile}
            title="Файл (необязательно)"
            accept={MUGS_ALLOWED_EXTENSIONS.join(',')}
            helperText={`Растровые: PNG, JPG, JPEG, WEBP. Векторные: PDF, CDR, AI, EPS, DXF, SVG. 1 файл, до ${MUGS_MAX_UPLOAD_SIZE_MB} МБ.`}
            allowedMimeTypes={[...MUGS_ALLOWED_MIME_TYPES]}
            allowedExtensions={[...MUGS_ALLOWED_EXTENSIONS]}
            invalidTypeMessage="Разрешены только png, jpg, jpeg, webp, pdf, cdr, ai, eps, dxf, svg."
            maxSizeMb={MUGS_MAX_UPLOAD_SIZE_MB}
            className={publicFormStyles.uploadZone}
            helperTextClassName="mt-1 text-xs text-muted-foreground"
            icon={<Upload className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
          />
          {errors.file && <p className="mt-1 text-xs text-red-600">{errors.file}</p>}
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Макет не обязателен - можно отправить заявку без файла.</p>
        </div>

        <input className="hidden" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => setValues((prev) => ({ ...prev, website: e.target.value }))} aria-hidden="true" />

        <label className={publicFormStyles.consent}>
          <input
            type="checkbox"
            checked={values.consent}
            onChange={(e) => setValues((prev) => ({ ...prev, consent: e.target.checked }))}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
          />
          <span>
            Я согласен с{' '}
            <Link href="/privacy" className="underline hover:no-underline">
              политикой обработки персональных данных
            </Link>
            .
          </span>
        </label>
        {errors.consent && <p className="-mt-3 text-xs text-red-600">{errors.consent}</p>}

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 sm:p-5">
          <button
            type="submit"
            disabled={isSending}
            className={`${publicFormStyles.submitButton} w-full motion-reduce:transition-none sm:w-auto`}
          >
            {isSending ? 'Отправка…' : 'Отправить заявку'}
          </button>

          <p className="mt-3 text-xs text-neutral-500">После отправки формы пришлём расчёт и свяжемся удобным способом.</p>
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}
        {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}
      </form>
    </div>
  );
}
