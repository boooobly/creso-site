import { afterEach, describe, expect, it } from 'vitest';
import {
  createSignedAdminSessionToken,
  getAdminSessionTtlSeconds,
  verifyAdminSessionToken,
} from '@/lib/admin-auth';

const previousEnv = {
  NODE_ENV: process.env.NODE_ENV,
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
  ADMIN_SESSION_TTL_SECONDS: process.env.ADMIN_SESSION_TTL_SECONDS,
};

afterEach(() => {
  process.env.NODE_ENV = previousEnv.NODE_ENV;
  process.env.ADMIN_SESSION_SECRET = previousEnv.ADMIN_SESSION_SECRET;
  process.env.ADMIN_SESSION_TTL_SECONDS = previousEnv.ADMIN_SESSION_TTL_SECONDS;
});

describe('admin session token', () => {
  it('creates and verifies a signed token', async () => {
    process.env.NODE_ENV = 'test';
    process.env.ADMIN_SESSION_SECRET = 'unit-test-secret';
    process.env.ADMIN_SESSION_TTL_SECONDS = '86400';

    const token = await createSignedAdminSessionToken();
    await expect(verifyAdminSessionToken(token)).resolves.toBe(true);
  });

  it('rejects malformed or tampered tokens', async () => {
    process.env.NODE_ENV = 'test';
    process.env.ADMIN_SESSION_SECRET = 'unit-test-secret';
    process.env.ADMIN_SESSION_TTL_SECONDS = '86400';

    const token = await createSignedAdminSessionToken();
    const [version, payload, signature] = token.split('.');

    await expect(verifyAdminSessionToken('invalid')).resolves.toBe(false);
    await expect(verifyAdminSessionToken(`${version}.${payload}`)).resolves.toBe(false);
    await expect(verifyAdminSessionToken(`${version}.${payload}.${signature}extra`)).resolves.toBe(false);
  });

  it('rejects expired tokens', async () => {
    process.env.NODE_ENV = 'test';
    process.env.ADMIN_SESSION_SECRET = 'unit-test-secret';
    process.env.ADMIN_SESSION_TTL_SECONDS = '1';

    const token = await createSignedAdminSessionToken();

    await new Promise((resolve) => setTimeout(resolve, 1100));

    await expect(verifyAdminSessionToken(token)).resolves.toBe(false);
  });

  it('validates TTL env format', () => {
    process.env.NODE_ENV = 'test';
    process.env.ADMIN_SESSION_TTL_SECONDS = 'abc';

    expect(() => getAdminSessionTtlSeconds()).toThrow('[env] ADMIN_SESSION_TTL_SECONDS must be a positive integer.');
  });
});
