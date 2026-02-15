'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  engineParsers,
  engineUiCatalog,
  type BannerDensity,
  type WideFormatMaterialType,
  type WideFormatWidthWarningCode,
} from '@/lib/engine';

type WideFormatQuote = {
  width: number;
  height: number;
  quantity: number;
  grommets: number;
  parsedValuesValid: boolean;
  positiveInputs: boolean;
  widthWarningCode: WideFormatWidthWarningCode;
  areaPerUnit: number;
  perimeterPerUnit: number;
  basePrintCost: number;
  edgeGluingCost: number;
  grommetsCost: number;
  extrasCost: number;
  totalCost: number;
};

const WIDTH_WARNING_MESSAGES: Record<Exclude<WideFormatWidthWarningCode, null>, string> = {
  invalid_width: 'Введите корректную ширину.',
  max_width_exceeded: `Максимальная ширина — ${engineUiCatalog.wideFormat.maxWidth} м.`,
  banner_width_out_of_range: 'Для баннера допустимая ширина: 1.2–3 м.',
  sheet_width_out_of_range: 'Для плёнки и бумаги допустимая ширина: 1.06–1.6 м.',
};

const EMPTY_QUOTE: WideFormatQuote = {
  width: 0,
  height: 0,
  quantity: 0,
  grommets: 0,
  parsedValuesValid: false,
  positiveInputs: false,
  widthWarningCode: null,
  areaPerUnit: 0,
  perimeterPerUnit: 0,
  basePrintCost: 0,
  edgeGluingCost: 0,
  grommetsCost: 0,
  extrasCost: 0,
  totalCost: 0,
};

export default function WideFormatPricingCalculator() {
  const [material, setMaterial] = useState<WideFormatMaterialType>('banner');
  const [bannerDensity, setBannerDensity] = useState<BannerDensity>(300);
  const [width, setWidth] = useState<string>('1.2');
  const [height, setHeight] = useState<string>('1');
  const [quantity, setQuantity] = useState<string>('1');
  const [edgeGluing, setEdgeGluing] = useState(false);
  const [grommets, setGrommets] = useState<string>('0');

  const [quote, setQuote] = useState<WideFormatQuote>(EMPTY_QUOTE);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchQuote = async () => {
      setIsQuoteLoading(true);
      setQuoteError('');

      try {
        const response = await fetch('/api/quotes/wide-format', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            material,
            bannerDensity,
            widthInput: width,
            heightInput: height,
            quantityInput: quantity,
            grommetsInput: grommets,
            edgeGluing,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('failed');
        }

        const data = (await response.json()) as { quote: WideFormatQuote };

        if (active) {
          setQuote(data.quote);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        if (active) {
          setQuoteError('Ошибка расчёта');
          setQuote(EMPTY_QUOTE);
        }
      } finally {
        if (active) {
          setIsQuoteLoading(false);
        }
      }
    };

    fetchQuote();

    return () => {
      active = false;
      controller.abort();
    };
  }, [bannerDensity, edgeGluing, grommets, height, material, quantity, width]);

  const widthWarning = quote.widthWarningCode ? WIDTH_WARNING_MESSAGES[quote.widthWarningCode] : '';

  const sendCalculationHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set('service', 'Широкоформатная печать');

    const calcSummary = [
      `Материал: ${material}`,
      `Плотность: ${material === 'banner' ? `${bannerDensity}g` : '—'}`,
      `Ширина: ${width}`,
      `Высота: ${height}`,
      `Количество: ${quantity}`,
      `Люверсы: ${grommets}`,
      `Проклейка края: ${edgeGluing ? 'Да' : 'Нет'}`,
      `Итого: ${Math.round(quote.totalCost)} ₽`,
    ].join('; ');

    params.set('calc', calcSummary);
    return `/contacts?${params.toString()}#contact-form`;
  }, [bannerDensity, edgeGluing, grommets, height, material, quantity, quote.totalCost, width]);


  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card p-5 md:p-6 space-y-4">
        <h2 className="text-xl font-semibold">Параметры заказа</h2>

        <div className="space-y-2">
          <label htmlFor="material" className="text-sm font-medium">Материал</label>
          <div className="relative">
            <select
              id="material"
              value={material}
              onChange={(e) => setMaterial(e.target.value as WideFormatMaterialType)}
              className="w-full appearance-none rounded-xl border border-neutral-300 bg-white p-3 pr-10 dark:border-neutral-700 dark:bg-neutral-900"
            >
              {engineUiCatalog.wideFormat.materialOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <SelectArrow />
          </div>
        </div>

        {material === 'banner' && (
          <div className="space-y-2">
            <label htmlFor="density" className="text-sm font-medium">Плотность</label>
            <div className="relative">
              <select
                id="density"
                value={bannerDensity}
                onChange={(e) => setBannerDensity(engineParsers.parseIntegerInput(e.target.value, 300) as BannerDensity)}
                className="w-full appearance-none rounded-xl border border-neutral-300 bg-white p-3 pr-10 dark:border-neutral-700 dark:bg-neutral-900"
              >
                {[220, 300, 440].map((density) => (
                  <option key={density} value={density}>{density}g</option>
                ))}
              </select>
              <SelectArrow />
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="width" className="text-sm font-medium">Ширина (м)</label>
            <input
              id="width"
              type="number"
              min={0}
              max={engineUiCatalog.wideFormat.maxWidth}
              step="0.01"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="height" className="text-sm font-medium">Высота (м)</label>
            <input
              id="height"
              type="number"
              min={0}
              step="0.01"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="quantity" className="text-sm font-medium">Количество</label>
            <input
              id="quantity"
              type="number"
              min={1}
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="grommets" className="text-sm font-medium">Люверсы (шт.)</label>
            <input
              id="grommets"
              type="number"
              min={0}
              step="1"
              value={grommets}
              onChange={(e) => setGrommets(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={edgeGluing}
            onChange={(e) => setEdgeGluing(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium">Проклейка края (+40 ₽ за пог. метр)</span>
        </label>

        {widthWarning && (
          <p className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            {widthWarning}
          </p>
        )}
      </section>

      <aside className="card h-fit p-5 md:p-6 space-y-4 lg:sticky lg:top-24">
        <h2 className="text-xl font-semibold">Расчёт</h2>
        <div className="space-y-2 text-sm">
          <SummaryRow label="Площадь" value={quote.parsedValuesValid ? `${(quote.areaPerUnit * quote.quantity).toFixed(2)} м²` : '—'} />
          <SummaryRow label="Базовая печать" value={`${quote.basePrintCost.toLocaleString('ru-RU')} ₽`} />
          <SummaryRow label="Доп. услуги" value={`${quote.extrasCost.toLocaleString('ru-RU')} ₽`} />
        </div>

        <div className="rounded-2xl border-2 border-red-500/30 bg-white p-6 shadow-xl dark:bg-neutral-900">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Итого</p>
          <p className="mt-1 text-4xl font-extrabold md:text-5xl">{quote.totalCost.toLocaleString('ru-RU')} ₽</p>
          <Button variant="primary" className="mt-4 w-full">Заказать печать</Button>
          <Link href={sendCalculationHref} className="btn-secondary mt-3 w-full justify-center no-underline">Send this calculation</Link>
          <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
            Стоимость ориентировочная. Финальный расчет после проверки макета.
          </p>
        </div>

        <div className="space-y-2 rounded-xl border border-neutral-200/80 bg-neutral-50 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900/60">
          <p>Срок изготовления: <b>1–2 рабочих дня</b></p>
          <p>Максимальная ширина печати: <b>3.2 м</b></p>
          <p>Работаем с <b>НДС</b></p>
        </div>
        <span className="sr-only" aria-live="polite">{isQuoteLoading ? 'loading' : quoteError}</span>
      </aside>
    </div>
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
}: {
  children: React.ReactNode;
  variant: 'primary';
  className?: string;
}) {
  if (variant === 'primary') {
    return (
      <button type="button" className={`btn-primary ${className}`.trim()}>
        {children}
      </button>
    );
  }

  return null;
}
