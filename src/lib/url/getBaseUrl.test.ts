import { afterEach, describe, expect, it, vi } from 'vitest';

const ENV_KEYS = ['NODE_ENV', 'VERCEL_ENV', 'PUBLIC_BASE_URL'] as const;
const snapshot = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (snapshot[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = snapshot[key];
    }
  }
  vi.resetModules();
});

describe('getBaseUrl', () => {
  it('throws in production runtime/deploy when PUBLIC_BASE_URL is missing', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    delete process.env.PUBLIC_BASE_URL;

    const { getBaseUrl } = await import('@/lib/url/getBaseUrl');
    expect(() => getBaseUrl()).toThrow('PUBLIC_BASE_URL is required in production runtime/deploy');
  });
});
