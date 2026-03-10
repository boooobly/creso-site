import BagetConfigurator from '@/components/baget/BagetConfigurator';
import { isWideFormatCanvasBagetTransfer } from '@/lib/baget/transfer';
import type { BagetTransferSource } from '@/lib/baget/printRequirement';
import { loadBagetCatalog } from '@/lib/baget/sheetsCatalog';

type BagetPageProps = {
  searchParams?: {
    width?: string;
    height?: string;
    transferSource?: string;
  };
};

export default async function BagetPage({ searchParams }: BagetPageProps) {
  const { items, source } = await loadBagetCatalog();
  const shouldUseStretchedCanvasPreset = isWideFormatCanvasBagetTransfer(searchParams?.transferSource);
  const initialTransferSource: BagetTransferSource = shouldUseStretchedCanvasPreset ? 'wide-format' : 'manual';

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold md:text-3xl">Конфигуратор багета</h1>
        <p className="text-neutral-700">Подберите профиль, оцените превью и получите точный расчёт стоимости.</p>
        <p className="text-xs text-neutral-500">Catalog source: {source === 'sheet' ? 'Google Sheets' : 'fallback JSON'}</p>
        <BagetConfigurator
          items={items}
          initialWidth={searchParams?.width}
          initialHeight={searchParams?.height}
          initialWorkType={shouldUseStretchedCanvasPreset ? 'stretchedCanvas' : undefined}
          initialTransferSource={initialTransferSource}
        />
      </main>
    </div>
  );
}
