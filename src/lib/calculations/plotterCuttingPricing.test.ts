import { describe, expect, it } from 'vitest';
import { calculatePlotterCuttingPricing } from './plotterCuttingPricing';
import { PLOTTER_CUTTING_PRICING_CONFIG } from '@/lib/pricing-config/plotterCutting';

describe('calculatePlotterCuttingPricing', () => {
  it('keeps baseline formula totals with default config', () => {
    const result = calculatePlotterCuttingPricing({
      cutLengthInput: '10',
      areaInput: '2',
      complexity: 1.3,
      weeding: true,
      mountingFilm: true,
      transfer: true,
      urgent: true,
    });

    expect(result.baseCost).toBe(390);
    expect(result.extrasCost).toBe(650);
    expect(result.subtotal).toBe(1040);
    expect(result.urgentTotal).toBe(1352);
    expect(result.minimumApplied).toBe(false);
    expect(result.totalCost).toBe(1352);
  });

  it('applies minimum order total when computed total is lower', () => {
    const result = calculatePlotterCuttingPricing({
      cutLengthInput: '1',
      areaInput: '0.2',
      complexity: 1,
      weeding: false,
      mountingFilm: false,
      transfer: false,
      urgent: false,
    });

    expect(result.subtotal).toBe(30);
    expect(result.minimumApplied).toBe(true);
    expect(result.totalCost).toBe(PLOTTER_CUTTING_PRICING_CONFIG.minimumOrderTotal);
  });

  it('respects injected admin pricing config values', () => {
    const result = calculatePlotterCuttingPricing(
      {
        cutLengthInput: '5',
        areaInput: '1',
        complexity: 1,
        weeding: true,
        mountingFilm: true,
        transfer: true,
        urgent: true,
      },
      {
        baseCutPricePerMeter: 50,
        weedingPricePerMeter: 10,
        mountingFilmPricePerSquareMeter: 80,
        transferPrice: 200,
        urgentMultiplier: 1.5,
        minimumOrderTotal: 100,
      },
    );

    expect(result.baseCost).toBe(250);
    expect(result.extrasCost).toBe(330);
    expect(result.totalCost).toBe(870);
  });
});
