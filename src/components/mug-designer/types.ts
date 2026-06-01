export const MUG_STAGE = { width: 1920, height: 1080 } as const;
export const MUG_PRINT_AREA = { x: 217, y: 226, width: 1486, height: 628 } as const;

export type MugLayerBase = {
  id: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
};

export type MugImageLayer = MugLayerBase & {
  type: 'image';
  dataUrl: string;
  sourceFileName: string;
  width: number;
  height: number;
};

export type MugTextLayer = MugLayerBase & {
  type: 'text';
  text: string;
  width: number;
  fontFamily: string;
  fontSize: number;
  fontStyle: string;
  fill: string;
  align: 'left' | 'center' | 'right';
};

export type MugDesignerLayer = MugImageLayer | MugTextLayer;

export type MugDesignerValue = {
  previewDataUrl: string;
  printLayoutDataUrl: string;
  designJson: string;
  layers: MugDesignerLayer[];
  sourceFiles: File[];
};
