'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Image as KonvaImage, Layer, Rect, Stage, Transformer } from 'react-konva';
import type Konva from 'konva';
import {
  HANDLE_BAND_WIDTH,
  MAX_IMAGE_SCALE,
  MIN_IMAGE_SIDE,
  MIN_INSIDE_RATIO,
  MUG_WRAP,
  PREVIEW_MAX_SIZE_MB,
  SAFE_ZONE_INSET,
} from '@/lib/mugDesigner/constants';
import { dataUrlToFile } from '@/lib/mugDesigner/exportPreview';

type TransformState = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
};

export type MugDesignerExport = {
  preview: File;
  layout: File;
};

type Props = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  allowedExtensions: readonly string[];
  allowedMimeTypes: readonly string[];
  maxUploadMb: number;
  onExportReady: (handler: (() => Promise<MugDesignerExport | null>) | null) => void;
  onHandleOverlapChange: (value: boolean) => void;
};

const wrapCenterX = MUG_WRAP.width / 2;
const wrapCenterY = MUG_WRAP.height / 2;
const wrapLeft = 0;
const wrapTop = 0;
const wrapRight = MUG_WRAP.width;
const wrapBottom = MUG_WRAP.height;

function fitScale(imgW: number, imgH: number): number {
  const safeWidth = MUG_WRAP.width - SAFE_ZONE_INSET * 2;
  const safeHeight = MUG_WRAP.height - SAFE_ZONE_INSET * 2;
  return Math.min(safeWidth / imgW, safeHeight / imgH);
}

function isInsideBand(x: number, width: number): boolean {
  const left = x - width / 2;
  const right = x + width / 2;
  return left < HANDLE_BAND_WIDTH || right > MUG_WRAP.width - HANDLE_BAND_WIDTH;
}

export default function MugDesigner({ file, onFileChange, allowedExtensions, allowedMimeTypes, maxUploadMb, onExportReady, onHandleOverlapChange }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const imageRef = useRef<Konva.Image | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  const [canvasWidth, setCanvasWidth] = useState(1120);
  const [error, setError] = useState('');
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [transform, setTransform] = useState<TransformState>({
    x: wrapCenterX,
    y: wrapCenterY,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  });

  const stageScale = canvasWidth / MUG_WRAP.width;
  const canvasHeight = MUG_WRAP.height * stageScale;

  useEffect(() => {
    onExportReady(async () => {
      if (!stageRef.current || !img || !file) return null;

      const dataUrl = stageRef.current.toDataURL({ mimeType: 'image/png', pixelRatio: 1 });
      const preview = await dataUrlToFile(dataUrl, 'mug-wrap-preview.png', 'image/png');

      const layoutPayload = {
        wrapWidth: MUG_WRAP.width,
        wrapHeight: MUG_WRAP.height,
        handleBandWidth: HANDLE_BAND_WIDTH,
        safeInset: SAFE_ZONE_INSET,
        image: {
          x: transform.x,
          y: transform.y,
          scaleX: transform.scaleX,
          scaleY: transform.scaleY,
          rotation: transform.rotation,
          width: img.width,
          height: img.height,
        },
        originalFileName: file.name,
      };

      const layoutBlob = new Blob([JSON.stringify(layoutPayload, null, 2)], { type: 'application/json' });
      const layout = new File([layoutBlob], 'mug-layout.json', { type: 'application/json' });
      return { preview, layout };
    });

    return () => onExportReady(null);
  }, [file, img, onExportReady, transform]);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 1120;
      setCanvasWidth(Math.min(width, 1120));
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!file) {
      setImg(null);
      setTransform({ x: wrapCenterX, y: wrapCenterY, scaleX: 1, scaleY: 1, rotation: 0 });
      onHandleOverlapChange(false);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const nextImage = new window.Image();
    nextImage.onload = () => {
      const nextScale = fitScale(nextImage.width, nextImage.height);
      setImg(nextImage);
      setTransform({ x: wrapCenterX, y: wrapCenterY, scaleX: nextScale, scaleY: nextScale, rotation: 0 });
      onHandleOverlapChange(isInsideBand(wrapCenterX, nextImage.width * nextScale));
    };
    nextImage.src = objectUrl;

    return () => URL.revokeObjectURL(objectUrl);
  }, [file, onHandleOverlapChange]);

  useEffect(() => {
    if (!transformerRef.current || !imageRef.current || !img) return;
    transformerRef.current.nodes([imageRef.current]);
    transformerRef.current.getLayer()?.batchDraw();
  }, [img]);

  const isAllowed = useMemo(
    () => (candidate: File) => {
      const ext = candidate.name.includes('.') ? `.${candidate.name.split('.').pop()?.toLowerCase() ?? ''}` : '';
      return allowedExtensions.includes(ext) || allowedMimeTypes.includes(candidate.type.toLowerCase());
    },
    [allowedExtensions, allowedMimeTypes],
  );

  const clampPosition = (centerX: number, centerY: number, width: number, height: number) => {
    const minX = wrapLeft - width * (0.5 - MIN_INSIDE_RATIO);
    const maxX = wrapRight + width * (0.5 - MIN_INSIDE_RATIO);
    const minY = wrapTop - height * (0.5 - MIN_INSIDE_RATIO);
    const maxY = wrapBottom + height * (0.5 - MIN_INSIDE_RATIO);

    return {
      x: Math.min(Math.max(centerX, minX), maxX),
      y: Math.min(Math.max(centerY, minY), maxY),
    };
  };

  const onUpload = (event: ChangeEvent<HTMLInputElement>) => {
    setError('');
    const next = event.target.files?.[0] ?? null;

    if (!next) {
      onFileChange(null);
      return;
    }

    if (!isAllowed(next)) {
      setError('Для конструктора доступны только изображения (png, jpg, jpeg, webp).');
      event.target.value = '';
      return;
    }

    if (next.size <= 0 || next.size > maxUploadMb * 1024 * 1024) {
      setError(`Размер файла должен быть от 1 байта до ${maxUploadMb} МБ.`);
      event.target.value = '';
      return;
    }

    onFileChange(next);
  };

  const onFitToWrap = () => {
    if (!img) return;
    const nextScale = fitScale(img.width, img.height);
    setTransform({ x: wrapCenterX, y: wrapCenterY, scaleX: nextScale, scaleY: nextScale, rotation: transform.rotation });
    onHandleOverlapChange(isInsideBand(wrapCenterX, img.width * nextScale));
  };

  const onReset = () => {
    if (!img) return;
    const nextScale = fitScale(img.width, img.height);
    setTransform({ x: wrapCenterX, y: wrapCenterY, scaleX: nextScale, scaleY: nextScale, rotation: 0 });
    onHandleOverlapChange(isInsideBand(wrapCenterX, img.width * nextScale));
  };

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-6">
      <h3 className="text-xl font-semibold">Конструктор макета кружки</h3>

      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50">
          Upload image
          <input type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={onUpload} />
        </label>

        <button type="button" onClick={onFitToWrap} disabled={!img} className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50">
          Fit to wrap
        </button>
        <button type="button" onClick={onReset} disabled={!img} className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50">
          Reset
        </button>

        <label className="ml-0 flex min-w-[220px] items-center gap-3 text-sm text-neutral-600 md:ml-2">
          Rotate
          <input
            type="range"
            min={0}
            max={360}
            disabled={!img}
            value={transform.rotation}
            onChange={(event) => {
              const nextRotation = Number(event.target.value);
              setTransform((prev) => ({ ...prev, rotation: nextRotation }));
            }}
            className="w-full"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-2xl border border-neutral-200 bg-[linear-gradient(0deg,rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:24px_24px] p-3">
        <div ref={wrapperRef} className="mx-auto aspect-[20/9] w-full max-w-[1120px] overflow-hidden rounded-xl shadow-[0_12px_36px_-20px_rgba(15,23,42,0.45)]">
          <Stage ref={stageRef} width={canvasWidth} height={canvasHeight}>
            <Layer>
              <Group scaleX={stageScale} scaleY={stageScale}>
                <Rect x={0} y={0} width={MUG_WRAP.width} height={MUG_WRAP.height} fill="#ffffff" cornerRadius={24} stroke="#e5e7eb" strokeWidth={2} />

                <Rect x={HANDLE_BAND_WIDTH} y={0} width={MUG_WRAP.width - HANDLE_BAND_WIDTH * 2} height={MUG_WRAP.height} fill="rgba(59,130,246,0.03)" />
                <Rect x={0} y={0} width={HANDLE_BAND_WIDTH} height={MUG_WRAP.height} fill="rgba(100,116,139,0.12)" />
                <Rect x={MUG_WRAP.width - HANDLE_BAND_WIDTH} y={0} width={HANDLE_BAND_WIDTH} height={MUG_WRAP.height} fill="rgba(100,116,139,0.12)" />

                <Rect
                  x={SAFE_ZONE_INSET}
                  y={SAFE_ZONE_INSET}
                  width={MUG_WRAP.width - SAFE_ZONE_INSET * 2}
                  height={MUG_WRAP.height - SAFE_ZONE_INSET * 2}
                  stroke="#94a3b8"
                  strokeWidth={2}
                  dash={[10, 8]}
                  cornerRadius={16}
                />

                {img && (
                  <KonvaImage
                    ref={imageRef}
                    image={img}
                    x={transform.x}
                    y={transform.y}
                    offsetX={img.width / 2}
                    offsetY={img.height / 2}
                    width={img.width}
                    height={img.height}
                    scaleX={transform.scaleX}
                    scaleY={transform.scaleY}
                    rotation={transform.rotation}
                    draggable
                    onDragMove={(event) => {
                      const width = img.width * transform.scaleX;
                      const height = img.height * transform.scaleY;
                      const nextPos = clampPosition(event.target.x(), event.target.y(), width, height);
                      event.target.x(nextPos.x);
                      event.target.y(nextPos.y);
                    }}
                    onDragEnd={(event) => {
                      const width = img.width * transform.scaleX;
                      setTransform((prev) => ({ ...prev, x: event.target.x(), y: event.target.y() }));
                      onHandleOverlapChange(isInsideBand(event.target.x(), width));
                    }}
                  />
                )}

                {img && (
                  <Transformer
                    ref={transformerRef}
                    keepRatio
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                    rotateEnabled={false}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < MIN_IMAGE_SIDE || newBox.height < MIN_IMAGE_SIDE) return oldBox;
                      if (newBox.width > MUG_WRAP.width * MAX_IMAGE_SCALE || newBox.height > MUG_WRAP.height * MAX_IMAGE_SCALE) return oldBox;
                      return newBox;
                    }}
                    onTransformEnd={() => {
                      const node = imageRef.current;
                      if (!node || !img) return;

                      const nextScaleX = node.scaleX();
                      const nextScaleY = node.scaleY();
                      const width = img.width * nextScaleX;
                      const height = img.height * nextScaleY;
                      const clamped = clampPosition(node.x(), node.y(), width, height);

                      node.x(clamped.x);
                      node.y(clamped.y);

                      setTransform((prev) => ({
                        ...prev,
                        x: clamped.x,
                        y: clamped.y,
                        scaleX: nextScaleX,
                        scaleY: nextScaleY,
                      }));
                      onHandleOverlapChange(isInsideBand(clamped.x, width));
                    }}
                  />
                )}
              </Group>
            </Layer>
          </Stage>
        </div>
      </div>

      <p className="text-sm text-neutral-600">Это превью. Итоговую печать подтверждаем после проверки макета.</p>
      <p className="text-xs text-neutral-500">Файлы экспорта: mug-wrap-preview.png и mug-layout.json. PNG до {PREVIEW_MAX_SIZE_MB} МБ.</p>
    </div>
  );
}
