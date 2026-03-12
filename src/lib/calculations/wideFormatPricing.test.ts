import { describe, expect, it } from 'vitest';
import { calculateWideFormatPricing, getWideFormatWidthWarningCode } from './wideFormatPricing';

describe('calculateWideFormatPricing', () => {
  it('does not apply positioning marks cut cost for banner materials', () => {
    const quote = calculateWideFormatPricing({
      material: 'banner_340_matte_3_2m',
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

  it('keeps banners calculable within 3.2m and adds one auto join seam when width > 3.1m', () => {
    const quote = calculateWideFormatPricing({
      material: 'banner_440_matte_3_2m',
      bannerDensity: 300,
      widthInput: '3.15',
      heightInput: '2',
      quantityInput: '2',
      edgeGluing: false,
      imageWelding: false,
      grommets: false,
      plotterCutByRegistrationMarks: false,
      cutByPositioningMarks: false,
    });

    expect(quote.widthWarningCode).toBeNull();
    expect(quote.basePrintCost).toBeGreaterThan(0);
    expect(quote.requiresJoinSeam).toBe(true);
    expect(quote.imageWeldingCost).toBe(600);
  });

  it('does not add auto join seam for banners with width up to 3.1m', () => {
    const quote = calculateWideFormatPricing({
      material: 'banner_440_matte_3_2m',
      bannerDensity: 300,
      widthInput: '3.1',
      heightInput: '2',
      quantityInput: '1',
      edgeGluing: false,
      imageWelding: false,
      grommets: false,
      plotterCutByRegistrationMarks: false,
      cutByPositioningMarks: false,
    });

    expect(quote.requiresJoinSeam).toBe(false);
    expect(quote.imageWeldingCost).toBe(0);
  });

  it('returns max width warning when selected material width is exceeded', () => {
    expect(getWideFormatWidthWarningCode('canvas_cotton_350', 1.51)).toBe('max_width_exceeded');
    expect(getWideFormatWidthWarningCode('polyester_fabric_100_0_9', 1)).toBe('max_width_exceeded');
  });
});
