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

  it('keeps banners calculable and adds one auto join seam when width > 3.1m', () => {
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

  it('validates non-banner roll materials by smaller side to support rotation', () => {
    expect(getWideFormatWidthWarningCode('self_adhesive_film_matte_1_5', 1.5, 50)).toBeNull();
    expect(getWideFormatWidthWarningCode('self_adhesive_film_matte_1_5', 3.2, 1.4)).toBeNull();
    expect(getWideFormatWidthWarningCode('self_adhesive_film_matte_1_5', 10, 0.8)).toBeNull();

    expect(getWideFormatWidthWarningCode('self_adhesive_film_matte_1_5', 1.6, 1.6)).toBe('max_width_exceeded');
    expect(getWideFormatWidthWarningCode('self_adhesive_film_matte_1_5', 2, 3)).toBe('max_width_exceeded');
  });

  it('calculates billed area using optimal roll layout orientation', () => {
    const quote = calculateWideFormatPricing({
      material: 'self_adhesive_film_matte_1_5',
      bannerDensity: 300,
      widthInput: '1.2',
      heightInput: '0.7',
      quantityInput: '2',
      edgeGluing: false,
      imageWelding: false,
      grommets: false,
      plotterCutByRegistrationMarks: false,
      cutByPositioningMarks: false,
    });

    expect(quote.areaPerUnit * quote.quantity).toBeCloseTo(1.68, 6);
    expect(quote.billableAreaPerUnit * quote.quantity).toBeCloseTo(1.68, 6);
    expect(quote.basePrintCost).toBeCloseTo(840, 6);
  });

  it('keeps billed area equal to true layout area for small orders without inflation', () => {
    const quote = calculateWideFormatPricing({
      material: 'self_adhesive_film_matte_1_5',
      bannerDensity: 300,
      widthInput: '0.4',
      heightInput: '0.3',
      quantityInput: '2',
      edgeGluing: false,
      imageWelding: false,
      grommets: false,
      plotterCutByRegistrationMarks: false,
      cutByPositioningMarks: false,
    });

    expect(quote.areaPerUnit * quote.quantity).toBeCloseTo(0.24, 6);
    expect(quote.billableAreaPerUnit * quote.quantity).toBeCloseTo(0.6, 6);
    expect(quote.basePrintCost).toBeCloseTo(300, 6);
  });

  it('uses one-item-per-row layout when two items cannot fit across roll width', () => {
    const quote = calculateWideFormatPricing({
      material: 'self_adhesive_film_matte_1_5',
      bannerDensity: 300,
      widthInput: '1.2',
      heightInput: '0.8',
      quantityInput: '2',
      edgeGluing: false,
      imageWelding: false,
      grommets: false,
      plotterCutByRegistrationMarks: false,
      cutByPositioningMarks: false,
    });

    expect(quote.areaPerUnit * quote.quantity).toBeCloseTo(1.92, 6);
    expect(quote.billableAreaPerUnit * quote.quantity).toBeCloseTo(1.92, 6);
    expect(quote.basePrintCost).toBeCloseTo(960, 6);
  });
});
