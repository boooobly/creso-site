import type { BagetItem } from '@/components/baget/BagetCard';
import type {
  GlazingType,
  HangingType,
  FrameMode,
  StretcherType,
  WorkType,
} from '@/components/baget/BagetFilters';
import type { BagetPrintMaterial } from '@/lib/baget/printRequirement';
import {
  getBaguetteExtrasDefaultConfig,
  resolveAutoAdditionsFromConfig,
  getBaguettePrintPricePerM2,
  type AutoAdditionRule,
  type BaguetteExtrasPricingConfig,
} from '@/lib/baget/baguetteExtrasPricing';

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
  requiresPrint?: boolean;
  printMaterial?: BagetPrintMaterial | null;
  transferSource?: 'manual' | 'wide-format' | null;
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

function roundCurrency(value: number): number {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function toMetersFromMillimeters(valueMm: number): number {
  return Number.isFinite(valueMm) && valueMm > 0 ? valueMm / 1000 : 0;
}

export function calculateStretchingPrice(params: {
  widthMm: number;
  heightMm: number;
  areaRate: number;
  perimeterDividedByAreaRate: number;
}): number {
  const widthM = toMetersFromMillimeters(Number(params.widthMm));
  const heightM = toMetersFromMillimeters(Number(params.heightMm));
  const areaRate = Number(params.areaRate);
  const perimeterDividedByAreaRate = Number(params.perimeterDividedByAreaRate);

  if (!Number.isFinite(widthM) || !Number.isFinite(heightM) || widthM <= 0 || heightM <= 0) {
    return 0;
  }

  if (!Number.isFinite(areaRate) || areaRate < 0 || !Number.isFinite(perimeterDividedByAreaRate) || perimeterDividedByAreaRate < 0) {
    return 0;
  }

  const areaM2 = widthM * heightM;
  if (!Number.isFinite(areaM2) || areaM2 <= 0) {
    return 0;
  }

  const perimeterM = 2 * (widthM + heightM);
  if (!Number.isFinite(perimeterM) || perimeterM < 0) {
    return 0;
  }

  const price = areaM2 * areaRate + (perimeterM / areaM2) * perimeterDividedByAreaRate;
  return Number.isFinite(price) && price > 0 ? price : 0;
}

export function bagetQuote(input: BagetQuoteInput, extrasConfig: BaguetteExtrasPricingConfig = getBaguetteExtrasDefaultConfig()): BagetQuoteResult {
  const warnings: string[] = [];
  const width = Number(input.width);
  const height = Number(input.height);
  const quantity = Math.max(1, Math.round(input.quantity) || 1);
  const requiresPrint = Boolean(input.requiresPrint);
  const printMaterial = input.printMaterial ?? null;
  const validSize = Number.isFinite(width) && Number.isFinite(height) && width >= 50 && height >= 50;
  const passepartoutSize = Math.max(0, input.passepartoutSize ?? 0);
  const passepartoutBottomSize = Math.max(0, input.passepartoutBottomSize ?? 0);

  const effectiveWidth = input.hasPassepartout ? width + 2 * passepartoutSize : width;
  const effectiveHeight = input.hasPassepartout ? height + passepartoutSize + passepartoutBottomSize : height;
  const standAllowed = validSize && effectiveWidth <= extrasConfig.stand.maxWidthMm && effectiveHeight <= extrasConfig.stand.maxHeightMm;
  const stretcherNarrowAllowed = width <= extrasConfig.stretcher.narrowMaxWidthMm && height <= extrasConfig.stretcher.narrowMaxHeightMm;

  const autoAdditions: AutoAdditionRule = resolveAutoAdditionsFromConfig(input.workType, extrasConfig);
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
  const stretchingRequired = Boolean(autoAdditions.stretchingRequired);

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
        hangingLabel: hangerType === 'crocodile' ? 'Крокодильчик × 1' : `Тросик (${extrasConfig.hanging.wireLoopDefaultQty} петли)`,
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
        stretchingRequired,
        stretchingCost: 0,
        printAreaM2: 0,
        regularPrintCost: 0,
        minimumPrintPriceApplied: false,
        minimumPrintPriceRUB: extrasConfig.print.minimumPrintPriceRUB,
      },
    };
  }

  const bagetWidthMm = requiresBaget ? (input.selectedBaget?.width_mm ?? 0) : 0;
  const areaM2 = (effectiveWidth * effectiveHeight) / 1_000_000;
  const perimeterM = (2 * (effectiveWidth + effectiveHeight)) / 1000;
  const printAreaM2 = (width * height) / 1_000_000;
  const bagetMeters = requiresBaget
    ? ((2 * (effectiveWidth + effectiveHeight) + 8 * bagetWidthMm) / 1000) * 1.05
    : 0;
  const bagetCost = requiresBaget && input.selectedBaget
    ? bagetMeters * input.selectedBaget.price_per_meter
    : 0;

  let materialsCost = 0;
  if (input.glazing !== 'none') {
    const glazingPricing = extrasConfig.materials[input.glazing];
    materialsCost += areaM2 * glazingPricing.areaPricePerM2 + perimeterM * glazingPricing.cuttingPricePerM;
  }
  if (input.hasPassepartout) {
    materialsCost += areaM2 * extrasConfig.materials.passepartout.areaPricePerM2 + perimeterM * extrasConfig.materials.passepartout.cuttingPricePerM;
  }
  if (effectiveBackPanel) {
    materialsCost += areaM2 * extrasConfig.materials.cardboard.areaPricePerM2 + perimeterM * extrasConfig.materials.cardboard.cuttingPricePerM;
  }

  const pvcCost = autoAdditions.pvcType === 'none'
    ? 0
    : areaM2 * extrasConfig.materials[autoAdditions.pvcType].areaPricePerM2 + perimeterM * extrasConfig.materials[autoAdditions.pvcType].cuttingPricePerM;
  const orabondCost = autoAdditions.addOrabond ? areaM2 * extrasConfig.materials.orabond.areaPricePerM2 : 0;
  const hangingQuantity = hangerType === 'crocodile'
    ? (effectiveWidth > extrasConfig.hanging.crocodileDoubleThresholdWidthMm ? 2 : 1)
    : 1;
  const wireLoopsCost = extrasConfig.hanging.wireLoopDefaultQty * extrasConfig.hanging.wireLoopPrice;
  const hangingCost = hangerType === 'wire'
    ? (width / 1000) * extrasConfig.hanging.wirePricePerMeterWidth + wireLoopsCost
    : extrasConfig.hanging.crocodilePrice * hangingQuantity;
  const standCost = effectiveStand ? extrasConfig.stand.price : 0;
  const stretcherMeters = (width * 2 + height * 2) / 1000;
  const stretcherCost = input.workType === 'stretchedCanvas'
    ? stretcherMeters * extrasConfig.stretcher.pricesPerMeter[effectiveStretcherType]
    : 0;
  const regularPrintCost = requiresPrint && printMaterial
    ? printAreaM2 * getBaguettePrintPricePerM2(printMaterial, extrasConfig)
    : 0;
  const minimumPrintPriceApplied = regularPrintCost > 0 && regularPrintCost < extrasConfig.print.minimumPrintPriceRUB;
  const printCost = requiresPrint && printMaterial && regularPrintCost > 0
    ? Math.max(regularPrintCost, extrasConfig.print.minimumPrintPriceRUB)
    : 0;
  const stretchingCost = stretchingRequired
    ? calculateStretchingPrice({
        widthMm: width,
        heightMm: height,
        areaRate: extrasConfig.stretching.areaRate,
        perimeterDividedByAreaRate: extrasConfig.stretching.perimeterDividedByAreaRate,
      })
    : 0;
  const clampsPerimeterM = requiresBaget
    ? (2 * (effectiveWidth + effectiveHeight) + 8 * bagetWidthMm) / 1000
    : 0;
  const clampsCount = requiresBaget && extrasConfig.fasteners.clampStepM > 0
    ? clampsPerimeterM / extrasConfig.fasteners.clampStepM
    : 0;
  const clampsCost = clampsCount * extrasConfig.fasteners.clampPrice;

  const rawItems: QuoteLineItem[] = [
    {
      key: 'baget',
      title: 'Багет',
      qty: quantity,
      unitPrice: Math.round(bagetCost),
      total: bagetCost * quantity,
    },
    {
      key: 'print',
      title: printMaterial === 'paper' ? 'Печать на бумаге' : 'Печать на холсте',
      qty: quantity,
      unitPrice: Math.round(printCost),
      total: printCost * quantity,
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
      key: 'clamps',
      title: 'Прижимы',
      qty: quantity,
      unitPrice: roundCurrency(clampsCost),
      total: clampsCost * quantity,
    },
    {
      key: 'hanging',
      title: hangerType === 'crocodile' ? `Крокодильчик × ${hangingQuantity}` : `Тросик + ${extrasConfig.hanging.wireLoopDefaultQty} петли`,
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
      unitPrice: roundCurrency(stretcherCost),
      total: stretcherCost * quantity,
    },
    {
      key: 'stretching',
      title: 'Натяжка',
      qty: quantity,
      unitPrice: roundCurrency(stretchingCost),
      total: stretchingCost * quantity,
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
      printCost,
      printMaterial,
      requiresPrint,
      transferSource: input.transferSource ?? null,
      materialsCost,
      pvcCost,
      orabondCost,
      hangingCost,
      clampsCost,
      clampsCount,
      clampsPrice: extrasConfig.fasteners.clampPrice,
      clampsStepM: extrasConfig.fasteners.clampStepM,
      clampsPerimeterM,
      hangingLabel: hangerType === 'crocodile' ? `Крокодильчик × ${hangingQuantity}` : `Тросик + ${extrasConfig.hanging.wireLoopDefaultQty} петли`,
      standCost,
      stretcherCost,
      stretchingCost,
      printAreaM2,
      regularPrintCost,
      minimumPrintPriceApplied,
      minimumPrintPriceRUB: extrasConfig.print.minimumPrintPriceRUB,
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
      stretchingRequired,
    },
  };
}
