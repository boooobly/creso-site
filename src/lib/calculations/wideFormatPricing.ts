import { WIDE_FORMAT_PRICING_CONFIG } from '@/lib/pricing-config/wideFormat';
import { parseNumericInput } from './shared';
import type { BannerDensity, WideFormatMaterialType } from './types';

const BANNER_MATERIALS: ReadonlySet<WideFormatMaterialType> = new Set([
  'banner_240_gloss_3_2m',
  'banner_240_matt_3_2m',
  'banner_280',
  'banner_330',
  'banner_440',
  'banner_460_cast_3_2m',
  'banner_mesh_380_3_2m',
  'banner_510_cast_3_2m',
]);

export type WideFormatWidthWarningCode =
  | 'invalid_width'
  | 'max_width_exceeded'
  | 'banner_width_out_of_range'
  | 'sheet_width_out_of_range'
  | null;

export type WideFormatPricingInput = {
  material: WideFormatMaterialType;
  bannerDensity: BannerDensity;
  widthInput: string;
  heightInput: string;
  quantityInput: string;
  grommetsInput: string;
  edgeGluing: boolean;
};

export type WideFormatCalculationResult = {
  width: number;
  height: number;
  quantity: number;
  grommets: number;
  parsedValuesValid: boolean;
  positiveInputs: boolean;
  widthWarningCode: WideFormatWidthWarningCode;
  areaPerUnit: number;
  billableAreaPerUnit: number;
  perimeterPerUnit: number;
  basePrintCost: number;
  edgeGluingCost: number;
  grommetsCost: number;
  extrasCost: number;
  totalCost: number;
};

export function getWideFormatWidthWarningCode(material: WideFormatMaterialType, width: number): WideFormatWidthWarningCode {
  if (!Number.isFinite(width)) return 'invalid_width';
  if (width > WIDE_FORMAT_PRICING_CONFIG.maxWidth) return 'max_width_exceeded';

  if (
    BANNER_MATERIALS.has(material) &&
    (width < WIDE_FORMAT_PRICING_CONFIG.bannerWidthRange.min || width > WIDE_FORMAT_PRICING_CONFIG.bannerWidthRange.max)
  ) {
    return 'banner_width_out_of_range';
  }

  if (
    !BANNER_MATERIALS.has(material) &&
    (width < WIDE_FORMAT_PRICING_CONFIG.sheetWidthRange.min || width > WIDE_FORMAT_PRICING_CONFIG.sheetWidthRange.max)
  ) {
    return 'sheet_width_out_of_range';
  }

  return null;
}

export function calculateWideFormatPricing(input: WideFormatPricingInput): WideFormatCalculationResult {
  const width = parseNumericInput(input.widthInput);
  const height = parseNumericInput(input.heightInput);
  const quantity = parseNumericInput(input.quantityInput);
  const grommets = parseNumericInput(input.grommetsInput);

  const parsedValuesValid = [width, height, quantity, grommets].every((value) => Number.isFinite(value));
  const positiveInputs = width > 0 && height > 0 && quantity > 0 && grommets >= 0;
  const widthWarningCode = getWideFormatWidthWarningCode(input.material, width);

  const areaPerUnit = width * height;
  const billableAreaPerUnit = Math.max(areaPerUnit, 1);
  const perimeterPerUnit = (width + height) * 2;

  const pricePerM2 = WIDE_FORMAT_PRICING_CONFIG.pricesRUBPerM2[input.material];

  const basePrintCost = parsedValuesValid && positiveInputs && widthWarningCode === null
    ? billableAreaPerUnit * quantity * pricePerM2
    : 0;

  const edgeGluingCost = input.edgeGluing && parsedValuesValid && positiveInputs && widthWarningCode === null
    ? perimeterPerUnit * quantity * WIDE_FORMAT_PRICING_CONFIG.edgeGluingPerimeterPrice
    : 0;

  const grommetsCost = parsedValuesValid && positiveInputs
    ? grommets * quantity * WIDE_FORMAT_PRICING_CONFIG.grommetPrice
    : 0;

  const extrasCost = edgeGluingCost + grommetsCost;

  return {
    width,
    height,
    quantity,
    grommets,
    parsedValuesValid,
    positiveInputs,
    widthWarningCode,
    areaPerUnit,
    billableAreaPerUnit,
    perimeterPerUnit,
    basePrintCost,
    edgeGluingCost,
    grommetsCost,
    extrasCost,
    totalCost: basePrintCost + extrasCost,
  };
}
