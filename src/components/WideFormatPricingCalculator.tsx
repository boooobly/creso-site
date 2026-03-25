'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  type BannerDensity,
  type WideFormatWidthWarningCode,
  type WideFormatMaterialType,
} from '@/lib/engine';
import { trackEvent } from '@/lib/analytics';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import {
  calculateWideFormatPricing,
  type WideFormatCalculationResult,
  type WideFormatPricingInput,
} from '@/lib/calculations/wideFormatPricing';
import {
  getWideFormatCategoryByMaterial,
  type WideFormatCategory,
  getFirstVisibleWideFormatMaterial,
  getVisibleWideFormatCategoryOptions,
  getVisibleWideFormatVariantsByCategory,
  getWideFormatMaterialLabel,
  isExtrasAllowedForWideFormat,
  isBannerMaterial,
  isFilmMaterial,
  getWideFormatMaterialMaxWidth,
  WIDE_FORMAT_PUBLIC_PRICING_FALLBACK,
  type WideFormatPricingConfig,
} from '@/lib/pricing-config/wideFormat';
import {
  BAGET_TRANSFER_SOURCE_QUERY_KEY,
  BAGET_TRANSFER_SOURCE_WIDE_FORMAT_CANVAS,
} from '@/lib/baget/transfer';
import ImageDropzone from '@/components/ImageDropzone';
import Button from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type TransferredBagetImagePayload = {
  dataUrl: string;
  fileName: string;
};

const BAGET_TRANSFER_IMAGE_KEY = 'baget:transferred-image';
const SCROLL_OFFSET_PX = 90;

const WIDTH_WARNING_MESSAGES: Record<Exclude<WideFormatWidthWarningCode, null>, (maxWidth?: number) => string> = {
  invalid_width: () => 'Введите корректную ширину.',
  max_width_exceeded: (maxWidth) => `Размер не помещается в ширину рулона ${maxWidth ?? WIDE_FORMAT_PUBLIC_PRICING_FALLBACK.maxWidth} м. Одна из сторон макета должна быть не больше ${maxWidth ?? WIDE_FORMAT_PUBLIC_PRICING_FALLBACK.maxWidth} м.`,
};

const EMPTY_QUOTE: WideFormatCalculationResult = {
  width: 0,
  height: 0,
  quantity: 0,
  parsedValuesValid: false,
  positiveInputs: false,
  widthWarningCode: null,
  areaPerUnit: 0,
  billableAreaPerUnit: 0,
  perimeterPerUnit: 0,
  materialPricePerM2: 0,
  regularMaterialCost: 0,
  minimumPrintPriceApplied: false,
  basePrintCost: 0,
  edgeGluingCost: 0,
  imageWeldingCost: 0,
  requiresJoinSeam: false,
  grommetsCount: 0,
  grommetsCost: 0,
  plotterCutEstimatedCost: 0,
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

type WideFormatPricingCalculatorProps = {
  pricingConfig: WideFormatPricingConfig;
};

export default function WideFormatPricingCalculator({ pricingConfig }: WideFormatPricingCalculatorProps) {
  const router = useRouter();

  const initialMaterial = getFirstVisibleWideFormatMaterial(pricingConfig) ?? 'banner_240_gloss_3_2m';
  const [material, setMaterial] = useState<WideFormatMaterialType>(initialMaterial);
  const [category, setCategory] = useState<WideFormatCategory>(getWideFormatCategoryByMaterial(initialMaterial));
  const [bannerDensity] = useState<BannerDensity>(300);
  const [width, setWidth] = useState<string>('1.2');
  const [height, setHeight] = useState<string>('1');
  const [quantity, setQuantity] = useState<string>('1');

  const [edgeGluing, setEdgeGluing] = useState(false);
  const [imageWelding, setImageWelding] = useState(false);
  const [grommets, setGrommets] = useState(false);
  const [plotterCutByRegistrationMarks, setPlotterCutByRegistrationMarks] = useState(false);
  const [cutByPositioningMarks, setCutByPositioningMarks] = useState(false);

  const [canvasImageFile, setCanvasImageFile] = useState<File | null>(null);

  const [pricePulse, setPricePulse] = useState(false);

  const isCanvasMaterial = material.includes('canvas');
  const maxWidthForCurrentMaterial = getWideFormatMaterialMaxWidth(material, pricingConfig);

  const isBanner = isBannerMaterial(material);
  const isFilm = isFilmMaterial(material);
  const isExtrasAllowed = isExtrasAllowedForWideFormat(material);
  const visibleCategoryOptions = useMemo(() => getVisibleWideFormatCategoryOptions(pricingConfig), [pricingConfig]);
  const availableVariants = useMemo(() => getVisibleWideFormatVariantsByCategory(category, pricingConfig), [category, pricingConfig]);
  const parsedWidth = Number(width);
  const canShowWelding = Number.isFinite(parsedWidth) && parsedWidth > pricingConfig.bannerJoinSeamWidthThreshold;

  const handleCategoryChange = (nextCategory: WideFormatCategory) => {
    setCategory(nextCategory);
    const nextMaterial = getVisibleWideFormatVariantsByCategory(nextCategory, pricingConfig)[0]?.id;
    if (nextMaterial) {
      setMaterial(nextMaterial);
    }
  };

  useEffect(() => {
    setCategory(getWideFormatCategoryByMaterial(material));
  }, [material]);

  useEffect(() => {
    if (availableVariants.some((variant) => variant.id === material)) return;

    const nextVisibleMaterial = availableVariants[0]?.id ?? getFirstVisibleWideFormatMaterial(pricingConfig);
    if (nextVisibleMaterial) {
      setMaterial(nextVisibleMaterial);
      setCategory(getWideFormatCategoryByMaterial(nextVisibleMaterial));
    }
  }, [availableVariants, material, pricingConfig]);

  const quoteRequest = useMemo<WideFormatPricingInput>(() => ({
    material,
    bannerDensity,
    widthInput: width,
    heightInput: height,
    quantityInput: quantity,
    edgeGluing,
    imageWelding,
    grommets,
    plotterCutByRegistrationMarks,
    cutByPositioningMarks,
  }), [
    bannerDensity,
    cutByPositioningMarks,
    edgeGluing,
    height,
    imageWelding,
    grommets,
    material,
    plotterCutByRegistrationMarks,
    quantity,
    width,
  ]);
  const quote = useMemo(
    () => (visibleCategoryOptions.length === 0 ? EMPTY_QUOTE : calculateWideFormatPricing(quoteRequest, pricingConfig)),
    [pricingConfig, quoteRequest, visibleCategoryOptions.length],
  );
  const debouncedQuote = useDebouncedValue(quote, 300);

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
      grommets,
      plotterCutByRegistrationMarks,
      cutByPositioningMarks,
    });
  }, [
    bannerDensity,
    cutByPositioningMarks,
    edgeGluing,
    height,
    imageWelding,
    grommets,
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
    if (!isBanner && grommets) setGrommets(false);
  }, [edgeGluing, grommets, isBanner]);

  useEffect(() => {
    if (!canShowWelding && imageWelding) setImageWelding(false);
  }, [canShowWelding, imageWelding]);

  useEffect(() => {
    if (!isFilm && plotterCutByRegistrationMarks) setPlotterCutByRegistrationMarks(false);
  }, [isFilm, plotterCutByRegistrationMarks]);

  useEffect(() => {
    if (isBanner && cutByPositioningMarks) setCutByPositioningMarks(false);
  }, [cutByPositioningMarks, isBanner]);

  useEffect(() => {
    if (!isExtrasAllowed) {
      setEdgeGluing(false);
      setImageWelding(false);
      setGrommets(false);
      setPlotterCutByRegistrationMarks(false);
      setCutByPositioningMarks(false);
    }
  }, [isExtrasAllowed]);

  useEffect(() => {
    if (visibleCategoryOptions.length === 0) {
      return;
    }
    trackEvent('quote_generated', {
      calculator: 'wide_format',
      totalCost: debouncedQuote.totalCost,
    });
  }, [debouncedQuote.totalCost, visibleCategoryOptions.length]);

  const widthWarning = quote.widthWarningCode
    ? WIDTH_WARNING_MESSAGES[quote.widthWarningCode](maxWidthForCurrentMaterial)
    : '';
  const canShowPricingDetails = quote.parsedValuesValid && quote.positiveInputs && quote.widthWarningCode === null;
  const pricePerM2 = canShowPricingDetails && quote.materialPricePerM2 > 0
    ? quote.materialPricePerM2
    : null;
  const totalPerUnit = quote.quantity > 0 ? quote.totalCost / quote.quantity : null;

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

    const parsedWidth = Number(width.trim());
    const parsedHeight = Number(height.trim());
    const widthMm = Number.isFinite(parsedWidth) ? Math.round(parsedWidth * 1000) : null;
    const heightMm = Number.isFinite(parsedHeight) ? Math.round(parsedHeight * 1000) : null;

    const params = new URLSearchParams();
    if (widthMm !== null) params.set('width', String(widthMm));
    if (heightMm !== null) params.set('height', String(heightMm));
    params.set(BAGET_TRANSFER_SOURCE_QUERY_KEY, BAGET_TRANSFER_SOURCE_WIDE_FORMAT_CANVAS);
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
        grommets,
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.03fr)_minmax(0,0.97fr)] lg:items-stretch">
      <section className="card flex h-full flex-col space-y-6 border-neutral-200/85 p-5 shadow-sm shadow-neutral-200/50 md:p-6">
        <h2 className="text-xl font-semibold tracking-tight">Параметры заказа</h2>

        {visibleCategoryOptions.length === 0 ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Сейчас в публичном конструкторе нет доступных материалов. Попросите менеджера включить хотя бы один материал в разделе цен.
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="material-category" className="text-sm font-medium">Категория</label>
            <Select value={category} onValueChange={(value) => handleCategoryChange(value as WideFormatCategory)} disabled={visibleCategoryOptions.length === 0}>
              <SelectTrigger id="material-category" className="h-11 rounded-xl border-neutral-300 bg-neutral-50 px-3.5 text-[15px]">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Категории</SelectLabel>
                  {visibleCategoryOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="material-variant" className="text-sm font-medium">Вариант</label>
            <Select value={material} onValueChange={(value) => setMaterial(value as WideFormatMaterialType)} disabled={availableVariants.length === 0}>
              <SelectTrigger id="material-variant" className="h-11 rounded-xl border-neutral-300 bg-neutral-50 px-3.5 text-[15px]">
                <SelectValue placeholder="Выберите вариант">
                  {getWideFormatMaterialLabel(material)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{visibleCategoryOptions.find((option) => option.id === category)?.label ?? 'Материалы'}</SelectLabel>
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
              step="0.01"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="h-11 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 text-[15px] transition-colors focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:bg-neutral-900"
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
              className="h-11 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 text-[15px] transition-colors focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:bg-neutral-900"
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
            className="h-11 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 text-[15px] transition-colors focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        {isExtrasAllowed && (
          <div className="space-y-2.5 border-t border-neutral-200/80 pt-4">
            <p className="text-sm font-medium text-neutral-800">Дополнительные услуги</p>
            {isBanner && <CheckboxRow label="Проклейка края (+50 ₽ за пог. метр)" checked={edgeGluing} onChange={setEdgeGluing} />}
            {isBanner && <CheckboxRow label={`Люверсы (${pricingConfig.grommetPrice} ₽/шт${quote.grommetsCount > 0 ? `, ~${quote.grommetsCount} шт` : ""})`} checked={grommets} onChange={setGrommets} />}
            {isBanner && canShowWelding && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                При ширине больше {pricingConfig.bannerJoinSeamWidthThreshold} м автоматически добавляется одна проклейка стыка полотен.
              </p>
            )}
            {isFilm && <CheckboxRow label="Резка по меткам (от 250 ₽, точно после утверждения макета)" checked={plotterCutByRegistrationMarks} onChange={setPlotterCutByRegistrationMarks} />}
            {!isBanner && (
              <CheckboxRow
                label="Резка по меткам позиционирования (+30% от материала)"
                checked={cutByPositioningMarks}
                onChange={setCutByPositioningMarks}
              />
            )}
          </div>
        )}

        {isCanvasMaterial && (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/85 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
            <h3 className="text-base font-semibold">Печать на холсте</h3>
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
              Для последующего оформления в багет можно сразу передать размеры и изображение в конфигуратор.
            </p>
            <p className="mt-2 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              Максимальная ширина печати холста одним макетом - 1,45 м
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

      <aside className="card flex h-full flex-col space-y-5 border-neutral-200/85 p-5 shadow-sm shadow-neutral-200/50 md:p-6">
        <h2 className="text-xl font-semibold tracking-tight">Расчёт</h2>
        <div className="space-y-2 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3.5 text-sm dark:border-neutral-800 dark:bg-neutral-900/60">
          <SummaryRow label="Фактическая площадь" value={quote.parsedValuesValid ? `${(quote.areaPerUnit * quote.quantity).toFixed(2)} м²` : '—'} />
          <SummaryRow label="Тарифицируемая площадь" value={quote.parsedValuesValid ? `${(quote.billableAreaPerUnit * quote.quantity).toFixed(2)} м²` : '—'} />
        </div>
        <div className="space-y-2.5 text-sm">
          <div className="rounded-xl border border-neutral-200/80 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60">
            <p className="text-sm font-medium text-neutral-900">Материал</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">({(quote.billableAreaPerUnit * quote.quantity).toFixed(2)} м² × {pricePerM2 ? formatRubles(pricePerM2) : '—'})</p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">= {formatRubles(quote.regularMaterialCost)}</p>
            {pricePerM2 && (
              <p className="text-right text-xs text-neutral-500 dark:text-neutral-400">
                {formatRubles(pricePerM2)} / м²
              </p>
            )}
          </div>
          {quote.extrasCost > 0 && (
            <div className="rounded-xl border border-neutral-200/80 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60">
              <p className="text-sm font-medium text-neutral-900">Доп. услуги</p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">= {formatRubles(quote.extrasCost)}</p>
            </div>
          )}
          {quote.minimumPrintPriceApplied && (
            <SummaryRow
              label="Минимальная стоимость печати"
              value={`${pricingConfig.minimumPrintPriceRUB.toLocaleString('ru-RU')} ₽`}
            />
          )}
          {quote.edgeGluingCost > 0 && <SummaryRow label="— Проклейка края" value={`${quote.edgeGluingCost.toLocaleString('ru-RU')} ₽`} />}
          {quote.imageWeldingCost > 0 && <SummaryRow label={`— Проклейка стыка полотен${quote.requiresJoinSeam ? ' (авто)' : ''}`} value={`${quote.imageWeldingCost.toLocaleString('ru-RU')} ₽`} />}
          {plotterCutByRegistrationMarks && <SummaryRow label="— Резка по меткам" value={`от ${pricingConfig.plotterCutMinimumFee.toLocaleString('ru-RU')} ₽ (оценочно, рассчитает менеджер)`} />}
          {quote.grommetsCost > 0 && <SummaryRow label={`— Люверсы (${quote.grommetsCount} шт)`} value={`${quote.grommetsCost.toLocaleString('ru-RU')} ₽`} />}
          {quote.positioningMarksCutCost > 0 && <SummaryRow label="— Метки позиционирования" value={`${quote.positioningMarksCutCost.toLocaleString('ru-RU')} ₽`} />}
          {isFilm && (
            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              Стоимость резки по меткам рассчитывается менеджером после проверки и утверждения макета.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-red-500/25 bg-gradient-to-b from-red-50/35 via-white to-white p-5 shadow-[0_20px_36px_-30px_rgba(220,38,38,0.5)] dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900">
          <div className="space-y-2 border-t border-neutral-200 pt-3 dark:border-neutral-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Итого</p>
            <p className={`text-[2.55rem] font-semibold leading-none tracking-tight text-neutral-900 transition-transform duration-300 dark:text-neutral-50 ${pricePulse ? 'scale-[1.02]' : 'scale-100'}`}>{quote.totalCost.toLocaleString('ru-RU')} ₽</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Цена за 1 шт: {totalPerUnit ? totalPerUnit.toLocaleString('ru-RU') : '—'} ₽
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              ≈ {pricePerM2 ? Math.round(pricePerM2).toLocaleString('ru-RU') : '—'} ₽ / м²
            </p>
          </div>
          <p className="min-h-4 text-xs text-neutral-500 dark:text-neutral-400" aria-live="polite"> </p>
          <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">Финальная цена без скрытых платежей.</p>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">Мы подтверждаем итоговую стоимость перед печатью.</p>
          <Button variant="primary" className="mt-4 w-full" onClick={handleOrderClick} disabled={visibleCategoryOptions.length === 0}>Заказать печать</Button>
        </div>

        <div className="mt-auto space-y-2 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900/60">
          <p>Срок изготовления: <b>1–2 рабочих дня</b></p>
          <p>Максимальная ширина печати: <b>3.2 м</b></p>
        </div>
        <span className="sr-only" aria-live="polite">{quote.totalCost.toLocaleString('ru-RU')}</span>
      </aside>
    </div>
  );
}

function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3.5 py-2.5 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--brand-red)]"
      />
      <span className="text-sm leading-5 text-neutral-700 dark:text-neutral-200">{label}</span>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex items-center text-sm leading-6">
      <span className="text-neutral-600 dark:text-neutral-300">{label}</span>
      <span className="mx-3 flex-1 border-b border-dashed border-neutral-300 dark:border-neutral-700" />
      <b className="font-semibold text-neutral-900 dark:text-neutral-50">{value}</b>
    </p>
  );
}
