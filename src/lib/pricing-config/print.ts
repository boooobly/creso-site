import type { PrintDensity, PrintProductType, PrintType } from '@/lib/calculations/types';

export const PRINT_SIZE_OPTIONS: Record<PrintProductType, readonly string[]> = {
  cards: ['90x50', '85x55'],
  flyers: ['A6', 'A5'],
};

export const PRINT_QUANTITY_PRESETS = [100, 500, 1000] as const;

export const PRINT_PRICING_CONFIG = {
  minimumQuantity: 100,
  basePer100: {
    cards: 500,
    flyers: 650,
  } as Record<PrintProductType, number>,
  densityCoefficient: {
    300: 1,
    350: 1.2,
    400: 1.4,
  } as Record<PrintDensity, number>,
  sideCoefficient: {
    single: 1,
    double: 1.5,
  } as Record<PrintType, number>,
  laminationCoefficient: {
    false: 1,
    true: 1.2,
  } as const,
  sizeCoefficient: {
    cards: { '90x50': 1, '85x55': 1 },
    flyers: { A6: 1, A5: 1 },
  } as Record<PrintProductType, Record<string, number>>,
};
