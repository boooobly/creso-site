import type { MugPrintType, MugType } from '@/lib/calculations/types';

export const HEAT_TRANSFER_QUANTITY_PRESETS = [1, 5, 10, 20, 50] as const;

export const HEAT_TRANSFER_PRICING_CONFIG = {
  discountThreshold: 10,
  discountRate: 0.1,
  mugPrices: {
    white330: { single: 550, wrap: 700 },
    chameleon: { single: 850, wrap: 1000 },
  } as Record<MugType, Record<MugPrintType, number>>,
  tshirtPrice: {
    ownClothes: 700,
    companyClothes: 1200,
  },
  film: {
    unitPricePerMeter: 400,
    transferPrice: 300,
    urgentMultiplier: 1.3,
    minimumOrderTotal: 400,
  },
};
