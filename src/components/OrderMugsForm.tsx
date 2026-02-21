'use client';

import { FormEvent, useState } from 'react';
import { Upload } from 'lucide-react';
import ImageDropzone from '@/components/ImageDropzone';
import PhoneInput, { getPhoneDigits } from '@/components/ui/PhoneInput';

type MugsFinish = 'Глянец' | 'Мат';

type FormValues = {
  name: string;
  phone: string;
  quantity: string;
  finish: MugsFinish | '';
  comment: string;
  website: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const defaultValues: FormValues = {
  name: '',
  phone: '',
  quantity: '',
  finish: '',
  comment: '',
  website: '',
};

const ALLOWED_MUGS_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.pdf', '.cdr', '.ai', '.eps', '.dxf', '.svg'] as const;
const ALLOWED_MUGS_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'application/postscript',
  'application/illustrator',
  'application/dxf',
  'image/vnd.dxf',
  'image/svg+xml',
] as const;

export default function OrderMugsForm() {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = 'Укажите имя';
    }

    const phoneDigits = getPhoneDigits(values.phone);
    if (phoneDigits.length === 0) {
      nextErrors.phone = 'Укажите телефон';
    } else if (phoneDigits.length !== 11 || !phoneDigits.startsWith('7')) {
      nextErrors.phone = 'Формат: +7 (999) 999-99-99';
    }

    const quantity = Number(values.quantity);
    if (!values.quantity.trim()) {
      nextErrors.quantity = 'Укажите количество';
    } else if (!Number.isFinite(quantity) || !Number.isInteger(quantity) || quantity < 1) {
      nextErrors.quantity = 'Минимум 1 шт';
    }

    if (!values.finish) {
      nextErrors.finish = 'Выберите покрытие';
    }

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
      formData.set('quantity', values.quantity.trim());
      formData.set('finish', values.finish);
      formData.set('comment', values.comment.trim());
      formData.set('website', values.website);
      if (file) {
        formData.set('file', file, file.name);
      }

      const response = await fetch('/api/requests/mugs', {
        method: 'POST',
        body: formData,
      });

      const result: { ok?: boolean; error?: string } = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Не удалось отправить заявку');
      }

      setSuccessMessage('Заявка отправлена. Менеджер свяжется с вами в ближайшее время.');
      setValues(defaultValues);
      setFile(null);
      setErrors({});
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось отправить заявку. Попробуйте ещё раз.');
    } finally {
      setIsSending(false);
    }
  };

  const inputClass = (field: keyof FormValues) => `h-11 w-full rounded-xl border px-4 text-sm text-neutral-900 shadow-sm transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 focus:bg-white dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-red-500 dark:focus:ring-red-500/30 ${
    errors[field] ? 'border-red-500 bg-red-50 dark:bg-red-950/30' : 'border-neutral-300 bg-neutral-50'
  }`;

  return (
    <div id="mugs-form" className="card p-6 shadow-sm transition-all duration-300 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Оставить заявку на печать кружек</h2>
        <p className="mt-2 text-sm text-neutral-600">Заполните форму — подготовим до 3 вариантов макета и согласуем запуск в печать.</p>
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

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Количество *</span>
            <input
              type="number"
              min={1}
              step={1}
              className={inputClass('quantity')}
              value={values.quantity}
              onChange={(e) => setValues((prev) => ({ ...prev, quantity: e.target.value }))}
            />
            {errors.quantity && <span className="text-xs text-red-600">{errors.quantity}</span>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Покрытие *</span>
            <select
              className={inputClass('finish')}
              value={values.finish}
              onChange={(e) => setValues((prev) => ({ ...prev, finish: e.target.value as MugsFinish | '' }))}
            >
              <option value="">Выберите покрытие</option>
              <option value="Глянец">Глянец</option>
              <option value="Мат">Мат</option>
            </select>
            {errors.finish && <span className="text-xs text-red-600">{errors.finish}</span>}
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Комментарий</span>
          <textarea
            className={`${inputClass('comment')} min-h-[120px] py-3`}
            rows={4}
            value={values.comment}
            onChange={(e) => setValues((prev) => ({ ...prev, comment: e.target.value }))}
          />
        </label>

        <ImageDropzone
          value={file}
          onChange={setFile}
          title="Файл макета (необязательно)"
          description="Можно прикрепить растровый или векторный файл."
          accept={ALLOWED_MUGS_EXTENSIONS.join(',')}
          helperText="Макет не обязателен - можно отправить заявку без файла. Форматы: PNG, JPG, JPEG, WEBP, PDF, CDR, AI, EPS, DXF, SVG. До 50 МБ."
          allowedExtensions={[...ALLOWED_MUGS_EXTENSIONS]}
          allowedMimeTypes={[...ALLOWED_MUGS_MIME_TYPES]}
          invalidTypeMessage="Допустимые форматы: PNG, JPG, JPEG, WEBP, PDF, CDR, AI, EPS, DXF, SVG."
          className="border-2 border-dashed rounded-xl p-3 md:p-4 bg-muted/30 hover:border-red-400 transition"
          helperTextClassName="mt-1 text-xs text-muted-foreground"
          icon={<Upload className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
        />

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
