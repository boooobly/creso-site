'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import PhoneInput, { getPhoneDigits } from '@/components/ui/PhoneInput';
import ImageDropzone from '@/components/ImageDropzone';
import type { WideFormatMaterialType } from '@/lib/calculations/types';

type FormValues = {
  name: string;
  phone: string;
  email: string;
  width: string;
  height: string;
  quantity: string;
  materialLabel: string;
  materialId: WideFormatMaterialType | '';
  edgeGluing: boolean;
  imageWelding: boolean;
  grommets: boolean;
  plotterCutByRegistrationMarks: boolean;
  cutByPositioningMarks: boolean;
  comment: string;
  website: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const defaultValues: FormValues = {
  name: '',
  phone: '',
  email: '',
  width: '',
  height: '',
  quantity: '',
  materialLabel: '',
  materialId: '',
  edgeGluing: false,
  imageWelding: false,
  grommets: false,
  plotterCutByRegistrationMarks: false,
  cutByPositioningMarks: false,
  comment: '',
  website: '',
};

type WideFormatPrefillDetail = {
  widthM?: string;
  heightM?: string;
  widthMm?: number | null;
  heightMm?: number | null;
  quantity?: string;
  materialId?: WideFormatMaterialType;
  materialLabel?: string;
  edgeGluing?: boolean;
  imageWelding?: boolean;
  grommets?: boolean;
  plotterCutByRegistrationMarks?: boolean;
  cutByPositioningMarks?: boolean;
};

type WideFormatPrefillEvent = CustomEvent<WideFormatPrefillDetail>;

export default function OrderWideFormatForm() {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [isScrollHighlighted, setIsScrollHighlighted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as WideFormatPrefillEvent;
      const detail = customEvent.detail;

      setValues((prev) => ({
        ...prev,
        width: typeof detail?.widthMm === 'number' ? String(detail.widthMm) : prev.width,
        height: typeof detail?.heightMm === 'number' ? String(detail.heightMm) : prev.height,
        quantity: detail?.quantity ?? prev.quantity,
        materialLabel: detail?.materialLabel ?? prev.materialLabel,
        materialId: detail?.materialId ?? prev.materialId,
        edgeGluing: detail?.edgeGluing ?? prev.edgeGluing,
        imageWelding: detail?.imageWelding ?? prev.imageWelding,
        grommets: detail?.grommets ?? prev.grommets,
        plotterCutByRegistrationMarks: detail?.plotterCutByRegistrationMarks ?? prev.plotterCutByRegistrationMarks,
        cutByPositioningMarks: detail?.cutByPositioningMarks ?? prev.cutByPositioningMarks,
      }));

      setIsScrollHighlighted(true);
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
      highlightTimeoutRef.current = window.setTimeout(() => {
        setIsScrollHighlighted(false);
      }, 1800);
    };

    window.addEventListener('wideFormatPrefill', handler);
    return () => {
      window.removeEventListener('wideFormatPrefill', handler);
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!values.name.trim()) nextErrors.name = 'Укажите имя';

    const phoneDigits = getPhoneDigits(values.phone);
    if (phoneDigits.length === 0) {
      nextErrors.phone = 'Укажите телефон';
    } else if (phoneDigits.length !== 11 || !phoneDigits.startsWith('7')) {
      nextErrors.phone = 'Формат: +7 (999) 999-99-99';
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
      formData.set('name', values.name.trim());
      formData.set('phone', getPhoneDigits(values.phone));
      formData.set('email', values.email.trim());
      formData.set('width', values.width.trim());
      formData.set('height', values.height.trim());
      formData.set('quantity', values.quantity.trim());
      formData.set('material', values.materialLabel.trim());
      formData.set('materialId', values.materialId);
      formData.set('edgeGluing', String(values.edgeGluing));
      formData.set('imageWelding', String(values.imageWelding));
      formData.set('grommets', String(values.grommets));
      formData.set('plotterCutByRegistrationMarks', String(values.plotterCutByRegistrationMarks));
      formData.set('cutByPositioningMarks', String(values.cutByPositioningMarks));
      formData.set('comment', values.comment.trim());
      formData.set('website', values.website);
      if (file) {
        formData.set('file', file, file.name);
      }

      const response = await fetch('/api/wide-format-order', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Не удалось отправить заявку');
      }

      if (result.fileSent === false && result.reason === 'too_large') {
        setSuccessMessage('Заявка отправлена. Файл слишком большой для Telegram-бота, менеджер свяжется с вами для получения исходника.');
      } else {
        setSuccessMessage('Заявка отправлена. Менеджер свяжется с вами в ближайшее время.');
      }
      setValues(defaultValues);
      setFile(null);
      setErrors({});
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.');
    } finally {
      setIsSending(false);
    }
  };

  const inputClass = (field: keyof FormValues) => `h-11 w-full rounded-xl border px-4 text-sm text-neutral-900 shadow-sm transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 focus:bg-white dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-red-500 dark:focus:ring-red-500/30 ${
    errors[field] ? 'border-red-500 bg-red-50 dark:bg-red-950/30' : 'border-neutral-300 bg-neutral-50'
  }`;

  return (
    <div id="wide-format-form" className={`card p-6 shadow-sm transition-all duration-300 md:p-8 ${isScrollHighlighted ? 'highlight-on-scroll' : ''}`.trim()}>
      <div className="mb-6">
        <h2 id="wide-format-form-title" className="text-2xl font-semibold">Рассчитать стоимость</h2>
        <p className="mt-2 text-sm text-neutral-600">Оставьте контактные данные и параметры макета — подготовим расчёт.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Имя *</span>
            <input className={inputClass('name')} value={values.name} onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))} />
            {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Телефон *</span>
            <PhoneInput
              value={values.phone}
              onChange={(phone) => setValues((prev) => ({ ...prev, phone }))}
              placeholder="+7 (___) ___-__-__"
              className={inputClass('phone')}
            />
            {errors.phone && <span className="text-xs text-red-600">{errors.phone}</span>}
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input className={inputClass('email')} type="email" value={values.email} onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))} />
            {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
          </label>

          <div className="flex flex-col gap-2">
            <ImageDropzone
              value={file}
              onChange={setFile}
              title="Загрузка файла"
              accept=".jpg,.jpeg,.png,.webp,.tif,.tiff,.pdf,.cdr,.ai,.psd"
              helperText="JPG, PNG, WEBP, TIFF, PDF, CDR, AI, PSD. 1 файл, до 50 МБ."
              allowedMimeTypes={[
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/tiff',
                'application/pdf',
                'application/postscript',
                'application/illustrator',
                'application/vnd.adobe.photoshop',
              ]}
              allowedExtensions={['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.pdf', '.cdr', '.ai', '.psd']}
              invalidTypeMessage="Допустимые форматы: JPG, PNG, WEBP, TIFF, PDF, CDR, AI, PSD."
              className="border-2 border-dashed rounded-xl p-3 md:p-4 bg-muted/30 hover:border-red-400 transition"
              helperTextClassName="mt-1 text-xs text-muted-foreground"
              icon={<Upload className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
            />
            <p className="text-xs text-muted-foreground">Мы проверим макет перед печатью и подтвердим детали заказа.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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

          <label className="space-y-2">
            <span className="text-sm font-medium">Количество</span>
            <input className={inputClass('quantity')} inputMode="numeric" value={values.quantity} onChange={(e) => setValues((prev) => ({ ...prev, quantity: e.target.value }))} />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Материал</span>
            <input className={inputClass('materialLabel')} value={values.materialLabel} onChange={(e) => setValues((prev) => ({ ...prev, materialLabel: e.target.value }))} />
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-sm font-medium">Комментарий</span>
          <textarea className={`${inputClass('comment')} min-h-[120px] py-3`} rows={4} value={values.comment} onChange={(e) => setValues((prev) => ({ ...prev, comment: e.target.value }))} />
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
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 md:min-w-[180px]"
          >
            {isSending ? 'Отправка…' : 'Отправить заявку'}
          </button>
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}
        {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}
      </form>
    </div>
  );
}
