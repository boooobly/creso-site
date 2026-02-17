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
  className?: string;
  stretchedCanvas?: boolean;
};

export default function BagetPreview({
  widthMm,
  heightMm,
  selectedBaget,
  imageUrl,
  highlighted = false,
  className = '',
  stretchedCanvas = false,
}: BagetPreviewProps) {
  const frameThickness = useMemo(() => {
    if (!selectedBaget) return 8;
    return Math.max(8, Math.min(24, Math.round(selectedBaget.width_mm / 2.2)));
  }, [selectedBaget]);

  const ratio = useMemo(() => {
    if (widthMm < 50 || heightMm < 50) return 1;
    return widthMm / heightMm;
  }, [widthMm, heightMm]);

  return (
    <div className={["card rounded-2xl p-5 shadow-md", className].join(" ")}>
      <h2 className="mb-3 text-base font-semibold">Превью</h2>
      <div className="mx-auto flex h-full w-full items-center justify-center">
        <div
          className={[
            'relative mx-auto w-full max-w-[520px] overflow-hidden rounded-md bg-neutral-100 transition-all duration-200',
            highlighted ? 'animate-pulse shadow-[0_0_0_4px_rgba(220,38,38,0.18)]' : '',
          ].join(' ')}
          style={{
            aspectRatio: `${ratio}`,
            borderStyle: stretchedCanvas ? 'none' : 'solid',
            borderColor: '#b91c1c',
            borderWidth: stretchedCanvas ? '0px' : `${frameThickness}px`,
            boxShadow: stretchedCanvas
              ? '0 10px 20px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(15, 23, 42, 0.1), inset 0 -2px 4px rgba(15, 23, 42, 0.1)'
              : '0 12px 26px rgba(15, 23, 42, 0.16), inset 2px 2px 5px rgba(255, 255, 255, 0.35), inset -3px -3px 7px rgba(15, 23, 42, 0.18)',
          }}
        >
          {!stretchedCanvas ? (
            <>
              <div
                className="pointer-events-none absolute inset-0"
                style={{ boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.45), inset 2px 0 5px rgba(255,255,255,0.32)' }}
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{ boxShadow: 'inset 0 -3px 6px rgba(15,23,42,0.25), inset -3px 0 6px rgba(15,23,42,0.22)' }}
              />
            </>
          ) : null}
          {imageUrl ? (
            <Image src={imageUrl} alt="Загруженное изображение" fill sizes="(max-width: 1280px) 90vw, 520px" className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">Загрузите изображение для превью</div>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-neutral-500">{stretchedCanvas ? 'Превью показывает холст на подрамнике без рамки.' : 'Толщина рамки зависит от выбранной ширины профиля.'}</p>
    </div>
  );
}
