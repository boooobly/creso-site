'use client';

import {
  ChangeEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { bagetQuote } from '@/lib/calculations/bagetQuote';
import type { BaguetteExtrasPricingConfig } from '@/lib/baget/baguetteExtrasPricing';
import { canFulfillFrameFromPieces, computeRequiredSidesMeters, parseResiduesToPieces } from '@/lib/baget/stockPieces';
import { normalizeBagetImageUrl } from '@/lib/baget/normalizeBagetImageUrl';
import type { BagetSheetItem } from '@/lib/baget/sheetsCatalog';
import { getInitialBagetPrintRequirement, type BagetPrintRequirement, type BagetTransferSource } from '@/lib/baget/printRequirement';
import BagetCard, { BagetItem } from './BagetCard';
import BagetFilters, { FilterState, MaterialsState } from './BagetFilters';
import BagetOrderModal, { BagetOrderRequestBagetInput, BagetOrderSummary } from './BagetOrderModal';
import BagetPreview, { type BagetPreviewProps } from './BagetPreview';
import InfoTooltip from './InfoTooltip';

const ITEMS_PER_PAGE = 16;


const BAGET_TRANSFER_IMAGE_KEY = 'baget:transferred-image';

type TransferredBagetImagePayload = {
  dataUrl: string;
  fileName: string;
};

const GLAZING_LABELS: Record<MaterialsState['glazing'], string> = {
  none: 'Без остекления',
  glass: 'Стекло',
  antiReflectiveGlass: 'Антибликовое стекло',
  plexiglass: 'Оргстекло',
  pet1mm: 'ПЭТ 1мм',
};

const WORK_TYPE_LABELS: Record<MaterialsState['workType'], string> = {
  canvas: 'Картина на основе',
  stretchedCanvas: 'Холст на подрамнике',
  rhinestone: 'Стразы',
  embroidery: 'Вышивка',
  beads: 'Бисер',
  photo: 'Фото',
  other: 'Другое',
};

const PASSEPARTOUT_COLOR_LABELS: Record<MaterialsState['passepartoutColor'], string> = {
  white: 'Белый',
  cream: 'Кремовый',
  ivory: 'Слоновая кость',
  lightBeige: 'Светло-бежевый',
  beige: 'Бежевый',
  sand: 'Песочный',
  lightGray: 'Светло-серый',
  gray: 'Серый',
  graphite: 'Графит',
  black: 'Чёрный',
  brown: 'Коричневый',
  darkBlue: 'Темно-синий',
  burgundy: 'Бордовый',
  olive: 'Оливковый',
};

const initialFilters: FilterState = {
  color: 'all',
  style: 'all',
  widthMin: 0,
  widthMax: 100,
  priceMin: 0,
  priceMax: 5000,
};

const initialMaterials: MaterialsState = {
  glazing: 'none',
  passepartout: false,
  passepartoutMm: 40,
  passepartoutBottomMm: 55,
  passepartoutColor: 'white',
  backPanel: true,
  hanging: 'crocodile',
  stand: false,
  workType: 'canvas',
  stretcherType: 'narrow',
  frameMode: 'framed',
};

type CatalogBagetItem = BagetItem & {
  residues_text: string;
  reserve_mm: number;
  show_on_site: boolean;
};

const BAGET_PLACEHOLDER_IMAGE = '/images/outdoor-portfolio/placeholder-1.svg';

type BagetConfiguratorProps = {
  items: BagetSheetItem[];
  initialWidth?: string;
  initialHeight?: string;
  initialWorkType?: MaterialsState['workType'];
  initialTransferSource?: BagetTransferSource;
  pricingConfig: BaguetteExtrasPricingConfig;
};

function normalizeInitialDimension(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 50) return fallback;
  return String(Math.round(parsed));
}

export default function BagetConfigurator({
  items,
  initialWidth,
  initialHeight,
  initialWorkType,
  initialTransferSource,
  pricingConfig,
}: BagetConfiguratorProps) {
  const [widthInput, setWidthInput] = useState(() => normalizeInitialDimension(initialWidth, '500'));
  const [heightInput, setHeightInput] = useState(() => normalizeInitialDimension(initialHeight, '700'));
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [materials, setMaterials] = useState<MaterialsState>({
    ...initialMaterials,
    ...(initialWorkType ? { workType: initialWorkType } : {}),
  });
  const [printRequirement, setPrintRequirement] = useState<BagetPrintRequirement>(() => getInitialBagetPrintRequirement(initialTransferSource));
  const catalogItems = useMemo<CatalogBagetItem[]>(
    () =>
      items.map((item) => {
        const plankImage = normalizeBagetImageUrl(item.image_url);
        const cornerImage = normalizeBagetImageUrl(item.corner_image_url);
        const plankTexture = (item.image_url || '').trim();
        const cornerTextureFallback = (item.corner_image_url || '').trim();

        return {
          id: item.id,
          article: item.article,
          name: item.name,
          color: item.color,
          style: item.style,
          width_mm: item.width_mm,
          price_per_meter: item.price_per_meter,
          cardImage: cornerImage || plankImage || BAGET_PLACEHOLDER_IMAGE,
          frameTextureImage: plankTexture || cornerTextureFallback || '',
          fallbackImage: plankImage || BAGET_PLACEHOLDER_IMAGE,
          residues_text: item.residues_text,
          reserve_mm: Number.isFinite(item.reserve_mm) ? item.reserve_mm : 10,
          show_on_site: item.show_on_site,
        };
      }),
    [items],
  );
  const [selectedBaget, setSelectedBaget] = useState<CatalogBagetItem | null>(catalogItems[0] ?? null);
  const [page, setPage] = useState(1);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [previewHighlighted, setPreviewHighlighted] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewZoomed, setIsPreviewZoomed] = useState(false);
  const [previewZoomOrigin, setPreviewZoomOrigin] = useState({ xPct: 50, yPct: 50 });
  const [hoverZoomEnabled, setHoverZoomEnabled] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const previewTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const storedPayload = localStorage.getItem(BAGET_TRANSFER_IMAGE_KEY);
    if (!storedPayload) return;

    try {
      const parsed = JSON.parse(storedPayload) as Partial<TransferredBagetImagePayload>;
      if (typeof parsed.dataUrl === 'string' && parsed.dataUrl) {
        setImageUrl(parsed.dataUrl);
        setUploadedImageFile(null);
        setFileName(typeof parsed.fileName === 'string' && parsed.fileName ? parsed.fileName : 'Переданное изображение');
      }
    } catch {
      // ignore malformed local storage payload
    } finally {
      localStorage.removeItem(BAGET_TRANSFER_IMAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(hover: hover)');
    const update = () => setHoverZoomEnabled(media.matches);

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isPreviewOpen) {
      setIsPreviewZoomed(false);
      setPreviewZoomOrigin({ xPct: 50, yPct: 50 });
    }
  }, [isPreviewOpen]);

  useEffect(() => {
    if (!isPreviewOpen) return;
    const previewTrigger = previewTriggerRef.current;

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPreviewOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEsc);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onEsc);
      previewTrigger?.focus();
    };
  }, [isPreviewOpen]);

  const widthMm = Number(widthInput);
  const heightMm = Number(heightInput);
  const validSize = Number.isFinite(widthMm) && Number.isFinite(heightMm) && widthMm >= 50 && heightMm >= 50;
  const passepartoutMm = Math.max(0, materials.passepartoutMm);
  const passepartoutBottomMm = Math.max(0, materials.passepartoutBottomMm);
  const isNoFrameStretchedCanvas = materials.workType === 'stretchedCanvas' && materials.frameMode === 'noFrame';
  const isPassepartoutSizeAllowed = Number.isFinite(widthMm) && Number.isFinite(heightMm) ? widthMm <= 1000 && heightMm <= 700 : true;
  const isPassepartoutAllowed = !isNoFrameStretchedCanvas && isPassepartoutSizeAllowed;
  const isGlazingAllowed = !isNoFrameStretchedCanvas;
  const selectedBagetForQuote = isNoFrameStretchedCanvas ? null : selectedBaget;
  const quote = useMemo(
    () =>
      bagetQuote({
        width: widthMm,
        height: heightMm,
        quantity: 1,
        selectedBaget: selectedBagetForQuote,
        workType: materials.workType,
        frameMode: materials.workType === 'stretchedCanvas' ? materials.frameMode : 'framed',
        glazing: materials.glazing,
        hasPassepartout: materials.passepartout,
        passepartoutSize: passepartoutMm,
        passepartoutBottomSize: passepartoutBottomMm,
        backPanel: materials.backPanel,
        hangerType: materials.hanging,
        stand: materials.stand,
        stretcherType: materials.stretcherType,
        requiresPrint: printRequirement.requiresPrint,
        printMaterial: printRequirement.printMaterial,
        transferSource: printRequirement.transferSource,
      }, pricingConfig),
    [
      heightMm,
      materials.backPanel,
      materials.frameMode,
      materials.glazing,
      materials.hanging,
      materials.passepartout,
      materials.stand,
      materials.stretcherType,
      materials.workType,
      passepartoutBottomMm,
      passepartoutMm,
      printRequirement.printMaterial,
      printRequirement.requiresPrint,
      printRequirement.transferSource,
      selectedBagetForQuote,
      pricingConfig,
      widthMm,
    ],
  );

  const standAllowed = quote.meta?.standAllowed ?? false;
  const stretcherNarrowAllowed = quote.meta?.stretcherNarrowAllowed ?? false;
  const effectiveWidthMm = quote.effectiveSize.width;
  const effectiveHeightMm = quote.effectiveSize.height;
  const calcMeta = quote.meta ?? {};
  const autoAdditions = calcMeta.autoAdditions;


  const summaryCostRows = useMemo<Array<{
    key: string;
    label: ReactNode;
    value: number;
    note?: ReactNode;
  }>>(() => {
    const rows = [
      {
        key: 'print',
        label: calcMeta.printMaterial === 'paper' ? 'Печать на бумаге:' : 'Печать на холсте:',
        value: Number(calcMeta.printCost ?? 0),
      },
      {
        key: 'materials',
        label: 'Материалы:',
        value: Number(calcMeta.materialsCost ?? 0),
      },
      {
        key: 'pvc',
        label: 'ПВХ:',
        value: Number(calcMeta.pvcCost ?? 0),
        note: autoAdditions?.pvcType !== 'none' ? <span className="ml-2 text-xs text-neutral-500">Добавлено автоматически</span> : undefined,
      },
      {
        key: 'orabond',
        label: (
          <span className="inline-flex items-center gap-1">
            Orabond:
            <InfoTooltip
              text="Orabond - клеевой материал для накатки изображения на основу. Нужен для надежной фиксации изображения без пузырей и отслоений."
              ariaLabel="Что такое Orabond"
            />
          </span>
        ),
        value: Number(calcMeta.orabondCost ?? 0),
        note: autoAdditions?.addOrabond ? <span className="ml-2 text-xs text-neutral-500">Добавлено автоматически</span> : undefined,
      },
      {
        key: 'hanging',
        label: `${String(calcMeta.hangingLabel ?? '')}:`,
        value: Number(calcMeta.hangingCost ?? 0),
      },
      {
        key: 'stand',
        label: 'Ножка-подставка:',
        value: Number(calcMeta.standCost ?? 0),
      },
      {
        key: 'stretcher',
        label: 'Подрамник:',
        value: Number(calcMeta.stretcherCost ?? 0),
        note: materials.workType === 'stretchedCanvas'
          ? <span className="ml-2 text-xs text-neutral-500">{materials.stretcherType === 'narrow' ? 'Узкий (2 см)' : 'Широкий (4 см)'}</span>
          : undefined,
      },
      {
        key: 'stretching',
        label: 'Натяжка:',
        value: Number(calcMeta.stretchingCost ?? 0),
        note: calcMeta.stretchingRequired
          ? <span className="ml-2 text-xs text-neutral-500">Рассчитано автоматически</span>
          : undefined,
      },
    ];

    return rows.filter((row) => row.value > 0);
  }, [autoAdditions?.addOrabond, autoAdditions?.pvcType, calcMeta.hangingCost, calcMeta.hangingLabel, calcMeta.materialsCost, calcMeta.orabondCost, calcMeta.printCost, calcMeta.printMaterial, calcMeta.pvcCost, calcMeta.standCost, calcMeta.stretcherCost, calcMeta.stretchingCost, calcMeta.stretchingRequired, materials.stretcherType, materials.workType]);

  useEffect(() => {
    if (!standAllowed && materials.stand) {
      setMaterials((prev) => ({ ...prev, stand: false }));
    }
  }, [materials.stand, standAllowed]);


  useEffect(() => {
    if (!isPassepartoutAllowed && materials.passepartout) {
      setMaterials((prev) => ({ ...prev, passepartout: false }));
    }
  }, [isPassepartoutAllowed, materials.passepartout]);

  useEffect(() => {
    if (!isGlazingAllowed && materials.glazing !== 'none') {
      setMaterials((prev) => ({ ...prev, glazing: 'none' }));
    }
  }, [isGlazingAllowed, materials.glazing]);

  useEffect(() => {
    if (!printRequirement.requiresPrint && printRequirement.printMaterial !== null) {
      setPrintRequirement((prev) => ({ ...prev, printMaterial: null }));
      return;
    }

    if (printRequirement.requiresPrint && printRequirement.printMaterial === null) {
      setPrintRequirement((prev) => ({ ...prev, printMaterial: 'canvas' }));
    }
  }, [printRequirement.printMaterial, printRequirement.requiresPrint]);

  useEffect(() => {
    if (materials.workType === 'stretchedCanvas' && !stretcherNarrowAllowed && materials.stretcherType === 'narrow') {
      setMaterials((prev) => ({ ...prev, stretcherType: 'wide' }));
    }
  }, [materials.stretcherType, materials.workType, stretcherNarrowAllowed]);

  useEffect(() => {
    if (materials.workType !== 'stretchedCanvas') {
      if (materials.frameMode !== 'framed') {
        setMaterials((prev) => ({ ...prev, frameMode: 'framed' }));
      }
      return;
    }

    setMaterials((prev) => ({
      ...prev,
      hanging: 'wire',
      backPanel: false,
    }));
  }, [materials.frameMode, materials.workType]);

  const colors = useMemo(() => Array.from(new Set(catalogItems.map((item) => item.color))), [catalogItems]);
  const styles = useMemo(() => Array.from(new Set(catalogItems.map((item) => item.style))), [catalogItems]);

  const filteredItems = useMemo(
    () =>
      catalogItems.filter((item) => {
        const colorMatch = filters.color === 'all' || item.color === filters.color;
        const styleMatch = filters.style === 'all' || item.style === filters.style;
        const widthMatch = item.width_mm >= filters.widthMin && item.width_mm <= filters.widthMax;
        const priceMatch = item.price_per_meter >= filters.priceMin && item.price_per_meter <= filters.priceMax;
        const visibleOnSite = item.show_on_site;

        const canFulfillFromStock = !validSize || canFulfillFrameFromPieces(
          parseResiduesToPieces(item.residues_text),
          computeRequiredSidesMeters(widthMm, heightMm, Number.isFinite(item.reserve_mm) ? item.reserve_mm : 10),
        );

        return colorMatch && styleMatch && widthMatch && priceMatch && visibleOnSite && canFulfillFromStock;
      }),
    [catalogItems, filters, heightMm, validSize, widthMm],
  );

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  const pagedItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);


  useEffect(() => {
    if (isNoFrameStretchedCanvas) {
      if (selectedBaget !== null) {
        setSelectedBaget(null);
      }
      return;
    }

    if (!selectedBaget || !filteredItems.some((item) => item.id === selectedBaget.id)) {
      setSelectedBaget(filteredItems[0] ?? null);
    }
  }, [filteredItems, isNoFrameStretchedCanvas, selectedBaget]);

  const onImageUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const next = URL.createObjectURL(file);
    setUploadedImageFile(file);
    setFileName(file.name);
    setImageUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return next;
    });
    event.currentTarget.value = '';
  }, []);


  useEffect(() => {
    return () => {
      if (imageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleSelectBaget = useCallback((item: BagetItem) => {
    const found = filteredItems.find((candidate) => candidate.id === item.id) ?? null;
    setSelectedBaget(found);
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setPreviewHighlighted(true);
  }, [filteredItems]);

  useEffect(() => {
    if (!previewHighlighted) return;
    const t = window.setTimeout(() => setPreviewHighlighted(false), 900);
    return () => window.clearTimeout(t);
  }, [previewHighlighted]);

  const summaryMaterials = useMemo(() => {
    const materialItems: string[] = [];

    if (materials.glazing !== 'none') {
      materialItems.push(GLAZING_LABELS[materials.glazing]);
    }

    if (materials.backPanel || autoAdditions?.forceCardboard) {
      materialItems.push('Картон (задник)');
    }

    if (autoAdditions?.pvcType === 'pvc3') materialItems.push('ПВХ 3мм');
    if (autoAdditions?.pvcType === 'pvc4') materialItems.push('ПВХ 4мм');
    if (autoAdditions?.addOrabond) materialItems.push('Orabond');
    if (materials.workType === 'stretchedCanvas') {
      materialItems.push(`Подрамник ${materials.stretcherType === 'narrow' ? 'узкий (2 см)' : 'широкий (4 см)'}`);
      if (materials.frameMode === 'noFrame') {
        materialItems.push('Без декоративной рамки');
      }
    }

    if (autoAdditions?.stretchingRequired) {
      materialItems.push('Натяжка');
    }

    return materialItems;
  }, [autoAdditions, materials.backPanel, materials.frameMode, materials.glazing, materials.stretcherType, materials.workType]);

  const orderSummary = useMemo<BagetOrderSummary>(() => {
    const hangingQuantity = Number(calcMeta.hangingQuantity ?? 1);
    const effectiveHangingType = (calcMeta.hangingType as MaterialsState['hanging'] | undefined) ?? materials.hanging;

    return {
      workSizeMm: {
        wMm: Math.round(widthMm),
        hMm: Math.round(heightMm),
      },
      selectedBaget: selectedBagetForQuote
        ? {
            id: selectedBagetForQuote.id,
            article: selectedBagetForQuote.article,
            title: selectedBagetForQuote.name,
            widthMm: selectedBagetForQuote.width_mm,
            pricePerM: selectedBagetForQuote.price_per_meter,
          }
        : null,
      passepartout: materials.passepartout
        ? {
            enabled: true,
            color: PASSEPARTOUT_COLOR_LABELS[materials.passepartoutColor],
            topMm: passepartoutMm,
            bottomMm: passepartoutBottomMm,
          }
        : {
            enabled: false,
            color: PASSEPARTOUT_COLOR_LABELS[materials.passepartoutColor],
            topMm: 0,
            bottomMm: 0,
          },
      glazing: GLAZING_LABELS[materials.glazing],
      materials: summaryMaterials,
      workType: materials.workType === 'stretchedCanvas' && materials.frameMode === 'noFrame'
        ? `${WORK_TYPE_LABELS[materials.workType]} (без рамки)`
        : WORK_TYPE_LABELS[materials.workType],
      frameMode: materials.workType === 'stretchedCanvas' ? materials.frameMode : 'framed',
      hanging: {
        type: effectiveHangingType,
        label: effectiveHangingType === 'crocodile' ? 'Крокодильчик' : 'Тросик',
        quantity: hangingQuantity,
      },
      stand: materials.stand && standAllowed,
      printRequirement: {
        requiresPrint: printRequirement.requiresPrint,
        printMaterial: printRequirement.printMaterial,
        transferSource: printRequirement.transferSource,
        printCost: Math.round(Number(calcMeta.printCost ?? 0)),
      },
      priceItems: quote.items.map((item) => ({
        key: item.key,
        title: item.title,
        total: item.total,
      })),
    };
  }, [
    materials.frameMode,
    materials.glazing,
    materials.hanging,
    materials.passepartout,
    materials.passepartoutColor,
    materials.stand,
    materials.workType,
    passepartoutBottomMm,
    passepartoutMm,
    selectedBagetForQuote,
    standAllowed,
    summaryMaterials,
    printRequirement.printMaterial,
    printRequirement.requiresPrint,
    printRequirement.transferSource,
    quote.items,
    calcMeta.hangingQuantity,
    calcMeta.hangingType,
    calcMeta.printCost,
    widthMm,
    heightMm,
  ]);



  const orderInput = useMemo<{ baget: BagetOrderRequestBagetInput; fulfillmentType: 'pickup' } | null>(() => {
    const requiresBaget = !isNoFrameStretchedCanvas;
    if (requiresBaget && !selectedBagetForQuote) return null;

    return {
      baget: {
        width: widthMm,
        height: heightMm,
        quantity: 1,
        selectedBagetId: selectedBagetForQuote ? String(selectedBagetForQuote.id) : null,
        workType: materials.workType,
        glazing: materials.glazing,
        hasPassepartout: materials.passepartout,
        passepartoutSize: passepartoutMm,
        passepartoutBottomSize: passepartoutBottomMm,
        backPanel: materials.backPanel,
        hangerType: materials.hanging,
        stand: materials.stand,
        stretcherType: materials.stretcherType,
        frameMode: materials.workType === 'stretchedCanvas' ? materials.frameMode : 'framed',
        requiresPrint: printRequirement.requiresPrint,
        printMaterial: printRequirement.printMaterial,
        transferSource: printRequirement.transferSource,
        printCost: Math.round(Number(calcMeta.printCost ?? 0)),
      },
      fulfillmentType: 'pickup',
    };
  }, [
    heightMm,
    materials.backPanel,
    isNoFrameStretchedCanvas,
    materials.glazing,
    materials.hanging,
    materials.passepartout,
    materials.stand,
    materials.stretcherType,
    materials.frameMode,
    materials.workType,
    passepartoutBottomMm,
    passepartoutMm,
    printRequirement.printMaterial,
    printRequirement.requiresPrint,
    printRequirement.transferSource,
    selectedBagetForQuote,
    widthMm,
    calcMeta.printCost,
  ]);

  const previewProps = useMemo<BagetPreviewProps>(() => ({
    widthMm,
    heightMm,
    selectedBaget: selectedBagetForQuote,
    imageUrl,
    stretchedCanvas: isNoFrameStretchedCanvas,
    passepartoutEnabled: materials.passepartout,
    passepartoutMm,
    passepartoutBottomMm,
    passepartoutColor: materials.passepartoutColor,
  }), [
    heightMm,
    imageUrl,
    isNoFrameStretchedCanvas,
    materials.passepartout,
    materials.passepartoutColor,
    passepartoutBottomMm,
    passepartoutMm,
    selectedBagetForQuote,
    widthMm,
  ]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[18%_52%_30%] lg:items-start">
      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="card rounded-2xl p-4 shadow-md">
          <h2 className="mb-3 text-base font-semibold">Размер изделия (мм)</h2>
          <div className="space-y-3">
            <label className="block space-y-1 text-sm">
              <span>Ширина (мм)</span>
              <input
                type="number"
                min={50}
                value={widthInput}
                onChange={(e) => setWidthInput(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span>Высота (мм)</span>
              <input
                type="number"
                min={50}
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
            </label>
            {!validSize && <p className="text-xs text-red-600">Введите корректные значения не менее 50 мм.</p>}
          </div>
        </div>

        <BagetFilters
          filters={filters}
          setFilters={setFilters}
          materials={materials}
          setMaterials={setMaterials}
          printRequirement={printRequirement}
          setPrintRequirement={setPrintRequirement}
          colors={colors}
          styles={styles}
          standAllowed={standAllowed}
          stretcherNarrowAllowed={stretcherNarrowAllowed}
          passepartoutAllowed={isPassepartoutAllowed}
          glazingAllowed={isGlazingAllowed}
          passepartoutDisabledReason={
            isNoFrameStretchedCanvas
              ? 'Паспарту недоступно для холста на подрамнике без рамки.'
              : !isPassepartoutSizeAllowed
                ? 'Паспарту доступно для размеров до 1000 × 700 мм.'
                : undefined
          }
          glazingDisabledReason={isNoFrameStretchedCanvas ? 'Остекление недоступно для холста на подрамнике без рамки.' : undefined}
        />
      </aside>

      <main className="space-y-3 lg:pr-1">
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pagedItems.map((item) => (
            <BagetCard
              key={item.id}
              item={item}
              selected={selectedBaget?.id === item.id}
              onSelect={handleSelectBaget}
            />
          ))}
        </div>
        {pagedItems.length === 0 && (
          <div className="card rounded-2xl p-4 text-sm text-neutral-600 dark:text-neutral-300">По заданным фильтрам ничего не найдено.</div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-700 dark:bg-neutral-900/85 dark:text-neutral-200">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="btn-secondary min-w-[7rem] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Назад
            </button>
            <span className="text-neutral-700 dark:text-neutral-300">
              Страница {page} из {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="btn-secondary min-w-[7rem] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Вперёд
            </button>
          </div>
        )}
      </main>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="card rounded-2xl p-4 shadow-md">
          <h2 className="mb-2 text-base font-semibold">Изображение</h2>
          <input id="baget-image-upload" type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
          <label
            htmlFor="baget-image-upload"
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-all duration-200 hover:bg-neutral-50 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          >
            {fileName ? 'Изменить изображение' : 'Загрузить изображение'}
          </label>
          {fileName ? (
            <div className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-xs dark:bg-green-900/20">
              <p className="truncate text-neutral-700 dark:text-neutral-200">{fileName}</p>
              <p className="text-green-600 dark:text-green-400">Файл загружен</p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-300">Поддерживаются изображения JPG, PNG, WEBP.</p>
          )}
        </div>

        <button
          ref={previewTriggerRef}
          type="button"
          aria-label="Open preview"
          onClick={() => setIsPreviewOpen(true)}
          className="block w-full cursor-zoom-in text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 focus-visible:ring-offset-2"
        >
          <div ref={previewRef}>
            <BagetPreview
              {...previewProps}
              highlighted={previewHighlighted}
            />
          </div>
        </button>

        <div className="card rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-neutral-200/70 backdrop-blur-sm dark:bg-neutral-900/80 dark:ring-neutral-700/70">
          <h2 className="mb-3 text-base font-semibold">Расчёт</h2>
          {selectedBagetForQuote || isNoFrameStretchedCanvas ? (
            <ul className="space-y-2 text-sm transition-all duration-300">
              {!isNoFrameStretchedCanvas ? (
                <>
                  <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                    <span className="text-neutral-500 dark:text-neutral-300">Артикул:</span> {selectedBagetForQuote?.article}
                  </li>
                  <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                    <span className="text-neutral-500 dark:text-neutral-300">Ширина профиля:</span> {selectedBagetForQuote?.width_mm} мм
                  </li>
                </>
              ) : (
                <li className="border-b border-neutral-200/70 pb-2 text-sm text-neutral-600 dark:border-neutral-700/70 dark:text-neutral-300">
                  Режим оформления: <b>Без рамки</b>
                </li>
              )}
              <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                <span className="text-neutral-500 dark:text-neutral-300">Размер работы:</span> {Math.round(widthMm)} × {Math.round(heightMm)} мм
              </li>
              {materials.passepartout ? (
                <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                  <span className="text-neutral-500 dark:text-neutral-300">Размер с паспарту:</span> {Math.round(effectiveWidthMm)} × {Math.round(effectiveHeightMm)} мм
                </li>
              ) : null}
              {!isNoFrameStretchedCanvas ? (
                <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                  <span className="text-neutral-500 dark:text-neutral-300">Габарит с рамкой:</span> {Math.round(Number(calcMeta.framedWidthMm ?? 0))} × {Math.round(Number(calcMeta.framedHeightMm ?? 0))} мм
                </li>
              ) : null}
              <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                <span className="text-neutral-500 dark:text-neutral-300">Площадь:</span> {Number(calcMeta.areaM2 ?? 0).toFixed(3)} м²
              </li>
              {!isNoFrameStretchedCanvas ? (
                <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                  <span className="text-neutral-500 dark:text-neutral-300">Багет:</span> {Number(calcMeta.bagetMeters ?? 0).toFixed(2)} м ×{' '}
                  {selectedBagetForQuote?.price_per_meter.toLocaleString('ru-RU')} ₽ = {Math.round(Number(calcMeta.bagetCost ?? 0)).toLocaleString('ru-RU')} ₽
                </li>
              ) : null}
              {summaryCostRows.map((row) => (
                <li key={row.key} className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                  <span className="text-neutral-500 dark:text-neutral-300">{row.label}</span> {Math.round(row.value).toLocaleString('ru-RU')} ₽
                  {row.note ?? null}
                </li>
              ))}
              {autoAdditions?.forceCardboard ? (
                <li className="text-xs text-neutral-500 dark:text-neutral-300">Картон (задник): Добавлено автоматически</li>
              ) : null}
              {autoAdditions?.stretchingRequired ? (
                <li className="text-xs text-neutral-500 dark:text-neutral-300">Требуется натяжка: Добавлено автоматически</li>
              ) : null}
              <li className="mt-1 border-t border-neutral-300 pt-3 text-xl font-bold text-neutral-900 dark:border-neutral-600 dark:text-neutral-100">
                Итого: {quote.total.toLocaleString('ru-RU')} ₽
              </li>
            </ul>
          ) : (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Выберите багет для расчёта.</p>
          )}

          <button
            type="button"
            onClick={() => setIsOrderModalOpen(true)}
            disabled={(!selectedBagetForQuote && !isNoFrameStretchedCanvas) || !validSize}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-center text-white no-underline transition-all duration-200 hover:scale-[1.02] hover:bg-red-700 hover:shadow-lg active:scale-[0.98]"
          >
            Оформить заказ
          </button>
        </div>

        {isPreviewOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setIsPreviewOpen(false);
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Увеличенное превью багета"
          >
            <div className="relative w-[min(1000px,90vw)] max-h-[80vh] overflow-auto rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                aria-label="Закрыть увеличенное превью"
                className="absolute right-3 top-3 z-10 rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                ✕
              </button>
              <div
                className={[
                  'overflow-hidden rounded-xl',
                  hoverZoomEnabled ? (isPreviewZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in') : '',
                ].join(' ')}
                onMouseEnter={() => {
                  if (!hoverZoomEnabled) return;
                  setIsPreviewZoomed(true);
                }}
                onMouseMove={(event) => {
                  if (!hoverZoomEnabled) return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  if (!rect.width || !rect.height) return;

                  const xPct = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
                  const yPct = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
                  setPreviewZoomOrigin({ xPct, yPct });
                }}
                onMouseLeave={() => {
                  if (!hoverZoomEnabled) return;
                  setIsPreviewZoomed(false);
                  setPreviewZoomOrigin({ xPct: 50, yPct: 50 });
                }}
              >
                {hoverZoomEnabled ? (
                  <p className="mb-2 text-right text-xs text-neutral-500 dark:text-neutral-400">Наведите курсор для увеличения</p>
                ) : null}
                <div
                  style={{
                    transform: `scale(${isPreviewZoomed ? 1.8 : 1})`,
                    transformOrigin: `${previewZoomOrigin.xPct}% ${previewZoomOrigin.yPct}%`,
                    transition: 'transform 140ms ease-out',
                    willChange: 'transform',
                  }}
                >
                  <BagetPreview
                    className="max-h-[calc(80vh-2rem)]"
                    {...previewProps}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <BagetOrderModal
          open={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          orderSummary={orderSummary}
          orderInput={orderInput}
          uploadedImageFile={uploadedImageFile}
          totalPriceRub={quote.total}
          previewProps={previewProps}
          effectiveSize={{
            wMm: Math.round(effectiveWidthMm),
            hMm: Math.round(effectiveHeightMm),
          }}
          outerSize={isNoFrameStretchedCanvas
            ? undefined
            : {
                wMm: Math.round(Number(calcMeta.framedWidthMm ?? 0)),
                hMm: Math.round(Number(calcMeta.framedHeightMm ?? 0)),
              }}
        />
      </aside>
    </div>
  );
}
