import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';
import { loadBagetCatalog, loadBagetCatalogUncached, type BagetSheetItem } from '@/lib/baget/sheetsCatalog';

const BAGET_SNAPSHOT_SOURCE_KEY = 'public_baget_catalog';
const BAGET_SNAPSHOT_CACHE_SECONDS = 120;

type BagetCatalogSnapshotRecord = {
  source: 'snapshot';
  sheetId: string;
  tab: string;
  items: BagetSheetItem[];
  itemCount: number;
  syncedAt: string;
  error: string | null;
};

type SnapshotStatus = {
  exists: boolean;
  syncedAt: string | null;
};

type PublicBagetCatalogResult = {
  source: 'snapshot' | 'sheet' | 'fallback';
  sheetId: string;
  tab: string;
  items: BagetSheetItem[];
  error: string | null;
  itemCount?: number;
  syncedAt?: string;
  snapshotExists: boolean;
  snapshotSyncedAt: string | null;
};

function mapSnapshotItems(itemsJson: unknown): BagetSheetItem[] {
  if (!Array.isArray(itemsJson)) return [];
  return itemsJson as BagetSheetItem[];
}

async function loadSnapshotUncached(): Promise<BagetCatalogSnapshotRecord | null> {
  try {
    const snapshot = await prisma.bagetCatalogSnapshot.findUnique({
      where: { sourceKey: BAGET_SNAPSHOT_SOURCE_KEY },
    });

    if (!snapshot) return null;

    const items = mapSnapshotItems(snapshot.itemsJson);
    if (items.length === 0) {
      logger.warn('baget.catalog_snapshot.invalid_items_empty', {
        sheetId: snapshot.sheetId,
        tab: snapshot.tab,
        syncedAt: snapshot.syncedAt.toISOString(),
      });
      return null;
    }

    return {
      source: 'snapshot',
      sheetId: snapshot.sheetId,
      tab: snapshot.tab,
      items,
      itemCount: snapshot.itemCount,
      syncedAt: snapshot.syncedAt.toISOString(),
      error: snapshot.error,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown DB read failure';
    logger.warn('baget.catalog_snapshot.read_failed', { error: message });
    return null;
  }
}

async function loadSnapshotCached(): Promise<BagetCatalogSnapshotRecord | null> {
  const load = unstable_cache(
    async () => loadSnapshotUncached(),
    ['baget.catalog_snapshot.latest'],
    { revalidate: BAGET_SNAPSHOT_CACHE_SECONDS }
  );

  try {
    return await load();
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('incrementalCache missing')) {
      return loadSnapshotUncached();
    }

    logger.warn('baget.catalog_snapshot.cached_read_failed', { error: message });
    return null;
  }
}

async function loadSnapshotStatusUncached(): Promise<SnapshotStatus> {
  try {
    const snapshot = await prisma.bagetCatalogSnapshot.findUnique({
      where: { sourceKey: BAGET_SNAPSHOT_SOURCE_KEY },
      select: { syncedAt: true },
    });

    return {
      exists: Boolean(snapshot),
      syncedAt: snapshot?.syncedAt.toISOString() ?? null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown DB read failure';
    logger.warn('baget.catalog_snapshot.status_read_failed', { error: message });
    return {
      exists: false,
      syncedAt: null,
    };
  }
}

export async function loadPublicBagetCatalog(): Promise<PublicBagetCatalogResult> {
  const snapshot = await loadSnapshotCached();
  if (snapshot) {
    logger.info('baget.catalog_snapshot.used_for_public', {
      itemCount: snapshot.itemCount,
      syncedAt: snapshot.syncedAt,
      sheetId: snapshot.sheetId,
      tab: snapshot.tab,
    });

    return {
      ...snapshot,
      snapshotExists: true,
      snapshotSyncedAt: snapshot.syncedAt,
    };
  }

  const snapshotStatus = await loadSnapshotStatusUncached();
  const fallback = await loadBagetCatalog();
  logger.warn('baget.catalog_snapshot.missing_fallback_to_runtime_load', {
    source: fallback.source,
    itemCount: fallback.items.length,
    sheetId: fallback.sheetId,
    tab: fallback.tab,
    snapshotExists: snapshotStatus.exists,
    snapshotSyncedAt: snapshotStatus.syncedAt,
  });

  return {
    ...fallback,
    snapshotExists: snapshotStatus.exists,
    snapshotSyncedAt: snapshotStatus.syncedAt,
  };
}

export async function syncBagetCatalogSnapshot(): Promise<
  | { ok: true; itemCount: number; syncedAt: string; sheetId: string; tab: string }
  | { ok: false; error: string; sheetId: string; tab: string; preservedSnapshot: boolean }
> {
  const result = await loadBagetCatalogUncached();

  if (result.source !== 'sheet') {
    const errorMessage = result.error || 'Не удалось получить каталог из Google Sheets.';

    let preservedSnapshot = false;
    try {
      const existing = await prisma.bagetCatalogSnapshot.findUnique({
        where: { sourceKey: BAGET_SNAPSHOT_SOURCE_KEY },
        select: { id: true },
      });

      if (existing) {
        preservedSnapshot = true;
        await prisma.bagetCatalogSnapshot.update({
          where: { sourceKey: BAGET_SNAPSHOT_SOURCE_KEY },
          data: { error: errorMessage },
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown DB write failure';
      logger.error('baget.catalog_snapshot.sync_failed_to_store_error', {
        error: message,
        sheetId: result.sheetId,
        tab: result.tab,
      });
    }

    logger.warn('baget.catalog_snapshot.sync_failed', {
      error: errorMessage,
      sheetId: result.sheetId,
      tab: result.tab,
      preservedSnapshot,
    });

    return {
      ok: false,
      error: errorMessage,
      sheetId: result.sheetId,
      tab: result.tab,
      preservedSnapshot,
    };
  }

  const now = new Date();

  await prisma.bagetCatalogSnapshot.upsert({
    where: { sourceKey: BAGET_SNAPSHOT_SOURCE_KEY },
    update: {
      sheetId: result.sheetId,
      tab: result.tab,
      itemCount: result.items.length,
      itemsJson: result.items,
      syncedAt: now,
      error: null,
    },
    create: {
      sourceKey: BAGET_SNAPSHOT_SOURCE_KEY,
      sheetId: result.sheetId,
      tab: result.tab,
      itemCount: result.items.length,
      itemsJson: result.items,
      syncedAt: now,
      error: null,
    },
  });

  logger.info('baget.catalog_snapshot.synced', {
    itemCount: result.items.length,
    syncedAt: now.toISOString(),
    sheetId: result.sheetId,
    tab: result.tab,
  });

  return {
    ok: true,
    itemCount: result.items.length,
    syncedAt: now.toISOString(),
    sheetId: result.sheetId,
    tab: result.tab,
  };
}

export async function getBagetCatalogSnapshotStatus(): Promise<BagetCatalogSnapshotRecord | null> {
  return loadSnapshotUncached();
}
