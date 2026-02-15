import {
  calculatePlotterCuttingPricing,
  calculatePrintPricing,
  calculateRequiredBagetLength,
  calculateWideFormatPricing,
  isBaguetteSuitable,
  parseIntegerInput,
  parseNumericInput,
  resolveHeatTransferQuantity,
  validateBagetDimensions,
  calculateHeatTransferPricing,
  type BagetInputValidation,
  type HeatTransferPricingInput,
  type PlotterCuttingPricingInput,
  type PrintPricingInput,
  type WideFormatPricingInput,
  type PrintDensity,
  type PrintProductType,
  type PrintType,
  type BannerDensity,
  type WideFormatMaterialType,
  type WideFormatWidthWarningCode,
  type PlotterMaterialType,
  type HeatTransferProductType,
  type MugPrintType,
  type MugType,
  type TshirtGender,
  type TshirtSize,
} from '@/lib/calculations';
import { BAGUETTES } from '@/lib/pricing-config/baget';
import { HEAT_TRANSFER_QUANTITY_PRESETS } from '@/lib/pricing-config/heatTransfer';
import { PLOTTER_COMPLEXITY_OPTIONS, PLOTTER_MATERIAL_OPTIONS } from '@/lib/pricing-config/plotterCutting';
import { PRINT_QUANTITY_PRESETS, PRINT_SIZE_OPTIONS } from '@/lib/pricing-config/print';
import { WIDE_FORMAT_MATERIAL_OPTIONS, WIDE_FORMAT_PRICING_CONFIG } from '@/lib/pricing-config/wideFormat';

export type {
  BagetInputValidation,
  HeatTransferPricingInput,
  PlotterCuttingPricingInput,
  PrintPricingInput,
  WideFormatPricingInput,
  PrintDensity,
  PrintProductType,
  PrintType,
  BannerDensity,
  WideFormatMaterialType,
  WideFormatWidthWarningCode,
  PlotterMaterialType,
  HeatTransferProductType,
  MugPrintType,
  MugType,
  TshirtGender,
  TshirtSize,
};

export function getPrintQuote(input: PrintPricingInput) {
  return calculatePrintPricing(input);
}

export function getWideFormatQuote(input: WideFormatPricingInput) {
  return calculateWideFormatPricing(input);
}

export function getHeatTransferQuote(input: HeatTransferPricingInput) {
  return calculateHeatTransferPricing(input);
}

export function getPlotterCuttingQuote(input: PlotterCuttingPricingInput) {
  return calculatePlotterCuttingPricing(input);
}

export function getBagetValidation(widthInput: string, heightInput: string): BagetInputValidation {
  return validateBagetDimensions(widthInput, heightInput);
}

export function getRequiredBagetLength(width: number, height: number, isValid: boolean): number | null {
  return calculateRequiredBagetLength(width, height, isValid);
}

export function isBagetSuitable(availableLength: number, requiredLength: number | null): boolean {
  return isBaguetteSuitable(availableLength, requiredLength);
}

export function getResolvedHeatTransferQuantity(productType: HeatTransferProductType, mugQuantity: number, tshirtQuantity: number): number {
  return resolveHeatTransferQuantity(productType, mugQuantity, tshirtQuantity);
}

export const engineUiCatalog = {
  print: {
    quantityPresets: PRINT_QUANTITY_PRESETS,
    sizeOptions: PRINT_SIZE_OPTIONS,
  },
  wideFormat: {
    materialOptions: WIDE_FORMAT_MATERIAL_OPTIONS,
    maxWidth: WIDE_FORMAT_PRICING_CONFIG.maxWidth,
  },
  heatTransfer: {
    quantityPresets: HEAT_TRANSFER_QUANTITY_PRESETS,
  },
  plotterCutting: {
    materialOptions: PLOTTER_MATERIAL_OPTIONS,
    complexityOptions: PLOTTER_COMPLEXITY_OPTIONS,
  },
  baget: {
    items: BAGUETTES,
  },
} as const;

export const engineParsers = {
  parseIntegerInput,
  parseNumericInput,
} as const;
