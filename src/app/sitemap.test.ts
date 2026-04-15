import { afterEach, describe, expect, it, vi } from 'vitest';

const ENV_KEYS = ['NODE_ENV', 'PUBLIC_BASE_URL'] as const;
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

describe('sitemap base url', () => {
  it('uses PUBLIC_BASE_URL for sitemap and robots', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PUBLIC_BASE_URL = 'https://credomir.ru';

    const { default: sitemap } = await import('@/app/sitemap');
    const { default: robots } = await import('@/app/robots');

    const map = sitemap();
    const robotsConfig = robots();

    expect(map[0]?.url).toBe('https://credomir.ru');
    expect(robotsConfig.sitemap).toBe('https://credomir.ru/sitemap.xml');
  });
});
