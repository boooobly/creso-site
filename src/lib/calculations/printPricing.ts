import { PRINT_PRICING_CONFIG } from '@/lib/pricing-config/print';
import { resolveQuantity } from './shared';
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

export function calculatePrintPricing(input: PrintPricingInput): PrintPricingResult {
  const resolved = resolveQuantity({
    presetQuantity: input.presetQuantity,
    customQuantityInput: input.customQuantityInput,
    minimumQuantity: PRINT_PRICING_CONFIG.minimumQuantity,
  });

  if (!resolved.isValid) {
    return {
      quantity: resolved.quantity,
      isQuantityValid: false,
      totalPrice: 0,
      unitPrice: 0,
    };
  }

  const base = PRINT_PRICING_CONFIG.basePer100[input.productType];
  const densityCoefficient = PRINT_PRICING_CONFIG.densityCoefficient[input.density];
  const sideCoefficient = PRINT_PRICING_CONFIG.sideCoefficient[input.printType];
  const laminationCoefficient = PRINT_PRICING_CONFIG.laminationCoefficient[String(input.lamination) as 'true' | 'false'];
  const sizeCoefficient = PRINT_PRICING_CONFIG.sizeCoefficient[input.productType][input.size] ?? 1;

  const rawTotal = (resolved.quantity / 100) * base * densityCoefficient * sideCoefficient * laminationCoefficient * sizeCoefficient;
  const totalPrice = Math.round(rawTotal);

  return {
    quantity: resolved.quantity,
    isQuantityValid: true,
    totalPrice,
    unitPrice: Math.round((totalPrice / resolved.quantity) * 100) / 100,
  };
}
