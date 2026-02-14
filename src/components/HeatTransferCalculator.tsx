'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type ProductType = 'mug' | 'tshirt' | 'film';
type MugType = 'white330' | 'chameleon';
type MugPrintType = 'single' | 'wrap';
type TshirtSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';
type TshirtGender = 'male' | 'female';

const VECTOR_EXTENSIONS = ['pdf', 'svg', 'ai', 'eps', 'cdr'];
const RASTER_EXTENSIONS = ['png', 'jpg', 'jpeg'];
const ALLOWED_EXTENSIONS = [...VECTOR_EXTENSIONS, ...RASTER_EXTENSIONS];
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 5;

const MUG_PRICES: Record<MugType, Record<MugPrintType, number>> = {
  white330: { single: 550, wrap: 700 },
  chameleon: { single: 850, wrap: 1000 },
};

const QUICK_QTY = [1, 5, 10, 20, 50] as const;

const formatMoney = (value: number) => `${Math.round(value).toLocaleString('ru-RU')} ₽`;

type UploadedItem = {
  name: string;
  size: number;
  ext: string;
  isRaster: boolean;
};

export default function HeatTransferCalculator() {
  const [productType, setProductType] = useState<ProductType>('mug');

  const [mugType, setMugType] = useState<MugType>('white330');
  const [mugPrintType, setMugPrintType] = useState<MugPrintType>('single');
  const [mugQuantity, setMugQuantity] = useState(1);

  const [tshirtSize, setTshirtSize] = useState<TshirtSize>('M');
  const [tshirtGender, setTshirtGender] = useState<TshirtGender>('male');
  const [useOwnClothes, setUseOwnClothes] = useState(false);
  const [tshirtQuantity, setTshirtQuantity] = useState(1);

  const [filmLength, setFilmLength] = useState('1');
  const [filmUrgent, setFilmUrgent] = useState(false);
  const [filmTransfer, setFilmTransfer] = useState(false);

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

  const [touched, setTouched] = useState({ name: false, phone: false, agree: false });

  const quantity = productType === 'mug' ? mugQuantity : productType === 'tshirt' ? tshirtQuantity : 1;

  const pricing = useMemo(() => {
    if (productType === 'mug') {
      const unitPrice = MUG_PRICES[mugType][mugPrintType];
      const subtotal = unitPrice * mugQuantity;
      const discount = mugQuantity >= 10 ? subtotal * 0.1 : 0;
      const total = subtotal - discount;
      return {
        unitPrice,
        subtotal,
        discount,
        total,
        summaryType: 'Кружка',
        details: [
          `Модель: ${mugType === 'white330' ? 'Белая кружка 330 мл' : 'Кружка хамелеон'}`,
          `Печать: ${mugPrintType === 'single' ? 'Обычная (1 сторона)' : 'Круговая'}`,
        ],
      };
    }

    if (productType === 'tshirt') {
      const unitPrice = useOwnClothes ? 700 : 1200;
      const subtotal = unitPrice * tshirtQuantity;
      const discount = tshirtQuantity >= 10 ? subtotal * 0.1 : 0;
      const total = subtotal - discount;
      return {
        unitPrice,
        subtotal,
        discount,
        total,
        summaryType: 'Футболка',
        details: [
          `Размер: ${tshirtSize}`,
          `Пол: ${tshirtGender === 'male' ? 'Мужская' : 'Женская'}`,
          'Печать: Формат A4',
          useOwnClothes ? 'Своя вещь: да' : 'Своя вещь: нет',
        ],
      };
    }

    const length = Number(filmLength);
    const safeLength = Number.isFinite(length) && length > 0 ? length : 0;
    const base = safeLength * 400;
    const transferCost = filmTransfer ? 300 : 0;
    const subtotal = base + transferCost;
    const withUrgent = filmUrgent ? subtotal * 1.3 : subtotal;
    const total = withUrgent > 0 ? Math.max(withUrgent, 400) : 400;

    return {
      unitPrice: 400,
      subtotal,
      discount: 0,
      total,
      summaryType: 'Термоплёнка',
      details: [
        `Длина реза: ${safeLength || 0} м`,
        'Плёнка: белая',
        `Срочность: ${filmUrgent ? 'да (+30%)' : 'нет'}`,
        `Перенос на деталь: ${filmTransfer ? 'да (+300 ₽)' : 'нет'}`,
      ],
    };
  }, [filmLength, filmTransfer, filmUrgent, mugPrintType, mugQuantity, mugType, productType, tshirtGender, tshirtQuantity, tshirtSize, useOwnClothes]);

  const normalizedPhone = useMemo(() => phone.replace(/[\s()-]/g, ''), [phone]);
  const phoneValid = /^(\+7\d{10}|8\d{10})$/.test(normalizedPhone);
  const nameError = touched.name && !name.trim() ? 'Введите имя.' : '';
  const phoneError = touched.phone && !phoneValid ? 'Введите телефон в формате +7XXXXXXXXXX или 8XXXXXXXXXX.' : '';
  const agreeError = touched.agree && !agree ? 'Необходимо согласие с политикой.' : '';

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
        setFileError('Файл превышает 50 МБ. Уменьшите размер и повторите загрузку.');
        continue;
      }

      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setFileError('Недопустимый формат файла. Разрешены png, jpg, pdf, svg, ai, eps, cdr.');
        continue;
      }

      const isRaster = RASTER_EXTENSIONS.includes(ext);
      if (isRaster) hasRaster = true;

      if (!merged.some((item) => item.name === file.name && item.size === file.size)) {
        merged.push({ name: file.name, size: file.size, ext, isRaster });
      }
    }

    if (hasRaster || merged.some((item) => item.isRaster)) {
      setFileWarning('Макет будет проверен менеджером перед печатью');
    }

    setFiles(merged.slice(0, MAX_FILES));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setTouched({ name: true, phone: true, agree: true });

    if (!name.trim() || !phoneValid || !agree) {
      setSubmitError('Заполните обязательные поля формы.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        productType,
        configuration: {
          mugType,
          mugPrintType,
          mugQuantity,
          tshirtSize,
          tshirtGender,
          useOwnClothes,
          tshirtQuantity,
          filmLength: Number(filmLength) || 0,
          filmUrgent,
          filmTransfer,
        },
        pricing: {
          quantity,
          subtotal: Math.round(pricing.subtotal),
          discount: Math.round(pricing.discount),
          total: Math.round(pricing.total),
          details: pricing.details,
        },
        files: files.map((file) => file.name),
        contact: {
          name: name.trim(),
          phone: normalizedPhone,
          email: email.trim(),
          comment: comment.trim(),
          agreed: agree,
        },
      };

      const res = await fetch('/api/heat-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Не удалось отправить заявку.' }));
        throw new Error(data.error || 'Не удалось отправить заявку.');
      }

      setSubmitSuccess('Заявка отправлена. Менеджер свяжется с вами в ближайшее время.');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось отправить заявку.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="grid gap-6 lg:grid-cols-[1fr_360px]" onSubmit={onSubmit}>
      <section className="space-y-6">
        <div className="card space-y-4 p-4 md:p-6">
          <h2 className="text-lg font-semibold">Тип изделия</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <SegmentButton active={productType === 'mug'} onClick={() => setProductType('mug')} label="Кружка" />
            <SegmentButton active={productType === 'tshirt'} onClick={() => setProductType('tshirt')} label="Футболка" />
            <SegmentButton active={productType === 'film'} onClick={() => setProductType('film')} label="Термоплёнка" />
          </div>
        </div>

        {productType === 'mug' && (
          <div className="card space-y-4 p-4 md:p-6">
            <h3 className="text-lg font-semibold">Параметры кружки</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <SegmentButton active={mugType === 'white330'} onClick={() => setMugType('white330')} label="Белая кружка 330 мл" />
              <SegmentButton active={mugType === 'chameleon'} onClick={() => setMugType('chameleon')} label="Кружка хамелеон" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SegmentButton active={mugPrintType === 'single'} onClick={() => setMugPrintType('single')} label="Обычная (1 сторона)" />
              <SegmentButton active={mugPrintType === 'wrap'} onClick={() => setMugPrintType('wrap')} label="Круговая" />
            </div>
            <QuantityPicker quantity={mugQuantity} setQuantity={setMugQuantity} />
          </div>
        )}

        {productType === 'tshirt' && (
          <div className="card space-y-4 p-4 md:p-6">
            <h3 className="text-lg font-semibold">Параметры футболки</h3>
            <div className="grid gap-3 sm:grid-cols-5">
              {(['S', 'M', 'L', 'XL', 'XXL'] as TshirtSize[]).map((size) => (
                <SegmentButton key={size} active={tshirtSize === size} onClick={() => setTshirtSize(size)} label={size} />
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SegmentButton active={tshirtGender === 'male'} onClick={() => setTshirtGender('male')} label="Мужская" />
              <SegmentButton active={tshirtGender === 'female'} onClick={() => setTshirtGender('female')} label="Женская" />
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Печать: Формат A4 (фиксированная зона)</p>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
              <input type="checkbox" checked={useOwnClothes} onChange={(e) => setUseOwnClothes(e.target.checked)} className="h-4 w-4" />
              Своя вещь
            </label>
            {useOwnClothes && (
              <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300">
                Гарантия не распространяется на изделия заказчика
              </p>
            )}
            <QuantityPicker quantity={tshirtQuantity} setQuantity={setTshirtQuantity} />
          </div>
        )}

        {productType === 'film' && (
          <div className="card space-y-4 p-4 md:p-6">
            <h3 className="text-lg font-semibold">Параметры термоплёнки</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Плёнка: белая</p>
            <label className="space-y-2 text-sm font-medium">
              <span>Длина реза (м)</span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={filmLength}
                onChange={(e) => setFilmLength(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
              />
            </label>
            <CheckLine checked={filmUrgent} onChange={setFilmUrgent} label="Срочность +30%" />
            <CheckLine checked={filmTransfer} onChange={setFilmTransfer} label="Перенос на деталь +300 ₽" />
            <p className="text-xs text-neutral-500">Минимальная стоимость заказа: 400 ₽.</p>
          </div>
        )}

        <div className="card space-y-4 p-4 md:p-6">
          <h3 className="text-lg font-semibold">Файлы макета</h3>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              applyFiles(e.dataTransfer.files);
            }}
            className="rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm transition-colors hover:border-[var(--brand-red)] dark:border-neutral-700 dark:bg-neutral-900/50"
          >
            <p className="mb-3 text-neutral-600 dark:text-neutral-300">До 5 файлов, максимум 50 МБ на файл.</p>
            <label className="btn-primary inline-flex cursor-pointer">
              Загрузить файлы
              <input
                type="file"
                multiple
                accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) applyFiles(e.target.files);
                  e.currentTarget.value = '';
                }}
              />
            </label>
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

        <div className="card space-y-3 p-4 md:p-6">
          <h3 className="text-lg font-semibold">Контакты</h3>

          <InputField label="Имя" value={name} onChange={setName} onBlur={() => setTouched((prev) => ({ ...prev, name: true }))} />
          {nameError && <p className="-mt-2 text-sm text-red-600">{nameError}</p>}

          <InputField label="Телефон" value={phone} onChange={setPhone} onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))} placeholder="+7XXXXXXXXXX" />
          {phoneError && <p className="-mt-2 text-sm text-red-600">{phoneError}</p>}

          <InputField label="Email" value={email} onChange={setEmail} type="email" />

          <label className="space-y-2 text-sm font-medium">
            <span>Комментарий</span>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              onBlur={() => setTouched((prev) => ({ ...prev, agree: true }))}
              className="mt-1 h-4 w-4"
            />
            <span>
              Согласен с <Link href="/privacy" className="underline hover:no-underline">политикой обработки персональных данных</Link>
            </span>
          </label>
          {agreeError && <p className="-mt-2 text-sm text-red-600">{agreeError}</p>}
        </div>
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card rounded-2xl p-5 md:p-6">
          <h3 className="text-xl font-semibold">Расчёт стоимости</h3>
          <div className="mt-4 space-y-2 text-sm">
            <SummaryRow label="Тип изделия" value={pricing.summaryType} />
            {pricing.details.map((detail) => (
              <SummaryRow key={detail} label={detail.split(':')[0]} value={detail.split(':').slice(1).join(':').trim()} />
            ))}
            <SummaryRow label="Тираж" value={productType === 'film' ? '—' : `${quantity} шт`} />
            {pricing.discount > 0 && <SummaryRow label="Скидка" value={`-${formatMoney(pricing.discount)}`} />}
          </div>

          <div className="mt-6 rounded-xl bg-[var(--brand-red)]/10 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-[var(--brand-red)]">Итого</p>
            <p className="mt-1 text-3xl font-bold text-[var(--brand-red)]">{formatMoney(pricing.total)}</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Отправка…' : 'Заказать термоперенос'}
          </button>
          <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
            Стоимость ориентировочная. Финальный расчёт после проверки макета.
          </p>

          {submitError && <p className="mt-3 text-sm text-red-600">{submitError}</p>}
          {submitSuccess && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{submitSuccess}</p>}
        </div>
      </aside>
    </form>
  );
}

function SegmentButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
        active
          ? 'border-[var(--brand-red)] bg-[var(--brand-red)]/10 text-[var(--brand-red)]'
          : 'border-neutral-300 hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] dark:border-neutral-700'
      }`}
    >
      {label}
    </button>
  );
}

function QuantityPicker({ quantity, setQuantity }: { quantity: number; setQuantity: (value: number) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Тираж</p>
      <div className="flex flex-wrap gap-2">
        {QUICK_QTY.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setQuantity(value)}
            className={`rounded-xl border px-4 py-2 text-sm transition ${
              quantity === value
                ? 'border-[var(--brand-red)] bg-[var(--brand-red)]/10 text-[var(--brand-red)]'
                : 'border-neutral-300 hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] dark:border-neutral-700'
            }`}
          >
            {value}
          </button>
        ))}
      </div>
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
        className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
      />
      <p className="text-xs text-neutral-500">Скидка 10% применяется от 10 шт.</p>
    </div>
  );
}

function CheckLine({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
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
      <strong>{value}</strong>
    </p>
  );
}

function InputField({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
}) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
      />
    </label>
  );
}
