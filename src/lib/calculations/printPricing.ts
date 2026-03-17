import { resolveQuantity } from './shared';
import type { PrintPricingConfig } from '@/lib/print/printPricing';
import { PRINT_PRICING_FALLBACK_CONFIG } from '@/lib/print/printPricing';
import type { PrintDensity, PrintProductType, PrintType } from './types';

export type PrintPricingInput = {
  productType: PrintProductType;
  size: string;
  density: PrintDensity;
  printType: PrintType;
  lamination: boolean;
  presetQuantity: number;
  customQuantityInput: string;
};

export type PrintPricingResult = {
  quantity: number;
  isQuantityValid: boolean;
  totalPrice: number;
  unitPrice: number;
};

export function calculatePrintPricing(input: PrintPricingInput, pricingConfig: PrintPricingConfig = PRINT_PRICING_FALLBACK_CONFIG): PrintPricingResult {
  const resolved = resolveQuantity({
    presetQuantity: input.presetQuantity,
    customQuantityInput: input.customQuantityInput,
    minimumQuantity: pricingConfig.minimumQuantity,
  });

  if (!resolved.isValid) {
    return {
      quantity: resolved.quantity,
      isQuantityValid: false,
      totalPrice: 0,
      unitPrice: 0,
    };
  }

  const base = pricingConfig.basePer100[input.productType];
  const densityCoefficient = pricingConfig.densityCoefficient[input.density];
  const sideCoefficient = pricingConfig.sideCoefficient[input.printType];
  const laminationCoefficient = pricingConfig.laminationCoefficient[String(input.lamination) as 'true' | 'false'];
  const sizeCoefficient = pricingConfig.sizeCoefficient[input.productType][input.size] ?? 1;

  const rawTotal = (resolved.quantity / 100) * base * densityCoefficient * sideCoefficient * laminationCoefficient * sizeCoefficient;
  const totalPrice = Math.round(rawTotal);

  return {
    quantity: resolved.quantity,
    isQuantityValid: true,
    totalPrice,
    unitPrice: Math.round((totalPrice / resolved.quantity) * 100) / 100,
  };
}
