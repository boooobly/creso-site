export const WIDE_FORMAT_MATERIAL_OPTIONS = [
  { value: 'banner', label: 'Баннер' },
  { value: 'selfAdhesiveFilm', label: 'Самоклеящаяся пленка' },
  { value: 'backlit', label: 'Бэклит' },
  { value: 'perforatedFilm', label: 'Перфорированная пленка' },
  { value: 'posterPaper', label: 'Постерная бумага' },
] as const;

export type WideFormatMaterialType = typeof WIDE_FORMAT_MATERIAL_OPTIONS[number]['value'];
export type BannerDensity = 220 | 300 | 440;

export type WideFormatPricingInput = {
  material: WideFormatMaterialType;
  bannerDensity: BannerDensity;
  width: number;
  height: number;
  quantity: number;
  edgeGluing: boolean;
  grommets: number;
};

export type WideFormatCalculationResult = {
  parsedValuesValid: boolean;
  positiveInputs: boolean;
  widthWarning: string;
  areaPerUnit: number;
  perimeterPerUnit: number;
  baseRate: number;
  basePrintCost: number;
  edgeGluingCost: number;
  grommetsCost: number;
  extrasCost: number;
  totalCost: number;
};

const BANNER_DENSITY_PRICES: Record<BannerDensity, number> = {
  220: 350,
  300: 420,
  440: 520,
};

const MATERIAL_PRICES: Record<Exclude<WideFormatMaterialType, 'banner'>, number> = {
  selfAdhesiveFilm: 600,
  backlit: 750,
  perforatedFilm: 700,
  posterPaper: 300,
};

export const MAX_WIDE_FORMAT_WIDTH = 3.2;

export function getWideFormatWidthWarning(material: WideFormatMaterialType, width: number): string {
  if (!Number.isFinite(width)) return 'Введите корректную ширину.';
  if (width > MAX_WIDE_FORMAT_WIDTH) return `Максимальная ширина — ${MAX_WIDE_FORMAT_WIDTH} м.`;

  if (material === 'banner' && (width < 1.2 || width > 3)) {
    return 'Для баннера допустимая ширина: 1.2–3 м.';
  }

  if (material !== 'banner' && (width < 1.06 || width > 1.6)) {
    return 'Для плёнки и бумаги допустимая ширина: 1.06–1.6 м.';
  }

  return '';
}

export function calculateWideFormatPricing(input: WideFormatPricingInput): WideFormatCalculationResult {
  const values = [input.width, input.height, input.quantity, input.grommets];
  const parsedValuesValid = values.every((value) => Number.isFinite(value));
  const positiveInputs = input.width > 0 && input.height > 0 && input.quantity > 0 && input.grommets >= 0;
  const widthWarning = getWideFormatWidthWarning(input.material, input.width);

  const areaPerUnit = input.width * input.height;
  const perimeterPerUnit = (input.width + input.height) * 2;
  const baseRate =
    input.material === 'banner' ? BANNER_DENSITY_PRICES[input.bannerDensity] : MATERIAL_PRICES[input.material];

  const basePrintCost = parsedValuesValid && positiveInputs && !widthWarning
    ? areaPerUnit * input.quantity * baseRate
    : 0;

  const edgeGluingCost = input.edgeGluing && parsedValuesValid && positiveInputs && !widthWarning
    ? perimeterPerUnit * input.quantity * 40
    : 0;

  const grommetsCost = parsedValuesValid && positiveInputs ? input.grommets * input.quantity * 5 : 0;
  const extrasCost = edgeGluingCost + grommetsCost;
  const totalCost = basePrintCost + extrasCost;

  return {
    parsedValuesValid,
    positiveInputs,
    widthWarning,
    areaPerUnit,
    perimeterPerUnit,
    baseRate,
    basePrintCost,
    edgeGluingCost,
    grommetsCost,
    extrasCost,
    totalCost,
  };
}
