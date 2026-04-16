import React from 'react';
import BagetConfigurator from '@/components/baget/BagetConfigurator';
import type { BagetTransferSource } from '@/lib/baget/printRequirement';
import { loadPublicBagetCatalog } from '@/lib/baget/catalogSnapshot';
import { getCachedBagetPageContentMap, getCachedBaguetteExtrasPricingConfig } from '@/lib/baget/pageData';
import { logger } from '@/lib/logger';
import { saveLatestBagetPageLoadDiagnostics } from '@/lib/baget/pageLoadDiagnostics';

type BagetConfiguratorSectionProps = {
  initialWidth?: string;
  initialHeight?: string;
  initialWorkType?: 'stretchedCanvas';
  initialTransferSource: BagetTransferSource;
};

async function measureAsync<T>(action: () => Promise<T>) {
  const startedAt = Date.now();
  const data = await action();
  return {
    data,
    durationMs: Date.now() - startedAt,
  };
}

export function BagetConfiguratorSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px] animate-pulse">
      <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="h-5 w-40 rounded bg-neutral-200" />
        <div className="h-10 w-full rounded-lg bg-neutral-100" />
        <div className="h-10 w-full rounded-lg bg-neutral-100" />
        <div className="h-8 w-3/4 rounded bg-neutral-100" />
        <div className="h-8 w-2/3 rounded bg-neutral-100" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm space-y-4">
            <div className="aspect-[4/3] w-full rounded-xl bg-neutral-100" />
            <div className="h-4 w-2/3 rounded bg-neutral-200" />
            <div className="h-4 w-1/2 rounded bg-neutral-100" />
            <div className="h-9 w-full rounded-lg bg-neutral-100" />
          </div>
        ))}
      </section>

      <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="h-5 w-32 rounded bg-neutral-200" />
        <div className="h-44 w-full rounded-xl bg-neutral-100" />
        <div className="h-4 w-full rounded bg-neutral-100" />
        <div className="h-4 w-5/6 rounded bg-neutral-100" />
        <div className="h-10 w-full rounded-lg bg-neutral-200" />
      </section>
    </div>
  );
}

export async function BagetConfiguratorSection({
  initialWidth,
  initialHeight,
  initialWorkType,
  initialTransferSource,
}: BagetConfiguratorSectionProps) {
  const pageLoadStartedAt = Date.now();
  const [catalogResult, contentResult, pricingResult] = await Promise.all([
    measureAsync(() => loadPublicBagetCatalog()),
    measureAsync(() => getCachedBagetPageContentMap()),
    measureAsync(() => getCachedBaguetteExtrasPricingConfig()),
  ]);

  const { items, source: catalogSource, autoSyncedSnapshot, snapshotExists, snapshotSyncedAt } = catalogResult.data;
  const pricingConfig = pricingResult.data;

  const diagnosticsPayload = {
    totalDurationMs: Date.now() - pageLoadStartedAt,
    loadPublicBagetCatalogMs: catalogResult.durationMs,
    getPageContentMapMs: contentResult.durationMs,
    getBaguetteExtrasPricingConfigMs: pricingResult.durationMs,
    catalogSource,
    bagetItemsCount: items.length,
    snapshotExists: Boolean(snapshotExists),
    snapshotSyncedAt: snapshotSyncedAt ?? null,
  };

  const shouldLogDiagnostics = process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === 'preview';
  if (shouldLogDiagnostics) {
    logger.info('baget.page.load_diagnostics', {
      ...diagnosticsPayload,
      autoSyncedSnapshot: Boolean(autoSyncedSnapshot),
    });
  }

  void saveLatestBagetPageLoadDiagnostics(diagnosticsPayload).catch((error) => {
    const message = error instanceof Error ? error.message : 'Unknown diagnostics write failure';
    logger.warn('baget.page.load_diagnostics_save_failed', { error: message });
  });

  return (
    <BagetConfigurator
      items={items}
      initialWidth={initialWidth}
      initialHeight={initialHeight}
      initialWorkType={initialWorkType}
      initialTransferSource={initialTransferSource}
      pricingConfig={pricingConfig}
    />
  );
}
