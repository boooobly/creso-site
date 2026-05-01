import { describe, expect, it } from 'vitest';
import { bagetQuote, calculateStretchingPrice } from './bagetQuote';
import { getBaguetteExtrasDefaultConfig } from '@/lib/baget/baguetteExtrasPricing';

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

describe('bagetQuote', () => {
  it('calculates basic case without passepartout/stretcher extras', () => {
    const result = bagetQuote({
      width: 500,
      height: 700,
      quantity: 1,
      selectedBaget,
      workType: 'canvas',
      glazing: 'none',
      hasPassepartout: false,
      backPanel: true,
      hangerType: 'crocodile',
      stand: false,
      stretcherType: 'narrow',
    });

    expect(result.effectiveSize).toEqual({ width: 500, height: 700 });
    expect(result.total).toBe(3027);
    expect(result.items.map((item) => item.key)).toEqual(['baget', 'materials', 'hanging']);
  });

  it('adds passepartout and increases effective size and total', () => {
    const withoutPassepartout = bagetQuote({
      width: 400,
      height: 500,
      quantity: 1,
      selectedBaget,
      workType: 'canvas',
      glazing: 'none',
      hasPassepartout: false,
      backPanel: true,
      hangerType: 'crocodile',
      stand: false,
      stretcherType: 'narrow',
    });

    const withPassepartout = bagetQuote({
      width: 400,
      height: 500,
      quantity: 1,
      selectedBaget,
      workType: 'canvas',
      glazing: 'none',
      hasPassepartout: true,
      passepartoutSize: 40,
      passepartoutBottomSize: 55,
      backPanel: true,
      hangerType: 'crocodile',
      stand: false,
      stretcherType: 'narrow',
    });

    expect(withPassepartout.effectiveSize).toEqual({ width: 480, height: 595 });
    expect(withPassepartout.total).toBeGreaterThan(withoutPassepartout.total);
  });

  it('uses narrow stretcher up to 50x50 and switches to wide over 50x50', () => {
    const narrow = bagetQuote({
      width: 500,
      height: 500,
      quantity: 1,
      selectedBaget,
      workType: 'stretchedCanvas',
      glazing: 'none',
      hasPassepartout: false,
      backPanel: true,
      hangerType: 'crocodile',
      stand: false,
      stretcherType: 'narrow',
    });

    const forcedWide = bagetQuote({
      width: 510,
      height: 500,
      quantity: 1,
      selectedBaget,
      workType: 'stretchedCanvas',
      glazing: 'none',
      hasPassepartout: false,
      backPanel: true,
      hangerType: 'crocodile',
      stand: false,
      stretcherType: 'narrow',
    });

    expect(narrow.meta?.stretcherType).toBe('narrow');
    expect(forcedWide.meta?.stretcherType).toBe('wide');
    expect(forcedWide.total).toBeGreaterThan(narrow.total);
  });


  it('does not auto-add PVC for photo work type', () => {
    const result = bagetQuote({
      width: 400,
      height: 500,
      quantity: 1,
      selectedBaget,
      workType: 'photo',
      glazing: 'none',
      hasPassepartout: false,
      backPanel: true,
      hangerType: 'crocodile',
      stand: false,
      stretcherType: 'narrow',
    });

    expect(result.meta?.autoAdditions?.pvcType).toBe('none');
    expect(result.items.some((item) => item.key === 'pvc')).toBe(false);
  });



  it('uses wire pricing by width and auto-includes 2 loops', () => {
    const result = bagetQuote({
      width: 800,
      height: 400,
      quantity: 1,
      selectedBaget,
      workType: 'canvas',
      glazing: 'none',
      hasPassepartout: false,
      backPanel: false,
      hangerType: 'wire',
      stand: false,
      stretcherType: 'narrow',
    });

    expect(result.meta?.hangingCost).toBe(54);
  });

  it('uses updated stretcher and stand prices', () => {
    const result = bagetQuote({
      width: 300,
      height: 300,
      quantity: 1,
      selectedBaget,
      workType: 'stretchedCanvas',
      frameMode: 'noFrame',
      glazing: 'none',
      hasPassepartout: false,
      backPanel: false,
      hangerType: 'wire',
      stand: true,
      stretcherType: 'narrow',
    });

    expect(result.meta?.stretcherCost).toBe(240);
    expect(result.meta?.standCost).toBe(120);
  });

  it('uses updated area + cutting material prices', () => {
    const result = bagetQuote({
      width: 1000,
      height: 500,
      quantity: 1,
      selectedBaget,
      workType: 'canvas',
      glazing: 'glass',
      hasPassepartout: false,
      backPanel: false,
      hangerType: 'crocodile',
      stand: false,
      stretcherType: 'narrow',
    });

    expect(result.meta?.materialsCost).toBeCloseTo(1942.5, 5);
  });



  it('adds print cost as a separate line when print is required', () => {
    const result = bagetQuote({
      width: 800,
      height: 600,
      quantity: 1,
      selectedBaget,
      workType: 'canvas',
      glazing: 'none',
      hasPassepartout: false,
      backPanel: false,
      hangerType: 'crocodile',
      stand: false,
      stretcherType: 'narrow',
      requiresPrint: true,
      printMaterial: 'canvas',
      transferSource: 'wide-format',
    });

    expect(result.items.some((item) => item.key === 'print')).toBe(true);
    expect(result.meta?.printCost).toBe(720);
  });



  it('uses baguette admin print pricing config instead of wide-format pricing module', () => {
    const config = getBaguetteExtrasDefaultConfig();
    config.print.canvasPricePerM2 = 2222;
    config.print.minimumPrintPriceRUB = 600;

    const result = bagetQuote({
      width: 500,
      height: 500,
      quantity: 1,
      selectedBaget,
      workType: 'canvas',
      glazing: 'none',
      hasPassepartout: false,
      backPanel: false,
      hangerType: 'crocodile',
      stand: false,
      stretcherType: 'narrow',
      requiresPrint: true,
      printMaterial: 'canvas',
      transferSource: 'manual',
    }, config);

    expect(result.meta?.printCost).toBe(600);
  });
  it('allows stretched canvas without baget in no-frame mode and keeps stretcher cost', () => {
    const result = bagetQuote({
      width: 1200,
      height: 800,
      quantity: 1,
      selectedBaget: null,
      workType: 'stretchedCanvas',
      frameMode: 'noFrame',
      glazing: 'none',
      hasPassepartout: false,
      backPanel: false,
      hangerType: 'wire',
      stand: false,
      stretcherType: 'wide',
    });

    expect(result.warnings).toEqual([]);
    expect(result.meta?.requiresBaget).toBe(false);
    expect(result.meta?.bagetCost).toBe(0);
    expect(result.items.some((item) => item.key === 'baget')).toBe(false);
    expect(result.items.some((item) => item.key === 'stretcher')).toBe(true);
    expect(result.total).toBeGreaterThan(0);
  });


  it('adds stretching as a separate line item using admin-managed coefficients', () => {
    const config = getBaguetteExtrasDefaultConfig();
    config.stretching.areaRate = 500;
    config.stretching.perimeterDividedByAreaRate = 4;

    const result = bagetQuote({
      width: 1000,
      height: 500,
      quantity: 1,
      selectedBaget,
      workType: 'stretchedCanvas',
      frameMode: 'noFrame',
      glazing: 'none',
      hasPassepartout: false,
      backPanel: false,
      hangerType: 'wire',
      stand: false,
      stretcherType: 'wide',
    }, config);

    const stretchingItem = result.items.find((item) => item.key === 'stretching');
    expect(stretchingItem).toBeTruthy();
    expect(result.meta?.stretchingRequired).toBe(true);
    expect(result.meta?.stretchingCost).toBeCloseTo(274, 5);
    expect(stretchingItem?.total).toBeCloseTo(274, 5);
  });


  it('applies minimum print price for small print area', () => {
    const config = getBaguetteExtrasDefaultConfig();
    config.print.paperPricePerM2 = 500;
    config.print.minimumPrintPriceRUB = 400;

    const result = bagetQuote({
      width: 200,
      height: 200,
      quantity: 1,
      selectedBaget,
      workType: 'canvas',
      glazing: 'none',
      hasPassepartout: false,
      backPanel: false,
      hangerType: 'crocodile',
      stand: false,
      stretcherType: 'narrow',
      requiresPrint: true,
      printMaterial: 'paper',
    }, config);

    const printItem = result.items.find((item) => item.key === 'print');
    expect(printItem?.unitPrice).toBe(400);
    expect(result.meta?.minimumPrintPriceApplied).toBe(true);
  });

  it('uses regular print cost for large print area', () => {
    const config = getBaguetteExtrasDefaultConfig();
    config.print.paperPricePerM2 = 500;
    config.print.minimumPrintPriceRUB = 400;

    const result = bagetQuote({
      width: 1000,
      height: 1000,
      quantity: 1,
      selectedBaget,
      workType: 'canvas',
      glazing: 'none',
      hasPassepartout: false,
      backPanel: false,
      hangerType: 'crocodile',
      stand: false,
      stretcherType: 'narrow',
      requiresPrint: true,
      printMaterial: 'paper',
    }, config);

    const printItem = result.items.find((item) => item.key === 'print');
    expect(printItem?.unitPrice).toBe(500);
    expect(result.meta?.minimumPrintPriceApplied).toBe(false);
  });

  it('does not add print item when print is not required', () => {
    const result = bagetQuote({
      width: 400,
      height: 300,
      quantity: 1,
      selectedBaget,
      workType: 'canvas',
      glazing: 'none',
      hasPassepartout: false,
      backPanel: false,
      hangerType: 'crocodile',
      stand: false,
      stretcherType: 'narrow',
      requiresPrint: false,
      printMaterial: 'paper',
    });

    expect(result.items.some((item) => item.key === 'print')).toBe(false);
    expect(result.meta?.printCost).toBe(0);
  });

  it('multiplies minimum print price by quantity', () => {
    const config = getBaguetteExtrasDefaultConfig();
    config.print.paperPricePerM2 = 500;
    config.print.minimumPrintPriceRUB = 400;

    const result = bagetQuote({
      width: 200,
      height: 200,
      quantity: 2,
      selectedBaget,
      workType: 'canvas',
      glazing: 'none',
      hasPassepartout: false,
      backPanel: false,
      hangerType: 'crocodile',
      stand: false,
      stretcherType: 'narrow',
      requiresPrint: true,
      printMaterial: 'paper',
    }, config);

    const printItem = result.items.find((item) => item.key === 'print');
    expect(printItem?.total).toBe(800);
  });

  it('returns 0 stretching price for invalid math inputs', () => {
    expect(calculateStretchingPrice({ widthMm: 0, heightMm: 500, areaRate: 500, perimeterDividedByAreaRate: 4 })).toBe(0);
    expect(calculateStretchingPrice({ widthMm: 500, heightMm: 0, areaRate: 500, perimeterDividedByAreaRate: 4 })).toBe(0);
    expect(calculateStretchingPrice({ widthMm: 500, heightMm: 500, areaRate: Number.NaN, perimeterDividedByAreaRate: 4 })).toBe(0);
  });

});
