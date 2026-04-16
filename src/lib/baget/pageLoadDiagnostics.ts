import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

const BAGET_PAGE_DIAGNOSTICS_SOURCE_KEY = 'public_baget_page_latest';

export type BagetCatalogSource = 'snapshot' | 'sheet' | 'fallback';

function parseBagetCatalogSource(value: unknown): BagetCatalogSource {
  if (value === 'snapshot' || value === 'sheet' || value === 'fallback') {
    return value;
  }

  return 'fallback';
}

export type BagetPageLoadDiagnosticsInput = {
  totalDurationMs: number;
  loadPublicBagetCatalogMs: number;
  getPageContentMapMs: number;
  getBaguetteExtrasPricingConfigMs: number;
  catalogSource: BagetCatalogSource;
  bagetItemsCount: number;
  snapshotExists: boolean;
  snapshotSyncedAt: string | null;
};

export type BagetPageLoadDiagnosticsRecord = BagetPageLoadDiagnosticsInput & {
  createdAt: string;
};

function toSafeInteger(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  return Math.round(value);
}

function sanitizeDiagnostics(input: BagetPageLoadDiagnosticsInput): BagetPageLoadDiagnosticsInput {
  return {
    totalDurationMs: toSafeInteger(input.totalDurationMs),
    loadPublicBagetCatalogMs: toSafeInteger(input.loadPublicBagetCatalogMs),
    getPageContentMapMs: toSafeInteger(input.getPageContentMapMs),
    getBaguetteExtrasPricingConfigMs: toSafeInteger(input.getBaguetteExtrasPricingConfigMs),
    catalogSource: input.catalogSource,
    bagetItemsCount: toSafeInteger(input.bagetItemsCount),
    snapshotExists: Boolean(input.snapshotExists),
    snapshotSyncedAt: input.snapshotSyncedAt,
  };
}

export async function saveLatestBagetPageLoadDiagnostics(input: BagetPageLoadDiagnosticsInput) {
  const sanitized = sanitizeDiagnostics(input);

  await prisma.bagetPageLoadDiagnostics.upsert({
    where: { sourceKey: BAGET_PAGE_DIAGNOSTICS_SOURCE_KEY },
    update: {
      ...sanitized,
      createdAt: new Date(),
    },
    create: {
      sourceKey: BAGET_PAGE_DIAGNOSTICS_SOURCE_KEY,
      ...sanitized,
      createdAt: new Date(),
    },
  });
}

export async function loadLatestBagetPageLoadDiagnostics(): Promise<BagetPageLoadDiagnosticsRecord | null> {
  try {
    const record = await prisma.bagetPageLoadDiagnostics.findUnique({
      where: { sourceKey: BAGET_PAGE_DIAGNOSTICS_SOURCE_KEY },
    });

    if (!record) return null;

    return {
      totalDurationMs: record.totalDurationMs,
      loadPublicBagetCatalogMs: record.loadPublicBagetCatalogMs,
      getPageContentMapMs: record.getPageContentMapMs,
      getBaguetteExtrasPricingConfigMs: record.getBaguetteExtrasPricingConfigMs,
      catalogSource: parseBagetCatalogSource(record.catalogSource),
      bagetItemsCount: record.bagetItemsCount,
      snapshotExists: record.snapshotExists,
      snapshotSyncedAt: record.snapshotSyncedAt,
      createdAt: record.createdAt.toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown DB read failure';
    logger.warn('baget.page_load_diagnostics.read_failed', { error: message });
    return null;
  }
}
