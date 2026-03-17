import type { MugPrintType, MugType } from '@/lib/calculations/types';

export const HEAT_TRANSFER_QUANTITY_PRESETS = [1, 5, 10, 20, 50] as const;

export type HeatTransferPricingConfig = {
  discountThreshold: number;
  discountRate: number;
  mugPrices: Record<MugType, Record<MugPrintType, number>>;
  tshirtPrice: {
    ownClothes: number;
    companyClothes: number;
  };
  film: {
    unitPricePerMeter: number;
    transferPrice: number;
    urgentMultiplier: number;
    minimumOrderTotal: number;
  };
};

export const HEAT_TRANSFER_PRICING_CONFIG: HeatTransferPricingConfig = {
  discountThreshold: 10,
  discountRate: 0.1,
  mugPrices: {
    white330: { single: 550, wrap: 700 },
    chameleon: { single: 850, wrap: 1000 },
  },
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
