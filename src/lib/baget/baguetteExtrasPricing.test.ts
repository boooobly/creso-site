import { describe, expect, it } from 'vitest';
import {
  BAGUETTE_PRICING_REQUIRED_KEYS,
  checkBaguettePricingCompleteness,
  parseAndValidateBaguettePricingValue,
} from './baguetteExtrasPricing';

describe('baguetteExtrasPricing helpers', () => {
  it('detects completeness for required keys', () => {
    const complete = checkBaguettePricingCompleteness(BAGUETTE_PRICING_REQUIRED_KEYS);
    expect(complete.isComplete).toBe(true);
    expect(complete.missingRequiredKeys).toEqual([]);

    const partial = checkBaguettePricingCompleteness(BAGUETTE_PRICING_REQUIRED_KEYS.slice(0, 3));
    expect(partial.isComplete).toBe(false);
    expect(partial.missingRequiredKeys.length).toBeGreaterThan(0);
  });

  it('rejects invalid numeric admin values', () => {
    expect(() => parseAndValidateBaguettePricingValue('print.minimum_billable_area_m2', 'number', '0')).toThrow();
    expect(() => parseAndValidateBaguettePricingValue('hanging.wire_loop_default_qty', 'number', '2.5')).toThrow();
  });

  it('parses valid JSON rules for auto additions', () => {
    const value = parseAndValidateBaguettePricingValue(
      'auto_additions.default',
      'json',
      JSON.stringify({
        pvcType: 'none',
        addOrabond: false,
        forceCardboard: false,
        stretchingRequired: false,
        removeCardboard: false,
      }),
    );

    expect(value).toMatchObject({ pvcType: 'none' });
  });
});
