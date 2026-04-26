import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

function buildCsv(rows: string[]) {
  return [
    'ID,Поставщик,Артикул,Название багета,Ширина в миллиметрах,Цена за метр,"Остатки багета, м (редактируемая строка)","Запас на распил, мм",Показывать на сайте,URL изображения плети,URL изображения уголка,Стиль,Цвет,Примечание',
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
      'A1,Supplier,A-001,Багет 1,40,500,12*20,10,yes,https://example.com/a.jpg,,modern,white,',
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

  it('parses aliases, tolerant numbers and truthy values from real-world rows', async () => {
    process.env.BAGET_SHEET_ID = 'test-sheet-aliases';
    process.env.BAGET_SHEET_TAB = 'test-tab-aliases';

    const csv = [
      'id,Поставщик,Артикул багета,Наименование,Ширина в мм,Цена,Остаток по нарядам м.п.,"Запас, мм",Показать на сайте,Фото плети,Фото уголка,Стиль,Цвет,Комментарий',
      'A2,Supplier,A-002,Багет 2,35 мм,"1 200 ₽",12*20,15,да,https://example.com/a2.jpg,,modern,black,ok',
      'A3,Supplier,A-003,Багет 3,40,"1,5",9*10,10,✓,https://example.com/a3.jpg,,classic,white,note',
      'A4,Supplier,A-004,Багет 4,50,900,8*10,10,показать,https://example.com/a4.jpg,,loft,brown,note',
    ].join('\n');

    vi.stubGlobal('fetch', vi.fn(async () => new Response(csv, { status: 200 })));

    const { loadBagetCatalogUncached } = await import('./sheetsCatalog');
    const result = await loadBagetCatalogUncached();

    expect(result.source).toBe('sheet');
    expect(result.items).toHaveLength(3);
    expect(result.items[0]?.width_mm).toBe(35);
    expect(result.items[0]?.price_per_meter).toBe(1200);
    expect(result.items[1]?.price_per_meter).toBe(1.5);
    expect(result.items[2]?.show_on_site).toBe(true);
  });

  it('returns diagnostics when there are zero valid rows', async () => {
    process.env.BAGET_SHEET_ID = 'test-sheet-zero';
    process.env.BAGET_SHEET_TAB = 'test-tab-zero';

    const csv = [
      'ID,Артикул,Название багета,Ширина в миллиметрах,Цена за метр,"Остатки багета, м (редактируемая строка)",Показывать на сайте',
      '1,A-1,Name 1,35,1200,,да',
      '2,A-2,Name 2,35,1200,1*5,нет',
      '3,A-3,Name 3,abc,1200,1*5,да',
    ].join('\n');

    vi.stubGlobal('fetch', vi.fn(async () => new Response(csv, { status: 200 })));

    const { loadBagetCatalogUncached } = await import('./sheetsCatalog');
    const result = await loadBagetCatalogUncached();

    expect(result.source).toBe('fallback');
    expect(result.error).toContain('Zero valid parsed items from sheet');
    expect(result.diagnostics?.rowsCount).toBe(3);
    expect(result.diagnostics?.skipped.missingResidues).toBe(1);
    expect(result.diagnostics?.skipped.hidden).toBe(1);
    expect(result.diagnostics?.skipped.invalidWidth).toBe(1);
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
