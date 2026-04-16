import BagetConfigurator from '@/components/baget/BagetConfigurator';
import { isWideFormatCanvasBagetTransfer } from '@/lib/baget/transfer';
import type { BagetTransferSource } from '@/lib/baget/printRequirement';
import { loadPublicBagetCatalog } from '@/lib/baget/catalogSnapshot';
import { getPageContentMap, getPageContentValue } from '@/lib/page-content';
import { getBaguetteExtrasPricingConfig } from '@/lib/baget/baguetteExtrasPricing';
import { logger } from '@/lib/logger';

type BagetPageProps = {
  searchParams?: Promise<{
    width?: string;
    height?: string;
    transferSource?: string;
  }>;
};

async function measureAsync<T>(action: () => Promise<T>) {
  const startedAt = Date.now();
  const data = await action();
  return {
    data,
    durationMs: Date.now() - startedAt,
  };
}

export default async function BagetPage({ searchParams }: BagetPageProps) {
  const resolvedSearchParams = await searchParams;
  const pageLoadStartedAt = Date.now();

  const [catalogResult, contentResult, pricingResult] = await Promise.all([
    measureAsync(() => loadPublicBagetCatalog()),
    measureAsync(() => getPageContentMap('baget')),
    measureAsync(() => getBaguetteExtrasPricingConfig()),
  ]);
  const { items, source: catalogSource } = catalogResult.data;
  const contentMap = contentResult.data;
  const pricingConfigData = pricingResult.data;

  logger.info('baget.page.load_diagnostics', {
    totalDurationMs: Date.now() - pageLoadStartedAt,
    loadPublicBagetCatalogMs: catalogResult.durationMs,
    getPageContentMapMs: contentResult.durationMs,
    getBaguetteExtrasPricingConfigMs: pricingResult.durationMs,
    catalogSource,
    bagetItemsCount: items.length,
    snapshotExists: catalogResult.data.snapshotExists,
    snapshotSyncedAt: catalogResult.data.snapshotSyncedAt,
  });

  const heroTitle = getPageContentValue(contentMap, 'hero', 'title', 'Конфигуратор багета');
  const heroDescription = getPageContentValue(contentMap, 'hero', 'description', 'Подберите профиль, оцените превью и получите точный расчёт стоимости.');
  const shouldUseStretchedCanvasPreset = isWideFormatCanvasBagetTransfer(resolvedSearchParams?.transferSource);
  const initialTransferSource: BagetTransferSource = shouldUseStretchedCanvasPreset ? 'wide-format' : 'manual';

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold md:text-3xl">{heroTitle}</h1>
        <p className="text-neutral-700">{heroDescription}</p>
        <BagetConfigurator
          items={items}
          initialWidth={resolvedSearchParams?.width}
          initialHeight={resolvedSearchParams?.height}
          initialWorkType={shouldUseStretchedCanvasPreset ? 'stretchedCanvas' : undefined}
          initialTransferSource={initialTransferSource}
          pricingConfig={pricingConfigData.config}
        />
      </main>
    </div>
  );
}
