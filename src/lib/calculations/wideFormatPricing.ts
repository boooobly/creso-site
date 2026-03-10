import {
  isBannerMaterial,
  isFilmMaterial,
  WIDE_FORMAT_PRICING_CONFIG,
} from '@/lib/pricing-config/wideFormat';
import { parseNumericInput } from './shared';
import type { BannerDensity, WideFormatMaterialType } from './types';

export type WideFormatWidthWarningCode =
  | 'invalid_width'
  | 'max_width_exceeded'
  | 'canvas_max_width_exceeded'
  | null;

export type WideFormatPricingInput = {
  material: WideFormatMaterialType;
  bannerDensity: BannerDensity;
  widthInput: string;
  heightInput: string;
  quantityInput: string;
  edgeGluing: boolean;
  imageWelding: boolean;
  grommets: boolean;
  plotterCutByRegistrationMarks: boolean;
  cutByPositioningMarks: boolean;
};

export type WideFormatCalculationResult = {
  width: number;
  height: number;
  quantity: number;
  parsedValuesValid: boolean;
  positiveInputs: boolean;
  widthWarningCode: WideFormatWidthWarningCode;
  requiresJoinSeam: boolean;
  areaPerUnit: number;
  billableAreaPerUnit: number;
  perimeterPerUnit: number;
  basePrintCost: number;
  edgeGluingCost: number;
  imageWeldingCost: number;
  grommetsCount: number;
  grommetsCost: number;
  plotterCutEstimatedCost: number;
  positioningMarksCutCost: number;
  extrasCost: number;
  totalCost: number;
};

export function getWideFormatWidthWarningCode(material: WideFormatMaterialType, width: number): WideFormatWidthWarningCode {
  if (!Number.isFinite(width)) return 'invalid_width';

  const isCanvasMaterial = material.includes('canvas');
  const exceedsCanvasSingleLayoutWidth = width > WIDE_FORMAT_PRICING_CONFIG.canvasSingleLayoutMaxWidth;
  if (isCanvasMaterial && exceedsCanvasSingleLayoutWidth) {
    return 'canvas_max_width_exceeded';
  }

  const isBanner = isBannerMaterial(material);
  if (!isBanner && width > WIDE_FORMAT_PRICING_CONFIG.maxWidth) return 'max_width_exceeded';

  return null;
}

function getMaterialPricePerM2(material: WideFormatMaterialType): number {
  if (material === 'customer_roll_textured' || material === 'customer_roll_smooth') {
    const customerRollPerPass = material === 'customer_roll_textured'
      ? WIDE_FORMAT_PRICING_CONFIG.customerRollPerPass.textured
      : WIDE_FORMAT_PRICING_CONFIG.customerRollPerPass.smooth;

    return customerRollPerPass * WIDE_FORMAT_PRICING_CONFIG.passesStandard;
  }

  return WIDE_FORMAT_PRICING_CONFIG.pricesRUBPerM2[material];
}

export function calculateWideFormatPricing(input: WideFormatPricingInput): WideFormatCalculationResult {
  const width = parseNumericInput(input.widthInput);
  const height = parseNumericInput(input.heightInput);
  const quantity = parseNumericInput(input.quantityInput);

  const parsedValuesValid = [width, height, quantity].every((value) => Number.isFinite(value));
  const positiveInputs = width > 0 && height > 0 && quantity > 0;
  const widthWarningCode = getWideFormatWidthWarningCode(input.material, width);

  const areaPerUnit = width * height;
  const billableAreaPerUnit = Math.max(areaPerUnit, 1);
  const perimeterPerUnit = (width + height) * 2;
  const isBanner = isBannerMaterial(input.material);
  const requiresJoinSeam = isBanner && width > WIDE_FORMAT_PRICING_CONFIG.bannerJoinSeamWidthThreshold;

  const materialPricePerM2 = getMaterialPricePerM2(input.material);

  const basePrintCost = parsedValuesValid && positiveInputs && widthWarningCode === null
    ? billableAreaPerUnit * quantity * materialPricePerM2
    : 0;

  const edgeGluingCost = input.edgeGluing && isBanner && parsedValuesValid && positiveInputs && widthWarningCode === null
    ? perimeterPerUnit * quantity * WIDE_FORMAT_PRICING_CONFIG.edgeGluingPerimeterPrice
    : 0;

  const imageWeldingCost = requiresJoinSeam && parsedValuesValid && positiveInputs && widthWarningCode === null
    ? height * quantity * WIDE_FORMAT_PRICING_CONFIG.imageWeldingPerimeterPrice
    : 0;

  const plotterCutEstimatedCost = input.plotterCutByRegistrationMarks && isFilmMaterial(input.material) && parsedValuesValid && positiveInputs && widthWarningCode === null
    ? Math.max(
      WIDE_FORMAT_PRICING_CONFIG.plotterCutMinimumFee,
      perimeterPerUnit * quantity * WIDE_FORMAT_PRICING_CONFIG.plotterCutPerimeterPrice,
    )
    : 0;

  const grommetsCount = input.grommets && isBanner && parsedValuesValid && positiveInputs && widthWarningCode === null
    ? Math.ceil(perimeterPerUnit / WIDE_FORMAT_PRICING_CONFIG.grommetStepM)
    : 0;

  const grommetsCost = grommetsCount * WIDE_FORMAT_PRICING_CONFIG.grommetPrice * quantity;

  const positioningMarksCutCost = input.cutByPositioningMarks && !isBanner && basePrintCost > 0
    ? basePrintCost * WIDE_FORMAT_PRICING_CONFIG.positioningMarksCutPercent
    : 0;

  const extrasCost = edgeGluingCost + imageWeldingCost + grommetsCost + positioningMarksCutCost;

  return {
    width,
    height,
    quantity,
    parsedValuesValid,
    positiveInputs,
    widthWarningCode,
    requiresJoinSeam,
    areaPerUnit,
    billableAreaPerUnit,
    perimeterPerUnit,
    basePrintCost,
    edgeGluingCost,
    imageWeldingCost,
    grommetsCount,
    grommetsCost,
    plotterCutEstimatedCost,
    positioningMarksCutCost,
    extrasCost,
    totalCost: basePrintCost + extrasCost,
  };
}
