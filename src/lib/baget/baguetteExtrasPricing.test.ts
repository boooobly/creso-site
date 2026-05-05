import { describe, expect, it } from 'vitest';
import {
  BAGUETTE_PRICING_REQUIRED_KEYS,
  getBaguetteExtrasDefaultConfig,
  getBaguetteExtrasPricingConfigFromRows,
} from './baguetteExtrasPricing';
import { bagetQuote } from '@/lib/calculations/bagetQuote';

const selectedBaget = {
  id: 'b-1',
  article: 'A-1',
  name: 'Test Baget',
  color: 'black',
  style: 'modern',
  width_mm: 30,
  price_per_meter: 1000,
  image: '/x.jpg',
};

describe('baguette pricing fallback regression', () => {
  it('uses fallback defaults when admin rows are missing or invalid', () => {
    const runtime = getBaguetteExtrasPricingConfigFromRows([
      { subcategory: 'print', key: 'canvas_price_per_m2', value: 'not-a-number' },
    ]);

    const defaults = getBaguetteExtrasDefaultConfig();

    expect(runtime.config.print.canvasPricePerM2).toBe(defaults.print.canvasPricePerM2);
    expect(runtime.fallbackUsedKeys.some((item) => item.key === 'print.canvas_price_per_m2')).toBe(true);
    expect(runtime.missingKeys.length).toBe(BAGUETTE_PRICING_REQUIRED_KEYS.length - 1);
    expect(runtime.isComplete).toBe(false);
  });

  it('baget quote stays calculable with default fallback config only', () => {
    const quote = bagetQuote({
      width: 600,
      height: 400,
      quantity: 1,
      selectedBaget,
      workType: 'photo',
      glazing: 'none',
      hasPassepartout: false,
      backPanel: true,
      hangerType: 'crocodile',
      stand: false,
      stretcherType: 'narrow',
      requiresPrint: true,
      printMaterial: 'paper',
    }, getBaguetteExtrasDefaultConfig());

    expect(quote.total).toBeGreaterThan(0);
    expect(Number.isNaN(quote.total)).toBe(false);
    expect(quote.items.some((item) => item.key === 'print')).toBe(true);
  });
});
