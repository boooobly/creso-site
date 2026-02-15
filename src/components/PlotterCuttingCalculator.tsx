'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  engineParsers,
  engineUiCatalog,
  getPlotterCuttingQuote,
  type PlotterMaterialType,
} from '@/lib/engine';
import { openLeadFormWithCalculation } from '@/lib/lead-prefill';
import { trackEvent } from '@/lib/analytics';

const VECTOR_EXTENSIONS = ['cdr', 'ai', 'eps', 'pdf', 'svg', 'dxf'];
const RASTER_EXTENSIONS = ['png', 'jpg', 'jpeg'];
const ALLOWED_EXTENSIONS = [...VECTOR_EXTENSIONS, ...RASTER_EXTENSIONS];
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 5;

type UploadedItem = {
  name: string;
  size: number;
  ext: string;
  isRaster: boolean;
};

export default function PlotterCuttingCalculator() {
  const [material, setMaterial] = useState<PlotterMaterialType>('selfAdhesive');
  const [cutLength, setCutLength] = useState('1');
  const [area, setArea] = useState('0');
  const [complexity, setComplexity] = useState<number>(1);
  const [weeding, setWeeding] = useState(false);
  const [mountingFilm, setMountingFilm] = useState(false);
  const [transfer, setTransfer] = useState(false);
  const [urgent, setUrgent] = useState(false);

  const [files, setFiles] = useState<UploadedItem[]>([]);
  const [fileError, setFileError] = useState('');
  const [fileWarning, setFileWarning] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [agree, setAgree] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    agree: false,
  });

  const calculations = useMemo(() => getPlotterCuttingQuote({
    cutLengthInput: cutLength,
    areaInput: area,
    complexity,
    weeding,
    mountingFilm,
    transfer,
    urgent,
  }), [area, complexity, cutLength, mountingFilm, transfer, urgent, weeding]);

  const { valuesValid, cutLength: cutLengthNum, area: areaNum, baseCost, extrasCost, minimumApplied, totalCost } = calculations;

  const normalizedPhone = useMemo(() => phone.replace(/[\s()-]/g, ''), [phone]);
  const phoneValid = /^(\+7\d{10}|8\d{10})$/.test(normalizedPhone);

  const nameError = touched.name && !name.trim() ? 'Введите имя.' : '';
  const phoneError = touched.phone && !phoneValid ? 'Введите телефон в формате +7XXXXXXXXXX или 8XXXXXXXXXX.' : '';
  const agreeError = touched.agree && !agree ? 'Необходимо согласие с политикой.' : '';

  const acceptedAttr = ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',');

  useEffect(() => {
    trackEvent('calculator_started', { calculator: 'plotter_cutting' });
  }, []);

  useEffect(() => {
    trackEvent('calculator_updated', {
      calculator: 'plotter_cutting',
      material,
      cutLength,
      area,
      complexity,
      weeding,
      mountingFilm,
      transfer,
      urgent,
    });
  }, [area, complexity, cutLength, material, mountingFilm, transfer, urgent, weeding]);

  useEffect(() => {
    if (!valuesValid) return;

    trackEvent('quote_generated', {
      calculator: 'plotter_cutting',
      totalCost,
      baseCost,
      extrasCost,
    });
  }, [baseCost, extrasCost, totalCost, valuesValid]);

  const handleSendCalculation = () => {
    const calcSummary = [
      `Материал: ${material}`,
      `Длина реза: ${valuesValid ? `${cutLengthNum.toFixed(2)} м` : '—'}`,
      `Площадь: ${valuesValid ? `${areaNum.toFixed(2)} м²` : '—'}`,
      `Сложность: ${complexity}`,
      `Выборка: ${weeding ? 'Да' : 'Нет'}`,
      `Монтажная плёнка: ${mountingFilm ? 'Да' : 'Нет'}`,
      `Перенос: ${transfer ? 'Да' : 'Нет'}`,
      `Срочно: ${urgent ? 'Да' : 'Нет'}`,
      `Итого: ${Math.round(totalCost)} ₽`,
    ].join('; ');

    trackEvent('send_calculation_clicked', { calculator: 'plotter_cutting' });

    openLeadFormWithCalculation({
      service: 'Плоттерная резка',
      message: `Расчёт:
${calcSummary}`,
    });
  };

  const applyFiles = (incoming: FileList | File[]) => {
    setFileError('');
    setFileWarning('');

    const selected = Array.from(incoming);
    if (!selected.length) return;

    const merged = [...files];
    let hasRaster = false;

    for (const file of selected) {
      if (merged.length >= MAX_FILES) {
        setFileError(`Можно загрузить не более ${MAX_FILES} файлов.`);
        break;
      }

      if (file.size > MAX_FILE_SIZE) {
        setFileError('Файл превышает 50 МБ. Свяжитесь с менеджером.');
        continue;
      }

      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setFileError('Недопустимый формат файла. Разрешены векторные и растровые форматы из списка.');
        continue;
      }

      const isRaster = RASTER_EXTENSIONS.includes(ext);
      if (isRaster) hasRaster = true;

      if (!merged.some((item) => item.name === file.name && item.size === file.size)) {
        merged.push({ name: file.name, size: file.size, ext, isRaster });
      }
    }

    if (hasRaster || merged.some((item) => item.isRaster)) {
      setFileWarning('Файл не является векторным. Возможно потребуется подготовка макета.');
    }

    setFiles(merged.slice(0, MAX_FILES));
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    applyFiles(e.dataTransfer.files);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    const nextTouched = { name: true, phone: true, agree: true };
    setTouched(nextTouched);

    if (!name.trim() || !phoneValid || !agree) {
      setSubmitError('Заполните обязательные поля формы.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        calculator: {
          material,
          cutLength: cutLengthNum,
          area: areaNum,
          complexity,
          extras: {
            weeding,
            mountingFilm,
            transfer,
            urgent,
          },
          baseCost,
          extrasCost,
          minimumApplied,
          total: Math.round(totalCost),
        },
        files: files.map((f) => f.name),
        contact: {
          name: name.trim(),
          phone: normalizedPhone,
          email: email.trim(),
          comment: comment.trim(),
          agreed: agree,
        },
      };

      const res = await fetch('/api/plotter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Не удалось отправить заявку. Попробуйте позже.');
      }

      setSubmitSuccess('Заявка отправлена. Мы скоро свяжемся с вами.');
      setComment('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ошибка отправки заявки.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
      <section className="card space-y-4 p-5 md:p-6">
        <h2 className="text-xl font-semibold">Параметры резки</h2>

        <div className="space-y-2">
          <label htmlFor="material" className="text-sm font-medium">Материал</label>
          <div className="relative">
            <select
              id="material"
              value={material}
              onChange={(e) => setMaterial(e.target.value as PlotterMaterialType)}
              className="w-full appearance-none rounded-xl border border-neutral-300 bg-white p-3 pr-10 dark:border-neutral-700 dark:bg-neutral-900"
            >
              {engineUiCatalog.plotterCutting.materialOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <SelectArrow />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="cutLength" className="text-sm font-medium">Длина реза (м)</label>
            <input
              id="cutLength"
              type="number"
              min={0}
              step="0.1"
              value={cutLength}
              onChange={(e) => setCutLength(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="area" className="text-sm font-medium">Площадь (м²)</label>
            <input
              id="area"
              type="number"
              min={0}
              step="0.1"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="complexity" className="text-sm font-medium">Сложность</label>
          <div className="relative">
            <select
              id="complexity"
              value={complexity}
              onChange={(e) => setComplexity(engineParsers.parseNumericInput(e.target.value))}
              className="w-full appearance-none rounded-xl border border-neutral-300 bg-white p-3 pr-10 dark:border-neutral-700 dark:bg-neutral-900"
            >
              {engineUiCatalog.plotterCutting.complexityOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <SelectArrow />
          </div>
        </div>

        <div className="space-y-3">
          <CheckLine checked={weeding} onChange={setWeeding} label="Выборка (+15 ₽ / м)" />
          <CheckLine checked={mountingFilm} onChange={setMountingFilm} label="Монтажная плёнка (+100 ₽ / м²)" />
          <CheckLine checked={transfer} onChange={setTransfer} label="Перенос на деталь (+300 ₽)" />
          <CheckLine checked={urgent} onChange={setUrgent} label="Срочный заказ (+30%)" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Файлы макета</label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-900/50"
          >
            <p className="mb-3 text-neutral-600 dark:text-neutral-300">Перетащите файлы сюда или загрузите вручную.</p>
            <label className="btn-primary inline-flex cursor-pointer">
              Загрузить макет
              <input
                type="file"
                multiple
                accept={acceptedAttr}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) applyFiles(e.target.files);
                  e.currentTarget.value = '';
                }}
              />
            </label>
            <p className="mt-2 text-xs text-neutral-500">До 5 файлов, не более 50 МБ каждый.</p>

            {files.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                {files.map((file) => (
                  <li key={`${file.name}-${file.size}`}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          {fileWarning && <p className="text-sm text-amber-700 dark:text-amber-300">{fileWarning}</p>}
          {fileError && <p className="text-sm text-red-600">{fileError}</p>}
        </div>

        <div className="card space-y-3 p-4">
          <h3 className="text-lg font-semibold">Контакты</h3>

          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium">Имя *</label>
            <input
              id="name"
              value={name}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
            {nameError && <p className="text-sm text-red-600">{nameError}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="text-sm font-medium">Телефон *</label>
            <input
              id="phone"
              value={phone}
              onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+79991234567 или 89991234567"
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
            {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="comment" className="text-sm font-medium">Комментарий</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={agree}
              onBlur={() => setTouched((prev) => ({ ...prev, agree: true }))}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span className="text-sm">Согласен(а) с политикой обработки персональных данных *</span>
          </label>
          {agreeError && <p className="text-sm text-red-600">{agreeError}</p>}
        </div>
      </section>

      <aside className="card h-fit space-y-4 p-5 md:p-6 lg:sticky lg:top-24">
        <h2 className="text-xl font-semibold">Расчёт</h2>
        <div className="space-y-2 text-sm">
          <SummaryRow label="Длина реза" value={valuesValid ? `${cutLengthNum.toFixed(2)} м` : '—'} />
          <SummaryRow label="Базовая резка" value={`${Math.round(baseCost).toLocaleString('ru-RU')} ₽`} />
          <SummaryRow label="Доп. услуги" value={`${Math.round(extrasCost).toLocaleString('ru-RU')} ₽`} />
          {minimumApplied && <SummaryRow label="Минимальный заказ применён" value="400 ₽" />}
        </div>

        <div className="rounded-2xl border-2 border-red-500/30 bg-white p-6 shadow-xl dark:bg-neutral-900">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Итого</p>
          <p className="mt-1 text-4xl font-extrabold md:text-5xl">{Math.round(totalCost).toLocaleString('ru-RU')} ₽</p>
          {minimumApplied && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Минимальный заказ применён — 400 ₽</p>
          )}

          <Button variant="primary" className="mt-4 w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
          </Button>
          <button type="button" onClick={handleSendCalculation} className="btn-secondary mt-3 w-full justify-center">Send this calculation</button>
          <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">Менеджер свяжется с вами для уточнения деталей.</p>

          {submitError && <p className="mt-3 text-sm text-red-600">{submitError}</p>}
          {submitSuccess && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{submitSuccess}</p>}
        </div>
      </aside>
    </form>
  );
}

function CheckLine({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex items-center">
      <span>{label}</span>
      <span className="mx-3 flex-1 border-b border-dashed border-neutral-300 dark:border-neutral-700" />
      <b>{value}</b>
    </p>
  );
}

function SelectArrow() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Button({
  children,
  variant,
  className = '',
  disabled = false,
}: {
  children: React.ReactNode;
  variant: 'primary';
  className?: string;
  disabled?: boolean;
}) {
  if (variant === 'primary') {
    return (
      <button type="submit" disabled={disabled} className={`btn-primary ${className} disabled:opacity-60`.trim()}>
        {children}
      </button>
    );
  }

  return null;
}
