import type { BagetItem } from '@/components/baget/BagetCard';
import type {
  GlazingType,
  HangingType,
  FrameMode,
  StretcherType,
  WorkType,
} from '@/components/baget/BagetFilters';

const CROCODILE_PRICE = 20;
const WIRE_PRICE_PER_METER_WIDTH = 30;
const WIRE_LOOP_PRICE = 15;
const WIRE_LOOP_DEFAULT_QTY = 2;

const STAND_PRICE = 120;

const STRETCHER_PRICE_PER_METER: Record<StretcherType, number> = {
  narrow: 200,
  wide: 300,
};

const MATERIAL_PRICING = {
  glass: { areaPricePerM2: 3705, cuttingPricePerM: 30 },
  antiReflectiveGlass: { areaPricePerM2: 6000, cuttingPricePerM: 30 },
  museumGlass: { areaPricePerM2: 4200, cuttingPricePerM: 30 },
  plexiglass: { areaPricePerM2: 2575, cuttingPricePerM: 30 },
  pet1mm: { areaPricePerM2: 1200, cuttingPricePerM: 30 },
  passepartout: { areaPricePerM2: 2325, cuttingPricePerM: 30 },
  cardboard: { areaPricePerM2: 465, cuttingPricePerM: 30 },
  pvc3: { areaPricePerM2: 1855, cuttingPricePerM: 30 },
  pvc4: { areaPricePerM2: 2455, cuttingPricePerM: 35 },
  orabond: { areaPricePerM2: 1200, cuttingPricePerM: 0 },
} as const;

type AutoAdditions = {
  pvcType: 'none' | 'pvc3' | 'pvc4';
  addOrabond: boolean;
  forceCardboard: boolean;
  stretchingRequired: boolean;
  removeCardboard: boolean;
};

export interface BagetQuoteInput {
  width: number;
  height: number;
  quantity: number;
  selectedBaget: BagetItem | null;
  workType: WorkType;
  glazing: GlazingType;
  hasPassepartout: boolean;
  passepartoutSize?: number;
  passepartoutBottomSize?: number;
  backPanel: boolean;
  hangerType?: HangingType | null;
  stand: boolean;
  stretcherType?: StretcherType | null;
  frameMode?: FrameMode | null;
}

export interface QuoteLineItem {
  key: string;
  title: string;
  qty?: number;
  unitPrice?: number;
  total: number;
}

export interface BagetQuoteResult {
  total: number;
  items: QuoteLineItem[];
  effectiveSize: {
    width: number;
    height: number;
  };
  warnings: string[];
  meta?: Record<string, any>;
}

function resolveAutoAdditions(workType: WorkType): AutoAdditions {
  if (workType === 'rhinestone') {
    return {
      pvcType: 'pvc3',
      addOrabond: true,
      forceCardboard: false,
      stretchingRequired: false,
      removeCardboard: false,
    };
  }

  if (workType === 'embroidery' || workType === 'beads') {
    return {
      pvcType: 'pvc4',
      addOrabond: false,
      forceCardboard: true,
      stretchingRequired: true,
      removeCardboard: false,
    };
  }

  if (workType === 'photo') {
    return {
      pvcType: 'none',
      addOrabond: true,
      forceCardboard: true,
      stretchingRequired: false,
      removeCardboard: false,
    };
  }

  if (workType === 'stretchedCanvas') {
    return {
      pvcType: 'none',
      addOrabond: false,
      forceCardboard: false,
      stretchingRequired: true,
      removeCardboard: true,
    };
  }

  return {
    pvcType: 'none',
    addOrabond: false,
    forceCardboard: false,
    stretchingRequired: false,
    removeCardboard: false,
  };
}

export function bagetQuote(input: BagetQuoteInput): BagetQuoteResult {
  const warnings: string[] = [];
  const width = Number(input.width);
  const height = Number(input.height);
  const quantity = Math.max(1, Math.round(input.quantity) || 1);
  const validSize = Number.isFinite(width) && Number.isFinite(height) && width >= 50 && height >= 50;
  const passepartoutSize = Math.max(0, input.passepartoutSize ?? 0);
  const passepartoutBottomSize = Math.max(0, input.passepartoutBottomSize ?? 0);

  const effectiveWidth = input.hasPassepartout ? width + 2 * passepartoutSize : width;
  const effectiveHeight = input.hasPassepartout ? height + passepartoutSize + passepartoutBottomSize : height;
  const standAllowed = validSize && effectiveWidth <= 300 && effectiveHeight <= 300;
  const stretcherNarrowAllowed = width <= 500 && height <= 500;

  const autoAdditions = resolveAutoAdditions(input.workType);
  const effectiveFrameMode: FrameMode = input.workType === 'stretchedCanvas'
    ? (input.frameMode ?? 'framed')
    : 'framed';
  const requiresBaget = !(input.workType === 'stretchedCanvas' && effectiveFrameMode === 'noFrame');
  const hangerType: HangingType = input.workType === 'stretchedCanvas' ? 'wire' : input.hangerType ?? 'crocodile';
  const effectiveBackPanel = input.workType === 'stretchedCanvas'
    ? false
    : autoAdditions.removeCardboard
      ? false
      : input.backPanel || autoAdditions.forceCardboard;
  const effectiveStretcherType: StretcherType = input.workType !== 'stretchedCanvas'
    ? (input.stretcherType ?? 'narrow')
    : (input.stretcherType === 'narrow' && !stretcherNarrowAllowed ? 'wide' : (input.stretcherType ?? 'narrow'));
  const effectiveStand = input.stand && standAllowed;

  if (!validSize) {
    warnings.push('Введите корректные значения не менее 50 мм.');
  }

  if (requiresBaget && !input.selectedBaget) {
    warnings.push('Выберите багет для расчёта.');
  }

  if (!validSize || (requiresBaget && !input.selectedBaget)) {
    return {
      total: 0,
      items: [],
      effectiveSize: {
        width: Number.isFinite(effectiveWidth) ? effectiveWidth : 0,
        height: Number.isFinite(effectiveHeight) ? effectiveHeight : 0,
      },
      warnings,
      meta: {
        areaM2: 0,
        framedWidthMm: Number.isFinite(effectiveWidth) ? effectiveWidth : 0,
        framedHeightMm: Number.isFinite(effectiveHeight) ? effectiveHeight : 0,
        bagetMeters: 0,
        hangingLabel: hangerType === 'crocodile' ? 'Крокодильчик × 1' : `Тросик (${WIRE_LOOP_DEFAULT_QTY} петли)`,
        autoAdditions,
        standAllowed,
        stretcherNarrowAllowed,
        effectiveBackPanel,
        hangingType: hangerType,
        hangingQuantity: 1,
        workType: input.workType,
        stretcherType: effectiveStretcherType,
        frameMode: effectiveFrameMode,
        requiresBaget,
      },
    };
  }

  const bagetWidthMm = requiresBaget ? (input.selectedBaget?.width_mm ?? 0) : 0;
  const areaM2 = (effectiveWidth * effectiveHeight) / 1_000_000;
  const perimeterM = (2 * (effectiveWidth + effectiveHeight)) / 1000;
  const bagetMeters = requiresBaget
    ? ((2 * (effectiveWidth + effectiveHeight) + 8 * bagetWidthMm) / 1000) * 1.05
    : 0;
  const bagetCost = requiresBaget && input.selectedBaget
    ? bagetMeters * input.selectedBaget.price_per_meter
    : 0;

  let materialsCost = 0;
  if (input.glazing !== 'none') {
    const glazingPricing = MATERIAL_PRICING[input.glazing];
    materialsCost += areaM2 * glazingPricing.areaPricePerM2 + perimeterM * glazingPricing.cuttingPricePerM;
  }
  if (input.hasPassepartout) {
    materialsCost += areaM2 * MATERIAL_PRICING.passepartout.areaPricePerM2 + perimeterM * MATERIAL_PRICING.passepartout.cuttingPricePerM;
  }
  if (effectiveBackPanel) {
    materialsCost += areaM2 * MATERIAL_PRICING.cardboard.areaPricePerM2 + perimeterM * MATERIAL_PRICING.cardboard.cuttingPricePerM;
  }

  const pvcCost = autoAdditions.pvcType === 'none'
    ? 0
    : areaM2 * MATERIAL_PRICING[autoAdditions.pvcType].areaPricePerM2 + perimeterM * MATERIAL_PRICING[autoAdditions.pvcType].cuttingPricePerM;
  const orabondCost = autoAdditions.addOrabond ? areaM2 * MATERIAL_PRICING.orabond.areaPricePerM2 : 0;
  const hangingQuantity = hangerType === 'crocodile' ? (effectiveWidth > 600 ? 2 : 1) : 1;
  const wireLoopsCost = WIRE_LOOP_DEFAULT_QTY * WIRE_LOOP_PRICE;
  const hangingCost = hangerType === 'wire'
    ? (width / 1000) * WIRE_PRICE_PER_METER_WIDTH + wireLoopsCost
    : CROCODILE_PRICE * hangingQuantity;
  const standCost = effectiveStand ? STAND_PRICE : 0;
  const stretcherMeters = (width * 2 + height * 2) / 1000;
  const stretcherCost = input.workType === 'stretchedCanvas'
    ? stretcherMeters * STRETCHER_PRICE_PER_METER[effectiveStretcherType]
    : 0;

  const rawItems: QuoteLineItem[] = [
    {
      key: 'baget',
      title: 'Багет',
      qty: quantity,
      unitPrice: Math.round(bagetCost),
      total: bagetCost * quantity,
    },
    {
      key: 'materials',
      title: 'Материалы',
      qty: quantity,
      unitPrice: Math.round(materialsCost),
      total: materialsCost * quantity,
    },
    {
      key: 'pvc',
      title: 'ПВХ',
      qty: quantity,
      unitPrice: Math.round(pvcCost),
      total: pvcCost * quantity,
    },
    {
      key: 'orabond',
      title: 'Orabond',
      qty: quantity,
      unitPrice: Math.round(orabondCost),
      total: orabondCost * quantity,
    },
    {
      key: 'hanging',
      title: hangerType === 'crocodile' ? `Крокодильчик × ${hangingQuantity}` : `Тросик + ${WIRE_LOOP_DEFAULT_QTY} петли`,
      qty: quantity,
      unitPrice: hangingCost,
      total: hangingCost * quantity,
    },
    {
      key: 'stand',
      title: 'Ножка-подставка',
      qty: quantity,
      unitPrice: standCost,
      total: standCost * quantity,
    },
    {
      key: 'stretcher',
      title: 'Подрамник',
      qty: quantity,
      unitPrice: Math.round(stretcherCost),
      total: stretcherCost * quantity,
    },
  ];

  const items = rawItems.filter((item) => item.total > 0);
  const total = items.reduce((sum, item) => sum + item.total, 0);

  const autoBadges: string[] = [];
  if (autoAdditions.pvcType === 'pvc3') autoBadges.push('ПВХ 3мм');
  if (autoAdditions.pvcType === 'pvc4') autoBadges.push('ПВХ 4мм');
  if (autoAdditions.addOrabond) autoBadges.push('Orabond');
  if (autoAdditions.forceCardboard) autoBadges.push('Картон (задник)');

  return {
    total: Math.round(total),
    items,
    effectiveSize: {
      width: effectiveWidth,
      height: effectiveHeight,
    },
    warnings,
    meta: {
      areaM2,
      framedWidthMm: effectiveWidth + 2 * bagetWidthMm,
      framedHeightMm: effectiveHeight + 2 * bagetWidthMm,
      bagetMeters,
      bagetCost,
      materialsCost,
      pvcCost,
      orabondCost,
      hangingCost,
      hangingLabel: hangerType === 'crocodile' ? `Крокодильчик × ${hangingQuantity}` : `Тросик + ${WIRE_LOOP_DEFAULT_QTY} петли`,
      standCost,
      stretcherCost,
      autoBadges,
      autoAdditions,
      standAllowed,
      stretcherNarrowAllowed,
      effectiveBackPanel,
      hangingType: hangerType,
      hangingQuantity,
      workType: input.workType,
      stretcherType: effectiveStretcherType,
      frameMode: effectiveFrameMode,
      requiresBaget,
    },
  };
}
