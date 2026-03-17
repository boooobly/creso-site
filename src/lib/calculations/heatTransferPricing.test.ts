import { describe, expect, it } from 'vitest';
import { calculateHeatTransferPricing } from './heatTransferPricing';

describe('calculateHeatTransferPricing', () => {
  it('keeps mug pricing behavior with discount threshold', () => {
    const result = calculateHeatTransferPricing({
      productType: 'mug',
      mugType: 'white330',
      mugPrintType: 'single',
      mugQuantity: 10,
      tshirtQuantity: 1,
      useOwnClothes: false,
      filmLengthInput: '1',
      filmUrgent: false,
      filmTransfer: false,
    });

    expect(result.unitPrice).toBe(550);
    expect(result.subtotal).toBe(5500);
    expect(result.discount).toBe(550);
    expect(result.total).toBe(4950);
  });

  it('keeps film minimum floor and options behavior', () => {
    const result = calculateHeatTransferPricing({
      productType: 'film',
      mugType: 'white330',
      mugPrintType: 'single',
      mugQuantity: 1,
      tshirtQuantity: 1,
      useOwnClothes: false,
      filmLengthInput: '0.2',
      filmUrgent: false,
      filmTransfer: false,
    });

    expect(result.subtotal).toBe(80);
    expect(result.total).toBe(400);
  });

  it('uses injected admin config values without changing formula shape', () => {
    const result = calculateHeatTransferPricing(
      {
        productType: 'tshirt',
        mugType: 'white330',
        mugPrintType: 'single',
        mugQuantity: 1,
        tshirtQuantity: 12,
        useOwnClothes: true,
        filmLengthInput: '1',
        filmUrgent: false,
        filmTransfer: false,
      },
      {
        discountThreshold: 10,
        discountRate: 0.2,
        mugPrices: {
          white330: { single: 500, wrap: 600 },
          chameleon: { single: 700, wrap: 800 },
        },
        tshirtPrice: {
          ownClothes: 100,
          companyClothes: 300,
        },
        film: {
          unitPricePerMeter: 250,
          transferPrice: 150,
          urgentMultiplier: 1.4,
          minimumOrderTotal: 200,
        },
      },
    );

    expect(result.unitPrice).toBe(100);
    expect(result.subtotal).toBe(1200);
    expect(result.discount).toBe(240);
    expect(result.total).toBe(960);
  });
});
