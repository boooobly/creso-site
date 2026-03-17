import { describe, expect, it } from 'vitest';
import { calculatePrintPricing } from './printPricing';
import { PRINT_PRICING_FALLBACK_CONFIG, type PrintPricingConfig } from '@/lib/print/printPricing';

describe('calculatePrintPricing', () => {
  it('preserves baseline total for cards with default migrated config', () => {
    const result = calculatePrintPricing({
      productType: 'cards',
      size: '90x50',
      density: 300,
      printType: 'single',
      lamination: false,
      presetQuantity: 1000,
      customQuantityInput: '',
    });

    expect(result).toEqual({
      quantity: 1000,
      isQuantityValid: true,
      totalPrice: 5000,
      unitPrice: 5,
    });
  });

  it('preserves baseline total for flyers with combined coefficients', () => {
    const result = calculatePrintPricing({
      productType: 'flyers',
      size: 'A5',
      density: 400,
      printType: 'double',
      lamination: true,
      presetQuantity: 500,
      customQuantityInput: '',
    });

    expect(result.totalPrice).toBe(8190);
    expect(result.unitPrice).toBe(16.38);
  });

  it('keeps quantity validation behavior after migration', () => {
    const result = calculatePrintPricing({
      productType: 'cards',
      size: '85x55',
      density: 350,
      printType: 'single',
      lamination: false,
      presetQuantity: 500,
      customQuantityInput: '50',
    });

    expect(result).toEqual({
      quantity: 50,
      isQuantityValid: false,
      totalPrice: 0,
      unitPrice: 0,
    });
  });

  it('applies admin-provided pricing config values', () => {
    const config: PrintPricingConfig = {
      ...PRINT_PRICING_FALLBACK_CONFIG,
      minimumQuantity: 200,
      sizeCoefficient: {
        ...PRINT_PRICING_FALLBACK_CONFIG.sizeCoefficient,
        cards: {
          ...PRINT_PRICING_FALLBACK_CONFIG.sizeCoefficient.cards,
          '90x50': 1.3,
        },
      },
    };

    const result = calculatePrintPricing({
      productType: 'cards',
      size: '90x50',
      density: 300,
      printType: 'single',
      lamination: false,
      presetQuantity: 200,
      customQuantityInput: '',
    }, config);

    expect(result.totalPrice).toBe(1300);
  });
});
