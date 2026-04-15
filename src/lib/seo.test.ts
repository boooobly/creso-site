import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/site-settings', () => ({
  getPublicSiteSettings: vi.fn(async () => ({
    seoTitle: 'Credomir',
    seoDescription: 'desc',
    seoSiteName: 'Credomir',
    seoOgImage: '/og-image.png',
  })),
}));

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

describe('getDefaultMetadata metadataBase', () => {
  it('uses PUBLIC_BASE_URL when set', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    process.env.PUBLIC_BASE_URL = 'https://credomir.ru';

    const { getDefaultMetadata } = await import('@/lib/seo');
    const metadata = await getDefaultMetadata();

    expect(metadata.metadataBase?.toString()).toBe('https://credomir.ru/');
  });

  it('falls back to localhost in non-production context when PUBLIC_BASE_URL is missing', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'preview';
    delete process.env.PUBLIC_BASE_URL;

    const { getDefaultMetadata } = await import('@/lib/seo');
    const metadata = await getDefaultMetadata();

    expect(metadata.metadataBase?.toString()).toBe('http://localhost:3000/');
  });

  it('never falls back to example.com', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'preview';
    delete process.env.PUBLIC_BASE_URL;

    const { getDefaultMetadata } = await import('@/lib/seo');
    const metadata = await getDefaultMetadata();

    expect(metadata.metadataBase?.host).not.toBe('example.com');
    expect(metadata.metadataBase?.toString().includes('example.com')).toBe(false);
  });
});
