'use client';

import { useEffect, useRef } from 'react';
import { MOCKUP_SRC, PRINT_AREA, SAFE_INSET } from '@/components/mug-designer/mugMockupConfig';

type Props = {
  wrapDataUrl: string | null;
  onExportReady: (handler: (() => Promise<File | null>) | null) => void;
};

const SLICE_COUNT = 120;

export default function MugMockPreview({ wrapDataUrl, onExportReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const mockImage = new Image();
    mockImage.onload = () => {
      canvas.width = mockImage.width;
      canvas.height = mockImage.height;

      const drawBase = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(mockImage, 0, 0);

        context.save();
        context.strokeStyle = 'rgba(59,130,246,0.65)';
        context.lineWidth = 2;
        context.setLineDash([10, 8]);
        context.strokeRect(
          PRINT_AREA.x + SAFE_INSET,
          PRINT_AREA.y + SAFE_INSET,
          PRINT_AREA.width - SAFE_INSET * 2,
          PRINT_AREA.height - SAFE_INSET * 2,
        );
        context.restore();
      };

      drawBase();
      if (!wrapDataUrl) return;

      const timer = window.setTimeout(() => {
        const wrap = new Image();
        wrap.onload = () => {
          drawBase();

          context.save();
          context.beginPath();
          context.rect(PRINT_AREA.x, PRINT_AREA.y, PRINT_AREA.width, PRINT_AREA.height);
          context.clip();

          for (let index = 0; index < SLICE_COUNT; index += 1) {
            const t = index / (SLICE_COUNT - 1);
            const srcX = Math.floor(t * wrap.width);
            const srcSliceWidth = Math.max(1, Math.floor(wrap.width / SLICE_COUNT));

            const centered = (t - 0.5) * 2;
            const curve = Math.cos(centered * Math.PI * 0.5);
            const depth = 0.58 + 0.42 * Math.max(curve, 0);

            const destSliceWidth = (PRINT_AREA.width / SLICE_COUNT) * depth;
            const destX = PRINT_AREA.x + t * PRINT_AREA.width - destSliceWidth / 2;
            context.drawImage(wrap, srcX, 0, srcSliceWidth, wrap.height, destX, PRINT_AREA.y, destSliceWidth, PRINT_AREA.height);
          }

          const edgeShade = context.createLinearGradient(PRINT_AREA.x, 0, PRINT_AREA.x + PRINT_AREA.width, 0);
          edgeShade.addColorStop(0, 'rgba(15,23,42,0.2)');
          edgeShade.addColorStop(0.2, 'rgba(15,23,42,0.07)');
          edgeShade.addColorStop(0.5, 'rgba(15,23,42,0)');
          edgeShade.addColorStop(0.8, 'rgba(15,23,42,0.07)');
          edgeShade.addColorStop(1, 'rgba(15,23,42,0.2)');
          context.fillStyle = edgeShade;
          context.fillRect(PRINT_AREA.x, PRINT_AREA.y, PRINT_AREA.width, PRINT_AREA.height);

          const gloss = context.createLinearGradient(
            PRINT_AREA.x + PRINT_AREA.width * 0.25,
            0,
            PRINT_AREA.x + PRINT_AREA.width * 0.42,
            0,
          );
          gloss.addColorStop(0, 'rgba(255,255,255,0)');
          gloss.addColorStop(0.5, 'rgba(255,255,255,0.18)');
          gloss.addColorStop(1, 'rgba(255,255,255,0)');
          context.fillStyle = gloss;
          context.fillRect(PRINT_AREA.x, PRINT_AREA.y, PRINT_AREA.width, PRINT_AREA.height);

          context.restore();
        };
        wrap.src = wrapDataUrl;
      }, 90);

      return () => window.clearTimeout(timer);
    };

    mockImage.src = MOCKUP_SRC;
  }, [wrapDataUrl]);

  useEffect(() => {
    onExportReady(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((result) => resolve(result), 'image/png'));
      if (!blob) return null;
      return new File([blob], 'mug-mock-preview.png', { type: 'image/png' });
    });

    return () => onExportReady(null);
  }, [onExportReady]);

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-6">
      <h4 className="text-lg font-semibold">Предпросмотр на кружке</h4>
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <canvas ref={canvasRef} className="h-auto w-full rounded-lg" />
      </div>
    </div>
  );
}
