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

describe('sitemap/robots base url', () => {
  it('uses PUBLIC_BASE_URL in production runtime/deploy', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    process.env.PUBLIC_BASE_URL = 'https://credomir.ru';

    const { default: sitemap } = await import('@/app/sitemap');
    const { default: robots } = await import('@/app/robots');

    const map = sitemap();
    const robotsConfig = robots();

    expect(map[0]?.url).toBe('https://credomir.ru');
    expect(robotsConfig.sitemap).toBe('https://credomir.ru/sitemap.xml');
  });

  it('falls back to localhost in non-production contexts when PUBLIC_BASE_URL is missing', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'preview';
    delete process.env.PUBLIC_BASE_URL;

    const { default: sitemap } = await import('@/app/sitemap');
    const { default: robots } = await import('@/app/robots');

    const map = sitemap();
    const robotsConfig = robots();

    expect(map[0]?.url).toBe('http://localhost:3000');
    expect(robotsConfig.sitemap).toBe('http://localhost:3000/sitemap.xml');
  });

  it('never emits example.com in generated sitemap/robots URLs', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'preview';
    delete process.env.PUBLIC_BASE_URL;

    const { default: sitemap } = await import('@/app/sitemap');
    const { default: robots } = await import('@/app/robots');

    const map = sitemap();
    const robotsConfig = robots();

    expect(map.every((entry) => !entry.url.includes('example.com'))).toBe(true);
    const sitemapValue = Array.isArray(robotsConfig.sitemap) ? robotsConfig.sitemap.join(' ') : (robotsConfig.sitemap ?? '');
    expect(sitemapValue.includes('example.com')).toBe(false);
  });
});
