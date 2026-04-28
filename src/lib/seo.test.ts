import { afterEach, describe, expect, it, vi } from 'vitest';

const ENV_KEYS = [
  'NODE_ENV',
  'VERCEL_ENV',
  'PUBLIC_BASE_URL',
  'NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION',
  'NEXT_PUBLIC_YANDEX_VERIFICATION',
] as const;
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
  it('builds canonical/open graph/twitter URLs using PUBLIC_BASE_URL', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    process.env.PUBLIC_BASE_URL = 'https://credomir.com/';

    const { buildPublicPageMetadata } = await import('@/lib/seo');
    const metadata = buildPublicPageMetadata({
      title: 'Test page',
      description: 'Test description',
      path: '/services',
      image: '/og/service.png',
    });

    expect(metadata.alternates?.canonical).toBe('https://credomir.com/services');
    expect(metadata.openGraph?.url).toBe('https://credomir.com/services');
    expect(metadata.openGraph?.locale).toBe('ru_RU');
    expect(metadata.twitter?.card).toBe('summary_large_image');
    expect(metadata.robots).toEqual({ index: true, follow: true });

    const firstImage = Array.isArray(metadata.openGraph?.images) ? metadata.openGraph.images[0] : undefined;
    const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url;
    expect(imageUrl).toBe('https://credomir.com/og/service.png');
    expect(metadata.twitter?.images).toEqual(['https://credomir.com/og/service.png']);
  });

  it('includes verification metadata only when env values are present', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    process.env.PUBLIC_BASE_URL = 'https://credomir.com';
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION = 'google-token';
    process.env.NEXT_PUBLIC_YANDEX_VERIFICATION = 'yandex-token';

    const { buildPublicPageMetadata } = await import('@/lib/seo');
    const metadata = buildPublicPageMetadata({
      title: 'Verify',
      description: 'Verify desc',
      path: '/',
    });

    expect(metadata.verification).toEqual({
      google: 'google-token',
      yandex: 'yandex-token',
    });
  });

  it('omits verification metadata when env values are empty', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    process.env.PUBLIC_BASE_URL = 'https://credomir.com';
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION = '   ';
    delete process.env.NEXT_PUBLIC_YANDEX_VERIFICATION;

    const { buildPublicPageMetadata } = await import('@/lib/seo');
    const metadata = buildPublicPageMetadata({
      title: 'No verify',
      description: 'No verify desc',
      path: '/contacts',
    });

    expect(metadata.verification).toBeUndefined();
  });
});
