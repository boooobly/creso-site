import BagetConfigurator from '@/components/baget/BagetConfigurator';
import { isWideFormatCanvasBagetTransfer } from '@/lib/baget/transfer';
import type { BagetTransferSource } from '@/lib/baget/printRequirement';
import { loadBagetCatalog } from '@/lib/baget/sheetsCatalog';
import { getPageContentMap, getPageContentValue } from '@/lib/page-content';
import { getBaguetteExtrasPricingConfig } from '@/lib/baget/baguetteExtrasPricing';

type BagetPageProps = {
  searchParams?: Promise<{
    width?: string;
    height?: string;
    transferSource?: string;
  }>;
};

export default async function BagetPage({ searchParams }: BagetPageProps) {
  const resolvedSearchParams = await searchParams;
  const [{ items }, contentMap, pricingConfigData] = await Promise.all([
    loadBagetCatalog(),
    getPageContentMap('baget'),
    getBaguetteExtrasPricingConfig(),
  ]);
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
