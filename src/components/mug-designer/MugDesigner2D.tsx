'use client';

import { ChangeEvent, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text as KonvaText, Transformer } from 'react-konva';
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

type SelectedElement = 'image' | 'text' | null;

type TextLayerState = {
  text: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  fontSize: number;
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

function clampScale(value: number): number {
  if (!Number.isFinite(value) || value === 0) return 1;
  return value;
}

function clampPosition(x: number, y: number, width: number, height: number): { x: number; y: number } {
  const requiredOverlapX = Math.min(width * 0.1, PRINT_RECT.width * 0.2);
  const requiredOverlapY = Math.min(height * 0.1, PRINT_RECT.height * 0.2);

  const minX = PRINT_RECT.x - width / 2 + requiredOverlapX;
  const maxX = PRINT_RECT.x + PRINT_RECT.width + width / 2 - requiredOverlapX;
  const minY = PRINT_RECT.y - height / 2 + requiredOverlapY;
  const maxY = PRINT_RECT.y + PRINT_RECT.height + height / 2 - requiredOverlapY;

  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY),
  };
}

const SAFE_INSET = 16;

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
  const textNodeRef = useRef<Konva.Text | null>(null);
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
  const [textLayer, setTextLayer] = useState<TextLayerState | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      exportDesign: async () => {
        if (!stageRef.current || !printLayerRef.current || (!userImage && !textLayer)) return null;

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
            fileName: file?.name ?? null,
            printRect: PRINT_RECT,
            image: userImage
              ? {
                  x: transform.x,
                  y: transform.y,
                  scaleX: transform.scaleX,
                  scaleY: transform.scaleY,
                  rotation: transform.rotation,
                  width: userImage.width,
                  height: userImage.height,
                }
              : null,
            text: textLayer
              ? {
                  text: textLayer.text,
                  x: textLayer.x,
                  y: textLayer.y,
                  rotation: textLayer.rotation,
                  width: textLayer.width,
                  height: textLayer.height,
                  scaleX: textLayer.scaleX,
                  scaleY: textLayer.scaleY,
                  fontSize: textLayer.fontSize,
                }
              : null,
          },
          null,
          2,
        );

        return { mockPngDataUrl, printPngDataUrl, layoutJson };
      },
    }),
    [file, textLayer, transform, userImage],
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
      setTextLayer(null);
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
    if (!transformerRef.current || !selectedElement) {
      transformerRef.current?.nodes([]);
      transformerRef.current?.getLayer()?.batchDraw();
      return;
    }

    if (selectedElement === 'image' && userImageRef.current && userImage) {
      transformerRef.current.nodes([userImageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
      return;
    }

    if (selectedElement === 'text' && textNodeRef.current && textLayer) {
      transformerRef.current.nodes([textNodeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedElement, textLayer, userImage]);

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
    setTextLayer(null);
    setSelectedElement('image');
  };

  const onAddText = () => {
    const defaultWidth = Math.min(PRINT_RECT.width - 20, 220);
    setTextLayer({
      text: 'Ваш текст',
      x: PRINT_RECT.x + PRINT_RECT.width / 2,
      y: PRINT_RECT.y + PRINT_RECT.height / 2,
      rotation: 0,
      width: defaultWidth,
      height: 40,
      scaleX: 1,
      scaleY: 1,
      fontSize: 32,
    });
    setSelectedElement('text');
  };

  const primaryButtonClass = 'w-full rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700';
  const secondaryButtonClass = 'w-full rounded-md border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-50';
  const toolButtonClass = 'rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium hover:bg-neutral-50 transition';

  if (!mockupImage) {
    return <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">Загрузка конструктора…</div>;
  }

  const stageScale = viewportWidth / MOCKUP_WIDTH;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-md sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Соберите макет</h2>
        <p className="mt-2 text-sm text-neutral-600 sm:text-base">Загрузите изображение или добавьте текст. Итоговый макет мы проверим перед печатью.</p>
        <p className="mt-2 text-xs text-neutral-500">Подсказка: выделите объект, чтобы изменить размер и поворот.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between text-xs text-neutral-500">
            <span>Область печати</span>
            <span>Перетащите объект внутрь рамки</span>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-3 sm:p-4">
            <div ref={wrapperRef} className="mx-auto flex w-full max-w-[1100px] justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white p-2">
              <Stage
                width={MOCKUP_WIDTH}
                height={MOCKUP_HEIGHT}
                scaleX={stageScale}
                scaleY={stageScale}
                ref={stageRef}
                style={{ width: viewportWidth, height: viewportHeight }}
                onMouseDown={(event) => {
                  if (event.target === event.target.getStage()) setSelectedElement(null);
                }}
                onTouchStart={(event) => {
                  if (event.target === event.target.getStage()) setSelectedElement(null);
                }}
              >
                <Layer>
                  <KonvaImage image={mockupImage} x={0} y={0} width={MOCKUP_WIDTH} height={MOCKUP_HEIGHT} />
                </Layer>

                <Layer ref={printLayerRef}>
                  <Rect x={0} y={0} width={MOCKUP_WIDTH} height={MOCKUP_HEIGHT} fill="rgba(0,0,0,0.08)" listening={false} />
                  <Rect
                    x={PRINT_RECT.x}
                    y={PRINT_RECT.y}
                    width={PRINT_RECT.width}
                    height={PRINT_RECT.height}
                    cornerRadius={8}
                    fill="black"
                    globalCompositeOperation="destination-out"
                    listening={false}
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
                        shadowEnabled={selectedElement === 'image'}
                        shadowColor="rgba(220,38,38,0.35)"
                        shadowBlur={selectedElement === 'image' ? 16 : 0}
                        shadowOpacity={selectedElement === 'image' ? 0.5 : 0}
                        draggable={true}
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

                    {textLayer && (
                      <KonvaText
                        ref={textNodeRef}
                        text={textLayer.text}
                        x={textLayer.x}
                        y={textLayer.y}
                        offsetX={textLayer.width / 2}
                        offsetY={textLayer.height / 2}
                        width={textLayer.width}
                        height={textLayer.height}
                        fontSize={textLayer.fontSize}
                        align="center"
                        verticalAlign="middle"
                        fill="#dc2626"
                        rotation={textLayer.rotation}
                        scaleX={textLayer.scaleX}
                        scaleY={textLayer.scaleY}
                        shadowEnabled={selectedElement === 'text'}
                        shadowColor="rgba(220,38,38,0.35)"
                        shadowBlur={selectedElement === 'text' ? 14 : 0}
                        shadowOpacity={selectedElement === 'text' ? 0.45 : 0}
                        draggable
                        onClick={() => setSelectedElement('text')}
                        onTap={() => setSelectedElement('text')}
                        onDragStart={() => setSelectedElement('text')}
                        onDragEnd={(event) => {
                          setTextLayer((prev) => (prev ? { ...prev, x: event.target.x(), y: event.target.y() } : prev));
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
                    listening={false}
                  />
                  <Rect
                    x={PRINT_RECT.x + SAFE_INSET}
                    y={PRINT_RECT.y + SAFE_INSET}
                    width={PRINT_RECT.width - SAFE_INSET * 2}
                    height={PRINT_RECT.height - SAFE_INSET * 2}
                    cornerRadius={6}
                    stroke="rgba(220,38,38,0.35)"
                    dash={[6, 8]}
                    strokeWidth={2}
                    listening={false}
                  />

                  {isDragging && (
                    <>
                      <Rect x={PRINT_RECT.x + PRINT_RECT.width / 2} y={PRINT_RECT.y} width={2} height={PRINT_RECT.height} fill="rgba(220,38,38,0.35)" listening={false} />
                      <Rect x={PRINT_RECT.x} y={PRINT_RECT.y + PRINT_RECT.height / 2} width={PRINT_RECT.width} height={2} fill="rgba(220,38,38,0.35)" listening={false} />
                    </>
                  )}

                  {selectedElement && (
                    <Transformer
                      ref={transformerRef}
                      keepRatio={selectedElement === 'image'}
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
                        if (selectedElement === 'text') return newBox;
                        if (newBox.width < MIN_IMAGE_SIDE || newBox.height < MIN_IMAGE_SIDE) return oldBox;
                        if (newBox.width > PRINT_RECT.width * MAX_IMAGE_SCALE || newBox.height > PRINT_RECT.height * MAX_IMAGE_SCALE) return oldBox;
                        return newBox;
                      }}
                      onTransformEnd={() => {
                        if (selectedElement === 'text') {
                          const node = textNodeRef.current;
                          if (!node) return;

                          setTextLayer((prev) => (
                            prev
                              ? {
                                  ...prev,
                                  x: node.x(),
                                  y: node.y(),
                                  rotation: node.rotation(),
                                  scaleX: clampScale(node.scaleX()),
                                  scaleY: clampScale(node.scaleY()),
                                  width: Math.max(40, node.width()),
                                  height: Math.max(20, node.height()),
                                }
                              : prev
                          ));
                          return;
                        }

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
          </div>
        </section>

        <aside className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="space-y-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Добавить</p>
            <button type="button" className={primaryButtonClass} onClick={onAddText}>
              Добавить текст
            </button>
            <label className={`block cursor-pointer text-center ${primaryButtonClass}`}>
              Загрузить изображение
              <input type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={onUpload} />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          {selectedElement && (
            <div className="space-y-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Настройки объекта</p>
              <p className="text-xs text-neutral-600">Выбрано: {selectedElement === 'image' ? 'Изображение' : 'Текст'}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={toolButtonClass}
                  onClick={() => {
                    if (selectedElement === 'image') setTransform((prev) => ({ ...prev, x: prev.x + 60, y: prev.y + 60 }));
                    if (selectedElement === 'text') setTextLayer((prev) => (prev ? { ...prev, x: prev.x + 40, y: prev.y + 40 } : prev));
                  }}
                >
                  Дублировать
                </button>
                <button
                  type="button"
                  className={toolButtonClass}
                  onClick={() => {
                    if (selectedElement === 'image') onFileChange(null);
                    if (selectedElement === 'text') setTextLayer(null);
                    setSelectedElement(null);
                  }}
                >
                  Удалить
                </button>
                <button
                  type="button"
                  className={`${toolButtonClass} col-span-2`}
                  onClick={() => {
                    if (selectedElement === 'image') setTransform((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
                    if (selectedElement === 'text') setTextLayer((prev) => (prev ? { ...prev, rotation: (prev.rotation + 90) % 360 } : prev));
                  }}
                >
                  Повернуть на 90°
                </button>
              </div>
            </div>
          )}

          {selectedElement === 'text' && textLayer && (
            <div className="space-y-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Текст</p>
              <label className="space-y-1 text-sm text-neutral-700">
                <span>Содержимое текста</span>
                <input
                  type="text"
                  value={textLayer.text}
                  onChange={(event) => setTextLayer((prev) => (prev ? { ...prev, text: event.target.value } : prev))}
                  className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
              </label>
            </div>
          )}

          {selectedElement === 'image' && userImage && (
            <div className="space-y-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Настройки изображения</p>
              <label className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">Непрозрачность</span>
                  <span className="text-xs text-neutral-500">{imageOpacity}%</span>
                </div>
                <input type="range" min={0} max={100} value={imageOpacity} onChange={(event) => setImageOpacity(Number(event.target.value))} className="w-full accent-red-600" />
              </label>
              <label className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">Удалить белый фон (предпросмотр)</span>
                  <span className="text-xs text-neutral-500">{removeWhiteBgLevel}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={removeWhiteBgLevel}
                  onChange={(event) => setRemoveWhiteBgLevel(Number(event.target.value))}
                  className="w-full accent-red-600"
                />
              </label>
              <button type="button" className={secondaryButtonClass} onClick={onFitToPrint}>
                Вписать в зону печати
              </button>
            </div>
          )}

          <div className="space-y-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Параметры</p>
            <p className="text-sm text-neutral-700">Количество</p>
            <div className="flex items-center gap-2">
              <button type="button" className="h-10 w-10 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                -
              </button>
              <div className="flex h-10 flex-1 items-center justify-center rounded-md border border-neutral-200 bg-white text-sm">{quantity}</div>
              <button type="button" className="h-10 w-10 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50" onClick={() => setQuantity((prev) => prev + 1)}>
                +
              </button>
            </div>
          </div>

          <div className="space-y-3 border-t border-neutral-200 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Стоимость</p>
            <p className="text-4xl font-semibold tracking-tight">490 ₽</p>
            <button
              type="button"
              className="w-full rounded-md bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              onClick={() => {
                document.getElementById('mug-order-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Добавить в заказ
            </button>
            <button type="button" onClick={onReset} disabled={!userImage} className="w-full rounded-md border border-neutral-200 bg-white py-3 text-sm font-medium transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50">
              Сбросить макет
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
});

export default MugDesigner2D;
