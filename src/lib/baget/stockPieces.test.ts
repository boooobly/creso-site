import { describe, expect, it } from 'vitest';
import {
  canFulfillFrameFromPieces,
  computeRequiredSidesMeters,
  parseResiduesToPieces,
} from './stockPieces';

describe('parseResiduesToPieces', () => {
  it('parses decimal commas and multipliers', () => {
    expect(parseResiduesToPieces('2,9*2+2+1,33+1,25')).toEqual([2.9, 2.9, 2, 1.33, 1.25]);
  });
});

describe('computeRequiredSidesMeters', () => {
  it('includes profile width and reserve for each side', () => {
    expect(computeRequiredSidesMeters(500, 300, 81, 10)).toEqual([0.672, 0.672, 0.472, 0.472]);
  });
});

describe('canFulfillFrameFromPieces', () => {
  it('allows cutting multiple sides from one longer stock piece', () => {
    const requiredSides = computeRequiredSidesMeters(500, 300, 81, 10);

    expect(canFulfillFrameFromPieces([1.2, 1.5], requiredSides)).toBe(true);
  });

  it('rejects stock sets that cannot satisfy all sides', () => {
    expect(canFulfillFrameFromPieces([1.2, 1.2], [0.7, 0.7, 0.7, 0.7])).toBe(false);
  });

  it('handles mixed pieces for asymmetric frame sizes', () => {
    const requiredSides = computeRequiredSidesMeters(600, 400, 30, 10);

    expect(requiredSides).toEqual([0.67, 0.67, 0.47, 0.47]);
    expect(canFulfillFrameFromPieces([1.4, 0.95], requiredSides)).toBe(true);
    expect(canFulfillFrameFromPieces([1.3, 0.9], requiredSides)).toBe(false);
  });
});
