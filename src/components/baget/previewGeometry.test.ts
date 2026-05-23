import { describe, expect, it } from 'vitest';
import { calculatePreviewGeometry } from './previewGeometry';

describe('calculatePreviewGeometry', () => {
  it('keeps real geometry ratios for 100x100mm work with 81mm frame', () => {
    const geometry = calculatePreviewGeometry({
      containerWidthPx: 1000,
      containerHeightPx: 1000,
      workWidthMm: 100,
      workHeightMm: 100,
      bagetVisibleWidthMm: 81,
      bagetFullWidthMm: 81,
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
      bagetVisibleWidthMm: 30,
      bagetFullWidthMm: 30,
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
      bagetVisibleWidthMm: 10,
      bagetFullWidthMm: 10,
      passepartoutMm: 0,
      passepartoutBottomMm: 0,
    });

    expect(geometry.outerWpx / geometry.workWpx).toBeCloseTo(120 / 100, 6);
    expect(geometry.outerHpx / geometry.workHpx).toBeCloseTo(120 / 100, 6);
  });
});


  it('uses visible/full/quarter model for 500x500 with visible 35 and full 40', () => {
    const geometry = calculatePreviewGeometry({
      containerWidthPx: 1140,
      containerHeightPx: 1140,
      workWidthMm: 500,
      workHeightMm: 500,
      bagetVisibleWidthMm: 35,
      bagetFullWidthMm: 40,
      passepartoutMm: 0,
      passepartoutBottomMm: 0,
    });

    expect(geometry.outerWpx / geometry.workWpx).toBeCloseTo(570 / 500, 6);
    expect(geometry.framePx / geometry.workWpx).toBeCloseTo(40 / 500, 6);
    expect(geometry.contentOffsetPx / geometry.workWpx).toBeCloseTo(35 / 500, 6);
    expect(geometry.quarterPx / geometry.workWpx).toBeCloseTo(5 / 500, 6);
    expect(geometry.visibleOpeningWpx / geometry.workWpx).toBeCloseTo(490 / 500, 6);
    expect(geometry.visibleOpeningHpx / geometry.workHpx).toBeCloseTo(490 / 500, 6);
  });
