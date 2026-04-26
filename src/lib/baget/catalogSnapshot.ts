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
  lastAutoSyncedAt: string | null;
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
  autoSyncedSnapshot?: boolean;
  snapshotExists?: boolean;
  snapshotSyncedAt?: string | null;
};

let lastAutoSyncedAt: string | null = null;

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
      lastAutoSyncedAt,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown DB read failure';
    logger.warn('baget.catalog_snapshot.read_failed', { error: message });
    return null;
  }
}

async function loadSnapshotStatusUncached(): Promise<SnapshotStatus> {
  const snapshot = await loadSnapshotUncached();
  return {
    exists: Boolean(snapshot),
    syncedAt: snapshot?.syncedAt ?? null,
  };
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

async function upsertSnapshotFromSheet(result: {
  sheetId: string;
  tab: string;
  items: BagetSheetItem[];
}): Promise<BagetCatalogSnapshotRecord> {
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

  return {
    source: 'snapshot',
    sheetId: result.sheetId,
    tab: result.tab,
    items: result.items,
    itemCount: result.items.length,
    syncedAt: now.toISOString(),
    error: null,
    lastAutoSyncedAt,
  };
}

export async function ensureBagetCatalogSnapshot(): Promise<BagetCatalogSnapshotRecord> {
  const existingSnapshot = await loadSnapshotUncached();
  if (existingSnapshot && existingSnapshot.items.length > 0 && !existingSnapshot.error) {
    return existingSnapshot;
  }

  const result = await loadBagetCatalogUncached();
  if (result.source !== 'sheet') {
    const reason = result.error || 'Google Sheets runtime load did not return sheet source';
    throw new Error(reason);
  }

  lastAutoSyncedAt = new Date().toISOString();
  const snapshot = await upsertSnapshotFromSheet(result);

  logger.info('baget.catalog_snapshot.auto_synced', {
    itemCount: snapshot.itemCount,
    syncedAt: snapshot.syncedAt,
    autoSyncedAt: lastAutoSyncedAt,
    sheetId: snapshot.sheetId,
    tab: snapshot.tab,
  });

  return {
    ...snapshot,
    lastAutoSyncedAt,
  };
}

export async function loadPublicBagetCatalog(): Promise<PublicBagetCatalogResult> {
  try {
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
        autoSyncedSnapshot: false,
        snapshotExists: true,
        snapshotSyncedAt: snapshot.syncedAt,
      };
    }

    const autoSyncedSnapshot = await ensureBagetCatalogSnapshot();
    return {
      ...autoSyncedSnapshot,
      autoSyncedSnapshot: true,
      snapshotExists: true,
      snapshotSyncedAt: autoSyncedSnapshot.syncedAt,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown catalog snapshot failure';
    logger.warn('baget.catalog_snapshot.auto_sync_failed_runtime_fallback', { error: message });
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
    autoSyncedSnapshot: false,
    snapshotExists: snapshotStatus.exists,
    snapshotSyncedAt: snapshotStatus.syncedAt,
  };
}

export async function syncBagetCatalogSnapshot(): Promise<
  | { ok: true; itemCount: number; syncedAt: string; sheetId: string; tab: string }
  | {
      ok: false;
      error: string;
      sheetId: string;
      tab: string;
      preservedSnapshot: boolean;
      diagnostics?: {
        rowsCount: number;
        headers: string[];
        skipped: {
          missingResidues: number;
          hidden: number;
          invalidWidth: number;
          invalidPrice: number;
          other: number;
        };
      };
    }
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
      diagnostics: result.diagnostics,
    };
  }

  const now = new Date();
  await upsertSnapshotFromSheet(result);

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

export function getBagetCatalogAutoSyncStatus() {
  return {
    lastAutoSyncedAt,
    autoSyncedRecently: Boolean(lastAutoSyncedAt),
  };
}
