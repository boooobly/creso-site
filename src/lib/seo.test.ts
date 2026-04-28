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
    expect(metadata.icons).toEqual({
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
        { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      ],
    });

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

describe('getDefaultMetadata', () => {
  it('includes default site icons', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    process.env.PUBLIC_BASE_URL = 'https://credomir.com';

    vi.doMock('@/lib/site-settings', () => ({
      getPublicSiteSettings: vi.fn().mockResolvedValue({
        seoTitle: 'CredoMir',
        seoDescription: 'Description',
        seoSiteName: 'CredoMir',
        seoOgImage: '/og-image.png',
      }),
    }));

    const { getDefaultMetadata } = await import('@/lib/seo');
    const metadata = await getDefaultMetadata();

    expect(metadata.icons).toEqual({
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
        { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      ],
    });
  });
});

describe('buildFaqPageJsonLd', () => {
  it('builds FAQPage json-ld with Question and Answer objects', async () => {
    const { buildFaqPageJsonLd } = await import('@/lib/seo');
    const data = buildFaqPageJsonLd([{ question: '  Q1  ', answer: '  A1  ' }]);

    expect(data).toEqual({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Q1',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A1',
          },
        },
      ],
    });
  });

  it('supports both { question, answer } and { q, a } shapes', async () => {
    const { buildFaqPageJsonLd } = await import('@/lib/seo');
    const data = buildFaqPageJsonLd([
      { question: 'Question one', answer: 'Answer one' },
      { q: 'Question two', a: 'Answer two' },
    ]);

    expect(data?.mainEntity).toEqual([
      {
        '@type': 'Question',
        name: 'Question one',
        acceptedAnswer: { '@type': 'Answer', text: 'Answer one' },
      },
      {
        '@type': 'Question',
        name: 'Question two',
        acceptedAnswer: { '@type': 'Answer', text: 'Answer two' },
      },
    ]);
  });

  it('filters invalid or empty items', async () => {
    const { buildFaqPageJsonLd } = await import('@/lib/seo');
    const data = buildFaqPageJsonLd([
      { question: 'Valid', answer: 'Answer' },
      { question: ' ', answer: 'Answer' },
      { q: 'Question', a: '   ' },
      {},
    ]);

    expect(data?.mainEntity).toHaveLength(1);
    expect(data?.mainEntity[0]).toMatchObject({
      '@type': 'Question',
      name: 'Valid',
      acceptedAnswer: { '@type': 'Answer', text: 'Answer' },
    });
  });

  it('returns null when no valid items exist', async () => {
    const { buildFaqPageJsonLd } = await import('@/lib/seo');
    const data = buildFaqPageJsonLd([{ question: ' ', answer: ' ' }, { q: '', a: '' }]);

    expect(data).toBeNull();
  });
});
