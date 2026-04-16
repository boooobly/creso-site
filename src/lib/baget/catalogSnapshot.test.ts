import { beforeEach, describe, expect, it, vi } from 'vitest';

const snapshotFindUniqueMock = vi.fn();
const snapshotUpsertMock = vi.fn();
const snapshotUpdateMock = vi.fn();
const loadBagetCatalogMock = vi.fn();
const loadBagetCatalogUncachedMock = vi.fn();

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    bagetCatalogSnapshot: {
      findUnique: snapshotFindUniqueMock,
      upsert: snapshotUpsertMock,
      update: snapshotUpdateMock,
    },
  },
}));

vi.mock('@/lib/baget/sheetsCatalog', () => ({
  loadBagetCatalog: loadBagetCatalogMock,
  loadBagetCatalogUncached: loadBagetCatalogUncachedMock,
}));

describe('baget catalog snapshot flow', () => {
  beforeEach(() => {
    vi.resetModules();
    snapshotFindUniqueMock.mockReset();
    snapshotUpsertMock.mockReset();
    snapshotUpdateMock.mockReset();
    loadBagetCatalogMock.mockReset();
    loadBagetCatalogUncachedMock.mockReset();
  });

  it('public loader uses existing snapshot without calling sheets', async () => {
    snapshotFindUniqueMock.mockResolvedValueOnce({
      sourceKey: 'public_baget_catalog',
      sheetId: 'sheet-id',
      tab: 'baget_catalog',
      itemCount: 1,
      itemsJson: [{ id: 'a1', article: 'A', name: 'Baget', width_mm: 10, price_per_meter: 100, supplier: '', residues_text: '1*10', reserve_mm: 10, show_on_site: true, image_url: '', corner_image_url: '', style: '', color: '', note: '' }],
      syncedAt: new Date('2026-04-16T10:00:00.000Z'),
      error: null,
    });

    const { loadPublicBagetCatalog } = await import('./catalogSnapshot');
    const result = await loadPublicBagetCatalog();

    expect(result.source).toBe('snapshot');
    expect(result.items).toHaveLength(1);
    expect(loadBagetCatalogMock).not.toHaveBeenCalled();
    expect(loadBagetCatalogUncachedMock).not.toHaveBeenCalled();
  });

  it('successful sync saves snapshot', async () => {
    loadBagetCatalogUncachedMock.mockResolvedValueOnce({
      source: 'sheet',
      sheetId: 'sheet-id',
      tab: 'baget_catalog',
      items: [{ id: 'a1' }],
      error: null,
    });

    const { syncBagetCatalogSnapshot } = await import('./catalogSnapshot');
    const result = await syncBagetCatalogSnapshot();

    expect(result.ok).toBe(true);
    expect(snapshotUpsertMock).toHaveBeenCalledTimes(1);
  });

  it('failed sync does not overwrite previous good snapshot items', async () => {
    loadBagetCatalogUncachedMock.mockResolvedValueOnce({
      source: 'fallback',
      sheetId: 'sheet-id',
      tab: 'baget_catalog',
      items: [{ id: 'fallback' }],
      error: 'network down',
    });
    snapshotFindUniqueMock.mockResolvedValueOnce({ id: 'snapshot-1' });

    const { syncBagetCatalogSnapshot } = await import('./catalogSnapshot');
    const result = await syncBagetCatalogSnapshot();

    expect(result.ok).toBe(false);
    expect(snapshotUpsertMock).not.toHaveBeenCalled();
    expect(snapshotUpdateMock).toHaveBeenCalledWith(expect.objectContaining({
      data: { error: 'network down' },
    }));
  });

  it('auto-syncs and persists snapshot when cached snapshot is missing', async () => {
    snapshotFindUniqueMock.mockResolvedValueOnce(null);
    loadBagetCatalogUncachedMock.mockResolvedValueOnce({
      source: 'sheet',
      sheetId: 'sheet-id',
      tab: 'baget_catalog',
      items: [{ id: 'sheet-item' }],
      error: null,
    });

    const { loadPublicBagetCatalog } = await import('./catalogSnapshot');
    const result = await loadPublicBagetCatalog();

    expect(result.source).toBe('snapshot');
    expect(result.autoSyncedSnapshot).toBe(true);
    expect(snapshotUpsertMock).toHaveBeenCalledTimes(1);
    expect(loadBagetCatalogMock).not.toHaveBeenCalled();
  });

  it('falls back to runtime loader when auto-sync fails unexpectedly', async () => {
    snapshotFindUniqueMock.mockResolvedValueOnce(null);
    loadBagetCatalogUncachedMock.mockResolvedValueOnce({
      source: 'fallback',
      sheetId: 'sheet-id',
      tab: 'baget_catalog',
      items: [],
      error: 'sheet unavailable',
    });
    loadBagetCatalogMock.mockResolvedValueOnce({
      source: 'fallback',
      sheetId: 'sheet-id',
      tab: 'baget_catalog',
      items: [{ id: 'runtime-fallback' }],
      error: null,
    });

    const { loadPublicBagetCatalog } = await import('./catalogSnapshot');
    const result = await loadPublicBagetCatalog();

    expect(result.source).toBe('fallback');
    expect(result.items[0]?.id).toBe('runtime-fallback');
    expect(loadBagetCatalogMock).toHaveBeenCalledTimes(1);
  });
});
