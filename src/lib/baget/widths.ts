export type NormalizedBagetWidths = {
  visibleWidthMm: number;
  fullWidthMm: number;
  quarterMm: number;
};

export function normalizeBagetWidths(visibleWidthMmRaw: unknown, fullWidthMmRaw: unknown): NormalizedBagetWidths {
  const visibleCandidate = Number(visibleWidthMmRaw);
  const visibleWidthMm = Number.isFinite(visibleCandidate) && visibleCandidate >= 0 ? visibleCandidate : 0;

  const fullCandidate = Number(fullWidthMmRaw);
  const fullWidthMm = Number.isFinite(fullCandidate) && fullCandidate > 0 && fullCandidate >= visibleWidthMm
    ? fullCandidate
    : visibleWidthMm;

  return {
    visibleWidthMm,
    fullWidthMm,
    quarterMm: Math.max(0, fullWidthMm - visibleWidthMm),
  };
}
