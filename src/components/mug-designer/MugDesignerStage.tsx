'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Konva from 'konva';
import { MUG_PRINT_AREA, MUG_STAGE, MugDesignerLayer } from './types';

export type MugDesignerStageHandle = {
  exportDesign: () => Promise<{ previewDataUrl: string; printLayoutDataUrl: string }>;
};

type Props = {
  layers: MugDesignerLayer[];
  selectedId?: string;
  showGuides: boolean;
  onSelect: (id?: string) => void;
  onPatch: (id: string, patch: Partial<MugDesignerLayer>) => void;
  onBaseImageError: (failed: boolean) => void;
};

const BASE_IMAGE_SRC = '/images/mug/mug-base.png';
const imageCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return cached;

  const pending = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });

  imageCache.set(src, pending);
  pending.catch(() => imageCache.delete(src));
  return pending;
}

function commonAttrs(layer: MugDesignerLayer) {
  return {
    id: layer.id,
    x: layer.x,
    y: layer.y,
    rotation: layer.rotation,
    scaleX: layer.scaleX,
    scaleY: layer.scaleY,
  };
}

function createTextNode(layer: Extract<MugDesignerLayer, { type: 'text' }>) {
  return new Konva.Text({
    ...commonAttrs(layer),
    text: layer.text,
    width: layer.width,
    fontFamily: layer.fontFamily,
    fontSize: layer.fontSize,
    fontStyle: layer.fontStyle,
    fill: layer.fill,
    align: layer.align,
  });
}

async function createExportNode(layer: MugDesignerLayer): Promise<Konva.Shape> {
  if (layer.type === 'text') return createTextNode(layer);
  return new Konva.Image({
    ...commonAttrs(layer),
    image: await loadImage(layer.dataUrl),
    width: layer.width,
    height: layer.height,
  });
}

async function addExportObjects(group: Konva.Group, layers: MugDesignerLayer[]) {
  const nodes = await Promise.all(layers.map(createExportNode));
  group.add(...nodes);
}

const MugDesignerStage = forwardRef<MugDesignerStageHandle, Props>(function MugDesignerStage(
  { layers, selectedId, showGuides, onSelect, onPatch, onBaseImageError },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>();
  const objectsLayerRef = useRef<Konva.Layer>();
  const objectsGroupRef = useRef<Konva.Group>();
  const guidesLayerRef = useRef<Konva.Layer>();
  const transformerRef = useRef<Konva.Transformer>();
  const onSelectRef = useRef(onSelect);
  const onPatchRef = useRef(onPatch);
  const onBaseImageErrorRef = useRef(onBaseImageError);

  onSelectRef.current = onSelect;
  onPatchRef.current = onPatch;
  onBaseImageErrorRef.current = onBaseImageError;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stage = new Konva.Stage({ container, width: MUG_STAGE.width, height: MUG_STAGE.height });
    const baseLayer = new Konva.Layer({ listening: false });
    const objectsLayer = new Konva.Layer();
    const objectsGroup = new Konva.Group({
      clipX: MUG_PRINT_AREA.x,
      clipY: MUG_PRINT_AREA.y,
      clipWidth: MUG_PRINT_AREA.width,
      clipHeight: MUG_PRINT_AREA.height,
    });
    const guidesLayer = new Konva.Layer({ listening: false });
    const transformer = new Konva.Transformer({
      rotateEnabled: true,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      boundBoxFunc: (oldBox, nextBox) => (nextBox.width < 24 || nextBox.height < 24 ? oldBox : nextBox),
    });
    const transformerLayer = new Konva.Layer();

    objectsLayer.add(objectsGroup);
    transformerLayer.add(transformer);
    stage.add(baseLayer, objectsLayer, guidesLayer, transformerLayer);

    stageRef.current = stage;
    objectsLayerRef.current = objectsLayer;
    objectsGroupRef.current = objectsGroup;
    guidesLayerRef.current = guidesLayer;
    transformerRef.current = transformer;

    stage.on('click tap', (event) => {
      if (event.target === stage) onSelectRef.current(undefined);
    });

    loadImage(BASE_IMAGE_SRC)
      .then((image) => {
        if (stageRef.current !== stage) return;
        baseLayer.add(new Konva.Image({ image, width: MUG_STAGE.width, height: MUG_STAGE.height, listening: false }));
        baseLayer.draw();
        onBaseImageErrorRef.current(false);
      })
      .catch(() => {
        if (stageRef.current === stage) onBaseImageErrorRef.current(true);
      });

    const resize = () => {
      const scale = Math.min(1, container.clientWidth / MUG_STAGE.width);
      stage.width(MUG_STAGE.width * scale);
      stage.height(MUG_STAGE.height * scale);
      stage.scale({ x: scale, y: scale });
      stage.batchDraw();
    };
    resize();

    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(resize);
    observer?.observe(container);

    return () => {
      observer?.disconnect();
      stage.destroy();
      stageRef.current = undefined;
      objectsLayerRef.current = undefined;
      objectsGroupRef.current = undefined;
      guidesLayerRef.current = undefined;
      transformerRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    const objectsLayer = objectsLayerRef.current;
    const objectsGroup = objectsGroupRef.current;
    if (!objectsLayer || !objectsGroup) return;

    objectsGroup.destroyChildren();
    layers.forEach((layer) => {
      const node: Konva.Shape =
        layer.type === 'text'
          ? createTextNode(layer)
          : new Konva.Image({ ...commonAttrs(layer), image: document.createElement('img'), width: layer.width, height: layer.height });

      node.draggable(true);
      node.on('click tap', () => onSelectRef.current(layer.id));
      node.on('dragend', () => onPatchRef.current(layer.id, { x: node.x(), y: node.y() }));
      node.on('transformend', () =>
        onPatchRef.current(layer.id, {
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
        }),
      );
      objectsGroup.add(node);

      if (layer.type === 'image') {
        loadImage(layer.dataUrl)
          .then((image) => {
            if (!node.getStage()) return;
            (node as Konva.Image).image(image);
            objectsLayer.batchDraw();
          })
          .catch(() => undefined);
      }
    });
    objectsLayer.draw();
  }, [layers]);

  useEffect(() => {
    const guidesLayer = guidesLayerRef.current;
    if (!guidesLayer) return;

    guidesLayer.destroyChildren();
    if (showGuides) {
      const { x, y, width, height } = MUG_PRINT_AREA;
      guidesLayer.add(
        new Konva.Rect({ x, y, width, height, fill: 'rgba(239,68,68,.06)', stroke: '#ef4444', strokeWidth: 3, dash: [18, 12] }),
        new Konva.Line({ points: [960, y, 960, y + height], stroke: '#ef4444', strokeWidth: 2, dash: [12, 12] }),
        new Konva.Line({ points: [x, 540, x + width, 540], stroke: '#ef4444', strokeWidth: 2, dash: [12, 12] }),
      );
    }
    guidesLayer.draw();
  }, [showGuides]);

  useEffect(() => {
    const objectsGroup = objectsGroupRef.current;
    const transformer = transformerRef.current;
    if (!objectsGroup || !transformer) return;

    const selectedNode = selectedId ? objectsGroup.findOne(`#${selectedId}`) : undefined;
    transformer.nodes(selectedNode instanceof Konva.Node ? [selectedNode] : []);
    transformer.getLayer()?.batchDraw();
  }, [layers, selectedId]);

  useImperativeHandle(
    ref,
    () => ({
      exportDesign: async () => {
        const host = document.createElement('div');
        host.style.cssText = 'position:fixed;left:-99999px;top:0;width:1px;height:1px;overflow:hidden;';
        document.body.appendChild(host);

        const previewContainer = document.createElement('div');
        const printContainer = document.createElement('div');
        host.append(previewContainer, printContainer);

        const previewStage = new Konva.Stage({ container: previewContainer, width: MUG_STAGE.width, height: MUG_STAGE.height });
        const printStage = new Konva.Stage({ container: printContainer, width: MUG_PRINT_AREA.width, height: MUG_PRINT_AREA.height });

        try {
          const previewLayer = new Konva.Layer();
          const printLayer = new Konva.Layer();
          const previewGroup = new Konva.Group({
            clipX: MUG_PRINT_AREA.x,
            clipY: MUG_PRINT_AREA.y,
            clipWidth: MUG_PRINT_AREA.width,
            clipHeight: MUG_PRINT_AREA.height,
          });
          const printGroup = new Konva.Group({ x: -MUG_PRINT_AREA.x, y: -MUG_PRINT_AREA.y });

          const baseImage = await loadImage(BASE_IMAGE_SRC).catch(() => undefined);
          if (baseImage) {
            previewLayer.add(new Konva.Image({ image: baseImage, width: MUG_STAGE.width, height: MUG_STAGE.height }));
            onBaseImageErrorRef.current(false);
          } else {
            onBaseImageErrorRef.current(true);
          }

          await Promise.all([addExportObjects(previewGroup, layers), addExportObjects(printGroup, layers)]);
          previewLayer.add(previewGroup);
          printLayer.add(printGroup);
          previewStage.add(previewLayer);
          printStage.add(printLayer);
          previewLayer.draw();
          printLayer.draw();

          return {
            previewDataUrl: previewStage.toDataURL({ pixelRatio: 1 }),
            printLayoutDataUrl: printStage.toDataURL({ pixelRatio: 1 }),
          };
        } finally {
          previewStage.destroy();
          printStage.destroy();
          host.remove();
        }
      },
    }),
    [layers],
  );

  return <div ref={containerRef} className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-100" />;
});

export default MugDesignerStage;
