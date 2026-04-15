import { describe, expect, it } from 'vitest';
import { createSlidingWindowRateLimiter, type SlidingWindowRateLimitStore } from '@/lib/rate-limit';

function createTestStore(): SlidingWindowRateLimitStore {
  const map = new Map<string, number[]>();
  return {
    get: (ip) => map.get(ip),
    set: (ip, timestamps) => {
      map.set(ip, timestamps);
    },
    delete: (ip) => {
      map.delete(ip);
    },
    size: () => map.size,
    entries: () => [...map.entries()].map(([ip, timestamps]) => ({ ip, timestamps })),
  };
}

describe('createSlidingWindowRateLimiter', () => {
  it('supports custom store adapter and rate limits after threshold', () => {
    const limiter = createSlidingWindowRateLimiter({ store: createTestStore() });
    const ip = '203.0.113.80';
    const baseNow = 1_700_000_000_000;

    for (let i = 0; i < 5; i += 1) {
      expect(limiter.isRateLimited(ip, baseNow + i)).toBe(false);
    }

    expect(limiter.isRateLimited(ip, baseNow + 6)).toBe(true);
  });
});
