'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { BagetItem } from './BagetCard';

type BagetPreviewProps = {
  widthMm: number;
  heightMm: number;
  selectedBaget: BagetItem | null;
  imageUrl: string | null;
  highlighted?: boolean;
};

export default function BagetPreview({ widthMm, heightMm, selectedBaget, imageUrl, highlighted = false }: BagetPreviewProps) {
  const frameThickness = useMemo(() => {
    if (!selectedBaget) return 8;
    return Math.max(8, Math.min(24, Math.round(selectedBaget.width_mm / 2.2)));
  }, [selectedBaget]);

  const ratio = useMemo(() => {
    if (widthMm < 50 || heightMm < 50) return 1;
    return widthMm / heightMm;
  }, [widthMm, heightMm]);

  return (
    <div className="card rounded-2xl p-4 shadow-md">
      <h2 className="mb-3 text-base font-semibold">Превью</h2>
      <div className="mx-auto w-full max-w-[300px]">
        <div
          className={[
            'relative mx-auto w-full max-w-[280px] overflow-hidden rounded-md bg-neutral-100 transition-shadow duration-500',
            highlighted ? 'animate-pulse shadow-[0_0_0_4px_rgba(220,38,38,0.18)]' : '',
          ].join(' ')}
          style={{
            aspectRatio: `${ratio}`,
            borderStyle: 'solid',
            borderColor: '#b91c1c',
            borderWidth: `${frameThickness}px`,
          }}
        >
          {imageUrl ? (
            <Image src={imageUrl} alt="Загруженное изображение" fill sizes="280px" className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">Загрузите изображение для превью</div>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-neutral-500">Толщина рамки зависит от выбранной ширины профиля.</p>
    </div>
  );
}
