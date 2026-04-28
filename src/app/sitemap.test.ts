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
    process.env.PUBLIC_BASE_URL = 'https://credomir.com';

    const { default: sitemap } = await import('@/app/sitemap');
    const { default: robots } = await import('@/app/robots');

    const map = sitemap();
    const robotsConfig = robots();

    expect(map[0]?.url).toBe('https://credomir.com');
    expect(robotsConfig.sitemap).toBe('https://credomir.com/sitemap.xml');
  });

  it('includes only indexable public routes and excludes redirects/private routes in sitemap', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    process.env.PUBLIC_BASE_URL = 'https://credomir.com';

    const { default: sitemap } = await import('@/app/sitemap');

    const map = sitemap();
    const urls = map.map((entry) => entry.url);

    expect(urls).not.toContain('https://credomir.com/blog');
    expect(urls).not.toContain('https://credomir.com/admin');
    expect(urls).not.toContain('https://credomir.com/api');
    expect(urls).not.toContain('https://credomir.com/pay/mock');
    expect(urls).not.toContain('https://credomir.com/order');

    expect(urls.some((url) => url.includes('/admin'))).toBe(false);
    expect(urls.some((url) => url.includes('/api'))).toBe(false);
    expect(urls.some((url) => url.includes('/pay/mock'))).toBe(false);
    expect(urls.some((url) => url.includes('/order/'))).toBe(false);
  });

  it('adds explicit robots disallow rules for private routes', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    process.env.PUBLIC_BASE_URL = 'https://credomir.com';

    const { default: robots } = await import('@/app/robots');
    const robotsConfig = robots();

    const rule = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;
    expect(rule).toBeDefined();
    expect(rule && 'allow' in rule ? rule.allow : undefined).toBe('/');
    expect(rule && 'disallow' in rule ? rule.disallow : undefined).toEqual([
      '/admin',
      '/admin/',
      '/api',
      '/api/',
      '/pay/mock',
      '/order/',
    ]);
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
