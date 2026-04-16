import React, { Suspense } from 'react';
import { BagetConfiguratorSection, BagetConfiguratorSkeleton } from '@/components/baget/BagetConfiguratorSection';
import { isWideFormatCanvasBagetTransfer } from '@/lib/baget/transfer';
import type { BagetTransferSource } from '@/lib/baget/printRequirement';

type BagetPageProps = {
  searchParams?: Promise<{
    width?: string;
    height?: string;
    transferSource?: string;
  }>;
};

export default async function BagetPage({ searchParams }: BagetPageProps) {
  const resolvedSearchParams = await searchParams;
  const shouldUseStretchedCanvasPreset = isWideFormatCanvasBagetTransfer(resolvedSearchParams?.transferSource);
  const initialTransferSource: BagetTransferSource = shouldUseStretchedCanvasPreset ? 'wide-format' : 'manual';

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold md:text-3xl">Конфигуратор багета</h1>
        <p className="text-neutral-700">Подберите профиль, оцените превью и получите точный расчёт стоимости.</p>
        <Suspense fallback={<BagetConfiguratorSkeleton />}>
          <BagetConfiguratorSection
            initialWidth={resolvedSearchParams?.width}
            initialHeight={resolvedSearchParams?.height}
            initialWorkType={shouldUseStretchedCanvasPreset ? 'stretchedCanvas' : undefined}
            initialTransferSource={initialTransferSource}
          />
        </Suspense>
      </main>
    </div>
  );
}
