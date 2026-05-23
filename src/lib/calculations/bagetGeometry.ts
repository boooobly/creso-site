export type ResolveBagetFrameGeometryInput = {
  workWidthMm: number;
  workHeightMm: number;
  passepartoutLeftMm?: number;
  passepartoutRightMm?: number;
  passepartoutTopMm?: number;
  passepartoutBottomMm?: number;
  visibleWidthMm: number;
  fullWidthMm?: number | null;
};

export function resolveBagetFrameGeometry(input: ResolveBagetFrameGeometryInput) {
  const visibleWidthMm = Math.max(0, Number(input.visibleWidthMm) || 0);
  const rawFullWidthMm = Number(input.fullWidthMm);
  const fullWidthMm = Number.isFinite(rawFullWidthMm) && rawFullWidthMm > 0
    ? Math.max(visibleWidthMm, rawFullWidthMm)
    : visibleWidthMm;
  const quarterMm = Math.max(0, fullWidthMm - visibleWidthMm);

  const effectiveWidthMm = Math.max(0, (Number(input.workWidthMm) || 0) + (Number(input.passepartoutLeftMm) || 0) + (Number(input.passepartoutRightMm) || 0));
  const effectiveHeightMm = Math.max(0, (Number(input.workHeightMm) || 0) + (Number(input.passepartoutTopMm) || 0) + (Number(input.passepartoutBottomMm) || 0));

  const visibleOpeningWidthMm = Math.max(0, effectiveWidthMm - 2 * quarterMm);
  const visibleOpeningHeightMm = Math.max(0, effectiveHeightMm - 2 * quarterMm);
  const outerFrameWidthMm = visibleOpeningWidthMm + 2 * fullWidthMm;
  const outerFrameHeightMm = visibleOpeningHeightMm + 2 * fullWidthMm;

  return { visibleWidthMm, fullWidthMm, quarterMm, effectiveWidthMm, effectiveHeightMm, visibleOpeningWidthMm, visibleOpeningHeightMm, outerFrameWidthMm, outerFrameHeightMm };
}
