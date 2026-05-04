export type PreviewGeometryInput = {
  containerWidthPx: number;
  containerHeightPx: number;
  workWidthMm: number;
  workHeightMm: number;
  bagetWidthMm: number;
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
  workWpx: number;
  workHpx: number;
  passePx: number;
  passeBottomPx: number;
};

export function calculatePreviewGeometry(input: PreviewGeometryInput): PreviewGeometry {
  const { containerWidthPx, containerHeightPx, workWidthMm, workHeightMm, bagetWidthMm, passepartoutMm, passepartoutBottomMm } = input;

  if (!containerWidthPx || !containerHeightPx) {
    return {
      scale: 0,
      framePx: 0,
      outerWpx: 0,
      outerHpx: 0,
      effectiveWpx: 0,
      effectiveHpx: 0,
      workWpx: 0,
      workHpx: 0,
      passePx: 0,
      passeBottomPx: 0,
    };
  }

  const effectiveWmm = workWidthMm + passepartoutMm * 2;
  const effectiveHmm = workHeightMm + passepartoutMm + passepartoutBottomMm;
  const outerTotalWmm = effectiveWmm + 2 * bagetWidthMm;
  const outerTotalHmm = effectiveHmm + 2 * bagetWidthMm;
  const scale = Math.min(containerWidthPx / outerTotalWmm, containerHeightPx / outerTotalHmm);

  const framePx = bagetWidthMm > 0 ? bagetWidthMm * scale : 0;
  const passePx = passepartoutMm * scale;
  const passeBottomPx = passepartoutBottomMm * scale;
  const workWpx = workWidthMm * scale;
  const workHpx = workHeightMm * scale;
  const effectiveWpx = effectiveWmm * scale;
  const effectiveHpx = effectiveHmm * scale;
  const outerWpx = outerTotalWmm * scale;
  const outerHpx = outerTotalHmm * scale;

  return {
    scale,
    framePx,
    outerWpx,
    outerHpx,
    effectiveWpx,
    effectiveHpx,
    workWpx,
    workHpx,
    passePx,
    passeBottomPx,
  };
}
