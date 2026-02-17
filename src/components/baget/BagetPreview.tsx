'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BagetItem } from './BagetCard';
import { PassepartoutColor } from './BagetFilters';

type BagetPreviewProps = {
  widthMm: number;
  heightMm: number;
  selectedBaget: BagetItem | null;
  imageUrl: string | null;
  highlighted?: boolean;
  className?: string;
  stretchedCanvas?: boolean;
  passepartoutEnabled?: boolean;
  passepartoutMm?: number;
  passepartoutBottomMm?: number;
  passepartoutColor?: PassepartoutColor;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const PASSEPARTOUT_COLORS: Record<PassepartoutColor, string> = {
  white: '#f8fafc',
  ivory: '#f7f1de',
  beige: '#ece0c8',
  gray: '#d4d4d8',
  black: '#1f2937',
};

export default function BagetPreview({
  widthMm,
  heightMm,
  selectedBaget,
  imageUrl,
  highlighted = false,
  className = '',
  stretchedCanvas = false,
  passepartoutEnabled = false,
  passepartoutMm = 0,
  passepartoutBottomMm = 0,
  passepartoutColor = 'white',
}: BagetPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerPx, setContainerPx] = useState({ width: 0, height: 0 });

  const safeWidthMm = widthMm >= 50 ? widthMm : 500;
  const safeHeightMm = heightMm >= 50 ? heightMm : 500;
  const safePasseMm = passepartoutEnabled ? Math.max(0, passepartoutMm) : 0;
  const safePasseBottomMm = passepartoutEnabled ? Math.max(0, passepartoutBottomMm) : 0;

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
    const cw = containerPx.width;
    const ch = containerPx.height;
    const bagetWidthMm = stretchedCanvas ? 0 : (selectedBaget?.width_mm ?? 0);
    const effectiveWmm = safeWidthMm + safePasseMm * 2;
    const effectiveHmm = safeHeightMm + safePasseMm + safePasseBottomMm;

    if (!cw || !ch) {
      return {
        scale: 0,
        framePx: 0,
        outerWpx: 0,
        outerHpx: 0,
        effectiveWpx: 0,
        effectiveHpx: 0,
        workWpx: 0,
        workHpx: 0,
        passePx: 0,
        passeBottomPx: 0,
      };
    }

    const outerTotalWmm = effectiveWmm + 2 * bagetWidthMm;
    const outerTotalHmm = effectiveHmm + 2 * bagetWidthMm;
    const scale = Math.min(cw / outerTotalWmm, ch / outerTotalHmm);

    const framePx = bagetWidthMm > 0 ? clamp(bagetWidthMm * scale, 6, 48) : 0;
    const passePx = clamp(safePasseMm * scale, 0, 80);
    const passeBottomPx = clamp(safePasseBottomMm * scale, 0, 80);
    const workWpx = safeWidthMm * scale;
    const workHpx = safeHeightMm * scale;
    const effectiveWpx = effectiveWmm * scale;
    const effectiveHpx = effectiveHmm * scale;
    const outerWpx = effectiveWpx + 2 * framePx;
    const outerHpx = effectiveHpx + 2 * framePx;

    return {
      scale,
      framePx,
      outerWpx,
      outerHpx,
      effectiveWpx,
      effectiveHpx,
      workWpx,
      workHpx,
      passePx,
      passeBottomPx,
    };
  }, [containerPx.height, containerPx.width, passepartoutEnabled, safeHeightMm, safePasseBottomMm, safePasseMm, safeWidthMm, selectedBaget, stretchedCanvas]);

  return (
    <div className={['card rounded-2xl p-5 shadow-md', className].join(' ')}>
      <h2 className="mb-3 text-base font-semibold">Превью</h2>

      <div className="mx-auto w-full max-w-[520px]">
        <div
          ref={containerRef}
          className="relative grid aspect-square min-h-[280px] w-full place-items-center overflow-hidden rounded-xl p-2"
        >
          <div
            className={[
              'max-h-full max-w-full rounded-md transition-all duration-200',
              highlighted ? 'animate-pulse shadow-[0_0_0_4px_rgba(220,38,38,0.18)]' : '',
            ].join(' ')}
            style={{
              width: `${previewGeometry.outerWpx}px`,
              height: `${previewGeometry.outerHpx}px`,
              padding: `${previewGeometry.framePx}px`,
              boxSizing: 'border-box',
              background: stretchedCanvas
                ? 'transparent'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 30%, #b91c1c 65%, #7f1d1d 100%)',
              boxShadow: stretchedCanvas
                ? '0 10px 20px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(15, 23, 42, 0.1), inset 0 -2px 4px rgba(15, 23, 42, 0.1)'
                : '0 12px 26px rgba(15, 23, 42, 0.16), inset 0 2px 4px rgba(255,255,255,0.42), inset 2px 0 4px rgba(255,255,255,0.24), inset 0 -4px 8px rgba(15,23,42,0.28), inset -3px 0 6px rgba(15,23,42,0.24)',
            }}
          >
            <div
              className="relative overflow-hidden rounded-[2px] transition-all duration-200"
              style={{
                width: `${previewGeometry.effectiveWpx}px`,
                height: `${previewGeometry.effectiveHpx}px`,
                backgroundColor: PASSEPARTOUT_COLORS[passepartoutColor],
              }}
            >
              <div
                className="absolute transition-all duration-200"
                style={{
                  top: `${previewGeometry.passePx}px`,
                  left: `${previewGeometry.passePx}px`,
                  width: `${previewGeometry.workWpx}px`,
                  height: `${previewGeometry.workHpx}px`,
                }}
              >
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
                  <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-500">Загрузите изображение для превью</div>
                )}
              </div>
              {passepartoutEnabled ? (
                <div
                  className="pointer-events-none absolute inset-0 rounded-[2px]"
                  style={{
                    boxShadow: `inset ${previewGeometry.passePx}px ${previewGeometry.passePx}px 0 0 transparent, inset ${previewGeometry.passePx}px ${previewGeometry.passeBottomPx}px 0 0 transparent`,
                  }}
                />
              ) : null}
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
