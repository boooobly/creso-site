import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

function buildCsv(rows: string[]) {
  return [
    'ID,Поставщик,Артикул,Название багета,Ширина в миллиметрах,Цена за метр,"Остатки багета, м (редактируемая строка)",Запас на распил, мм,Показывать на сайте,URL изображения плети,URL изображения уголка,Стиль,Цвет,Примечание',
    ...rows,
  ].join('\n');
}

afterEach(() => {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) {
      delete process.env[key];
    }
  }
  Object.assign(process.env, ORIGINAL_ENV);
  vi.restoreAllMocks();
});

describe('loadBagetCatalog caching and fallback', () => {
  it('returns same catalog items for cached and uncached loaders', async () => {
    process.env.BAGET_SHEET_ID = 'test-sheet-cached';
    process.env.BAGET_SHEET_TAB = 'test-tab-cached';
    process.env.BAGET_SHEET_CACHE_SECONDS = '120';

    const csv = buildCsv([
      'A1,Supplier,A-001,Багет 1,40,500,12*20,10,yes,https://example.com/a.jpg,,modern,white,,',
    ]);

    vi.stubGlobal('fetch', vi.fn(async () => new Response(csv, { status: 200 })));

    const { loadBagetCatalog, loadBagetCatalogUncached } = await import('./sheetsCatalog');

    const uncached = await loadBagetCatalogUncached();
    const cached = await loadBagetCatalog();

    expect(cached.items).toEqual(uncached.items);
    expect(cached.source).toBe(uncached.source);
  });

  it('keeps fallback data when sheet fetch fails', async () => {
    process.env.BAGET_SHEET_ID = 'test-sheet-fallback';
    process.env.BAGET_SHEET_TAB = 'test-tab-fallback';
    process.env.BAGET_SHEET_CACHE_SECONDS = '60';

    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('network down');
    }));

    const { loadBagetCatalog } = await import('./sheetsCatalog');
    const result = await loadBagetCatalog();

    expect(result.source).toBe('fallback');
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.error).toContain('network down');
  });
});

describe('mapSheetItemsToBagetItems', () => {
  it('keeps mapped item structure unchanged', async () => {
    const { mapSheetItemsToBagetItems } = await import('./sheetsCatalog');
    const mapped = mapSheetItemsToBagetItems([
      {
        id: 'A1',
        supplier: 'Supplier',
        article: 'A-001',
        name: 'Багет 1',
        width_mm: 40,
        price_per_meter: 500,
        residues_text: '12*20',
        reserve_mm: 10,
        show_on_site: true,
        image_url: '/images/a.jpg',
        corner_image_url: '/images/corner.jpg',
        style: 'modern',
        color: 'white',
        note: '',
      },
    ]);

    expect(mapped).toEqual([
      {
        id: 'A1',
        article: 'A-001',
        name: 'Багет 1',
        color: 'white',
        style: 'modern',
        width_mm: 40,
        price_per_meter: 500,
        image: '/images/a.jpg',
      },
    ]);
  });
});
