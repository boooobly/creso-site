import { describe, expect, it } from 'vitest';
import {
  ADMIN_LOGIN_RATE_LIMIT_CONFIG,
  createAdminLoginRateLimiter,
  type AdminLoginRateLimitStore,
} from '@/lib/admin/login-rate-limit';

function createTestStore(): AdminLoginRateLimitStore {
  const map = new Map<string, { failures: number[]; lockedUntil: number | null }>();
  return {
    get: (ip) => map.get(ip),
    set: (ip, state) => {
      map.set(ip, state);
    },
    delete: (ip) => {
      map.delete(ip);
    },
    size: () => map.size,
    entries: () => [...map.entries()].map(([ip, state]) => ({ ip, state })),
  };
}

describe('admin login rate limiter', () => {
  it('increments failed attempts in window and locks at threshold', () => {
    const limiter = createAdminLoginRateLimiter();
    const now = Date.now();
    const ip = '1.2.3.4';

    for (let i = 1; i < ADMIN_LOGIN_RATE_LIMIT_CONFIG.maxAttempts; i += 1) {
      const result = limiter.registerFailure(ip, now + i);
      expect(result.locked).toBe(false);
      expect(result.failuresInWindow).toBe(i);
    }

    const finalAttempt = limiter.registerFailure(ip, now + ADMIN_LOGIN_RATE_LIMIT_CONFIG.maxAttempts);
    expect(finalAttempt.locked).toBe(true);
    expect(limiter.isLocked(ip, now + ADMIN_LOGIN_RATE_LIMIT_CONFIG.maxAttempts + 1)).toBe(true);
  });

  it('successful login resets limiter state', () => {
    const limiter = createAdminLoginRateLimiter();
    const now = Date.now();
    const ip = '5.6.7.8';

    for (let i = 0; i < ADMIN_LOGIN_RATE_LIMIT_CONFIG.maxAttempts; i += 1) {
      limiter.registerFailure(ip, now + i);
    }

    expect(limiter.isLocked(ip, now + 10)).toBe(true);
    limiter.reset(ip);
    expect(limiter.isLocked(ip, now + 11)).toBe(false);

    const nextFailure = limiter.registerFailure(ip, now + 12);
    expect(nextFailure.failuresInWindow).toBe(1);
    expect(nextFailure.locked).toBe(false);
  });

  it('lockout expires after cooldown and window', () => {
    const limiter = createAdminLoginRateLimiter();
    const now = Date.now();
    const ip = '9.8.7.6';

    for (let i = 0; i < ADMIN_LOGIN_RATE_LIMIT_CONFIG.maxAttempts; i += 1) {
      limiter.registerFailure(ip, now + i);
    }

    const beforeExpiry = now + ADMIN_LOGIN_RATE_LIMIT_CONFIG.cooldownMs + ADMIN_LOGIN_RATE_LIMIT_CONFIG.maxAttempts - 2;
    expect(limiter.isLocked(ip, beforeExpiry)).toBe(true);

    const afterExpiry = now + ADMIN_LOGIN_RATE_LIMIT_CONFIG.cooldownMs + ADMIN_LOGIN_RATE_LIMIT_CONFIG.maxAttempts + 1;
    expect(limiter.isLocked(ip, afterExpiry)).toBe(false);

    const afterWindow = now + ADMIN_LOGIN_RATE_LIMIT_CONFIG.windowMs + 1;
    const nextFailure = limiter.registerFailure(ip, afterWindow);
    expect(nextFailure.failuresInWindow).toBe(1);
    expect(nextFailure.locked).toBe(false);
  });

  it('supports custom store adapter', () => {
    const limiter = createAdminLoginRateLimiter({ store: createTestStore() });
    const now = Date.now();
    const ip = '9.9.9.9';

    for (let i = 0; i < ADMIN_LOGIN_RATE_LIMIT_CONFIG.maxAttempts; i += 1) {
      limiter.registerFailure(ip, now + i);
    }

    expect(limiter.isLocked(ip, now + ADMIN_LOGIN_RATE_LIMIT_CONFIG.maxAttempts + 1)).toBe(true);
  });
});
