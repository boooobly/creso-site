export type PrintProductType = 'cards' | 'flyers';
export type PrintDensity = 300 | 350 | 400;
export type PrintType = 'single' | 'double';

export type WideFormatMaterialType =
  | 'banner_240_gloss_3_2m'
  | 'banner_340_matte_3_2m'
  | 'banner_440_matte_3_2m'
  | 'banner_460_cast_3_2m'
  | 'self_adhesive_film_matte_1_5'
  | 'self_adhesive_film_gloss_1_5'
  | 'perforated_film_1_37'
  | 'clear_film_matte_1_5'
  | 'paper_trans_skylight'
  | 'polyester_fabric_140_1_5'
  | 'polyester_fabric_100_0_9'
  | 'canvas_cotton_350'
  | 'canvas_poly_250'
  | 'backlit_1_07'
  | 'fxflex_translucent_banner_1_07';

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
