import { getWideFormatMaterialMaxWidth, isBannerMaterial, isFilmMaterial } from '@/lib/pricing-config/wideFormat';
import { WIDE_FORMAT_PRICING_FALLBACK_CONFIG, type WideFormatPricingConfig } from '@/lib/wide-format/wideFormatPricing';
import { parseNumericInput } from './shared';
import type { BannerDensity, WideFormatMaterialType } from './types';

export type WideFormatWidthWarningCode =
  | 'invalid_width'
  | 'max_width_exceeded'
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
  materialPricePerM2: number;
  regularMaterialCost: number;
  minimumPrintPriceApplied: boolean;
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

export function getWideFormatWidthWarningCode(
  material: WideFormatMaterialType,
  width: number,
  height: number,
  pricingConfig: WideFormatPricingConfig = WIDE_FORMAT_PRICING_FALLBACK_CONFIG,
): WideFormatWidthWarningCode {
  if (!Number.isFinite(width) || !Number.isFinite(height)) return 'invalid_width';

  if (isBannerMaterial(material)) {
    return null;
  }

  const materialMaxWidth = getWideFormatMaterialMaxWidth(material, pricingConfig);
  const smallerSide = Math.min(width, height);

  if (smallerSide > materialMaxWidth) return 'max_width_exceeded';

  return null;
}

function getMaterialPricePerM2(material: WideFormatMaterialType, pricingConfig: WideFormatPricingConfig): number {
  return pricingConfig.pricesRUBPerM2[material];
}

export function calculateWideFormatPricing(
  input: WideFormatPricingInput,
  pricingConfig: WideFormatPricingConfig = WIDE_FORMAT_PRICING_FALLBACK_CONFIG,
): WideFormatCalculationResult {
  const width = parseNumericInput(input.widthInput);
  const height = parseNumericInput(input.heightInput);
  const quantity = parseNumericInput(input.quantityInput);

  const parsedValuesValid = [width, height, quantity].every((value) => Number.isFinite(value));
  const positiveInputs = width > 0 && height > 0 && quantity > 0;
  const widthWarningCode = getWideFormatWidthWarningCode(input.material, width, height, pricingConfig);

  const areaPerUnit = width * height;
  const actualAreaTotal = areaPerUnit * quantity;
  const billableAreaTotal = actualAreaTotal;
  const billableAreaPerUnit = quantity > 0 ? billableAreaTotal / quantity : 0;
  const perimeterPerUnit = (width + height) * 2;
  const isBanner = isBannerMaterial(input.material);
  const requiresJoinSeam = isBanner && width > pricingConfig.bannerJoinSeamWidthThreshold;

  const materialPricePerM2 = getMaterialPricePerM2(input.material, pricingConfig);

  const regularMaterialCost = parsedValuesValid && positiveInputs && widthWarningCode === null
    ? billableAreaTotal * materialPricePerM2
    : 0;

  const minimumPrintPriceApplied = regularMaterialCost > 0 && regularMaterialCost < pricingConfig.minimumPrintPriceRUB;

  const basePrintCost = regularMaterialCost > 0
    ? Math.max(regularMaterialCost, pricingConfig.minimumPrintPriceRUB)
    : 0;

  const edgeGluingCost = input.edgeGluing && isBanner && parsedValuesValid && positiveInputs && widthWarningCode === null
    ? perimeterPerUnit * quantity * pricingConfig.edgeGluingPerimeterPrice
    : 0;

  const imageWeldingCost = requiresJoinSeam && parsedValuesValid && positiveInputs && widthWarningCode === null
    ? height * quantity * pricingConfig.imageWeldingPerimeterPrice
    : 0;

  const plotterCutEstimatedCost = input.plotterCutByRegistrationMarks && isFilmMaterial(input.material) && parsedValuesValid && positiveInputs && widthWarningCode === null
    ? Math.max(
      pricingConfig.plotterCutMinimumFee,
      perimeterPerUnit * quantity * pricingConfig.plotterCutPerimeterPrice,
    )
    : 0;

  const grommetsCount = input.grommets && isBanner && parsedValuesValid && positiveInputs && widthWarningCode === null
    ? Math.ceil(perimeterPerUnit / pricingConfig.grommetStepM)
    : 0;

  const grommetsCost = grommetsCount * pricingConfig.grommetPrice * quantity;

  const positioningMarksCutCost = input.cutByPositioningMarks && !isBanner && basePrintCost > 0
    ? basePrintCost * pricingConfig.positioningMarksCutPercent
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
    materialPricePerM2,
    regularMaterialCost,
    minimumPrintPriceApplied,
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
