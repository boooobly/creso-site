import type { BagetItem } from '@/components/baget/BagetCard';
import type {
  GlazingType,
  HangingType,
  StretcherType,
  WorkType,
} from '@/components/baget/BagetFilters';

const HANGING_PRICES = {
  crocodile: 120,
  wire: 220,
} as const;

const STAND_PRICE = 280;

const STRETCHER_PRICE_PER_METER: Record<StretcherType, number> = {
  narrow: 320,
  wide: 480,
};

const MATERIAL_PRICE_PER_M2 = {
  glass: 1600,
  antiReflectiveGlass: 2600,
  museumGlass: 4200,
  plexiglass: 1300,
  pet1mm: 900,
  passepartout: 700,
  cardboard: 450,
  pvc3: 850,
  pvc4: 1100,
  orabond: 390,
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
      pvcType: 'pvc3',
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

  if (!input.selectedBaget) {
    warnings.push('Выберите багет для расчёта.');
  }

  if (!validSize || !input.selectedBaget) {
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
        framedWidthMm: 0,
        framedHeightMm: 0,
        bagetMeters: 0,
        hangingLabel: hangerType === 'crocodile' ? 'Крокодильчик × 1' : 'Тросик × 1',
        autoAdditions,
        standAllowed,
        stretcherNarrowAllowed,
        effectiveBackPanel,
        hangingType: hangerType,
        hangingQuantity: 1,
        workType: input.workType,
        stretcherType: effectiveStretcherType,
      },
    };
  }

  const B = input.selectedBaget.width_mm;
  const areaM2 = (effectiveWidth * effectiveHeight) / 1_000_000;
  const bagetMeters = ((2 * (effectiveWidth + effectiveHeight) + 8 * B) / 1000) * 1.05;
  const bagetCost = bagetMeters * input.selectedBaget.price_per_meter;

  let materialsCost = 0;
  if (input.glazing !== 'none') {
    materialsCost += areaM2 * MATERIAL_PRICE_PER_M2[input.glazing];
  }
  if (input.hasPassepartout) {
    materialsCost += areaM2 * MATERIAL_PRICE_PER_M2.passepartout;
  }
  if (effectiveBackPanel) {
    materialsCost += areaM2 * MATERIAL_PRICE_PER_M2.cardboard;
  }

  const pvcCost = autoAdditions.pvcType === 'none' ? 0 : areaM2 * MATERIAL_PRICE_PER_M2[autoAdditions.pvcType];
  const orabondCost = autoAdditions.addOrabond ? areaM2 * MATERIAL_PRICE_PER_M2.orabond : 0;
  const hangingQuantity = hangerType === 'crocodile' ? (effectiveWidth > 600 ? 2 : 1) : 1;
  const hangingCost = HANGING_PRICES[hangerType] * hangingQuantity;
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
      title: hangerType === 'crocodile' ? `Крокодильчик × ${hangingQuantity}` : `Тросик × ${hangingQuantity}`,
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
      framedWidthMm: effectiveWidth + 2 * B,
      framedHeightMm: effectiveHeight + 2 * B,
      bagetMeters,
      bagetCost,
      materialsCost,
      pvcCost,
      orabondCost,
      hangingCost,
      hangingLabel: hangerType === 'crocodile' ? `Крокодильчик × ${hangingQuantity}` : `Тросик × ${hangingQuantity}`,
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
    },
  };
}
