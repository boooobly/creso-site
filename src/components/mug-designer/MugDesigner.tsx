'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from 'react-konva';
import type Konva from 'konva';
import {
  HANDLE_ZONE_WIDTH,
  MAX_IMAGE_SCALE,
  MIN_IMAGE_SIDE,
  MIN_INSIDE_RATIO,
  MUG_WRAP,
  PREVIEW_MAX_SIZE_MB,
  PRINT_ZONE,
  SAFE_ZONE_INSET,
} from '@/lib/mugDesigner/constants';
import { dataUrlToFile } from '@/lib/mugDesigner/exportPreview';

type DesignerTransform = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

type Props = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  allowedExtensions: readonly string[];
  allowedMimeTypes: readonly string[];
  maxUploadMb: number;
  onExportReady: (handler: (() => Promise<File | null>) | null) => void;
};

const defaultTransform: DesignerTransform = {
  x: PRINT_ZONE.x + PRINT_ZONE.width / 2,
  y: PRINT_ZONE.y + PRINT_ZONE.height / 2,
  scale: 1,
  rotation: 0,
};

function fitScale(imgW: number, imgH: number): number {
  return Math.min(PRINT_ZONE.width / imgW, PRINT_ZONE.height / imgH);
}

export default function MugDesigner({ file, onFileChange, allowedExtensions, allowedMimeTypes, maxUploadMb, onExportReady }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const imageRef = useRef<Konva.Image | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  const [canvasWidth, setCanvasWidth] = useState(960);
  const [error, setError] = useState('');
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [transform, setTransform] = useState<DesignerTransform>(defaultTransform);

  const scale = canvasWidth / MUG_WRAP.width;
  const stageHeight = MUG_WRAP.height * scale;

  useEffect(() => {
    onExportReady(async () => {
      if (!stageRef.current) return null;
      const dataUrl = stageRef.current.toDataURL({ mimeType: 'image/png', pixelRatio: 1 });
      return dataUrlToFile(dataUrl, 'mug-preview.png', 'image/png');
    });
    return () => onExportReady(null);
  }, [onExportReady]);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 960;
      setCanvasWidth(Math.min(width, 960));
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!file) {
      setImg(null);
      setTransform(defaultTransform);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const nextImage = new window.Image();
    nextImage.onload = () => {
      const nextScale = fitScale(nextImage.width, nextImage.height);
      setImg(nextImage);
      setTransform({
        x: PRINT_ZONE.x + PRINT_ZONE.width / 2,
        y: PRINT_ZONE.y + PRINT_ZONE.height / 2,
        scale: nextScale,
        rotation: 0,
      });
    };
    nextImage.src = objectUrl;

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

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

  const clampPosition = (x: number, y: number, width: number, height: number) => {
    const minX = PRINT_ZONE.x - width * (1 - MIN_INSIDE_RATIO);
    const maxX = PRINT_ZONE.x + PRINT_ZONE.width - width * MIN_INSIDE_RATIO;
    const minY = PRINT_ZONE.y - height * (1 - MIN_INSIDE_RATIO);
    const maxY = PRINT_ZONE.y + PRINT_ZONE.height - height * MIN_INSIDE_RATIO;

    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY),
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

  const onFit = () => {
    if (!img) return;
    setTransform((prev) => ({
      ...prev,
      x: PRINT_ZONE.x + PRINT_ZONE.width / 2,
      y: PRINT_ZONE.y + PRINT_ZONE.height / 2,
      scale: fitScale(img.width, img.height),
    }));
  };

  const onReset = () => {
    if (!img) return;
    const nextScale = fitScale(img.width, img.height);
    setTransform({ x: PRINT_ZONE.x + PRINT_ZONE.width / 2, y: PRINT_ZONE.y + PRINT_ZONE.height / 2, scale: nextScale, rotation: 0 });
  };

  const imageWidth = img ? img.width * transform.scale : 0;
  const imageHeight = img ? img.height * transform.scale : 0;

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-6">
      <h3 className="text-xl font-semibold">Конструктор макета кружки</h3>
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50">
          Upload image
          <input type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={onUpload} />
        </label>
        <button type="button" onClick={onReset} className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50" disabled={!img}>Reset position</button>
        <button type="button" onClick={onFit} className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50" disabled={!img}>Fit to print zone</button>
      </div>
      <label className="block space-y-2">
        <span className="text-sm text-neutral-600">Rotate: {Math.round(transform.rotation)}°</span>
        <input type="range" min={0} max={360} value={transform.rotation} disabled={!img} onChange={(event) => setTransform((prev) => ({ ...prev, rotation: Number(event.target.value) }))} className="w-full" />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div ref={wrapperRef} className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
        <Stage ref={stageRef} width={canvasWidth} height={stageHeight}>
          <Layer>
            <Group scaleX={scale} scaleY={scale}>
              <Rect x={0} y={0} width={MUG_WRAP.width} height={MUG_WRAP.height} fill="#ffffff" />
              <Rect x={PRINT_ZONE.x} y={PRINT_ZONE.y} width={PRINT_ZONE.width} height={PRINT_ZONE.height} stroke="#ef4444" strokeWidth={4} dash={[20, 10]} />
              <Rect x={PRINT_ZONE.x + SAFE_ZONE_INSET} y={PRINT_ZONE.y + SAFE_ZONE_INSET} width={PRINT_ZONE.width - SAFE_ZONE_INSET * 2} height={PRINT_ZONE.height - SAFE_ZONE_INSET * 2} stroke="#f97316" strokeWidth={2} dash={[12, 8]} />
              <Rect x={PRINT_ZONE.x} y={PRINT_ZONE.y} width={HANDLE_ZONE_WIDTH} height={PRINT_ZONE.height} fill="rgba(71,85,105,0.12)" />
              <Rect x={PRINT_ZONE.x + PRINT_ZONE.width - HANDLE_ZONE_WIDTH} y={PRINT_ZONE.y} width={HANDLE_ZONE_WIDTH} height={PRINT_ZONE.height} fill="rgba(71,85,105,0.12)" />
              <Text x={PRINT_ZONE.x + 12} y={PRINT_ZONE.y + 10} text="NO-PRINT / HANDLE" fill="#334155" fontSize={24} />
              <Text x={PRINT_ZONE.x + PRINT_ZONE.width - HANDLE_ZONE_WIDTH + 8} y={PRINT_ZONE.y + 10} text="NO-PRINT" fill="#334155" fontSize={24} />
              <Text x={PRINT_ZONE.x + 20} y={PRINT_ZONE.y + PRINT_ZONE.height - 40} text="PRINT ZONE" fill="#dc2626" fontSize={28} />
              <Text x={PRINT_ZONE.x + SAFE_ZONE_INSET + 16} y={PRINT_ZONE.y + SAFE_ZONE_INSET + 10} text="SAFE ZONE" fill="#ea580c" fontSize={24} />
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
                  scaleX={transform.scale}
                  scaleY={transform.scale}
                  rotation={transform.rotation}
                  draggable
                  onDragMove={(event) => {
                    const nextPos = clampPosition(event.target.x(), event.target.y(), imageWidth, imageHeight);
                    event.target.x(nextPos.x);
                    event.target.y(nextPos.y);
                  }}
                  onDragEnd={(event) => setTransform((prev) => ({ ...prev, x: event.target.x(), y: event.target.y() }))}
                />
              )}
              {img && (
                <Transformer
                  ref={transformerRef}
                  rotateEnabled={false}
                  keepRatio
                  enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < MIN_IMAGE_SIDE || newBox.height < MIN_IMAGE_SIDE) return oldBox;
                    if (newBox.width > PRINT_ZONE.width * MAX_IMAGE_SCALE || newBox.height > PRINT_ZONE.height * MAX_IMAGE_SCALE) return oldBox;
                    return newBox;
                  }}
                  onTransformEnd={() => {
                    const node = imageRef.current;
                    if (!node || !img) return;
                    const nextScale = Math.max(node.scaleX(), fitScale(img.width, img.height) * 0.2);
                    node.scaleX(nextScale);
                    node.scaleY(nextScale);
                    setTransform((prev) => ({ ...prev, x: node.x(), y: node.y(), scale: nextScale }));
                  }}
                />
              )}
            </Group>
          </Layer>
        </Stage>
      </div>
      <p className="text-sm text-neutral-600">Это превью. Итоговую печать подтверждаем после проверки макета.</p>
      <p className="text-xs text-neutral-500">Preview PNG при отправке ограничен {PREVIEW_MAX_SIZE_MB} МБ.</p>
    </div>
  );
}
