import { describe, expect, it } from 'vitest';
import { bagetQuote } from './bagetQuote';

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
    expect(result.total).toBe(3050);
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
});
