import { HEAT_TRANSFER_PRICING_CONFIG } from '@/lib/pricing-config/heatTransfer';
import { parseNumericInput } from './shared';
import type { HeatTransferProductType, MugPrintType, MugType } from './types';

export type HeatTransferPricingInput = {
  productType: HeatTransferProductType;
  mugType: MugType;
  mugPrintType: MugPrintType;
  mugQuantity: number;
  tshirtQuantity: number;
  useOwnClothes: boolean;
  filmLengthInput: string;
  filmUrgent: boolean;
  filmTransfer: boolean;
};

export type HeatTransferPricingResult = {
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  total: number;
  safeFilmLength: number;
};

export function resolveHeatTransferQuantity(productType: HeatTransferProductType, mugQuantity: number, tshirtQuantity: number): number {
  if (productType === 'mug') return mugQuantity;
  if (productType === 'tshirt') return tshirtQuantity;
  return 1;
}

function calculateDiscount(subtotal: number, quantity: number): number {
  return quantity >= HEAT_TRANSFER_PRICING_CONFIG.discountThreshold
    ? subtotal * HEAT_TRANSFER_PRICING_CONFIG.discountRate
    : 0;
}

export function calculateHeatTransferPricing(input: HeatTransferPricingInput): HeatTransferPricingResult {
  if (input.productType === 'mug') {
    const quantity = input.mugQuantity;
    const unitPrice = HEAT_TRANSFER_PRICING_CONFIG.mugPrices[input.mugType][input.mugPrintType];
    const subtotal = unitPrice * quantity;
    const discount = calculateDiscount(subtotal, quantity);
    return { quantity, unitPrice, subtotal, discount, total: subtotal - discount, safeFilmLength: 0 };
  }

  if (input.productType === 'tshirt') {
    const quantity = input.tshirtQuantity;
    const unitPrice = input.useOwnClothes
      ? HEAT_TRANSFER_PRICING_CONFIG.tshirtPrice.ownClothes
      : HEAT_TRANSFER_PRICING_CONFIG.tshirtPrice.companyClothes;
    const subtotal = unitPrice * quantity;
    const discount = calculateDiscount(subtotal, quantity);
    return { quantity, unitPrice, subtotal, discount, total: subtotal - discount, safeFilmLength: 0 };
  }

  const length = parseNumericInput(input.filmLengthInput);
  const safeFilmLength = Number.isFinite(length) && length > 0 ? length : 0;
  const base = safeFilmLength * HEAT_TRANSFER_PRICING_CONFIG.film.unitPricePerMeter;
  const transferCost = input.filmTransfer ? HEAT_TRANSFER_PRICING_CONFIG.film.transferPrice : 0;
  const subtotal = base + transferCost;
  const urgentTotal = input.filmUrgent ? subtotal * HEAT_TRANSFER_PRICING_CONFIG.film.urgentMultiplier : subtotal;
  const total = urgentTotal > 0
    ? Math.max(urgentTotal, HEAT_TRANSFER_PRICING_CONFIG.film.minimumOrderTotal)
    : HEAT_TRANSFER_PRICING_CONFIG.film.minimumOrderTotal;

  return {
    quantity: 1,
    unitPrice: HEAT_TRANSFER_PRICING_CONFIG.film.unitPricePerMeter,
    subtotal,
    discount: 0,
    total,
    safeFilmLength,
  };
}
