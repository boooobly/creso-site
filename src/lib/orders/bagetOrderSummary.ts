import type { BagetQuoteResult } from '@/lib/calculations/bagetQuote';

export type PersistedOrderUpload = {
  url: string;
  pathname?: string | null;
  fileName: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
};

export type BagetOrderMaterialBreakdownItem = {
  key: string;
  label: string;
  included: boolean;
  costRub?: number;
  note?: string;
};

export type BagetOrderSummaryData = {
  kind: 'baget';
  size: {
    workWidthMm: number;
    workHeightMm: number;
    effectiveWidthMm: number;
    effectiveHeightMm: number;
    outerWidthMm?: number | null;
    outerHeightMm?: number | null;
  };
  baguette: {
    selectedBagetId?: string | null;
    article?: string | null;
    name?: string | null;
    color?: string | null;
    style?: string | null;
    widthMm?: number | null;
  } | null;
  workType: {
    value?: string | null;
    label: string;
  };
  frameMode: {
    value?: string | null;
    label: string;
  };
  glazing: {
    value?: string | null;
    label: string;
  };
  passepartout: {
    enabled: boolean;
    color?: string | null;
    sizeMm?: number | null;
    bottomSizeMm?: number | null;
    label: string;
  };
  backPanel: {
    enabled: boolean;
    label: string;
  };
  hanging: {
    type?: string | null;
    label: string;
    quantity?: number | null;
  };
  stand: {
    enabled: boolean;
    label: string;
  };
  stretcher: {
    type?: string | null;
    label: string;
    enabled: boolean;
  };
  printRequirement: {
    requiresPrint: boolean;
    label: string;
    printMaterial?: string | null;
    printMaterialLabel?: string | null;
    transferSource?: string | null;
    transferSourceLabel?: string | null;
  };
  materialsIncluded: string[];
  materialsBreakdown: BagetOrderMaterialBreakdownItem[];
  uploadedImage?: PersistedOrderUpload | null;
};

type BagetLikeInput = {
  width?: number;
  height?: number;
  selectedBagetId?: string | null;
  workType?: string;
  glazing?: string;
  hasPassepartout?: boolean;
  passepartoutSize?: number;
  passepartoutBottomSize?: number;
  backPanel?: boolean;
  hangerType?: string | null;
  stand?: boolean;
  stretcherType?: string | null;
  frameMode?: string | null;
  requiresPrint?: boolean;
  printMaterial?: string | null;
  transferSource?: string | null;
};

type SelectedBagetLike = {
  id?: string | number;
  article?: string | null;
  name?: string | null;
  color?: string | null;
  style?: string | null;
  width_mm?: number | null;
};

const WORK_TYPE_LABELS: Record<string, string> = {
  canvas: 'Картина на основе',
  stretchedCanvas: 'Холст',
  canvasOnStretcher: 'Холст на подрамнике',
  rhinestone: 'Стразы',
  embroideryBeads: 'Вышивка, бисер',
  embroidery: 'Вышивка, бисер',
  beads: 'Вышивка, бисер',
  stretcherOnly: 'Только подрамник',
  photo: 'Фото',
  other: 'Другое',
};

const GLAZING_LABELS: Record<string, string> = {
  none: 'Без остекления',
  glass: 'Стекло',
  antiReflectiveGlass: 'Антибликовое стекло',
  plexiglass: 'Оргстекло',
  pet1mm: 'ПЭТ 1мм',
};

const HANGER_LABELS: Record<string, string> = {
  crocodile: 'Крокодильчик',
  wire: 'Тросик',
};

const PRINT_MATERIAL_LABELS: Record<string, string> = {
  paper: 'Бумага',
  canvas: 'Холст',
};

const TRANSFER_SOURCE_LABELS: Record<string, string> = {
  manual: 'Файл клиента',
  'wide-format': 'Из широкоформатной печати',
};

const FRAME_MODE_LABELS: Record<string, string> = {
  framed: 'В раме',
  noFrame: 'Без рамки',
};

const STRETCHER_LABELS: Record<string, string> = {
  narrow: 'Узкий (2 см)',
  wide: 'Широкий (4 см)',
};

function roundMm(value: unknown): number {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? Math.round(numeric) : 0;
}

function formatOptional(value?: string | null): string | null {
  const text = String(value ?? '').trim();
  return text || null;
}

function labelFromMap(map: Record<string, string>, value?: string | null, fallback = '—'): string {
  if (!value) return fallback;
  return map[value] || value;
}

function numberFromMeta(meta: Record<string, unknown>, key: string): number {
  const value = Number(meta[key] ?? 0);
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function normalizeMaterialsBreakdown(params: {
  baget: BagetLikeInput;
  quote: BagetQuoteResult;
}): BagetOrderMaterialBreakdownItem[] {
  const meta = (params.quote.meta ?? {}) as Record<string, unknown>;
  const autoAdditions = (meta.autoAdditions ?? {}) as Record<string, unknown>;
  const glazingLabel = labelFromMap(GLAZING_LABELS, params.baget.glazing, 'Без остекления');
  const pvcType = formatOptional(String(autoAdditions.pvcType ?? 'none'));
  const hangingLabel = formatOptional(String(meta.hangingLabel ?? '')) || labelFromMap(HANGER_LABELS, params.baget.hangerType, 'Подвес');
  const stretcherType = formatOptional(String(meta.stretcherType ?? params.baget.stretcherType ?? ''));
  const printMaterial = formatOptional(params.baget.printMaterial ?? null);

  return [
    {
      key: 'passepartout',
      label: 'Паспарту',
      included: Boolean(params.baget.hasPassepartout),
      note: params.baget.hasPassepartout
        ? `Поля ${roundMm(params.baget.passepartoutSize)} мм, низ ${roundMm(params.baget.passepartoutBottomSize)} мм`
        : undefined,
    },
    {
      key: 'backPanel',
      label: 'Картон / задник',
      included: Boolean(meta.effectiveBackPanel),
    },
    {
      key: 'pvc',
      label: pvcType === 'pvc4' ? 'ПВХ 4мм' : 'ПВХ 3мм',
      included: pvcType === 'pvc3' || pvcType === 'pvc4',
      costRub: numberFromMeta(meta, 'pvcCost'),
    },
    {
      key: 'orabond',
      label: 'Orabond',
      included: Boolean(autoAdditions.addOrabond),
      costRub: numberFromMeta(meta, 'orabondCost'),
    },
    {
      key: 'glazing',
      label: glazingLabel,
      included: params.baget.glazing !== 'none',
    },
    {
      key: 'clamps',
      label: 'Прижимы',
      included: numberFromMeta(meta, 'clampsCost') > 0,
      costRub: numberFromMeta(meta, 'clampsCost'),
      note: meta.clampsCount ? `Количество: ${Math.round(Number(meta.clampsCount))}` : undefined,
    },
    {
      key: 'hanger',
      label: hangingLabel,
      included: Boolean(hangingLabel),
      costRub: numberFromMeta(meta, 'hangingCost'),
      note: meta.hangingQuantity ? `Количество: ${roundMm(meta.hangingQuantity)}` : undefined,
    },
    {
      key: 'stand',
      label: 'Ножка-подставка',
      included: numberFromMeta(meta, 'standCost') > 0 || Boolean(params.baget.stand),
      costRub: numberFromMeta(meta, 'standCost'),
    },
    {
      key: 'stretcher',
      label: 'Подрамник',
      included: params.baget.workType === 'stretchedCanvas',
      costRub: numberFromMeta(meta, 'stretcherCost'),
      note: stretcherType ? labelFromMap(STRETCHER_LABELS, stretcherType, stretcherType) : undefined,
    },
    {
      key: 'stretching',
      label: 'Натяжка',
      included: Boolean(meta.stretchingRequired),
      costRub: numberFromMeta(meta, 'stretchingCost'),
    },
    {
      key: 'print',
      label: 'Печать',
      included: Boolean(params.baget.requiresPrint),
      costRub: numberFromMeta(meta, 'printCost'),
      note: printMaterial ? labelFromMap(PRINT_MATERIAL_LABELS, printMaterial, printMaterial) : undefined,
    },
  ].filter((item) => item.included);
}

export function buildBagetOrderSummary(params: {
  baget: BagetLikeInput;
  selectedBaget: SelectedBagetLike | null;
  quote: BagetQuoteResult;
  uploadedImage?: PersistedOrderUpload | null;
}): BagetOrderSummaryData {
  const meta = (params.quote.meta ?? {}) as Record<string, unknown>;
  const workTypeValue = formatOptional(params.baget.workType);
  const frameModeValue = formatOptional(String(meta.frameMode ?? params.baget.frameMode ?? 'framed'));
  const glazingValue = formatOptional(params.baget.glazing);
  const hangingType = formatOptional(String(meta.hangingType ?? params.baget.hangerType ?? ''));
  const stretcherType = formatOptional(String(meta.stretcherType ?? params.baget.stretcherType ?? ''));
  const printMaterial = formatOptional(params.baget.printMaterial ?? null);
  const transferSource = formatOptional(params.baget.transferSource ?? null);
  const selectedBagetId = formatOptional(String(params.selectedBaget?.id ?? params.baget.selectedBagetId ?? ''));
  const materialsBreakdown = normalizeMaterialsBreakdown({ baget: params.baget, quote: params.quote });

  const materialsIncluded = materialsBreakdown.map((item) => item.note ? `${item.label} (${item.note})` : item.label);
  const passepartoutEnabled = Boolean(params.baget.hasPassepartout);
  const passepartoutSize = roundMm(params.baget.passepartoutSize);
  const passepartoutBottomSize = roundMm(params.baget.passepartoutBottomSize);

  return {
    kind: 'baget',
    size: {
      workWidthMm: roundMm(params.baget.width),
      workHeightMm: roundMm(params.baget.height),
      effectiveWidthMm: roundMm(params.quote.effectiveSize.width),
      effectiveHeightMm: roundMm(params.quote.effectiveSize.height),
      outerWidthMm: roundMm(meta.framedWidthMm),
      outerHeightMm: roundMm(meta.framedHeightMm),
    },
    baguette: selectedBagetId || params.selectedBaget
      ? {
          selectedBagetId,
          article: formatOptional(params.selectedBaget?.article ?? null),
          name: formatOptional(params.selectedBaget?.name ?? null),
          color: formatOptional(params.selectedBaget?.color ?? null),
          style: formatOptional(params.selectedBaget?.style ?? null),
          widthMm: params.selectedBaget?.width_mm ?? null,
        }
      : null,
    workType: {
      value: workTypeValue,
      label: labelFromMap(WORK_TYPE_LABELS, workTypeValue, workTypeValue || '—'),
    },
    frameMode: {
      value: frameModeValue,
      label: labelFromMap(FRAME_MODE_LABELS, frameModeValue, frameModeValue || '—'),
    },
    glazing: {
      value: glazingValue,
      label: labelFromMap(GLAZING_LABELS, glazingValue, glazingValue || '—'),
    },
    passepartout: {
      enabled: passepartoutEnabled,
      color: null,
      sizeMm: passepartoutEnabled ? passepartoutSize : null,
      bottomSizeMm: passepartoutEnabled ? passepartoutBottomSize : null,
      label: passepartoutEnabled
        ? `Да, поля ${passepartoutSize} мм, низ ${passepartoutBottomSize} мм`
        : 'Без паспарту',
    },
    backPanel: {
      enabled: Boolean(meta.effectiveBackPanel),
      label: Boolean(meta.effectiveBackPanel) ? 'Да' : 'Нет',
    },
    hanging: {
      type: hangingType,
      label: formatOptional(String(meta.hangingLabel ?? '')) || labelFromMap(HANGER_LABELS, hangingType, '—'),
      quantity: roundMm(meta.hangingQuantity),
    },
    stand: {
      enabled: numberFromMeta(meta, 'standCost') > 0 || Boolean(params.baget.stand),
      label: numberFromMeta(meta, 'standCost') > 0 || Boolean(params.baget.stand) ? 'Да' : 'Нет',
    },
    stretcher: {
      type: stretcherType,
      label: params.baget.workType === 'stretchedCanvas'
        ? labelFromMap(STRETCHER_LABELS, stretcherType, stretcherType || 'Подрамник')
        : 'Не требуется',
      enabled: params.baget.workType === 'stretchedCanvas',
    },
    printRequirement: {
      requiresPrint: Boolean(params.baget.requiresPrint),
      label: params.baget.requiresPrint ? 'Печать требуется' : 'Печать не требуется',
      printMaterial,
      printMaterialLabel: printMaterial ? labelFromMap(PRINT_MATERIAL_LABELS, printMaterial, printMaterial) : null,
      transferSource,
      transferSourceLabel: transferSource ? labelFromMap(TRANSFER_SOURCE_LABELS, transferSource, transferSource) : null,
    },
    materialsIncluded,
    materialsBreakdown,
    uploadedImage: params.uploadedImage ?? null,
  };
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getPersistedBagetOrderSummary(payloadJson: unknown, quoteJson: unknown): BagetOrderSummaryData | null {
  const payload = isRecord(payloadJson) ? payloadJson : null;
  const quote = isRecord(quoteJson) ? quoteJson : null;
  const embeddedSummary = payload && isRecord(payload.orderSummary) ? payload.orderSummary : null;

  if (embeddedSummary && embeddedSummary.kind === 'baget') {
    return embeddedSummary as BagetOrderSummaryData;
  }

  const baget = payload && isRecord(payload.baget) ? payload.baget : null;
  if (!baget || !quote) return null;

  return buildBagetOrderSummary({
    baget,
    selectedBaget: null,
    quote: quote as unknown as BagetQuoteResult,
    uploadedImage: payload && isRecord(payload.uploadedImage) ? payload.uploadedImage as PersistedOrderUpload : null,
  });
}
