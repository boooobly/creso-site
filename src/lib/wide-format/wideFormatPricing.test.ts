import { describe, expect, it } from 'vitest';
import {
  WIDE_FORMAT_PRICING_FALLBACK_CONFIG,
  getVisibleWideFormatMaterials,
  getWideFormatPricingConfigFromRows,
  isWideFormatMaterialVisibleInConstructor,
} from './wideFormatPricing';

describe('wideFormatPricing visibility config', () => {
  it('keeps materials visible by default in fallback config', () => {
    expect(isWideFormatMaterialVisibleInConstructor('banner_240_gloss_3_2m', WIDE_FORMAT_PRICING_FALLBACK_CONFIG)).toBe(true);
    expect(getVisibleWideFormatMaterials(WIDE_FORMAT_PRICING_FALLBACK_CONFIG)).toContain('canvas_poly_250');
  });

  it('reads visibility flags from pricing rows', () => {
    const parsed = getWideFormatPricingConfigFromRows([
      { subcategory: 'price_per_m2', key: 'banner_240_gloss_3_2m', value: 450 },
      { subcategory: 'max_width_by_material', key: 'banner_240_gloss_3_2m', value: 3.2 },
      { subcategory: 'visibility_in_constructor', key: 'banner_240_gloss_3_2m', value: false },
    ]);

    expect(parsed.config.visibleInConstructorByMaterial.banner_240_gloss_3_2m).toBe(false);
    expect(getVisibleWideFormatMaterials(parsed.config)).not.toContain('banner_240_gloss_3_2m');
    expect(parsed.fallbackUsedKeys.some((item) => item.key === 'visibility_in_constructor.banner_340_matte_3_2m')).toBe(true);
  });
});
