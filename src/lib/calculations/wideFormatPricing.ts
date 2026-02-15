import { WIDE_FORMAT_PRICING_CONFIG } from '@/lib/pricing-config/wideFormat';
import { parseNumericInput } from './shared';
import type { BannerDensity, WideFormatMaterialType } from './types';

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
    material === 'banner' &&
    (width < WIDE_FORMAT_PRICING_CONFIG.bannerWidthRange.min || width > WIDE_FORMAT_PRICING_CONFIG.bannerWidthRange.max)
  ) {
    return 'banner_width_out_of_range';
  }

  if (
    material !== 'banner' &&
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
  const perimeterPerUnit = (width + height) * 2;

  const baseRate =
    input.material === 'banner'
      ? WIDE_FORMAT_PRICING_CONFIG.bannerDensityPrice[input.bannerDensity]
      : WIDE_FORMAT_PRICING_CONFIG.materialPrice[input.material];

  const basePrintCost = parsedValuesValid && positiveInputs && widthWarningCode === null
    ? areaPerUnit * quantity * baseRate
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
    perimeterPerUnit,
    basePrintCost,
    edgeGluingCost,
    grommetsCost,
    extrasCost,
    totalCost: basePrintCost + extrasCost,
  };
}
