export type PrintProductType = 'cards' | 'flyers';
export type PrintDensity = 300 | 350 | 400;
export type PrintType = 'single' | 'double';

export type WideFormatMaterialType = 'banner' | 'selfAdhesiveFilm' | 'backlit' | 'perforatedFilm' | 'posterPaper';
export type BannerDensity = 220 | 300 | 440;

export type HeatTransferProductType = 'mug' | 'tshirt' | 'film';
export type MugType = 'white330' | 'chameleon';
export type MugPrintType = 'single' | 'wrap';
export type TshirtSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type TshirtGender = 'male' | 'female';

export type PlotterMaterialType = 'selfAdhesive' | 'oracal';

export type QuantityResolutionInput = {
  presetQuantity: number;
  customQuantityInput: string;
  minimumQuantity: number;
};

export type QuantityResolutionResult = {
  quantity: number;
  isValid: boolean;
  source: 'preset' | 'custom';
};

export type NumericInput = string | number;

export type BagetInputValidation = {
  inputsFilled: boolean;
  isValid: boolean;
  width: number;
  height: number;
};
