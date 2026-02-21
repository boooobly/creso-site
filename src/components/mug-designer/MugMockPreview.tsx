'use client';

import { useEffect, useRef } from 'react';

type Props = {
  wrapDataUrl: string | null;
  onExportReady: (handler: (() => Promise<File | null>) | null) => void;
};

const PREVIEW_WIDTH = 720;
const PREVIEW_HEIGHT = 460;
const SLICE_COUNT = 120;

export default function MugMockPreview({ wrapDataUrl, onExportReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = PREVIEW_WIDTH;
    canvas.height = PREVIEW_HEIGHT;
    const context = canvas.getContext('2d');
    if (!context) return;

    const drawBase = () => {
      context.clearRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
      context.fillStyle = '#f8fafc';
      context.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);

      context.save();
      context.fillStyle = '#e5e7eb';
      context.strokeStyle = '#d1d5db';
      context.lineWidth = 2;
      context.beginPath();
      context.roundRect(120, 80, 420, 280, 90);
      context.fill();
      context.stroke();
      context.restore();

      context.save();
      context.fillStyle = '#e2e8f0';
      context.strokeStyle = '#cbd5e1';
      context.lineWidth = 2;
      context.beginPath();
      context.ellipse(560, 220, 55, 75, 0, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.beginPath();
      context.fillStyle = '#f8fafc';
      context.ellipse(560, 220, 28, 42, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    drawBase();

    if (!wrapDataUrl) return;

    const timer = window.setTimeout(() => {
      const image = new Image();
      image.onload = () => {
        drawBase();

        const designX = 145;
        const designY = 115;
        const designWidth = 370;
        const designHeight = 210;

        context.save();
        context.beginPath();
        context.roundRect(designX, designY, designWidth, designHeight, 70);
        context.clip();

        for (let index = 0; index < SLICE_COUNT; index += 1) {
          const t = index / (SLICE_COUNT - 1);
          const srcX = Math.floor(t * image.width);
          const srcSliceWidth = Math.max(1, Math.floor(image.width / SLICE_COUNT));

          const centered = (t - 0.5) * 2;
          const curve = Math.cos(centered * Math.PI * 0.5);
          const depth = 0.55 + 0.45 * Math.max(curve, 0);

          const destSliceWidth = (designWidth / SLICE_COUNT) * depth;
          const destX = designX + t * designWidth - destSliceWidth / 2;

          context.drawImage(image, srcX, 0, srcSliceWidth, image.height, destX, designY, destSliceWidth, designHeight);
        }

        const edgeShade = context.createLinearGradient(designX, 0, designX + designWidth, 0);
        edgeShade.addColorStop(0, 'rgba(15,23,42,0.24)');
        edgeShade.addColorStop(0.2, 'rgba(15,23,42,0.08)');
        edgeShade.addColorStop(0.5, 'rgba(15,23,42,0)');
        edgeShade.addColorStop(0.8, 'rgba(15,23,42,0.08)');
        edgeShade.addColorStop(1, 'rgba(15,23,42,0.24)');
        context.fillStyle = edgeShade;
        context.fillRect(designX, designY, designWidth, designHeight);

        const gloss = context.createLinearGradient(designX + designWidth * 0.25, 0, designX + designWidth * 0.45, 0);
        gloss.addColorStop(0, 'rgba(255,255,255,0)');
        gloss.addColorStop(0.5, 'rgba(255,255,255,0.2)');
        gloss.addColorStop(1, 'rgba(255,255,255,0)');
        context.fillStyle = gloss;
        context.fillRect(designX, designY, designWidth, designHeight);

        context.restore();

        const shadow = context.createRadialGradient(330, 335, 50, 330, 335, 180);
        shadow.addColorStop(0, 'rgba(15,23,42,0.14)');
        shadow.addColorStop(1, 'rgba(15,23,42,0)');
        context.fillStyle = shadow;
        context.fillRect(120, 305, 430, 90);
      };
      image.src = wrapDataUrl;
    }, 90);

    return () => window.clearTimeout(timer);
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
