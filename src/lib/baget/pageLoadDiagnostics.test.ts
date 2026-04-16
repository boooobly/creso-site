import { beforeEach, describe, expect, it, vi } from 'vitest';

const upsertMock = vi.fn();
const findUniqueMock = vi.fn();

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    bagetPageLoadDiagnostics: {
      upsert: upsertMock,
      findUnique: findUniqueMock,
    },
  },
}));

describe('baget page load diagnostics storage', () => {
  beforeEach(() => {
    upsertMock.mockReset();
    findUniqueMock.mockReset();
  });

  it('saves latest diagnostics metrics via singleton upsert', async () => {
    const { saveLatestBagetPageLoadDiagnostics } = await import('./pageLoadDiagnostics');

    await saveLatestBagetPageLoadDiagnostics({
      totalDurationMs: 3200,
      loadPublicBagetCatalogMs: 120,
      getPageContentMapMs: 2800,
      getBaguetteExtrasPricingConfigMs: 200,
      catalogSource: 'snapshot',
      bagetItemsCount: 77,
      snapshotExists: true,
      snapshotSyncedAt: '2026-04-16T12:00:00.000Z',
    });

    expect(upsertMock).toHaveBeenCalledTimes(1);
    expect(upsertMock).toHaveBeenCalledWith(expect.objectContaining({
      where: { sourceKey: 'public_baget_page_latest' },
      update: expect.objectContaining({
        totalDurationMs: 3200,
        getPageContentMapMs: 2800,
      }),
    }));
  });

  it('preserves valid catalogSource values from DB', async () => {
    const { loadLatestBagetPageLoadDiagnostics } = await import('./pageLoadDiagnostics');

    for (const source of ['snapshot', 'sheet', 'fallback'] as const) {
      findUniqueMock.mockResolvedValueOnce({
        sourceKey: 'public_baget_page_latest',
        totalDurationMs: 3100,
        loadPublicBagetCatalogMs: 100,
        getPageContentMapMs: 2700,
        getBaguetteExtrasPricingConfigMs: 300,
        catalogSource: source,
        bagetItemsCount: 70,
        snapshotExists: true,
        snapshotSyncedAt: '2026-04-16T12:10:00.000Z',
        createdAt: new Date('2026-04-16T12:10:30.000Z'),
        updatedAt: new Date('2026-04-16T12:10:30.000Z'),
      });

      const result = await loadLatestBagetPageLoadDiagnostics();
      expect(result?.catalogSource).toBe(source);
    }
  });

  it('normalizes unknown catalogSource from DB to fallback', async () => {
    findUniqueMock.mockResolvedValueOnce({
      sourceKey: 'public_baget_page_latest',
      totalDurationMs: 3100,
      loadPublicBagetCatalogMs: 100,
      getPageContentMapMs: 2700,
      getBaguetteExtrasPricingConfigMs: 300,
      catalogSource: 'unexpected-source',
      bagetItemsCount: 70,
      snapshotExists: true,
      snapshotSyncedAt: '2026-04-16T12:10:00.000Z',
      createdAt: new Date('2026-04-16T12:10:30.000Z'),
      updatedAt: new Date('2026-04-16T12:10:30.000Z'),
    });

    const { loadLatestBagetPageLoadDiagnostics } = await import('./pageLoadDiagnostics');
    const result = await loadLatestBagetPageLoadDiagnostics();

    expect(result?.catalogSource).toBe('fallback');
  });

  it('loads latest diagnostics without exposing sensitive fields', async () => {
    findUniqueMock.mockResolvedValueOnce({
      sourceKey: 'public_baget_page_latest',
      totalDurationMs: 3100,
      loadPublicBagetCatalogMs: 100,
      getPageContentMapMs: 2700,
      getBaguetteExtrasPricingConfigMs: 300,
      catalogSource: 'snapshot',
      bagetItemsCount: 70,
      snapshotExists: true,
      snapshotSyncedAt: '2026-04-16T12:10:00.000Z',
      createdAt: new Date('2026-04-16T12:10:30.000Z'),
      updatedAt: new Date('2026-04-16T12:10:30.000Z'),
    });

    const { loadLatestBagetPageLoadDiagnostics } = await import('./pageLoadDiagnostics');
    const result = await loadLatestBagetPageLoadDiagnostics();

    expect(result).toEqual({
      totalDurationMs: 3100,
      loadPublicBagetCatalogMs: 100,
      getPageContentMapMs: 2700,
      getBaguetteExtrasPricingConfigMs: 300,
      catalogSource: 'snapshot',
      bagetItemsCount: 70,
      snapshotExists: true,
      snapshotSyncedAt: '2026-04-16T12:10:00.000Z',
      createdAt: '2026-04-16T12:10:30.000Z',
    });
    expect(result).not.toHaveProperty('sourceKey');
    expect(result).not.toHaveProperty('updatedAt');
  });
});
