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

describe('buildPublicPageMetadata', () => {
  it('builds canonical and open graph URLs using PUBLIC_BASE_URL', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    process.env.PUBLIC_BASE_URL = 'https://credomir.ru/';

    const { buildPublicPageMetadata } = await import('@/lib/seo');
    const metadata = buildPublicPageMetadata({
      title: 'Test page',
      description: 'Test description',
      path: '/services',
      image: '/og/service.png',
    });

    expect(metadata.alternates?.canonical).toBe('https://credomir.ru/services');
    expect(metadata.openGraph?.url).toBe('https://credomir.ru/services');
    expect(metadata.openGraph?.locale).toBe('ru_RU');

    const firstImage = Array.isArray(metadata.openGraph?.images) ? metadata.openGraph.images[0] : undefined;
    const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url;
    expect(imageUrl).toBe('https://credomir.ru/og/service.png');
  });
});
