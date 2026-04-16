import { beforeEach, describe, expect, it, vi } from 'vitest';

const listPageContentByPageKeyMock = vi.fn();
const toPageContentStringMapMock = vi.fn();

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: any[]) => Promise<unknown>) => fn,
}));

vi.mock('@/lib/admin/page-content-service', () => ({
  listPageContentByPageKey: listPageContentByPageKeyMock,
  toPageContentStringMap: toPageContentStringMapMock,
}));

describe('page-content map shape regression', () => {
  beforeEach(() => {
    listPageContentByPageKeyMock.mockReset();
    toPageContentStringMapMock.mockReset();
  });

  it('returns a real Map from getPageContentMap and reads values via getPageContentValue', async () => {
    const map = new Map<string, string>([['hero.title', 'Каталог багета']]);
    listPageContentByPageKeyMock.mockResolvedValue([{ sectionKey: 'hero', fieldKey: 'title', value: 'Каталог багета' }]);
    toPageContentStringMapMock.mockReturnValue(map);

    const { getPageContentMap, getPageContentValue } = await import('./page-content');
    const contentMap = await getPageContentMap('baget');

    expect(contentMap).toBeInstanceOf(Map);
    expect(getPageContentValue(contentMap, 'hero', 'title', 'fallback')).toBe('Каталог багета');
  });

  it('converts serialized cache payload back into a real Map', async () => {
    const map = new Map<string, string>([
      ['hero.title', 'Каталог багета'],
      ['hero.description', 'Описание'],
    ]);
    listPageContentByPageKeyMock.mockResolvedValue([{ sectionKey: 'hero', fieldKey: 'title', value: 'Каталог багета' }]);
    toPageContentStringMapMock.mockReturnValue(map);

    const { getPageContentMap } = await import('./page-content');
    const contentMap = await getPageContentMap('baget');

    expect(contentMap).toBeInstanceOf(Map);
    expect(Array.from(contentMap.entries())).toEqual(Array.from(map.entries()));
  });

  it('returns empty Map on failures and keeps getPageContentValue safe', async () => {
    listPageContentByPageKeyMock.mockRejectedValue(new Error('db unavailable'));

    const { getPageContentMap, getPageContentValue } = await import('./page-content');
    const contentMap = await getPageContentMap('baget');

    expect(contentMap).toBeInstanceOf(Map);
    expect(getPageContentValue(contentMap, 'hero', 'title', 'fallback')).toBe('fallback');
  });
});
