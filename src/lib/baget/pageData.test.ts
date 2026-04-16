import { beforeEach, describe, expect, it, vi } from 'vitest';

const getPageContentMapMock = vi.fn();
const getBaguetteExtrasPricingConfigMock = vi.fn();

const cacheStore = new Map<string, unknown>();
const unstableCacheMock = vi.fn((fn: () => Promise<unknown>, keys: string[]) => {
  const key = keys.join(':');
  return async () => {
    if (!cacheStore.has(key)) {
      cacheStore.set(key, await fn());
    }
    return cacheStore.get(key);
  };
});

vi.mock('next/cache', () => ({
  unstable_cache: unstableCacheMock,
}));

vi.mock('@/lib/page-content', () => ({
  getPageContentMap: getPageContentMapMock,
}));

vi.mock('@/lib/baget/baguetteExtrasPricing', () => ({
  getBaguetteExtrasPricingConfig: getBaguetteExtrasPricingConfigMock,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    warn: vi.fn(),
  },
}));

describe('baget page data cache wrappers', () => {
  beforeEach(() => {
    vi.resetModules();
    cacheStore.clear();
    unstableCacheMock.mockClear();
    getPageContentMapMock.mockReset();
    getBaguetteExtrasPricingConfigMock.mockReset();
  });

  it('caches page content entries and reconstructs a Map', async () => {
    getPageContentMapMock.mockResolvedValue(new Map<string, string>([['hero.title', 'Baget title']]));

    const { getCachedBagetPageContentMap } = await import('./pageData');
    const first = await getCachedBagetPageContentMap();
    const second = await getCachedBagetPageContentMap();

    expect(first).toBeInstanceOf(Map);
    expect(first.get('hero.title')).toBe('Baget title');
    expect(second).toBeInstanceOf(Map);
    expect(getPageContentMapMock).toHaveBeenCalledTimes(1);
  });

  it('caches only parsed pricing config object', async () => {
    getBaguetteExtrasPricingConfigMock.mockResolvedValue({
      config: { print: { paperPricePerM2: 10 } },
      loadedKeys: [],
      fallbackUsedKeys: [],
      missingKeys: [],
      unknownKeys: [],
      isComplete: true,
    });

    const { getCachedBaguetteExtrasPricingConfig } = await import('./pageData');
    const first = await getCachedBaguetteExtrasPricingConfig();
    const second = await getCachedBaguetteExtrasPricingConfig();

    expect(first).toEqual({ print: { paperPricePerM2: 10 } });
    expect(second).toEqual({ print: { paperPricePerM2: 10 } });
    expect(getBaguetteExtrasPricingConfigMock).toHaveBeenCalledTimes(1);
  });
});
