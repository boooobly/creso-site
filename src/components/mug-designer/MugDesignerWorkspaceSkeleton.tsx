'use client';

import type Konva from 'konva';
import Image from 'next/image';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from 'react-konva';

type EditableImageState = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

const MUG_NATIVE_WIDTH = 1457;
const MUG_NATIVE_HEIGHT = 630;

const PRINT_AREA = {
  x: MUG_NATIVE_WIDTH * 0.18,
  y: MUG_NATIVE_HEIGHT * 0.22,
  width: MUG_NATIVE_WIDTH * 0.64,
  height: MUG_NATIVE_HEIGHT * 0.56,
} as const;

const SAFE_AREA = {
  x: MUG_NATIVE_WIDTH * 0.23,
  y: MUG_NATIVE_HEIGHT * 0.28,
  width: MUG_NATIVE_WIDTH * 0.54,
  height: MUG_NATIVE_HEIGHT * 0.44,
} as const;

const MIN_IMAGE_SIDE = 24;
const ACCEPTED_FORMATS = '.png,.jpg,.jpeg,.webp';

function fitIntoRect(imgW: number, imgH: number, rectW: number, rectH: number) {
  const scale = Math.min(rectW / imgW, rectH / imgH);
  return {
    width: imgW * scale,
    height: imgH * scale,
  };
}

function fillRect(imgW: number, imgH: number, rectW: number, rectH: number) {
  const scale = Math.max(rectW / imgW, rectH / imgH);
  return {
    width: imgW * scale,
    height: imgH * scale,
  };
}

function centeredPlacement(width: number, height: number, rect: { x: number; y: number; width: number; height: number }): EditableImageState {
  return {
    x: rect.width / 2,
    y: rect.height / 2,
    width,
    height,
    rotation: 0,
  };
}

const isSupportedFile = (file: File) => {
  const type = file.type.toLowerCase();
  const byMime = ['image/png', 'image/jpeg', 'image/webp'].includes(type);
  const ext = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : '';
  const byExt = ext ? ['png', 'jpg', 'jpeg', 'webp'].includes(ext) : false;
  return byMime || byExt;
};

export default function MugDesignerWorkspaceSkeleton() {
  const stageWrapRef = useRef<HTMLDivElement | null>(null);
  const imageNodeRef = useRef<Konva.Image | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  const [stageWidth, setStageWidth] = useState(960);
  const [error, setError] = useState<string>('');
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [imageState, setImageState] = useState<EditableImageState | null>(null);

  const stageHeight = useMemo(() => Math.round((stageWidth / MUG_NATIVE_WIDTH) * MUG_NATIVE_HEIGHT), [stageWidth]);
  const stageScale = useMemo(() => stageWidth / MUG_NATIVE_WIDTH, [stageWidth]);

  useEffect(() => {
    const node = stageWrapRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? MUG_NATIVE_WIDTH;
      setStageWidth(Math.min(width, 1180));
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!imageElement || !imageNodeRef.current || !transformerRef.current) return;
    transformerRef.current.nodes([imageNodeRef.current]);
    transformerRef.current.getLayer()?.batchDraw();
  }, [imageElement, imageState]);

  const onUploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    setError('');

    if (!nextFile) return;

    if (!isSupportedFile(nextFile)) {
      setError('Поддерживаются только png, jpg, jpeg и webp.');
      event.target.value = '';
      return;
    }

    const src = URL.createObjectURL(nextFile);
    const loaded = new window.Image();

    loaded.onload = () => {
      const initial = fitIntoRect(loaded.width, loaded.height, SAFE_AREA.width, SAFE_AREA.height);
      setImageElement(loaded);
      setImageState(centeredPlacement(initial.width, initial.height, PRINT_AREA));
      URL.revokeObjectURL(src);
    };

    loaded.onerror = () => {
      setError('Не удалось загрузить изображение. Попробуйте другой файл.');
      URL.revokeObjectURL(src);
    };

    loaded.src = src;
    event.target.value = '';
  };

  const applyPlacement = (sizing: { width: number; height: number }) => {
    if (!imageElement) return;
    setImageState((prev) => ({
      ...(prev ?? centeredPlacement(sizing.width, sizing.height, PRINT_AREA)),
      x: PRINT_AREA.width / 2,
      y: PRINT_AREA.height / 2,
      width: sizing.width,
      height: sizing.height,
    }));
  };

  const onCenter = () => {
    setImageState((prev) => (prev ? { ...prev, x: PRINT_AREA.width / 2, y: PRINT_AREA.height / 2 } : prev));
  };

  const onFitSafe = () => {
    if (!imageElement) return;
    applyPlacement(fitIntoRect(imageElement.width, imageElement.height, SAFE_AREA.width, SAFE_AREA.height));
  };

  const onFitPrint = () => {
    if (!imageElement) return;
    applyPlacement(fitIntoRect(imageElement.width, imageElement.height, PRINT_AREA.width, PRINT_AREA.height));
  };

  const onFillPrint = () => {
    if (!imageElement) return;
    applyPlacement(fillRect(imageElement.width, imageElement.height, PRINT_AREA.width, PRINT_AREA.height));
  };

  const onRotate90 = () => {
    setImageState((prev) => (prev ? { ...prev, rotation: (prev.rotation + 90) % 360 } : prev));
  };

  const onRemoveImage = () => {
    setImageElement(null);
    setImageState(null);
    setError('');
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_380px] 2xl:grid-cols-[minmax(0,2fr)_400px]">
      <section className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">Рабочее превью</h2>
            <p className="mt-1 text-sm text-neutral-600">Загрузите изображение и отредактируйте его в зоне печати кружки.</p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Интерактивно</span>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-gradient-to-b from-neutral-100 to-neutral-50 p-3 sm:p-4">
          <div
            ref={stageWrapRef}
            className="relative mx-auto aspect-[1457/630] w-full max-w-[1180px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]"
          >
            <Image
              src="/images/mug/mug-base.png"
              alt="Базовый мокап кружки"
              fill
              priority
              sizes="(min-width: 1536px) 72vw, (min-width: 1280px) 62vw, 100vw"
              className="pointer-events-none object-contain"
            />

            <Stage width={stageWidth} height={stageHeight} className="absolute inset-0 h-full w-full">
              <Layer scaleX={stageScale} scaleY={stageScale}>
                <Group x={PRINT_AREA.x} y={PRINT_AREA.y} clip={{ x: 0, y: 0, width: PRINT_AREA.width, height: PRINT_AREA.height }}>
                  {imageElement && imageState && (
                    <KonvaImage
                      ref={imageNodeRef}
                      image={imageElement}
                      x={imageState.x}
                      y={imageState.y}
                      width={imageState.width}
                      height={imageState.height}
                      offsetX={imageState.width / 2}
                      offsetY={imageState.height / 2}
                      rotation={imageState.rotation}
                      draggable
                      onDragMove={(event) => {
                        setImageState((prev) => (prev ? { ...prev, x: event.target.x(), y: event.target.y() } : prev));
                      }}
                      onDragEnd={(event) => {
                        setImageState((prev) => (prev ? { ...prev, x: event.target.x(), y: event.target.y() } : prev));
                      }}
                      onTransformEnd={(event) => {
                        const node = event.target;
                        const nextWidth = Math.max(MIN_IMAGE_SIDE, node.width() * node.scaleX());
                        const nextHeight = Math.max(MIN_IMAGE_SIDE, node.height() * node.scaleY());

                        node.scaleX(1);
                        node.scaleY(1);

                        setImageState((prev) =>
                          prev
                            ? {
                                ...prev,
                                x: node.x(),
                                y: node.y(),
                                width: nextWidth,
                                height: nextHeight,
                                rotation: node.rotation(),
                              }
                            : prev,
                        );
                      }}
                    />
                  )}

                  {imageElement && imageState && (
                    <Transformer
                      ref={transformerRef}
                      rotateEnabled
                      enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                      borderStroke="#ef4444"
                      anchorStroke="#ef4444"
                      anchorFill="#ffffff"
                      anchorCornerRadius={3}
                      anchorSize={8}
                      boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < MIN_IMAGE_SIDE || newBox.height < MIN_IMAGE_SIDE) {
                          return oldBox;
                        }
                        return newBox;
                      }}
                    />
                  )}
                </Group>

                <Rect
                  x={PRINT_AREA.x}
                  y={PRINT_AREA.y}
                  width={PRINT_AREA.width}
                  height={PRINT_AREA.height}
                  cornerRadius={22}
                  fill="rgba(14, 165, 233, 0.08)"
                  stroke="rgba(14, 165, 233, 0.95)"
                  strokeWidth={2}
                  listening={false}
                />
                <Text
                  x={PRINT_AREA.x + 10}
                  y={PRINT_AREA.y + 10}
                  text="Область печати"
                  fontSize={14}
                  fontStyle="700"
                  fill="#075985"
                  padding={6}
                  fillAfterStrokeEnabled
                  listening={false}
                />

                <Rect
                  x={SAFE_AREA.x}
                  y={SAFE_AREA.y}
                  width={SAFE_AREA.width}
                  height={SAFE_AREA.height}
                  cornerRadius={18}
                  fill="rgba(16, 185, 129, 0.08)"
                  stroke="rgba(16, 185, 129, 0.95)"
                  strokeWidth={2}
                  listening={false}
                />
                <Text
                  x={SAFE_AREA.x + 10}
                  y={SAFE_AREA.y + 10}
                  text="Безопасная зона"
                  fontSize={14}
                  fontStyle="700"
                  fill="#047857"
                  padding={6}
                  fillAfterStrokeEnabled
                  listening={false}
                />
              </Layer>
            </Stage>
          </div>
        </div>
      </section>

      <aside className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">Изображение</h2>
        <p className="mt-1 text-sm text-neutral-600">Первый этап редактирования: загрузка, позиционирование и базовые трансформации.</p>

        <div className="mt-4 space-y-4">
          <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
            Загрузить изображение
            <input type="file" accept={ACCEPTED_FORMATS} className="hidden" onChange={onUploadImage} />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="grid gap-2">
            <button type="button" onClick={onCenter} disabled={!imageState} className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50">
              Выровнять по центру
            </button>
            <button type="button" onClick={onFitSafe} disabled={!imageState} className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50">
              Вписать в безопасную зону
            </button>
            <button type="button" onClick={onFitPrint} disabled={!imageState} className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50">
              Вписать в область печати
            </button>
            <button type="button" onClick={onFillPrint} disabled={!imageState} className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50">
              Заполнить область печати
            </button>
            <button type="button" onClick={onRotate90} disabled={!imageState} className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50">
              Повернуть на 90°
            </button>
            <button type="button" onClick={onRemoveImage} disabled={!imageState} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50">
              Удалить изображение
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
