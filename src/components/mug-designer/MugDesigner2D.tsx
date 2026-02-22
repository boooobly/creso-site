'use client';

import { ChangeEvent, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Group, Image as KonvaImage, Layer, Rect, Stage, Transformer } from 'react-konva';
import type Konva from 'konva';
import { MOCKUP_HEIGHT, MOCKUP_SRC, MOCKUP_WIDTH, PRINT_AREA } from '@/components/mug-designer/mugMockupConfig';
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

type SelectedElement = 'image' | null;

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

function clampScale(value: number): number {
  if (!Number.isFinite(value) || value === 0) return 1;
  return value;
}

function clampPosition(x: number, y: number, width: number, height: number): { x: number; y: number } {
  const minVisibleX = Math.min(width * 0.25, PRINT_RECT.width * 0.35);
  const minVisibleY = Math.min(height * 0.25, PRINT_RECT.height * 0.35);

  const minX = PRINT_RECT.x - width / 2 + minVisibleX;
  const maxX = PRINT_RECT.x + PRINT_RECT.width + width / 2 - minVisibleX;
  const minY = PRINT_RECT.y - height / 2 + minVisibleY;
  const maxY = PRINT_RECT.y + PRINT_RECT.height + height / 2 - minVisibleY;

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
  const [viewportWidth, setViewportWidth] = useState(900);
  const [viewportHeight, setViewportHeight] = useState(460);
  const [transform, setTransform] = useState<TransformState>(defaultTransform);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
  const [imageOpacity, setImageOpacity] = useState(100);
  const [removeWhiteBgLevel, setRemoveWhiteBgLevel] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useImperativeHandle(
    ref,
    () => ({
      exportDesign: async () => {
        if (!stageRef.current || !printLayerRef.current || !userImage || !file) return null;

        const mockPngDataUrl = stageRef.current.toDataURL({ pixelRatio: 1, mimeType: 'image/png' });
        const printPngDataUrl = printLayerRef.current.toDataURL({
          x: PRINT_RECT.x,
          y: PRINT_RECT.y,
          width: PRINT_RECT.width,
          height: PRINT_RECT.height,
          pixelRatio: 1,
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
    }),
    [file, transform, userImage],
  );

  useEffect(() => {
    const image = new window.Image();
    image.onload = () => setMockupImage(image);
    image.src = MOCKUP_SRC;
  }, []);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 900;
      const maxWidth = Math.min(width, 1100);
      const maxHeight = 560;
      const scale = Math.min(maxWidth / MOCKUP_WIDTH, maxHeight / MOCKUP_HEIGHT);

      setViewportWidth(MOCKUP_WIDTH * scale);
      setViewportHeight(MOCKUP_HEIGHT * scale);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!file) {
      setUserImage(null);
      setSelectedElement(null);
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
      setSelectedElement('image');
    };
    image.src = objectUrl;

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    if (!transformerRef.current || !userImageRef.current || !userImage || selectedElement !== 'image') return;
    transformerRef.current.nodes([userImageRef.current]);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedElement, userImage]);

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
    setTransform({
      x: PRINT_RECT.x + PRINT_RECT.width / 2,
      y: PRINT_RECT.y + PRINT_RECT.height / 2,
      scaleX: nextScale,
      scaleY: nextScale,
      rotation: 0,
    });
  };

  const onReset = () => {
    if (!userImage) return;
    const nextScale = fitScale(userImage.width, userImage.height);
    setTransform({
      x: PRINT_RECT.x + PRINT_RECT.width / 2,
      y: PRINT_RECT.y + PRINT_RECT.height / 2,
      scaleX: nextScale,
      scaleY: nextScale,
      rotation: 0,
    });
  };

  const primaryButtonClass = 'rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700';
  const secondaryButtonClass =
    'rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50';
  const toolButtonClass =
    'rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50';

  if (!mockupImage) {
    return <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">Загрузка конструктора…</div>;
  }

  const stageScale = viewportWidth / MOCKUP_WIDTH;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div ref={wrapperRef} className="mx-auto flex w-full max-w-[1100px] justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4">
          <Stage width={MOCKUP_WIDTH} height={MOCKUP_HEIGHT} scaleX={stageScale} scaleY={stageScale} ref={stageRef} style={{ width: viewportWidth, height: viewportHeight }}>
            <Layer>
              <KonvaImage image={mockupImage} x={0} y={0} width={MOCKUP_WIDTH} height={MOCKUP_HEIGHT} />
            </Layer>

            <Layer ref={printLayerRef}>
              <Rect x={0} y={0} width={MOCKUP_WIDTH} height={MOCKUP_HEIGHT} fill="rgba(0,0,0,0.10)" />
              <Rect
                x={PRINT_RECT.x}
                y={PRINT_RECT.y}
                width={PRINT_RECT.width}
                height={PRINT_RECT.height}
                cornerRadius={8}
                fill="black"
                globalCompositeOperation="destination-out"
              />

              <Group clipX={PRINT_RECT.x} clipY={PRINT_RECT.y} clipWidth={PRINT_RECT.width} clipHeight={PRINT_RECT.height}>
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
                    opacity={imageOpacity / 100}
                    draggable
                    dragBoundFunc={(position) => {
                      const width = userImage.width * Math.abs(transform.scaleX);
                      const height = userImage.height * Math.abs(transform.scaleY);
                      return clampPosition(position.x, position.y, width, height);
                    }}
                    onClick={() => setSelectedElement('image')}
                    onTap={() => setSelectedElement('image')}
                    onDragStart={() => {
                      setIsDragging(true);
                      setSelectedElement('image');
                    }}
                    onDragMove={(event) => {
                      const width = userImage.width * Math.abs(transform.scaleX);
                      const height = userImage.height * Math.abs(transform.scaleY);
                      const next = clampPosition(event.target.x(), event.target.y(), width, height);
                      event.target.x(next.x);
                      event.target.y(next.y);
                    }}
                    onDragEnd={(event) => {
                      setIsDragging(false);
                      setTransform((prev) => ({ ...prev, x: event.target.x(), y: event.target.y() }));
                    }}
                  />
                )}
              </Group>

              <Rect
                x={PRINT_RECT.x}
                y={PRINT_RECT.y}
                width={PRINT_RECT.width}
                height={PRINT_RECT.height}
                cornerRadius={8}
                stroke="#dc2626"
                dash={[10, 8]}
                strokeWidth={4}
              />

              {isDragging && (
                <>
                  <Rect x={PRINT_RECT.x + PRINT_RECT.width / 2} y={PRINT_RECT.y} width={2} height={PRINT_RECT.height} fill="rgba(220,38,38,0.35)" />
                  <Rect x={PRINT_RECT.x} y={PRINT_RECT.y + PRINT_RECT.height / 2} width={PRINT_RECT.width} height={2} fill="rgba(220,38,38,0.35)" />
                </>
              )}

              {userImage && selectedElement === 'image' && (
                <Transformer
                  ref={transformerRef}
                  keepRatio
                  rotateEnabled
                  enabledAnchors={['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']}
                  anchorStroke="#dc2626"
                  anchorFill="#dc2626"
                  borderStroke="#dc2626"
                  anchorSize={14}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (!Number.isFinite(newBox.width) || !Number.isFinite(newBox.height) || newBox.width <= 0 || newBox.height <= 0) {
                      return oldBox;
                    }
                    if (newBox.width < MIN_IMAGE_SIDE || newBox.height < MIN_IMAGE_SIDE) return oldBox;
                    if (newBox.width > PRINT_RECT.width * MAX_IMAGE_SCALE || newBox.height > PRINT_RECT.height * MAX_IMAGE_SCALE) return oldBox;
                    return newBox;
                  }}
                  onTransformEnd={() => {
                    const node = userImageRef.current;
                    if (!node || !userImage) return;

                    const nextScaleX = clampScale(node.scaleX());
                    const nextScaleY = clampScale(node.scaleY());
                    const width = userImage.width * Math.abs(nextScaleX);
                    const height = userImage.height * Math.abs(nextScaleY);
                    const next = clampPosition(node.x(), node.y(), width, height);

                    node.x(next.x);
                    node.y(next.y);

                    setTransform((prev) => ({
                      ...prev,
                      x: next.x,
                      y: next.y,
                      scaleX: nextScaleX,
                      scaleY: nextScaleY,
                      rotation: node.rotation(),
                    }));
                  }}
                />
              )}
            </Layer>
          </Stage>
        </div>
      </section>

      <aside className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Добавить</p>
          <button type="button" className={`w-full ${primaryButtonClass}`} disabled>
            Добавить текст
          </button>
          <label className={`block w-full cursor-pointer text-center ${primaryButtonClass}`}>
            Загрузить изображение
            <input type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={onUpload} />
          </label>
          <button type="button" className={`w-full ${primaryButtonClass}`} disabled>
            Добавить клипарт
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {selectedElement === 'image' && userImage && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Редактирование</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className={toolButtonClass} onClick={() => onFileChange(null)}>
                Удалить
              </button>
              <button type="button" className={toolButtonClass} onClick={() => setTransform((prev) => ({ ...prev, x: prev.x + 60, y: prev.y + 60 }))}>
                Дублировать
              </button>
              <button type="button" className={toolButtonClass} onClick={() => setTransform((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))}>
                Повернуть 90°
              </button>
              <button type="button" className={toolButtonClass} onClick={() => setTransform((prev) => ({ ...prev, scaleX: prev.scaleX * -1 }))}>
                Отразить по X
              </button>
              <button type="button" className={toolButtonClass} onClick={() => setTransform((prev) => ({ ...prev, scaleY: prev.scaleY * -1 }))}>
                Отразить по Y
              </button>
              <button type="button" className={toolButtonClass} onClick={onFitToPrint}>
                Вписать в зону печати
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Настройки изображения</p>
          <label className="space-y-1 text-sm text-neutral-700">
            <span>Непрозрачность: {imageOpacity}%</span>
            <input type="range" min={0} max={100} value={imageOpacity} onChange={(event) => setImageOpacity(Number(event.target.value))} className="w-full accent-red-600" />
          </label>
          <label className="space-y-1 text-sm text-neutral-700">
            <span>Удалить белый фон (предпросмотр): {removeWhiteBgLevel}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={removeWhiteBgLevel}
              onChange={(event) => setRemoveWhiteBgLevel(Number(event.target.value))}
              className="w-full accent-red-600"
            />
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Параметры</p>
          <label className="space-y-1 text-sm text-neutral-700">
            <span>Размер</span>
            <select className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm">
              <option>330 мл</option>
            </select>
          </label>
          <div className="space-y-1">
            <p className="text-sm text-neutral-700">Количество</p>
            <div className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-2 py-1">
              <button type="button" className={secondaryButtonClass} onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                -
              </button>
              <span className="text-sm font-medium">{quantity}</span>
              <button type="button" className={secondaryButtonClass} onClick={() => setQuantity((prev) => prev + 1)}>
                +
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-neutral-200 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Стоимость</p>
          <p className="text-3xl font-semibold">490 ₽</p>
          <button type="button" className={`w-full ${primaryButtonClass}`}>
            Добавить в заказ
          </button>
        </div>

        <button type="button" onClick={onReset} disabled={!userImage} className={`w-full ${secondaryButtonClass}`}>
          Сбросить макет
        </button>
      </aside>
    </div>
  );
});

export default MugDesigner2D;
