'use client';

import { ChangeEvent, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Group, Image as KonvaImage, Layer, Rect, Stage, Transformer } from 'react-konva';
import type Konva from 'konva';
import { MOCKUP_SRC, PRINT_AREA } from '@/components/mug-designer/mugMockupConfig';
import { MAX_IMAGE_SCALE, MIN_IMAGE_SIDE } from '@/lib/mugDesigner/constants';

export const PRINT_RECT = {
  x: PRINT_AREA.x,
  y: PRINT_AREA.y,
  width: PRINT_AREA.width,
  height: PRINT_AREA.height,
} as const;

type TransformState = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
};

export type MugDesigner2DHandle = {
  exportDesign: () => Promise<{ mockPngDataUrl: string; printPngDataUrl: string; layoutJson: string } | null>;
};

type Props = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  allowedExtensions: readonly string[];
  allowedMimeTypes: readonly string[];
  maxUploadMb: number;
};

function fitScale(imgW: number, imgH: number): number {
  return Math.min(PRINT_RECT.width / imgW, PRINT_RECT.height / imgH);
}

function clampPosition(x: number, y: number, width: number, height: number): { x: number; y: number } {
  const minX = PRINT_RECT.x - width * 0.7;
  const maxX = PRINT_RECT.x + PRINT_RECT.width - width * 0.3;
  const minY = PRINT_RECT.y - height * 0.7;
  const maxY = PRINT_RECT.y + PRINT_RECT.height - height * 0.3;

  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY),
  };
}

const defaultTransform: TransformState = {
  x: PRINT_RECT.x + PRINT_RECT.width / 2,
  y: PRINT_RECT.y + PRINT_RECT.height / 2,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
};

const MugDesigner2D = forwardRef<MugDesigner2DHandle, Props>(function MugDesigner2D(
  { file, onFileChange, allowedExtensions, allowedMimeTypes, maxUploadMb },
  ref,
) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const printLayerRef = useRef<Konva.Layer | null>(null);
  const userImageRef = useRef<Konva.Image | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  const [error, setError] = useState('');
  const [mockupImage, setMockupImage] = useState<HTMLImageElement | null>(null);
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(1100);
  const [transform, setTransform] = useState<TransformState>(defaultTransform);

  useImperativeHandle(ref, () => ({
    exportDesign: async () => {
      if (!stageRef.current || !printLayerRef.current || !userImage || !file) return null;

      const mockPngDataUrl = stageRef.current.toDataURL({ pixelRatio: 2, mimeType: 'image/png' });
      const printPngDataUrl = printLayerRef.current.toDataURL({
        x: PRINT_RECT.x,
        y: PRINT_RECT.y,
        width: PRINT_RECT.width,
        height: PRINT_RECT.height,
        pixelRatio: 2,
        mimeType: 'image/png',
      });

      const layoutJson = JSON.stringify(
        {
          fileName: file.name,
          printRect: PRINT_RECT,
          image: {
            x: transform.x,
            y: transform.y,
            scaleX: transform.scaleX,
            scaleY: transform.scaleY,
            rotation: transform.rotation,
            width: userImage.width,
            height: userImage.height,
          },
        },
        null,
        2,
      );

      return { mockPngDataUrl, printPngDataUrl, layoutJson };
    },
  }), [file, transform, userImage]);

  useEffect(() => {
    const image = new window.Image();
    image.onload = () => setMockupImage(image);
    image.src = MOCKUP_SRC;
  }, []);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 1100;
      setCanvasWidth(Math.min(width, 1100));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!file) {
      setUserImage(null);
      setTransform(defaultTransform);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      const nextScale = fitScale(image.width, image.height);
      setUserImage(image);
      setTransform({
        x: PRINT_RECT.x + PRINT_RECT.width / 2,
        y: PRINT_RECT.y + PRINT_RECT.height / 2,
        scaleX: nextScale,
        scaleY: nextScale,
        rotation: 0,
      });
    };
    image.src = objectUrl;

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    if (!transformerRef.current || !userImageRef.current || !userImage) return;
    transformerRef.current.nodes([userImageRef.current]);
    transformerRef.current.getLayer()?.batchDraw();
  }, [userImage]);

  const isAllowed = useMemo(
    () => (candidate: File) => {
      const ext = candidate.name.includes('.') ? `.${candidate.name.split('.').pop()?.toLowerCase() ?? ''}` : '';
      return allowedExtensions.includes(ext) || allowedMimeTypes.includes(candidate.type.toLowerCase());
    },
    [allowedExtensions, allowedMimeTypes],
  );

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

  const onFitToPrint = () => {
    if (!userImage) return;
    const nextScale = fitScale(userImage.width, userImage.height);
    setTransform((prev) => ({ ...prev, x: PRINT_RECT.x + PRINT_RECT.width / 2, y: PRINT_RECT.y + PRINT_RECT.height / 2, scaleX: nextScale, scaleY: nextScale }));
  };

  const onReset = () => {
    if (!userImage) return;
    const nextScale = fitScale(userImage.width, userImage.height);
    setTransform({ x: PRINT_RECT.x + PRINT_RECT.width / 2, y: PRINT_RECT.y + PRINT_RECT.height / 2, scaleX: nextScale, scaleY: nextScale, rotation: 0 });
  };

  if (!mockupImage) {
    return <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">Загрузка конструктора…</div>;
  }

  const stageScale = canvasWidth / mockupImage.width;
  const stageHeight = mockupImage.height * stageScale;

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-6">
      <h3 className="text-xl font-semibold">Конструктор макета кружки</h3>

      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50">
          Upload image
          <input type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={onUpload} />
        </label>
        <button type="button" onClick={onFitToPrint} disabled={!userImage} className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50">
          Fit to print zone
        </button>
        <button type="button" onClick={onReset} disabled={!userImage} className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50">
          Reset
        </button>
        <label className="ml-0 flex min-w-[220px] items-center gap-3 text-sm text-neutral-600 md:ml-2">
          Rotate
          <input type="range" min={0} max={360} value={transform.rotation} disabled={!userImage} onChange={(event) => setTransform((prev) => ({ ...prev, rotation: Number(event.target.value) }))} className="w-full" />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div ref={wrapperRef} className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
        <Stage ref={stageRef} width={canvasWidth} height={stageHeight}>
          <Layer>
            <Group scaleX={stageScale} scaleY={stageScale}>
              <KonvaImage image={mockupImage} x={0} y={0} width={mockupImage.width} height={mockupImage.height} />
            </Group>
          </Layer>

          <Layer ref={printLayerRef}>
            <Group scaleX={stageScale} scaleY={stageScale} clipX={PRINT_RECT.x} clipY={PRINT_RECT.y} clipWidth={PRINT_RECT.width} clipHeight={PRINT_RECT.height}>
              {userImage && (
                <KonvaImage
                  ref={userImageRef}
                  image={userImage}
                  x={transform.x}
                  y={transform.y}
                  offsetX={userImage.width / 2}
                  offsetY={userImage.height / 2}
                  width={userImage.width}
                  height={userImage.height}
                  scaleX={transform.scaleX}
                  scaleY={transform.scaleY}
                  rotation={transform.rotation}
                  draggable
                  onDragMove={(event) => {
                    const width = userImage.width * transform.scaleX;
                    const height = userImage.height * transform.scaleY;
                    const next = clampPosition(event.target.x(), event.target.y(), width, height);
                    event.target.x(next.x);
                    event.target.y(next.y);
                  }}
                  onDragEnd={(event) => {
                    setTransform((prev) => ({ ...prev, x: event.target.x(), y: event.target.y() }));
                  }}
                />
              )}
            </Group>
            <Group scaleX={stageScale} scaleY={stageScale}>
              <Rect x={PRINT_RECT.x} y={PRINT_RECT.y} width={PRINT_RECT.width} height={PRINT_RECT.height} stroke="rgba(37,99,235,0.45)" dash={[10, 8]} strokeWidth={2} />
            </Group>
            {userImage && (
              <Transformer
                ref={transformerRef}
                keepRatio
                enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < MIN_IMAGE_SIDE || newBox.height < MIN_IMAGE_SIDE) return oldBox;
                  if (newBox.width > PRINT_RECT.width * MAX_IMAGE_SCALE || newBox.height > PRINT_RECT.height * MAX_IMAGE_SCALE) return oldBox;
                  return newBox;
                }}
                onTransformEnd={() => {
                  const node = userImageRef.current;
                  if (!node || !userImage) return;

                  const width = userImage.width * node.scaleX();
                  const height = userImage.height * node.scaleY();
                  const next = clampPosition(node.x(), node.y(), width, height);

                  node.x(next.x);
                  node.y(next.y);

                  setTransform((prev) => ({ ...prev, x: next.x, y: next.y, scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() }));
                }}
              />
            )}
          </Layer>
        </Stage>
      </div>

      <p className="text-sm text-neutral-600">Это превью. Итоговую печать подтверждаем после проверки макета.</p>
    </div>
  );
});

export default MugDesigner2D;
