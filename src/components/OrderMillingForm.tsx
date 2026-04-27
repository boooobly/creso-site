'use client';

import { FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import ImageDropzone from '@/components/ImageDropzone';
import PhoneInput, { getPhoneDigits } from '@/components/ui/PhoneInput';
import { publicFormStyles, publicInputClass } from '@/lib/public-form-styles';
import {
  MILLING_ALLOWED_EXTENSIONS,
  MILLING_ALLOWED_MIME_TYPES,
  MILLING_MATERIAL_OPTIONS,
  MILLING_MAX_UPLOAD_SIZE_MB,
  MILLING_THICKNESS_BY_MATERIAL,
} from '@/lib/pricing-config/milling';
import { reachGoal } from '@/lib/analytics/yandexMetrica';

type FormValues = {
  name: string;
  phone: string;
  material: string;
  thickness: string;
  comment: string;
  helpWithPrep: boolean;
  privacyConsent: boolean;
  website: string;
};

type FormErrors = Partial<Record<keyof FormValues | 'file', string>>;



type RequirementsSection = {
  title: string;
  description: string;
};

const requirementsSections: RequirementsSection[] = [
  {
    title: 'Форматы файлов',
    description: 'CDR, AI, EPS, PDF (вектор), DXF, SVG.',
  },
  {
    title: 'Общее',
    description: 'Масштаб 1:1, все шрифты перевести в кривые.',
  },
  {
    title: 'Контуры',
    description: 'Замкнутые, без эффектов, прозрачностей и градиентов, без пересечений и незамкнутых линий.',
  },
  {
    title: 'Рекомендации по минимумам',
    description: 'Минимальный размер элементов — 7 мм, расстояние между объектами — 4 мм, минимальная толщина элементов — 5 мм.',
  },
  {
    title: 'Если не уверены',
    description: 'Отметьте «Нужна помощь с подготовкой файла» — поможем.',
  },
];

const defaultValues: FormValues = {
  name: '',
  phone: '',
  material: MILLING_MATERIAL_OPTIONS[0]?.value ?? '',
  thickness: '',
  comment: '',
  helpWithPrep: false,
  privacyConsent: false,
  website: '',
};

export default function OrderMillingForm() {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);
  const requirementsTitleId = useId();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const thicknessOptions = useMemo(() => MILLING_THICKNESS_BY_MATERIAL[values.material] ?? [], [values.material]);

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

    if (!values.material.trim()) nextErrors.material = 'Выберите материал';
    if (!values.thickness.trim()) nextErrors.thickness = 'Выберите толщину';
    if (!values.privacyConsent) nextErrors.privacyConsent = 'Необходимо согласие на обработку персональных данных';

    return nextErrors;
  };


  const handleViewPrices = () => {
    const pricesSection = document.getElementById('milling-prices');
    pricesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    window.dispatchEvent(new CustomEvent('milling:open-material', {
      detail: { material: values.material },
    }));
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
      formData.set('material', values.material.trim());
      formData.set('thickness', values.thickness.trim());
      formData.set('comment', values.comment.trim());
      formData.set('helpWithPrep', String(values.helpWithPrep));
      formData.set('privacyConsent', String(values.privacyConsent));
      formData.set('website', values.website);
      if (file) formData.set('file', file, file.name);

      const response = await fetch('/api/requests/milling', {
        method: 'POST',
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !payload?.ok) {
        setFormError(payload?.error || 'Не удалось отправить заявку. Попробуйте позже.');
        return;
      }

      reachGoal('milling_order_submit_success');
      setSuccessMessage('Заявка отправлена. Менеджер свяжется с вами в ближайшее время.');
      setValues(defaultValues);
      setFile(null);
      setErrors({});
    } catch {
      setFormError('Не удалось отправить заявку. Попробуйте позже.');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!isRequirementsOpen) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsRequirementsOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isRequirementsOpen]);

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (!focusableElements?.length) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const active = document.activeElement;

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    }
  };

  return (
    <div id="milling-request" className={publicFormStyles.shell}>
      <div className={`${publicFormStyles.heading} mb-6`}>
        <h2 className="text-2xl font-semibold">Заявка на фрезеровку</h2>
      </div>

      <form className={publicFormStyles.fieldsStack} onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Имя *</span>
            <input className={inputClass('name')} value={values.name} onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))} />
            {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Телефон *</span>
            <PhoneInput value={values.phone} onChange={(phone) => setValues((prev) => ({ ...prev, phone }))} className={inputClass('phone')} />
            {errors.phone && <span className="text-xs text-red-600">{errors.phone}</span>}
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Материал</span>
              <button
                type="button"
                onClick={handleViewPrices}
                className="text-xs font-medium text-red-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
              >
                Посмотреть цены
              </button>
            </div>
            <select className={inputClass('material')} value={values.material} onChange={(e) => setValues((prev) => ({ ...prev, material: e.target.value, thickness: '' }))}>
              {MILLING_MATERIAL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.material && <span className="text-xs text-red-600">{errors.material}</span>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Толщина</span>
            <select className={inputClass('thickness')} value={values.thickness} onChange={(e) => setValues((prev) => ({ ...prev, thickness: e.target.value }))}>
              <option value="">Выберите толщину</option>
              {thicknessOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.thickness && <span className="text-xs text-red-600">{errors.thickness}</span>}
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-sm font-medium">Комментарий</span>
          <textarea className={`${inputClass('comment')} min-h-[120px] py-3`} rows={4} value={values.comment} onChange={(e) => setValues((prev) => ({ ...prev, comment: e.target.value }))} />
        </label>

        <div className={publicFormStyles.summaryCard}>
          <label className="inline-flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={values.helpWithPrep}
              onChange={(e) => setValues((prev) => ({ ...prev, helpWithPrep: e.target.checked }))}
              className="h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
            />
            Нужна помощь с подготовкой файла
          </label>
        </div>

        <div className="space-y-2">
          <ImageDropzone
            value={file}
            onChange={setFile}
            title="Загрузка файла"
            accept={MILLING_ALLOWED_EXTENSIONS.join(',')}
            helperText={`Допустимые форматы: PDF, CDR, AI, EPS, DXF, SVG. 1 файл, до ${MILLING_MAX_UPLOAD_SIZE_MB} МБ.`}
            allowedMimeTypes={[...MILLING_ALLOWED_MIME_TYPES]}
            allowedExtensions={[...MILLING_ALLOWED_EXTENSIONS]}
            invalidTypeMessage="Разрешены только векторные форматы: PDF, CDR, AI, EPS, DXF, SVG."
            maxSizeMb={MILLING_MAX_UPLOAD_SIZE_MB}
            className={publicFormStyles.uploadZone}
            helperTextClassName="mt-1 text-xs text-muted-foreground"
            icon={<Upload className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
          />
          {errors.file && <p className="text-xs text-red-600">{errors.file}</p>}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <p className="text-neutral-500 dark:text-neutral-400">Макет не обязателен - можно отправить заявку без файла.</p>
            <button
              type="button"
              onClick={() => setIsRequirementsOpen(true)}
              className="font-medium text-red-600 underline underline-offset-2 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
            >
              Требования к макету
            </button>
          </div>
        </div>

        <input className="hidden" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => setValues((prev) => ({ ...prev, website: e.target.value }))} aria-hidden="true" />

        <div className={publicFormStyles.summaryCard}>
          <label className="inline-flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={values.privacyConsent}
              onChange={(e) => setValues((prev) => ({ ...prev, privacyConsent: e.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
            />
            <span>
              Я согласен с{' '}
              <a
                href="/privacy"
                className="text-red-600 underline underline-offset-2 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
              >
                политикой обработки персональных данных
              </a>
            </span>
          </label>
          {errors.privacyConsent && <p className="mt-2 text-xs text-red-600">{errors.privacyConsent}</p>}
        </div>

        <div className={publicFormStyles.actionRow}>
          <button
            type="submit"
            disabled={isSending}
            className={`${publicFormStyles.submitButton} hover:scale-[1.02] md:min-w-[180px]`}
          >
            {isSending ? 'Отправка…' : 'Отправить заявку'}
          </button>

          <div className="space-y-1">
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}
          </div>
        </div>
      </form>

      {isRequirementsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsRequirementsOpen(false);
            }
          }}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={requirementsTitleId}
            onKeyDown={trapFocus}
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-neutral-900 md:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 id={requirementsTitleId} className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Требования к макету для фрезеровки
              </h3>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsRequirementsOpen(false)}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                aria-label="Закрыть модальное окно"
              >
                Закрыть
              </button>
            </div>

            <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
              {requirementsSections.map((section) => (
                <div key={section.title} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">{section.title}</p>
                  <p className="mt-1 leading-relaxed">{section.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
