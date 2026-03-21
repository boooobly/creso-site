"use client";

import {
  ChangeEvent,
  forwardRef,
  MutableRefObject,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Group,
  Image as KonvaImage,
  Layer,
  Rect,
  Stage,
  Text as KonvaText,
  Transformer,
} from "react-konva";
import type Konva from "konva";
import {
  MOCKUP_HEIGHT,
  MOCKUP_SRC,
  MOCKUP_WIDTH,
  PRINT_AREA,
} from "@/components/mug-designer/mugMockupConfig";
import { MAX_IMAGE_SCALE, MIN_IMAGE_SIDE } from "@/lib/mugDesigner/constants";

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

type SelectedElement = "image" | "text" | null;

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

export type MugDesigner2DExport = {
  mockPngDataUrl: string;
  printPngDataUrl: string;
  layoutJson: string;
};

export type MugDesigner2DHandle = {
  exportDesign: () => Promise<MugDesigner2DExport | null>;
  hasRestorableDraft: () => boolean;
  restoreDraft: () => boolean;
  clearDraft: () => void;
};

type Props = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  allowedExtensions: readonly string[];
  allowedMimeTypes: readonly string[];
  maxUploadMb: number;
  onExportChange?: (next: MugDesigner2DExport | null) => void;
};

type StageMetrics = {
  previewScale: number;
  displayedWidth: number;
  displayedHeight: number;
  scaledPrintRect: { x: number; y: number; width: number; height: number };
};

type PreviewWorkspaceProps = {
  wrapperRef: MutableRefObject<HTMLDivElement | null>;
  stageRef: MutableRefObject<Konva.Stage | null>;
  guidesLayerRef: MutableRefObject<Konva.Layer | null>;
  contentLayerRef: MutableRefObject<Konva.Layer | null>;
  userImageRef: MutableRefObject<Konva.Image | null>;
  textNodeRef: MutableRefObject<Konva.Text | null>;
  transformerRef: MutableRefObject<Konva.Transformer | null>;
  metrics: StageMetrics;
  mockupImage: HTMLImageElement;
  userImage: HTMLImageElement | null;
  transform: TransformState;
  textLayer: TextLayerState | null;
  imageOpacity: number;
  selectedElement: SelectedElement;
  isDragging: boolean;
  onSelectElement: (next: SelectedElement) => void;
  onDragStateChange: (next: boolean) => void;
  onTransformChange: (
    updater: (prev: TransformState) => TransformState,
  ) => void;
  onTextLayerChange: (
    updater: (prev: TextLayerState | null) => TextLayerState | null,
  ) => void;
};

type ControlsDockProps = {
  error: string;
  selectedElement: SelectedElement;
  userImage: HTMLImageElement | null;
  textLayer: TextLayerState | null;
  imageOpacity: number;
  quantity: number;
  pricing: { baseTotal: number; discountRate: number; finalTotal: number };
  primaryButtonClass: string;
  secondaryButtonClass: string;
  toolButtonClass: string;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onDeleteSelected: () => void;
  onRotateSelected: () => void;
  onOpacityChange: (next: number) => void;
  onFitToPrint: () => void;
  onTextChange: (next: string) => void;
  onQuantityChange: (updater: (prev: number) => number) => void;
  onScrollToOrder: () => void;
  onReset: () => void;
};

const SAFE_INSET = 16;
const PREVIEW_STAGE_GUTTER = 24;
const PREVIEW_STAGE_MAX_HEIGHT = 780;
const PREVIEW_STAGE_MIN_WIDTH = 320;
const DRAFT_KEY = "mugsDesignerDraft:v1";
const TARGET_MOCK_EXPORT_WIDTH = 1800;
const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MUG_UNIT_PRICE = 450;
const MUG_DISCOUNT_STEP_QUANTITY = 12;
const MUG_DISCOUNT_STEP_RATE = 0.025;
const MUG_MAX_DISCOUNT_RATE = 0.2;

const defaultTransform: TransformState = {
  x: PRINT_RECT.x + PRINT_RECT.width / 2,
  y: PRINT_RECT.y + PRINT_RECT.height / 2,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
};

type DesignerDraft = {
  version: 1;
  savedAt: string;
  layoutJson: string;
  quantity?: number;
  needsDesign?: boolean;
  mockPngDataUrl?: string;
  printPngDataUrl?: string;
};

function fitScale(imgW: number, imgH: number): number {
  return Math.min(PRINT_RECT.width / imgW, PRINT_RECT.height / imgH);
}

function clampScale(value: number): number {
  if (!Number.isFinite(value) || value === 0) return 1;
  return value;
}

function clampPosition(
  x: number,
  y: number,
  width: number,
  height: number,
): { x: number; y: number } {
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

function scaleRect(
  rect: { x: number; y: number; width: number; height: number },
  scale: number,
): { x: number; y: number; width: number; height: number } {
  return {
    x: rect.x * scale,
    y: rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  };
}

function parseDraft(raw: string | null): DesignerDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DesignerDraft>;
    if (
      parsed.version !== 1 ||
      typeof parsed.layoutJson !== "string" ||
      typeof parsed.savedAt !== "string"
    ) {
      return null;
    }

    const savedTime = Date.parse(parsed.savedAt);
    if (
      !Number.isFinite(savedTime) ||
      Date.now() - savedTime > DRAFT_MAX_AGE_MS
    ) {
      return null;
    }

    return parsed as DesignerDraft;
  } catch {
    return null;
  }
}

function SectionCard({
  title,
  description,
  children,
  tone = "default",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  tone?: "default" | "muted";
}) {
  const toneClass = tone === "muted" ? "bg-neutral-50/80" : "bg-white";

  return (
    <section
      className={`space-y-3 rounded-xl border border-neutral-200 p-4 ${toneClass}`}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {title}
        </p>
        {description ? (
          <p className="text-sm text-neutral-600">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function PreviewWorkspace(props: PreviewWorkspaceProps) {
  const {
    wrapperRef,
    stageRef,
    guidesLayerRef,
    contentLayerRef,
    userImageRef,
    textNodeRef,
    transformerRef,
    metrics,
    mockupImage,
    userImage,
    transform,
    textLayer,
    imageOpacity,
    selectedElement,
    isDragging,
    onSelectElement,
    onDragStateChange,
    onTransformChange,
    onTextLayerChange,
  } = props;

  return (
    <section className="self-start rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 lg:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
        <span>Область печати</span>
        <span>
          Горизонтальный макет кружки без жёсткой маски в live preview
        </span>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-50 p-2 sm:p-3">
        <div className="w-full rounded-[20px] border border-neutral-200 bg-white shadow-sm">
          <div
            ref={wrapperRef}
            className="flex w-full items-center justify-center overflow-hidden px-2 py-3 sm:px-3 sm:py-4 lg:px-4 lg:py-5"
          >
            <div
              className="relative shrink-0"
              style={{
                width: metrics.displayedWidth,
                height: metrics.displayedHeight,
              }}
            >
              <Stage
                width={metrics.displayedWidth}
                height={metrics.displayedHeight}
                ref={stageRef}
                onMouseDown={(event) => {
                  if (event.target === event.target.getStage())
                    onSelectElement(null);
                }}
                onTouchStart={(event) => {
                  if (event.target === event.target.getStage())
                    onSelectElement(null);
                }}
              >
                <Layer listening={false}>
                  <Group
                    scaleX={metrics.previewScale}
                    scaleY={metrics.previewScale}
                  >
                    <Rect
                      x={0}
                      y={0}
                      width={MOCKUP_WIDTH}
                      height={MOCKUP_HEIGHT}
                      fill="#ffffff"
                    />
                    <KonvaImage
                      image={mockupImage}
                      x={0}
                      y={0}
                      width={MOCKUP_WIDTH}
                      height={MOCKUP_HEIGHT}
                    />
                  </Group>
                </Layer>

                <Layer ref={contentLayerRef}>
                  <Group
                    scaleX={metrics.previewScale}
                    scaleY={metrics.previewScale}
                  >
                    {userImage ? (
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
                        shadowEnabled={selectedElement === "image"}
                        shadowColor="rgba(220,38,38,0.35)"
                        shadowBlur={selectedElement === "image" ? 16 : 0}
                        shadowOpacity={selectedElement === "image" ? 0.5 : 0}
                        draggable
                        dragBoundFunc={(position) => {
                          const width =
                            userImage.width * Math.abs(transform.scaleX);
                          const height =
                            userImage.height * Math.abs(transform.scaleY);
                          return clampPosition(
                            position.x,
                            position.y,
                            width,
                            height,
                          );
                        }}
                        onClick={() => onSelectElement("image")}
                        onTap={() => onSelectElement("image")}
                        onDragStart={() => {
                          onDragStateChange(true);
                          onSelectElement("image");
                        }}
                        onDragMove={(event) => {
                          const width =
                            userImage.width * Math.abs(transform.scaleX);
                          const height =
                            userImage.height * Math.abs(transform.scaleY);
                          const next = clampPosition(
                            event.target.x(),
                            event.target.y(),
                            width,
                            height,
                          );
                          event.target.x(next.x);
                          event.target.y(next.y);
                        }}
                        onDragEnd={(event) => {
                          onDragStateChange(false);
                          onTransformChange((prev) => ({
                            ...prev,
                            x: event.target.x(),
                            y: event.target.y(),
                          }));
                        }}
                      />
                    ) : null}

                    {textLayer ? (
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
                        shadowEnabled={selectedElement === "text"}
                        shadowColor="rgba(220,38,38,0.35)"
                        shadowBlur={selectedElement === "text" ? 14 : 0}
                        shadowOpacity={selectedElement === "text" ? 0.45 : 0}
                        draggable
                        onClick={() => onSelectElement("text")}
                        onTap={() => onSelectElement("text")}
                        onDragStart={() => onSelectElement("text")}
                        onDragEnd={(event) => {
                          onTextLayerChange((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  x: event.target.x(),
                                  y: event.target.y(),
                                }
                              : prev,
                          );
                        }}
                      />
                    ) : null}
                  </Group>
                </Layer>

                <Layer ref={guidesLayerRef}>
                  <Group
                    scaleX={metrics.previewScale}
                    scaleY={metrics.previewScale}
                  >
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

                    {isDragging ? (
                      <>
                        <Rect
                          x={PRINT_RECT.x + PRINT_RECT.width / 2}
                          y={PRINT_RECT.y}
                          width={2}
                          height={PRINT_RECT.height}
                          fill="rgba(220,38,38,0.35)"
                          listening={false}
                        />
                        <Rect
                          x={PRINT_RECT.x}
                          y={PRINT_RECT.y + PRINT_RECT.height / 2}
                          width={PRINT_RECT.width}
                          height={2}
                          fill="rgba(220,38,38,0.35)"
                          listening={false}
                        />
                      </>
                    ) : null}
                  </Group>
                </Layer>

                <Layer ref={guidesLayerRef}>
                  <Group
                    scaleX={metrics.previewScale}
                    scaleY={metrics.previewScale}
                  >
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

                  {selectedElement ? (
                    <Transformer
                      ref={transformerRef}
                      keepRatio={selectedElement === "image"}
                      rotateEnabled
                      enabledAnchors={[
                        "top-left",
                        "top-center",
                        "top-right",
                        "middle-left",
                        "middle-right",
                        "bottom-left",
                        "bottom-center",
                        "bottom-right",
                      ]}
                      anchorStroke="#dc2626"
                      anchorFill="#dc2626"
                      borderStroke="#dc2626"
                      anchorSize={14}
                      boundBoxFunc={(oldBox, newBox) => {
                        if (
                          !Number.isFinite(newBox.width) ||
                          !Number.isFinite(newBox.height) ||
                          newBox.width <= 0 ||
                          newBox.height <= 0
                        ) {
                          return oldBox;
                        }
                        if (selectedElement === "text") return newBox;
                        if (
                          newBox.width < MIN_IMAGE_SIDE ||
                          newBox.height < MIN_IMAGE_SIDE
                        )
                          return oldBox;
                        if (
                          newBox.width > PRINT_RECT.width * MAX_IMAGE_SCALE ||
                          newBox.height > PRINT_RECT.height * MAX_IMAGE_SCALE
                        ) {
                          return oldBox;
                        }
                        return newBox;
                      }}
                      onTransformEnd={() => {
                        if (selectedElement === "text") {
                          const node = textNodeRef.current;
                          if (!node) return;

                          onTextLayerChange((prev) =>
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
                              : prev,
                          );
                          return;
                        }

                                const node = userImageRef.current;
                                if (!node || !userImage) return;

                                const nextScaleX = clampScale(node.scaleX());
                                const nextScaleY = clampScale(node.scaleY());
                                const width =
                                  userImage.width * Math.abs(nextScaleX);
                                const height =
                                  userImage.height * Math.abs(nextScaleY);
                                const next = clampPosition(
                                  node.x(),
                                  node.y(),
                                  width,
                                  height,
                                );

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
                        </Group>
                      </Layer>
                    </Stage>
                  </div>
                </div>
              </div>
            </div>
          </section>

                        const nextScaleX = clampScale(node.scaleX());
                        const nextScaleY = clampScale(node.scaleY());
                        const width = userImage.width * Math.abs(nextScaleX);
                        const height = userImage.height * Math.abs(nextScaleY);
                        const next = clampPosition(
                          node.x(),
                          node.y(),
                          width,
                          height,
                        );

                        node.x(next.x);
                        node.y(next.y);

                        onTransformChange((prev) => ({
                          ...prev,
                          rotation: (prev.rotation + 90) % 360,
                        }));
                      }}
                    />
                  ) : null}
                </Layer>
              </Stage>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ControlsDock({
  error,
  selectedElement,
  userImage,
  textLayer,
  imageOpacity,
  quantity,
  pricing,
  primaryButtonClass,
  secondaryButtonClass,
  toolButtonClass,
  onUpload,
  onDeleteSelected,
  onRotateSelected,
  onOpacityChange,
  onFitToPrint,
  onTextChange,
  onQuantityChange,
  onScrollToOrder,
  onReset,
}: ControlsDockProps) {
  const hasSelection = selectedElement !== null;
  const hasImageSelection = selectedElement === "image" && Boolean(userImage);
  const hasTextSelection = selectedElement === "text" && Boolean(textLayer);
  const canReset = Boolean(userImage || textLayer);

  return (
    <aside className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 lg:sticky lg:top-24">
      <SectionCard
        title="Добавить"
        description="Загрузите изображение для печати на кружке."
        tone="muted"
      >
        <label
          className={`block cursor-pointer text-center ${primaryButtonClass}`}
        >
          Загрузить изображение
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={onUpload}
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </SectionCard>

      <SectionCard
        title="Выбранный объект"
        description={
          hasSelection
            ? `Выбрано: ${selectedElement === "image" ? "Изображение" : "Текст"}`
            : "Выберите объект на кружке, чтобы управлять им без длинных разворачивающихся блоков."
        }
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-2">
          <button
            type="button"
            className={`${toolButtonClass} cursor-not-allowed opacity-60`}
            disabled
            title="Дублирование появится вместе с поддержкой нескольких слоёв."
          >
            Дублировать
          </button>
          <button
            type="button"
            className={toolButtonClass}
            disabled={!hasSelection}
            onClick={onDeleteSelected}
          >
            Удалить
          </button>
          <button
            type="button"
            className={`${toolButtonClass} sm:col-span-2 lg:col-span-2`}
            disabled={!hasSelection}
            onClick={onRotateSelected}
          >
            Повернуть на 90°
          </button>
        </div>

        <div className="grid gap-3 border-t border-neutral-200 pt-3 min-h-[154px] content-start">
          <label
            className={`space-y-1 ${hasImageSelection ? "" : "opacity-50"}`}
          >
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-neutral-600">Непрозрачность</span>
              <span className="text-neutral-500">{imageOpacity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={imageOpacity}
              disabled={!hasImageSelection}
              onChange={(event) => onOpacityChange(Number(event.target.value))}
              className="w-full accent-red-600"
            />
          </label>

          <button
            type="button"
            className={secondaryButtonClass}
            disabled={!hasImageSelection}
            onClick={onFitToPrint}
          >
            Вписать в зону печати
          </button>

          {hasTextSelection && textLayer ? (
            <label className="space-y-1 text-sm text-neutral-700">
              <span>Содержимое текста</span>
              <input
                type="text"
                value={textLayer.text}
                onChange={(event) => onTextChange(event.target.value)}
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />
            </label>
          ) : (
            <p className="text-xs text-neutral-500">
              Пунктирная рамка — это ориентир печати. Live preview не обрезает
              объект до этой области.
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Параметры заказа"
        description="Количество, стоимость и переход к оформлению."
        tone="muted"
      >
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-10 w-10 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50"
              onClick={() => onQuantityChange((prev) => Math.max(1, prev - 1))}
            >
              -
            </button>
            <div className="flex h-10 flex-1 items-center justify-center rounded-md border border-neutral-200 bg-white text-sm font-medium">
              {quantity}
            </div>
            <button
              type="button"
              className="h-10 w-10 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50"
              onClick={() => onQuantityChange((prev) => prev + 1)}
            >
              +
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Базовая стоимость
              </span>
              <span className="mt-1 block text-sm text-neutral-700">
                {pricing.baseTotal.toLocaleString("ru-RU", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}{" "}
                ₽
              </span>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Скидка
              </span>
              <span className="mt-1 block text-sm text-neutral-700">
                {(pricing.discountRate * 100).toLocaleString("ru-RU", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
                %
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
            <div className="flex items-end justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Итого
              </span>
              <span className="text-3xl font-semibold tracking-tight">
                {pricing.finalTotal.toLocaleString("ru-RU", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}{" "}
                ₽
              </span>
            </div>
          </div>

          <div className="grid gap-2 border-t border-neutral-200 pt-3">
            <button
              type="button"
              className={primaryButtonClass}
              onClick={onScrollToOrder}
            >
              Добавить в заказ
            </button>
            <button
              type="button"
              className={secondaryButtonClass}
              disabled={!canReset}
              onClick={onReset}
            >
              Сбросить макет
            </button>
          </div>
        </div>
      </SectionCard>
    </aside>
  );
}

const MugDesigner2D = forwardRef<MugDesigner2DHandle, Props>(
  function MugDesigner2D(
    {
      file,
      onFileChange,
      allowedExtensions,
      allowedMimeTypes,
      maxUploadMb,
      onExportChange,
    },
    ref,
  ) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const stageRef = useRef<Konva.Stage | null>(null);
    const guidesLayerRef = useRef<Konva.Layer | null>(null);
    const contentLayerRef = useRef<Konva.Layer | null>(null);
    const userImageRef = useRef<Konva.Image | null>(null);
    const textNodeRef = useRef<Konva.Text | null>(null);
    const transformerRef = useRef<Konva.Transformer | null>(null);

    const [error, setError] = useState("");
    const [mockupImage, setMockupImage] = useState<HTMLImageElement | null>(
      null,
    );
    const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
    const [viewportWidth, setViewportWidth] = useState(960);
    const [transform, setTransform] =
      useState<TransformState>(defaultTransform);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedElement, setSelectedElement] =
      useState<SelectedElement>(null);
    const [imageOpacity, setImageOpacity] = useState(100);
    const [quantity, setQuantity] = useState(1);
    const [textLayer, setTextLayer] = useState<TextLayerState | null>(null);

    const pricing = useMemo(() => {
      const baseTotal = quantity * MUG_UNIT_PRICE;
      const steps = Math.floor(quantity / MUG_DISCOUNT_STEP_QUANTITY);
      const discountRate = Math.min(
        steps * MUG_DISCOUNT_STEP_RATE,
        MUG_MAX_DISCOUNT_RATE,
      );
      const finalTotal = baseTotal * (1 - discountRate);

      return {
        baseTotal: Math.round(baseTotal * 100) / 100,
        discountRate,
        finalTotal: Math.round(finalTotal * 100) / 100,
      };
    }, [quantity]);

    const stageMetrics = useMemo<StageMetrics>(() => {
      const previewScale = viewportWidth / MOCKUP_WIDTH;
      const displayedWidth = viewportWidth;
      const displayedHeight = Math.round(
        (displayedWidth * MOCKUP_HEIGHT) / MOCKUP_WIDTH,
      );
      return {
        previewScale,
        displayedWidth,
        displayedHeight,
        scaledPrintRect: scaleRect(PRINT_RECT, previewScale),
      };
    }, [viewportWidth]);

    const buildLayoutJson = () =>
      JSON.stringify(
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

    const withGuidesHidden = <T,>(callback: () => T): T => {
      const guidesLayer = guidesLayerRef.current;
      const previousVisible = guidesLayer?.visible() ?? true;

      if (guidesLayer) {
        guidesLayer.visible(false);
        guidesLayer.getLayer()?.batchDraw();
      }

      try {
        return callback();
      } finally {
        if (guidesLayer) {
          guidesLayer.visible(previousVisible);
          guidesLayer.getLayer()?.batchDraw();
        }
      }
    };

    const buildExport = async (): Promise<MugDesigner2DExport | null> => {
      if (
        !stageRef.current ||
        !contentLayerRef.current ||
        (!userImage && !textLayer)
      ) {
        return null;
      }

      const stage = stageRef.current;
      const exportPixelRatio = MOCKUP_WIDTH / stage.width();
      const printExportRect = scaleRect(
        PRINT_RECT,
        stage.width() / MOCKUP_WIDTH,
      );

      const sourceCanvas = withGuidesHidden(() =>
        stage.toCanvas({ pixelRatio: exportPixelRatio }),
      );

      const shouldDownscale = sourceCanvas.width > 2000;
      const targetWidth = shouldDownscale
        ? Math.min(TARGET_MOCK_EXPORT_WIDTH, sourceCanvas.width)
        : sourceCanvas.width;
      const targetHeight = shouldDownscale
        ? Math.round((sourceCanvas.height * targetWidth) / sourceCanvas.width)
        : sourceCanvas.height;

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = targetWidth;
      exportCanvas.height = targetHeight;

      const exportContext = exportCanvas.getContext("2d");
      if (!exportContext) return null;

      exportContext.fillStyle = "#ffffff";
      exportContext.fillRect(0, 0, targetWidth, targetHeight);
      exportContext.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);

      const mockPngDataUrl = exportCanvas.toDataURL("image/png", 1.0);
      const printPngDataUrl = contentLayerRef.current.toDataURL({
        x: printExportRect.x,
        y: printExportRect.y,
        width: printExportRect.width,
        height: printExportRect.height,
        pixelRatio: exportPixelRatio,
        mimeType: "image/png",
      });

      return {
        mockPngDataUrl,
        printPngDataUrl,
        layoutJson: buildLayoutJson(),
      };
    };

    const applyLayoutJson = (layoutJson: string) => {
      try {
        const parsed = JSON.parse(layoutJson) as {
          image?: Partial<TransformState> | null;
          text?: Partial<TextLayerState> | null;
        };

        if (parsed.image && userImage) {
          setTransform((prev) => ({
            ...prev,
            x: typeof parsed.image?.x === "number" ? parsed.image.x : prev.x,
            y: typeof parsed.image?.y === "number" ? parsed.image.y : prev.y,
            scaleX:
              typeof parsed.image?.scaleX === "number"
                ? parsed.image.scaleX
                : prev.scaleX,
            scaleY:
              typeof parsed.image?.scaleY === "number"
                ? parsed.image.scaleY
                : prev.scaleY,
            rotation:
              typeof parsed.image?.rotation === "number"
                ? parsed.image.rotation
                : prev.rotation,
          }));
        }

        if (parsed.text) {
          setTextLayer((prev) => {
            if (!prev && typeof parsed.text?.text !== "string") return prev;
            return {
              text:
                typeof parsed.text?.text === "string"
                  ? parsed.text.text
                  : (prev?.text ?? "Текст на кружке"),
              x:
                typeof parsed.text?.x === "number"
                  ? parsed.text.x
                  : (prev?.x ?? PRINT_RECT.x + PRINT_RECT.width / 2),
              y:
                typeof parsed.text?.y === "number"
                  ? parsed.text.y
                  : (prev?.y ?? PRINT_RECT.y + PRINT_RECT.height / 2),
              rotation:
                typeof parsed.text?.rotation === "number"
                  ? parsed.text.rotation
                  : (prev?.rotation ?? 0),
              width:
                typeof parsed.text?.width === "number"
                  ? parsed.text.width
                  : (prev?.width ?? 260),
              height:
                typeof parsed.text?.height === "number"
                  ? parsed.text.height
                  : (prev?.height ?? 40),
              scaleX:
                typeof parsed.text?.scaleX === "number"
                  ? parsed.text.scaleX
                  : (prev?.scaleX ?? 1),
              scaleY:
                typeof parsed.text?.scaleY === "number"
                  ? parsed.text.scaleY
                  : (prev?.scaleY ?? 1),
              fontSize:
                typeof parsed.text?.fontSize === "number"
                  ? parsed.text.fontSize
                  : (prev?.fontSize ?? 36),
            };
          });
        }
      } catch {
        // ignore corrupted layout
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        exportDesign: async () => buildExport(),
        hasRestorableDraft: () =>
          Boolean(parseDraft(window.localStorage.getItem(DRAFT_KEY))),
        restoreDraft: () => {
          const draft = parseDraft(window.localStorage.getItem(DRAFT_KEY));
          if (!draft) return false;
          applyLayoutJson(draft.layoutJson);
          if (
            typeof draft.quantity === "number" &&
            Number.isFinite(draft.quantity)
          ) {
            setQuantity(Math.max(1, Math.round(draft.quantity)));
          }
          return true;
        },
        clearDraft: () => {
          window.localStorage.removeItem(DRAFT_KEY);
        },
      }),
      [buildExport, file, textLayer, transform, userImage],
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
        const contentWidth =
          entries[0]?.contentRect.width ?? node.clientWidth ?? 960;
        const availableWidth = Math.max(
          contentWidth - PREVIEW_STAGE_GUTTER * 2,
          PREVIEW_STAGE_MIN_WIDTH,
        );
        const availableHeight =
          PREVIEW_STAGE_MAX_HEIGHT - PREVIEW_STAGE_GUTTER * 2;
        const scale = Math.min(
          availableWidth / MOCKUP_WIDTH,
          availableHeight / MOCKUP_HEIGHT,
          1,
        );
        setViewportWidth(
          Math.max(Math.round(MOCKUP_WIDTH * scale), PREVIEW_STAGE_MIN_WIDTH),
        );
      });

      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      if (!file) {
        setUserImage(null);
        setSelectedElement(null);
        setTransform(defaultTransform);
        setImageOpacity(100);
        setIsDragging(false);
        setTextLayer(null);
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      const image = new window.Image();
      image.onload = () => {
        const nextScale = fitScale(image.width, image.height);
        setUserImage(image);
        setImageOpacity(100);
        setIsDragging(false);
        setTransform({
          x: PRINT_RECT.x + PRINT_RECT.width / 2,
          y: PRINT_RECT.y + PRINT_RECT.height / 2,
          scaleX: nextScale,
          scaleY: nextScale,
          rotation: 0,
        });
        setSelectedElement("image");
      };
      image.src = objectUrl;

      return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    useEffect(() => {
      const transformer = transformerRef.current;
      if (!transformer || !selectedElement) {
        transformer?.nodes([]);
        transformer?.getLayer()?.batchDraw();
        return;
      }

      if (selectedElement === "image" && userImageRef.current && userImage) {
        transformer.nodes([userImageRef.current]);
        transformer.getLayer()?.batchDraw();
        return;
      }

      if (selectedElement === "text" && textNodeRef.current && textLayer) {
        transformer.nodes([textNodeRef.current]);
        transformer.getLayer()?.batchDraw();
      }
    }, [selectedElement, textLayer, userImage]);

    useEffect(() => {
      const timeoutId = window.setTimeout(() => {
        if (!userImage && !textLayer) {
          window.localStorage.removeItem(DRAFT_KEY);
          return;
        }

        const payload: DesignerDraft = {
          version: 1,
          savedAt: new Date().toISOString(),
          layoutJson: buildLayoutJson(),
          quantity,
        };

        if (stageRef.current && contentLayerRef.current) {
          try {
            const mockPngDataUrl = withGuidesHidden(() =>
              stageRef.current!.toDataURL({
                pixelRatio: 1,
                mimeType: "image/png",
              }),
            );
            const printPngDataUrl = contentLayerRef.current.toDataURL({
              x: stageMetrics.scaledPrintRect.x,
              y: stageMetrics.scaledPrintRect.y,
              width: stageMetrics.scaledPrintRect.width,
              height: stageMetrics.scaledPrintRect.height,
              pixelRatio: 1,
              mimeType: "image/png",
            });
            const maxPreviewLength = 1_200_000;
            if (
              mockPngDataUrl.length <= maxPreviewLength &&
              printPngDataUrl.length <= maxPreviewLength
            ) {
              payload.mockPngDataUrl = mockPngDataUrl;
              payload.printPngDataUrl = printPngDataUrl;
            }
          } catch {
            // preview export is optional for autosave
          }
        }

        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      }, 500);

      return () => window.clearTimeout(timeoutId);
    }, [
      buildLayoutJson,
      quantity,
      stageMetrics.scaledPrintRect,
      textLayer,
      transform,
      userImage,
    ]);

    useEffect(() => {
      if (!onExportChange) return;

      const timeoutId = window.setTimeout(() => {
        void buildExport()
          .then((nextExport) => onExportChange(nextExport))
          .catch(() => onExportChange(null));
      }, 400);

      return () => window.clearTimeout(timeoutId);
    }, [buildExport, onExportChange, textLayer, transform, userImage]);

    const isAllowed = useMemo(
      () => (candidate: File) => {
        const ext = candidate.name.includes(".")
          ? `.${candidate.name.split(".").pop()?.toLowerCase() ?? ""}`
          : "";
        return (
          allowedExtensions.includes(ext) ||
          allowedMimeTypes.includes(candidate.type.toLowerCase())
        );
      },
      [allowedExtensions, allowedMimeTypes],
    );

    const onUpload = (event: ChangeEvent<HTMLInputElement>) => {
      setError("");
      const next = event.target.files?.[0] ?? null;
      if (!next) {
        onFileChange(null);
        return;
      }

      if (!isAllowed(next)) {
        setError(
          "Для конструктора доступны только изображения (png, jpg, jpeg, webp).",
        );
        event.target.value = "";
        return;
      }

      if (next.size <= 0 || next.size > maxUploadMb * 1024 * 1024) {
        setError(`Размер файла должен быть от 1 байта до ${maxUploadMb} МБ.`);
        event.target.value = "";
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

    const resetDesignerState = ({
      clearDraft = false,
    }: { clearDraft?: boolean } = {}) => {
      onFileChange(null);
      setTransform(defaultTransform);
      setImageOpacity(100);
      setTextLayer(null);
      setSelectedElement(null);

      if (clearDraft) {
        window.localStorage.removeItem(DRAFT_KEY);
      }
    };

    const primaryButtonClass =
      "w-full rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700";
    const secondaryButtonClass =
      "w-full rounded-md border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50";
    const toolButtonClass =
      "rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50";

    if (!mockupImage) {
      return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">
          Загрузка конструктора…
        </div>
      );
    }

    return (
      <div className="space-y-4 lg:space-y-5">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Соберите макет
              </h2>
              <p className="mt-2 text-sm text-neutral-600 sm:text-base">
                Загрузите изображение или добавьте текст. Live workspace
                остаётся свободным, а ограничения печати применяются только при
                выводе результата.
              </p>
            </div>
            <p className="text-xs text-neutral-500 lg:max-w-[240px] lg:text-right">
              Пунктирная рамка показывает печатную область кружки, но не
              превращает editor preview в жёсткую маску.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2.25fr)_minmax(320px,360px)] xl:gap-5">
          <PreviewWorkspace
            wrapperRef={wrapperRef}
            stageRef={stageRef}
            guidesLayerRef={guidesLayerRef}
            contentLayerRef={contentLayerRef}
            userImageRef={userImageRef}
            textNodeRef={textNodeRef}
            transformerRef={transformerRef}
            metrics={stageMetrics}
            mockupImage={mockupImage}
            userImage={userImage}
            transform={transform}
            textLayer={textLayer}
            imageOpacity={imageOpacity}
            selectedElement={selectedElement}
            isDragging={isDragging}
            onSelectElement={setSelectedElement}
            onDragStateChange={setIsDragging}
            onTransformChange={(updater) =>
              setTransform((prev) => updater(prev))
            }
            onTextLayerChange={(updater) =>
              setTextLayer((prev) => updater(prev))
            }
          />

          <ControlsDock
            error={error}
            selectedElement={selectedElement}
            userImage={userImage}
            textLayer={textLayer}
            imageOpacity={imageOpacity}
            quantity={quantity}
            pricing={pricing}
            primaryButtonClass={primaryButtonClass}
            secondaryButtonClass={secondaryButtonClass}
            toolButtonClass={toolButtonClass}
            onUpload={onUpload}
            onDeleteSelected={() => {
              if (selectedElement === "image") onFileChange(null);
              if (selectedElement === "text") setTextLayer(null);
              setSelectedElement(null);
            }}
            onRotateSelected={() => {
              if (selectedElement === "image") {
                setTransform((prev) => ({
                  ...prev,
                  rotation: (prev.rotation + 90) % 360,
                }));
              }
              if (selectedElement === "text") {
                setTextLayer((prev) =>
                  prev
                    ? { ...prev, rotation: (prev.rotation + 90) % 360 }
                    : prev,
                );
              }
            }}
            onOpacityChange={setImageOpacity}
            onFitToPrint={onFitToPrint}
            onTextChange={(next) =>
              setTextLayer((prev) => (prev ? { ...prev, text: next } : prev))
            }
            onQuantityChange={(updater) => setQuantity((prev) => updater(prev))}
            onScrollToOrder={() => {
              document
                .getElementById("mug-order-form")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            onReset={() => resetDesignerState({ clearDraft: true })}
          />
        </div>
      </div>
    );
  },
);

export default MugDesigner2D;
