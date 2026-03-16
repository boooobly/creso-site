import BagetConfigurator from '@/components/baget/BagetConfigurator';
import { isWideFormatCanvasBagetTransfer } from '@/lib/baget/transfer';
import type { BagetTransferSource } from '@/lib/baget/printRequirement';
import { loadBagetCatalog } from '@/lib/baget/sheetsCatalog';
import { getPageContentMap, getPageContentValue } from '@/lib/page-content';
import { getBaguetteExtrasPricingConfig } from '@/lib/baget/baguetteExtrasPricing';

type BagetPageProps = {
  searchParams?: {
    width?: string;
    height?: string;
    transferSource?: string;
  };
};

export default async function BagetPage({ searchParams }: BagetPageProps) {
  const [{ items, source }, contentMap, pricingConfigData] = await Promise.all([
    loadBagetCatalog(),
    getPageContentMap('baget'),
    getBaguetteExtrasPricingConfig(),
  ]);
  const heroTitle = getPageContentValue(contentMap, 'hero', 'title', 'Конфигуратор багета');
  const heroDescription = getPageContentValue(contentMap, 'hero', 'description', 'Подберите профиль, оцените превью и получите точный расчёт стоимости.');
  const shouldUseStretchedCanvasPreset = isWideFormatCanvasBagetTransfer(searchParams?.transferSource);
  const initialTransferSource: BagetTransferSource = shouldUseStretchedCanvasPreset ? 'wide-format' : 'manual';

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold md:text-3xl">{heroTitle}</h1>
        <p className="text-neutral-700">{heroDescription}</p>
        <p className="text-xs text-neutral-500">Catalog source: {source === 'sheet' ? 'Google Sheets' : 'fallback JSON'}</p>
        <BagetConfigurator
          items={items}
          initialWidth={searchParams?.width}
          initialHeight={searchParams?.height}
          initialWorkType={shouldUseStretchedCanvasPreset ? 'stretchedCanvas' : undefined}
          initialTransferSource={initialTransferSource}
          pricingConfig={pricingConfigData.config}
        />
      </main>
    </div>
  );
}
