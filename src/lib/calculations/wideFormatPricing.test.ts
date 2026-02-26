import { describe, expect, it } from 'vitest';
import { calculateWideFormatPricing } from './wideFormatPricing';

describe('calculateWideFormatPricing', () => {
  it('does not apply positioning marks cut cost for banner materials', () => {
    const quote = calculateWideFormatPricing({
      material: 'banner_330',
      bannerDensity: 300,
      widthInput: '2',
      heightInput: '1',
      quantityInput: '1',
      edgeGluing: false,
      imageWelding: false,
      grommets: false,
      plotterCutByRegistrationMarks: false,
      cutByPositioningMarks: true,
    });

    expect(quote.positioningMarksCutCost).toBe(0);
    expect(quote.extrasCost).toBe(0);
  });
});
