import { describe, expect, it } from 'vitest';
import { calculatePreviewGeometry } from './previewGeometry';

describe('calculatePreviewGeometry', () => {
  it('keeps real geometry ratios for 100x100mm work with 81mm frame', () => {
    const geometry = calculatePreviewGeometry({
      containerWidthPx: 1000,
      containerHeightPx: 1000,
      workWidthMm: 100,
      workHeightMm: 100,
      bagetWidthMm: 81,
      passepartoutMm: 0,
      passepartoutBottomMm: 0,
    });

    expect(geometry.outerWpx / geometry.workWpx).toBeCloseTo(262 / 100, 6);
    expect(geometry.framePx / geometry.workWpx).toBeCloseTo(81 / 100, 6);
  });

  it('calculates 500x700mm work with 30mm frame as 560x760 outer size', () => {
    const geometry = calculatePreviewGeometry({
      containerWidthPx: 1400,
      containerHeightPx: 1400,
      workWidthMm: 500,
      workHeightMm: 700,
      bagetWidthMm: 30,
      passepartoutMm: 0,
      passepartoutBottomMm: 0,
    });

    expect(geometry.outerWpx / geometry.workWpx).toBeCloseTo(560 / 500, 6);
    expect(geometry.outerHpx / geometry.workHpx).toBeCloseTo(760 / 700, 6);
  });

  it('calculates 100x100mm work with 10mm frame as 120x120 outer size', () => {
    const geometry = calculatePreviewGeometry({
      containerWidthPx: 1000,
      containerHeightPx: 1000,
      workWidthMm: 100,
      workHeightMm: 100,
      bagetWidthMm: 10,
      passepartoutMm: 0,
      passepartoutBottomMm: 0,
    });

    expect(geometry.outerWpx / geometry.workWpx).toBeCloseTo(120 / 100, 6);
    expect(geometry.outerHpx / geometry.workHpx).toBeCloseTo(120 / 100, 6);
  });
});
