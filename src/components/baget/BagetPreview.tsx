'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
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

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function BagetPreview({
  widthMm,
  heightMm,
  selectedBaget,
  imageUrl,
  highlighted = false,
  className = '',
  stretchedCanvas = false,
}: BagetPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerPx, setContainerPx] = useState({ width: 0, height: 0 });

  const safeWidthMm = widthMm >= 50 ? widthMm : 500;
  const safeHeightMm = heightMm >= 50 ? heightMm : 500;

  const ratio = useMemo(() => safeWidthMm / safeHeightMm, [safeHeightMm, safeWidthMm]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const nextWidth = Math.round(entry.contentRect.width);
      const nextHeight = Math.round(entry.contentRect.height);

      setContainerPx((prev) => {
        if (prev.width === nextWidth && prev.height === nextHeight) return prev;
        return { width: nextWidth, height: nextHeight };
      });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const previewGeometry = useMemo(() => {
    const measuredW = containerPx.width;
    const measuredH = containerPx.height;

    if (!measuredW || !measuredH || !selectedBaget) {
      return {
        scale: 0,
        framePx: stretchedCanvas ? 0 : 8,
        workPxW: measuredW,
        workPxH: measuredH,
      };
    }

    const scale = Math.min(measuredW / safeWidthMm, measuredH / safeHeightMm);
    const framePx = stretchedCanvas ? 0 : clamp(selectedBaget.width_mm * scale, 6, 48);

    return {
      scale,
      framePx,
      workPxW: safeWidthMm * scale,
      workPxH: safeHeightMm * scale,
    };
  }, [containerPx.height, containerPx.width, safeHeightMm, safeWidthMm, selectedBaget, stretchedCanvas]);

  const frameStyle = useMemo(
    () => ({
      padding: `${previewGeometry.framePx}px`,
      width: `${previewGeometry.workPxW + previewGeometry.framePx * 2}px`,
      height: `${previewGeometry.workPxH + previewGeometry.framePx * 2}px`,
      background: stretchedCanvas
        ? 'transparent'
        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 30%, #b91c1c 65%, #7f1d1d 100%)',
      boxShadow: stretchedCanvas
        ? '0 10px 20px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(15, 23, 42, 0.1), inset 0 -2px 4px rgba(15, 23, 42, 0.1)'
        : '0 12px 26px rgba(15, 23, 42, 0.16), inset 0 2px 4px rgba(255,255,255,0.42), inset 2px 0 4px rgba(255,255,255,0.24), inset 0 -4px 8px rgba(15,23,42,0.28), inset -3px 0 6px rgba(15,23,42,0.24)',
    }),
    [previewGeometry.framePx, previewGeometry.workPxH, previewGeometry.workPxW, stretchedCanvas],
  );

  return (
    <div className={['card rounded-2xl p-5 shadow-md', className].join(' ')}>
      <h2 className="mb-3 text-base font-semibold">Превью</h2>

      <div className="mx-auto flex w-full items-center justify-center">
        <div
          ref={containerRef}
          className="relative w-full max-w-[520px]"
          style={{ aspectRatio: `${ratio}` }}
        >
          <div
            className={[
              'absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-visible rounded-md transition-all duration-200',
              highlighted ? 'animate-pulse shadow-[0_0_0_4px_rgba(220,38,38,0.18)]' : '',
            ].join(' ')}
            style={frameStyle}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[2px] bg-neutral-100 transition-all duration-200">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Загруженное изображение"
                  fill
                  sizes="(max-width: 1280px) 90vw, 520px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">Загрузите изображение для превью</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        {stretchedCanvas
          ? 'Превью показывает холст на подрамнике без рамки.'
          : `Толщина рамки масштабируется по реальным размерам (${previewGeometry.scale > 0 ? `${previewGeometry.framePx.toFixed(1)}px` : '...'}).`}
      </p>
    </div>
  );
}
