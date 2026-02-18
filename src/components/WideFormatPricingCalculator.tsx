'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  engineUiCatalog,
  type BannerDensity,
  type WideFormatMaterialType,
  type WideFormatWidthWarningCode,
} from '@/lib/engine';
import { trackEvent } from '@/lib/analytics';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import {
  getWideFormatCategoryByMaterial,
  type WideFormatCategory,
  WIDE_FORMAT_CATEGORY_OPTIONS,
  WIDE_FORMAT_VARIANTS_BY_CATEGORY,
  getWideFormatMaterialLabel,
  isExtrasAllowedForWideFormat,
  isBannerMaterial,
  isFilmMaterial,
  WIDE_FORMAT_PRICING_CONFIG,
} from '@/lib/pricing-config/wideFormat';
import ImageDropzone from '@/components/ImageDropzone';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type WideFormatQuote = {
  width: number;
  height: number;
  quantity: number;
  parsedValuesValid: boolean;
  positiveInputs: boolean;
  widthWarningCode: WideFormatWidthWarningCode;
  areaPerUnit: number;
  billableAreaPerUnit: number;
  perimeterPerUnit: number;
  basePrintCost: number;
  edgeGluingCost: number;
  imageWeldingCost: number;
  plotterCutCost: number;
  positioningMarksCutCost: number;
  extrasCost: number;
  totalCost: number;
};

type TransferredBagetImagePayload = {
  dataUrl: string;
  fileName: string;
};

const BAGET_TRANSFER_IMAGE_KEY = 'baget:transferred-image';
const SCROLL_OFFSET_PX = 90;

const WIDTH_WARNING_MESSAGES: Record<Exclude<WideFormatWidthWarningCode, null>, string> = {
  invalid_width: 'Введите корректную ширину.',
  max_width_exceeded: `Максимальная ширина — ${WIDE_FORMAT_PRICING_CONFIG.maxWidth} м.`,
};

const EMPTY_QUOTE: WideFormatQuote = {
  width: 0,
  height: 0,
  quantity: 0,
  parsedValuesValid: false,
  positiveInputs: false,
  widthWarningCode: null,
  areaPerUnit: 0,
  billableAreaPerUnit: 0,
  perimeterPerUnit: 0,
  basePrintCost: 0,
  edgeGluingCost: 0,
  imageWeldingCost: 0,
  plotterCutCost: 0,
  positioningMarksCutCost: 0,
  extrasCost: 0,
  totalCost: 0,
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('failed_to_read_file'));
    reader.readAsDataURL(file);
  });
}

export default function WideFormatPricingCalculator() {
  const router = useRouter();

  const [material, setMaterial] = useState<WideFormatMaterialType>('banner_240_gloss_3_2m');
  const [category, setCategory] = useState<WideFormatCategory>(getWideFormatCategoryByMaterial('banner_240_gloss_3_2m'));
  const [bannerDensity] = useState<BannerDensity>(300);
  const [width, setWidth] = useState<string>('1.2');
  const [height, setHeight] = useState<string>('1');
  const [quantity, setQuantity] = useState<string>('1');
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');

  const [edgeGluing, setEdgeGluing] = useState(false);
  const [imageWelding, setImageWelding] = useState(false);
  const [plotterCutByRegistrationMarks, setPlotterCutByRegistrationMarks] = useState(false);
  const [cutByPositioningMarks, setCutByPositioningMarks] = useState(false);

  const [canvasImageFile, setCanvasImageFile] = useState<File | null>(null);

  const [quote, setQuote] = useState<WideFormatQuote>(EMPTY_QUOTE);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [pricePulse, setPricePulse] = useState(false);

  const isCanvasMaterial = material.includes('canvas');

  const isBanner = isBannerMaterial(material);
  const isFilm = isFilmMaterial(material);
  const isExtrasAllowed = isExtrasAllowedForWideFormat(material);
  const availableVariants = WIDE_FORMAT_VARIANTS_BY_CATEGORY[category];
  const parsedWidth = Number(width);
  const canShowWelding = Number.isFinite(parsedWidth) && parsedWidth > WIDE_FORMAT_PRICING_CONFIG.maxWidth;

  const handleCategoryChange = (nextCategory: WideFormatCategory) => {
    setCategory(nextCategory);
    const nextMaterial = WIDE_FORMAT_VARIANTS_BY_CATEGORY[nextCategory][0]?.id;
    if (nextMaterial) {
      setMaterial(nextMaterial);
    }
  };

  useEffect(() => {
    setCategory(getWideFormatCategoryByMaterial(material));
  }, [material]);

  const quoteRequest = useMemo(() => ({
    material,
    bannerDensity,
    widthInput: width,
    heightInput: height,
    quantityInput: quantity,
    edgeGluing,
    imageWelding,
    plotterCutByRegistrationMarks,
    cutByPositioningMarks,
  }), [
    bannerDensity,
    cutByPositioningMarks,
    edgeGluing,
    height,
    imageWelding,
    material,
    plotterCutByRegistrationMarks,
    quantity,
    width,
  ]);
  const debouncedQuoteRequest = useDebouncedValue(quoteRequest, 300);
  const isQuotePending = quoteRequest !== debouncedQuoteRequest || isQuoteLoading;

  useEffect(() => {
    trackEvent('calculator_started', { calculator: 'wide_format' });
  }, []);

  useEffect(() => {
    trackEvent('calculator_updated', {
      calculator: 'wide_format',
      material,
      bannerDensity,
      width,
      height,
      quantity,
      edgeGluing,
      imageWelding,
      plotterCutByRegistrationMarks,
      cutByPositioningMarks,
    });
  }, [
    bannerDensity,
    cutByPositioningMarks,
    edgeGluing,
    height,
    imageWelding,
    material,
    plotterCutByRegistrationMarks,
    quantity,
    width,
  ]);

  useEffect(() => {
    setPricePulse(true);
    const timer = window.setTimeout(() => setPricePulse(false), 300);
    return () => window.clearTimeout(timer);
  }, [quote.totalCost]);

  useEffect(() => {
    if (!isBanner && edgeGluing) setEdgeGluing(false);
  }, [edgeGluing, isBanner]);

  useEffect(() => {
    if (!canShowWelding && imageWelding) setImageWelding(false);
  }, [canShowWelding, imageWelding]);

  useEffect(() => {
    if (!isFilm && plotterCutByRegistrationMarks) setPlotterCutByRegistrationMarks(false);
  }, [isFilm, plotterCutByRegistrationMarks]);

  useEffect(() => {
    if (!isExtrasAllowed) {
      setEdgeGluing(false);
      setImageWelding(false);
      setPlotterCutByRegistrationMarks(false);
      setCutByPositioningMarks(false);
    }
  }, [isExtrasAllowed]);

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
          body: JSON.stringify(debouncedQuoteRequest),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('failed');
        }

        const data = (await response.json()) as { quote: WideFormatQuote };

        if (active) {
          setQuote(data.quote);
          trackEvent('quote_generated', {
            calculator: 'wide_format',
            totalCost: data.quote.totalCost,
          });
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
  }, [debouncedQuoteRequest]);

  const widthWarning = quote.widthWarningCode ? WIDTH_WARNING_MESSAGES[quote.widthWarningCode] : '';
  const canShowPricingDetails = quote.parsedValuesValid && quote.positiveInputs && quote.widthWarningCode === null;
  const pricePerM2 = canShowPricingDetails && quote.billableAreaPerUnit > 0 && quote.quantity > 0
    ? quote.basePrintCost / (quote.billableAreaPerUnit * quote.quantity)
    : null;

  const formatRubles = (value: number) => `${Math.round(value).toLocaleString('ru-RU')} ₽`;

  const handleFrameInBaget = async () => {
    if (canvasImageFile) {
      try {
        const dataUrl = await fileToDataUrl(canvasImageFile);
        const payload: TransferredBagetImagePayload = {
          dataUrl,
          fileName: canvasImageFile.name,
        };
        localStorage.setItem(BAGET_TRANSFER_IMAGE_KEY, JSON.stringify(payload));
      } catch {
        localStorage.removeItem(BAGET_TRANSFER_IMAGE_KEY);
      }
    } else {
      localStorage.removeItem(BAGET_TRANSFER_IMAGE_KEY);
    }

    const params = new URLSearchParams();
    if (width.trim()) params.set('width', width.trim());
    if (height.trim()) params.set('height', height.trim());
    const query = params.toString();

    router.push(query ? `/baget?${query}` : '/baget');
  };

  const handleOrderClick = () => {
    trackEvent('order_button_clicked', { calculator: 'wide_format' });

    const parsedWidth = Number(width);
    const parsedHeight = Number(height);

    window.dispatchEvent(new CustomEvent('wideFormatPrefill', {
      detail: {
        widthM: width,
        heightM: height,
        widthMm: Number.isFinite(parsedWidth) ? Math.round(parsedWidth * 1000) : null,
        heightMm: Number.isFinite(parsedHeight) ? Math.round(parsedHeight * 1000) : null,
        quantity,
        materialId: material,
        materialLabel: getWideFormatMaterialLabel(material),
        edgeGluing,
        imageWelding,
        plotterCutByRegistrationMarks,
        cutByPositioningMarks,
      },
    }));

    const formTitle = document.getElementById('wide-format-form-title');
    if (formTitle) {
      const y = formTitle.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET_PX;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card p-5 md:p-6 space-y-4">
        <h2 className="text-xl font-semibold">Параметры заказа</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="material-category" className="text-sm font-medium">Категория</label>
            <Select value={category} onValueChange={(value) => handleCategoryChange(value as WideFormatCategory)}>
              <SelectTrigger id="material-category" className="h-[46px]">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Категории</SelectLabel>
                  {WIDE_FORMAT_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="material-variant" className="text-sm font-medium">Вариант</label>
            <Select value={material} onValueChange={(value) => setMaterial(value as WideFormatMaterialType)}>
              <SelectTrigger id="material-variant" className="h-[46px]">
                <SelectValue placeholder="Выберите вариант">
                  {getWideFormatMaterialLabel(material)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{WIDE_FORMAT_CATEGORY_OPTIONS.find((option) => option.id === category)?.label}</SelectLabel>
                  {availableVariants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

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

        {isExtrasAllowed && (
          <div className="space-y-2 pt-1">
            <p className="text-sm font-medium">Дополнительные услуги</p>
            {isBanner && <CheckboxRow label="Проклейка края (+50 ₽ за пог. метр)" checked={edgeGluing} onChange={setEdgeGluing} />}
            {canShowWelding && <CheckboxRow label="Сварка изображения (+150 ₽ за пог. метр)" checked={imageWelding} onChange={setImageWelding} />}
            {isFilm && <CheckboxRow label="Плоттерная резка по меткам (+25 ₽ за пог. метр)" checked={plotterCutByRegistrationMarks} onChange={setPlotterCutByRegistrationMarks} />}
            <CheckboxRow label="Резка по меткам позиционирования (+30% от материала)" checked={cutByPositioningMarks} onChange={setCutByPositioningMarks} />
          </div>
        )}

        {isCanvasMaterial && (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
            <h3 className="text-base font-semibold">Печать на холсте</h3>
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
              Для последующего оформления в багет можно сразу передать размеры и изображение в конфигуратор.
            </p>

            <div className="mt-3">
              <ImageDropzone
                value={canvasImageFile}
                onChange={setCanvasImageFile}
                title="Изображение (опционально)"
                helperText="JPG, PNG, WEBP, TIFF. До 50 МБ."
              />
            </div>

            <button
              type="button"
              onClick={handleFrameInBaget}
              className="mt-4 w-full rounded-xl bg-red-600 px-5 py-3 text-center text-sm font-semibold text-white transition-all hover:scale-[1.02] md:w-auto"
            >
              Оформить в багет
            </button>
          </div>
        )}

        {widthWarning && (
          <p className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            {widthWarning}
          </p>
        )}
      </section>

      <aside className="card h-fit p-5 md:p-6 space-y-4 lg:sticky lg:top-24">
        <h2 className="text-xl font-semibold">Расчёт</h2>
        <div className="space-y-2 text-sm">
          <SummaryRow label="Фактическая площадь" value={quote.parsedValuesValid ? `${(quote.areaPerUnit * quote.quantity).toFixed(2)} м²` : '—'} />
          {quote.parsedValuesValid && quote.billableAreaPerUnit !== quote.areaPerUnit && (
            <SummaryRow label="Тарифицируемая площадь" value={`${(quote.billableAreaPerUnit * quote.quantity).toFixed(2)} м²`} />
          )}
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
            <p className="text-sm font-medium">Материал</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">({(quote.billableAreaPerUnit * quote.quantity).toFixed(2)} м² × {pricePerM2 ? formatRubles(pricePerM2) : '—'})</p>
            <p className="text-sm font-semibold">= {formatRubles(quote.basePrintCost)}</p>
            {pricePerM2 && (
              <p className="text-right text-xs text-neutral-500 dark:text-neutral-400">
                {formatRubles(pricePerM2)} / м²
              </p>
            )}
          </div>
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
            <p className="text-sm font-medium">Доп. услуги</p>
            <p className="text-sm font-semibold">= {formatRubles(quote.extrasCost)}</p>
          </div>
          {quote.edgeGluingCost > 0 && <SummaryRow label="— Проклейка края" value={`${quote.edgeGluingCost.toLocaleString('ru-RU')} ₽`} />}
          {quote.imageWeldingCost > 0 && <SummaryRow label="— Сварка изображения" value={`${quote.imageWeldingCost.toLocaleString('ru-RU')} ₽`} />}
          {quote.plotterCutCost > 0 && <SummaryRow label="— Плоттерная резка" value={`${quote.plotterCutCost.toLocaleString('ru-RU')} ₽`} />}
          {quote.positioningMarksCutCost > 0 && <SummaryRow label="— Метки позиционирования" value={`${quote.positioningMarksCutCost.toLocaleString('ru-RU')} ₽`} />}
        </div>

        <div className="rounded-2xl border-2 border-red-500/30 bg-white p-6 shadow-xl dark:bg-neutral-900">
          <div className="mb-3 border-t border-neutral-200 pt-3 dark:border-neutral-700" />
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Итого</p>
          <p className={`mt-1 text-5xl font-extrabold transition-transform duration-300 md:text-6xl ${pricePulse ? 'scale-105' : 'scale-100'}`}>{quote.totalCost.toLocaleString('ru-RU')} ₽</p>
          <p className="min-h-4 text-xs text-neutral-500 dark:text-neutral-400" aria-live="polite">{isQuotePending ? 'Обновляем расчёт…' : ' '}</p>
          <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">Финальная цена без скрытых платежей.</p>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">Мы подтверждаем итоговую стоимость перед печатью.</p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">Цена может измениться в зависимости от наличия бумаги.</p>
          <Button variant="primary" className="mt-4 w-full" onClick={handleOrderClick}>Заказать печать</Button>
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

function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      <span className="text-sm">{label}</span>
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

function Button({
  children,
  variant,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  variant: 'primary';
  className?: string;
  onClick?: () => void;
}) {
  if (variant === 'primary') {
    return (
      <button type="button" onClick={onClick} className={`btn-primary ${className}`.trim()}>
        {children}
      </button>
    );
  }

  return null;
}
