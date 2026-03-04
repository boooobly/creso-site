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
    .sort((a, b) => a - b);

  for (const side of sides) {
    const pieceIndex = availablePieces.findIndex((piece) => piece >= side);
    if (pieceIndex === -1) {
      return false;
    }

    availablePieces.splice(pieceIndex, 1);
  }

  return true;
}

export function computeRequiredSidesMeters(widthMm: number, heightMm: number, reserveMmPerSide: number): number[] {
  const reserveMeters = reserveMmPerSide / 1000;
  const widthMeters = widthMm / 1000 + reserveMeters;
  const heightMeters = heightMm / 1000 + reserveMeters;

  return [widthMeters, widthMeters, heightMeters, heightMeters];
}

function runSanityChecks(): void {
  const failsWithShortPieces = canFulfillFrameFromPieces(
    [0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45],
    [0.61, 0.61, 0.51, 0.51],
  );

  if (failsWithShortPieces) {
    throw new Error('[baget/stockPieces] sanity check failed: short pieces should not fulfill frame.');
  }

  const fulfillsWithMixedPieces = canFulfillFrameFromPieces(
    [2.9, 1.23, 0.69, 0.61, 0.54, 0.4, 0.3, 0.3],
    [0.61, 0.61, 0.51, 0.51],
  );

  if (!fulfillsWithMixedPieces) {
    throw new Error('[baget/stockPieces] sanity check failed: mixed pieces should fulfill frame.');
  }
}

if (process.env.NODE_ENV !== 'production') {
  runSanityChecks();
}
