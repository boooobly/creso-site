'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Upload } from 'lucide-react';
import ImageDropzone from '@/components/ImageDropzone';
import PhoneInput, { getPhoneDigits } from '@/components/ui/PhoneInput';

type PrintSide = 'single' | 'double';

type BusinessCardsSummary = {
  quantity: number;
  printSide: PrintSide;
  lamination: boolean;
  needDesign: boolean;
  unitPrice: number;
  totalPrice: number;
};

type Props = {
  summary: BusinessCardsSummary;
};

type FormValues = {
  name: string;
  phone: string;
  email: string;
  comment: string;
  website: string;
  flyersRequested: boolean;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const defaultValues: FormValues = {
  name: '',
  phone: '',
  email: '',
  comment: '',
  website: '',
  flyersRequested: false,
};

const FIXED_NOTES = [
  'Double-sided price is the same',
  'Lamination +15%, one side only',
  'Design price is agreed with manager',
];

export default function OrderBusinessCardsForm({ summary }: Props) {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const payloadMeta = useMemo(
    () => ({
      product: 'Business cards',
      quantity: summary.quantity,
      printSide: summary.printSide,
      lamination: summary.lamination,
      needDesign: summary.needDesign,
      unitPrice: summary.unitPrice,
      totalPrice: summary.totalPrice,
      turnaround: '7–10 business days',
      fixedSpecs: {
        size: '90x50',
        stock: '300 gsm',
        printType: 'offset',
      },
      notes: FIXED_NOTES,
      flyersRequested: values.flyersRequested,
    }),
    [summary, values.flyersRequested],
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

    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Проверьте email';
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage('');
    setFormError('');

    const nextErrors = validate();
    setErrors(nextErrors);

    if (!summary.quantity) {
      setFormError('Не выбран тираж. Обновите параметры калькулятора.');
      return;
    }

    if (Object.keys(nextErrors).length > 0) return;

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.set('name', values.name.trim());
      formData.set('phone', getPhoneDigits(values.phone));
      formData.set('email', values.email.trim());
      formData.set('comment', values.comment.trim());
      formData.set('website', values.website);
      formData.set('payload', JSON.stringify(payloadMeta));
      formData.set('product', payloadMeta.product);
      formData.set('quantity', String(payloadMeta.quantity));
      formData.set('printSide', payloadMeta.printSide);
      formData.set('lamination', String(payloadMeta.lamination));
      formData.set('needDesign', String(payloadMeta.needDesign));
      formData.set('unitPrice', String(payloadMeta.unitPrice));
      formData.set('totalPrice', String(payloadMeta.totalPrice));
      formData.set('turnaround', payloadMeta.turnaround);
      formData.set('size', payloadMeta.fixedSpecs.size);
      formData.set('stock', payloadMeta.fixedSpecs.stock);
      formData.set('printType', payloadMeta.fixedSpecs.printType);
      formData.set('notes', JSON.stringify(payloadMeta.notes));
      formData.set('flyersRequested', String(payloadMeta.flyersRequested));

      if (file) {
        formData.set('fileName', file.name);
        formData.set('fileType', file.type || 'application/octet-stream');
        formData.set('fileSize', String(file.size));
        formData.set('file', file, file.name);
      }

      const response = await fetch('/api/requests/business-cards', {
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

  const inputClass = (field: keyof FormValues) => {
    const hasError = Boolean(errors[field]);

    return [
      'h-11 w-full rounded-xl border bg-white/95 px-4 text-sm text-neutral-900 shadow-sm transition-all duration-200',
      'placeholder:text-neutral-400 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500',
      'dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:hover:border-neutral-500',
      hasError ? 'border-red-500 focus:ring-red-500/30' : 'border-neutral-300',
    ].join(' ');
  };

  return (
    <div className="card rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(20,20,20,0.06)] md:p-6 dark:border-neutral-800 dark:bg-neutral-950/40">
      <div className="mb-4 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
        <h2 className="text-xl font-bold tracking-tight">Отправить заявку</h2>
        <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-300">Оставьте контакты и приложите макет — менеджер подтвердит детали и сроки.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium">Имя *</span>
            <input className={inputClass('name')} value={values.name} onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))} />
            {errors.name && <span className="t-small text-red-500">{errors.name}</span>}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium">Телефон *</span>
            <PhoneInput
              value={values.phone}
              onChange={(phone) => setValues((prev) => ({ ...prev, phone }))}
              placeholder="+7 (___) ___-__-__"
              className={inputClass('phone')}
            />
            {errors.phone && <span className="t-small text-red-500">{errors.phone}</span>}
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium">Email</span>
            <input className={inputClass('email')} type="email" value={values.email} onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))} />
            {errors.email && <span className="t-small text-red-500">{errors.email}</span>}
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
              className="rounded-xl border border-neutral-300/90 bg-neutral-50/80 p-3 transition-all duration-200 hover:border-red-400 dark:border-neutral-700 dark:bg-neutral-900/40"
              helperTextClassName="mt-1 t-small text-neutral-500 dark:text-neutral-400"
              icon={<Upload className="h-5 w-5 text-neutral-500" aria-hidden="true" />}
            />
            <p className="t-small text-neutral-500 dark:text-neutral-400">Мы проверим макет перед печатью и подтвердим детали заказа.</p>
          </div>
        </div>

        <div className="space-y-1.5 rounded-xl border border-neutral-200/80 bg-neutral-50/75 p-3 dark:border-neutral-800 dark:bg-neutral-900/40">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={values.flyersRequested}
              onChange={(e) => setValues((prev) => ({ ...prev, flyersRequested: e.target.checked }))}
              className="h-4 w-4 rounded border-neutral-400 text-red-600 focus:ring-red-500/40"
            />
            <span className="text-sm font-medium">Флаеры (расчёт по согласованию)</span>
          </label>
          <p className="t-small text-neutral-500 dark:text-neutral-400">Укажите желаемый формат, бумагу и тираж в комментарии.</p>
          {values.flyersRequested && !values.comment.trim() && (
            <p className="t-small text-amber-700 dark:text-amber-300">Подсказка: добавьте в комментарии параметры флаеров для точного расчёта.</p>
          )}
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Комментарий</span>
          <textarea className={`${inputClass('comment')} min-h-[110px] py-3`} rows={4} value={values.comment} onChange={(e) => setValues((prev) => ({ ...prev, comment: e.target.value }))} />
        </label>

        <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 p-3.5 text-sm dark:border-neutral-700 dark:bg-neutral-900/70">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Параметры заказа</p>
          <div className="grid gap-y-1.5 sm:grid-cols-2">
            <p><span className="text-neutral-500">Тираж:</span> <b>{summary.quantity.toLocaleString('ru-RU')} шт.</b></p>
            <p><span className="text-neutral-500">Печать:</span> <b>{summary.printSide === 'single' ? 'Односторонняя' : 'Двусторонняя'}</b></p>
            <p><span className="text-neutral-500">Ламинация:</span> <b>{summary.lamination ? 'Да' : 'Нет'}</b></p>
            <p><span className="text-neutral-500">Нужен дизайн:</span> <b>{summary.needDesign ? 'Да' : 'Нет'}</b></p>
          </div>
          <div className="mt-2 border-t border-neutral-200/90 pt-2 dark:border-neutral-700">
            <p className="text-base font-semibold tabular-nums">Итого: {summary.totalPrice.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>

        <input
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => setValues((prev) => ({ ...prev, website: e.target.value }))}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-3 pt-1 md:flex-row md:items-center">
          <button
            type="submit"
            disabled={isSending}
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 md:min-w-[200px]"
          >
            {isSending ? 'Отправка…' : 'Отправить заявку'}
          </button>
        </div>

        {formError && <p className="t-small text-red-500">{formError}</p>}
        {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}
      </form>
    </div>
  );
}
