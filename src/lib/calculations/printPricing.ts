export type PrintProductType = 'cards' | 'flyers';
export type PrintDensity = 300 | 350 | 400;
export type PrintType = 'single' | 'double';

export type PrintPricingInput = {
  productType: PrintProductType;
  density: PrintDensity;
  printType: PrintType;
  lamination: boolean;
  effectiveQuantity: number;
};

const DENSITY_COEFFICIENT: Record<PrintDensity, number> = {
  300: 1,
  350: 1.2,
  400: 1.4,
};

const BASE_PER_100: Record<PrintProductType, number> = {
  cards: 500,
  flyers: 650,
};

export const PRINT_SIZE_OPTIONS: Record<PrintProductType, string[]> = {
  cards: ['90x50', '85x55'],
  flyers: ['A6', 'A5'],
};

export const PRINT_QUICK_QUANTITIES = [100, 500, 1000] as const;

export function isPrintQuantityValid(quantity: number): boolean {
  return Number.isFinite(quantity) && quantity >= 100;
}

export function calculatePrintTotalPrice(input: PrintPricingInput): number {
  if (!isPrintQuantityValid(input.effectiveQuantity)) {
    return 0;
  }

  const base = BASE_PER_100[input.productType];
  const densityCoeff = DENSITY_COEFFICIENT[input.density];
  const sideCoeff = input.printType === 'double' ? 1.5 : 1;
  const laminationCoeff = input.lamination ? 1.2 : 1;

  const price = (input.effectiveQuantity / 100) * base * densityCoeff * sideCoeff * laminationCoeff;
  return Math.round(price);
}

export function calculatePrintUnitPrice(totalPrice: number, effectiveQuantity: number): number {
  if (!isPrintQuantityValid(effectiveQuantity) || effectiveQuantity <= 0) {
    return 0;
  }

  return Number((totalPrice / effectiveQuantity).toFixed(2));
}
