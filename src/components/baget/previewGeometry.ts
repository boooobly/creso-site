export type PreviewGeometryInput = {
  containerWidthPx: number;
  containerHeightPx: number;
  workWidthMm: number;
  workHeightMm: number;
  bagetVisibleWidthMm: number;
  bagetFullWidthMm: number;
  passepartoutMm: number;
  passepartoutBottomMm: number;
};

export type PreviewGeometry = {
  scale: number;
  framePx: number;
  outerWpx: number;
  outerHpx: number;
  effectiveWpx: number;
  effectiveHpx: number;
  quarterPx: number;
  contentOffsetPx: number;
  visibleOpeningWpx: number;
  visibleOpeningHpx: number;
  workWpx: number;
  workHpx: number;
  passePx: number;
  passeBottomPx: number;
};

export function calculatePreviewGeometry(input: PreviewGeometryInput): PreviewGeometry {
  const { containerWidthPx, containerHeightPx, workWidthMm, workHeightMm, bagetVisibleWidthMm, bagetFullWidthMm, passepartoutMm, passepartoutBottomMm } = input;

  if (!containerWidthPx || !containerHeightPx) {
    return {
      scale: 0,
      framePx: 0,
      outerWpx: 0,
      outerHpx: 0,
      effectiveWpx: 0,
      effectiveHpx: 0,
      quarterPx: 0,
      contentOffsetPx: 0,
      visibleOpeningWpx: 0,
      visibleOpeningHpx: 0,
      workWpx: 0,
      workHpx: 0,
      passePx: 0,
      passeBottomPx: 0,
    };
  }

  const effectiveWmm = workWidthMm + passepartoutMm * 2;
  const effectiveHmm = workHeightMm + passepartoutMm + passepartoutBottomMm;
  const quarterMm = Math.max(0, bagetFullWidthMm - bagetVisibleWidthMm);
  const visibleOpeningWmm = Math.max(0, effectiveWmm - 2 * quarterMm);
  const visibleOpeningHmm = Math.max(0, effectiveHmm - 2 * quarterMm);
  const outerTotalWmm = visibleOpeningWmm + 2 * bagetFullWidthMm;
  const outerTotalHmm = visibleOpeningHmm + 2 * bagetFullWidthMm;
  const scale = Math.min(containerWidthPx / outerTotalWmm, containerHeightPx / outerTotalHmm);

  const framePx = bagetFullWidthMm > 0 ? bagetFullWidthMm * scale : 0;
  const quarterPx = quarterMm * scale;
  const contentOffsetPx = bagetVisibleWidthMm * scale;
  const passePx = passepartoutMm * scale;
  const passeBottomPx = passepartoutBottomMm * scale;
  const workWpx = workWidthMm * scale;
  const workHpx = workHeightMm * scale;
  const effectiveWpx = effectiveWmm * scale;
  const effectiveHpx = effectiveHmm * scale;
  const visibleOpeningWpx = visibleOpeningWmm * scale;
  const visibleOpeningHpx = visibleOpeningHmm * scale;
  const outerWpx = outerTotalWmm * scale;
  const outerHpx = outerTotalHmm * scale;

  return {
    scale,
    framePx,
    outerWpx,
    outerHpx,
    effectiveWpx,
    effectiveHpx,
    quarterPx,
    contentOffsetPx,
    visibleOpeningWpx,
    visibleOpeningHpx,
    workWpx,
    workHpx,
    passePx,
    passeBottomPx,
  };
}
