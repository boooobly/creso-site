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

  it('applies roll width validation for paper, backlit, fabric and canvas', () => {
    expect(getWideFormatWidthWarningCode('paper_trans_skylight', 4, 1.6)).toBeNull();
    expect(getWideFormatWidthWarningCode('backlit_1_07', 4, 1)).toBeNull();
    expect(getWideFormatWidthWarningCode('backlit_1_07', 1.2, 1.2)).toBe('max_width_exceeded');
    expect(getWideFormatWidthWarningCode('polyester_fabric_100_0_9', 10, 0.9)).toBeNull();
    expect(getWideFormatWidthWarningCode('canvas_cotton_350', 2, 1.4)).toBeNull();
    expect(getWideFormatWidthWarningCode('canvas_cotton_350', 1.51, 1.6)).toBe('max_width_exceeded');
  });

  it('does not block banners with large dimensions due to seam capability', () => {
    expect(getWideFormatWidthWarningCode('banner_240_gloss_3_2m', 4, 4)).toBeNull();
  });
});
