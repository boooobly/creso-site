import { describe, expect, it } from 'vitest';
import { calculateWideFormatPricing, getWideFormatWidthWarningCode } from './wideFormatPricing';

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

  it('keeps banners calculable above single-print max width and adds one auto join seam when width > 3.1m', () => {
    const quote = calculateWideFormatPricing({
      material: 'banner_440',
      bannerDensity: 300,
      widthInput: '3.5',
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
      material: 'banner_440',
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

  it('returns dedicated warning when canvas width exceeds 1.45m', () => {
    expect(getWideFormatWidthWarningCode('canvas_cotton_350', 1.46)).toBe('canvas_max_width_exceeded');
  });
});
