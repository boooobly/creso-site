import { afterEach, describe, expect, it, vi } from 'vitest';

const ENV_KEYS = ['NODE_ENV', 'VERCEL_ENV', 'PUBLIC_BASE_URL'] as const;
const snapshot = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (snapshot[key] === undefined) {
      delete process.env[key];
    } else {
      vi.stubEnv(key, snapshot[key]);
    }
  }
  vi.resetModules();
});

describe('getBaseUrl', () => {
  it('strips paths, queries and fragments from the canonical origin', async () => {
    process.env.PUBLIC_BASE_URL = 'https://credomir.com/contacts?campaign=test#map';
    const { getBaseUrl } = await import('@/lib/url/getBaseUrl');
    expect(getBaseUrl()).toBe('https://credomir.com');
  });

  it.each(['ftp://credomir.com', 'https://user:password@credomir.com'])('rejects an unsafe origin: %s', async (url) => {
    process.env.PUBLIC_BASE_URL = url;
    const { getBaseUrl } = await import('@/lib/url/getBaseUrl');
    expect(() => getBaseUrl()).toThrow();
  });

  it('requires a canonical origin on self-hosted production too', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.VERCEL_ENV;
    delete process.env.PUBLIC_BASE_URL;
    const { getBaseUrl } = await import('@/lib/url/getBaseUrl');
    expect(() => getBaseUrl()).toThrow('PUBLIC_BASE_URL is required');
  });

  it('normalizes www.credomir.com to canonical non-www domain', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    process.env.VERCEL_ENV = 'production';
    process.env.PUBLIC_BASE_URL = 'https://www.credomir.com/';

    const { getBaseUrl } = await import('@/lib/url/getBaseUrl');
    expect(getBaseUrl()).toBe('https://credomir.com');
  });

  it('throws in production runtime/deploy when PUBLIC_BASE_URL is missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    process.env.VERCEL_ENV = 'production';
    delete process.env.PUBLIC_BASE_URL;

    const { getBaseUrl } = await import('@/lib/url/getBaseUrl');
    expect(() => getBaseUrl()).toThrow('PUBLIC_BASE_URL is required in production runtime/deploy');
  });
});
