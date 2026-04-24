const DECIMAL_COMMA = /,/g;

function normalizeToken(rawToken: string): string {
  return rawToken.replace(/\s+/g, '').replace(DECIMAL_COMMA, '.');
}

export function parseResiduesToPieces(residuesText: string): number[] {
  const normalizedInput = residuesText.trim();
  if (!normalizedInput) {
    return [];
  }

  const tokens = normalizedInput.split('+');
  const pieces: number[] = [];

  for (const rawToken of tokens) {
    const token = normalizeToken(rawToken);
    if (!token) {
      return [];
    }

    const [lengthPart, multiplierPart] = token.split('*');
    if (!lengthPart || (multiplierPart !== undefined && !multiplierPart)) {
      return [];
    }

    if (token.split('*').length > 2) {
      return [];
    }

    const length = Number(lengthPart);
    if (!Number.isFinite(length) || length <= 0) {
      return [];
    }

    const multiplier = multiplierPart === undefined ? 1 : Number(multiplierPart);
    if (!Number.isInteger(multiplier) || multiplier <= 0) {
      return [];
    }

    for (let i = 0; i < multiplier; i += 1) {
      pieces.push(length);
    }
  }

  return pieces;
}

function canAllocateSidesFromPieces(remainingPieces: number[], sides: number[], sideIndex: number): boolean {
  if (sideIndex >= sides.length) {
    return true;
  }

  const side = sides[sideIndex];
  const triedCapacities = new Set<number>();

  for (let pieceIndex = 0; pieceIndex < remainingPieces.length; pieceIndex += 1) {
    const piece = remainingPieces[pieceIndex];
    if (piece < side) {
      continue;
    }

    const roundedPiece = Number(piece.toFixed(6));
    if (triedCapacities.has(roundedPiece)) {
      continue;
    }
    triedCapacities.add(roundedPiece);

    const nextPieces = [...remainingPieces];
    nextPieces[pieceIndex] = piece - side;
    nextPieces.sort((a, b) => b - a);

    if (canAllocateSidesFromPieces(nextPieces, sides, sideIndex + 1)) {
      return true;
    }
  }

  return false;
}

export function canFulfillFrameFromPieces(piecesMeters: number[], requiredSidesMeters: number[]): boolean {
  if (requiredSidesMeters.length !== 4) {
    return false;
  }

  const sides = requiredSidesMeters
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => b - a);

  if (sides.length !== 4) {
    return false;
  }

  const availablePieces = piecesMeters
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => b - a);

  if (availablePieces.length === 0) {
    return false;
  }

  return canAllocateSidesFromPieces(availablePieces, sides, 0);
}

export function computeRequiredSidesMeters(
  effectiveWidthMm: number,
  effectiveHeightMm: number,
  bagetProfileWidthMm: number,
  reserveMmPerSide: number,
): number[] {
  const sideWidthMeters = (effectiveWidthMm + 2 * bagetProfileWidthMm + reserveMmPerSide) / 1000;
  const sideHeightMeters = (effectiveHeightMm + 2 * bagetProfileWidthMm + reserveMmPerSide) / 1000;

  return [sideWidthMeters, sideWidthMeters, sideHeightMeters, sideHeightMeters];
}

function runSanityChecks(): void {
  const failsWithShortPieces = canFulfillFrameFromPieces(
    [0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45],
    [0.61, 0.61, 0.51, 0.51],
  );

  if (failsWithShortPieces) {
    throw new Error('[baget/stockPieces] sanity check failed: short pieces should not fulfill frame.');
  }

  const fulfillsByCuttingLongPieces = canFulfillFrameFromPieces(
    [1.5, 1.2],
    [0.672, 0.672, 0.472, 0.472],
  );

  if (!fulfillsByCuttingLongPieces) {
    throw new Error('[baget/stockPieces] sanity check failed: long pieces should allow multi-cut fulfillment.');
  }
}

if (process.env.NODE_ENV !== 'production') {
  runSanityChecks();
}
