'use client';

import { MouseEvent, useMemo, useState } from 'react';
import { MOCKUP_SRC, PRINT_AREA, SAFE_INSET } from '@/components/mug-designer/mugMockupConfig';

type Point = { x: number; y: number };

export default function MugPrintAreaCalibrator() {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const [first, setFirst] = useState<Point | null>(null);
  const [second, setSecond] = useState<Point | null>(null);
  const [copied, setCopied] = useState(false);

  const rect = useMemo(() => {
    if (!first || !second) return null;
    const x = Math.min(first.x, second.x);
    const y = Math.min(first.y, second.y);
    return {
      x,
      y,
      width: Math.abs(second.x - first.x),
      height: Math.abs(second.y - first.y),
    };
  }, [first, second]);

  const onImageClick = (event: MouseEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const bounds = img.getBoundingClientRect();

    const x = Math.round(((event.clientX - bounds.left) / bounds.width) * img.naturalWidth);
    const y = Math.round(((event.clientY - bounds.top) / bounds.height) * img.naturalHeight);

    if (!first || (first && second)) {
      setFirst({ x, y });
      setSecond(null);
      return;
    }

    setSecond({ x, y });
  };

  const payload = {
    MOCKUP_SRC,
    PRINT_AREA: rect ?? PRINT_AREA,
    SAFE_INSET,
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4">
      <p className="text-sm text-neutral-600">Кликните 2 точки: верхний левый и нижний правый углы зоны печати.</p>
      <div className="relative overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-2">
        <img src={MOCKUP_SRC} alt="Mug mockup calibrator" onClick={onImageClick} className="max-w-full cursor-crosshair select-none" />
      </div>

      <div className="grid gap-2 text-xs text-neutral-700 md:grid-cols-2">
        <div>Point A: {first ? `${first.x}, ${first.y}` : '—'}</div>
        <div>Point B: {second ? `${second.x}, ${second.y}` : '—'}</div>
        <div>Current PRINT_AREA.x: {rect?.x ?? PRINT_AREA.x}</div>
        <div>Current PRINT_AREA.y: {rect?.y ?? PRINT_AREA.y}</div>
        <div>Current PRINT_AREA.width: {rect?.width ?? PRINT_AREA.width}</div>
        <div>Current PRINT_AREA.height: {rect?.height ?? PRINT_AREA.height}</div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copyJson} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50">
          Copy JSON
        </button>
        <button type="button" onClick={() => { setFirst(null); setSecond(null); }} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50">
          Reset points
        </button>
        {copied && <span className="text-xs text-emerald-600">Скопировано</span>}
      </div>
    </div>
  );
}
