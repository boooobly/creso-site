export type PrintProductType = 'cards' | 'flyers';
export type PrintDensity = 300 | 350 | 400;
export type PrintType = 'single' | 'double';

export type WideFormatMaterialType =
  | 'banner_240_gloss_3_2m'
  | 'banner_240_matt_3_2m'
  | 'banner_280'
  | 'banner_330'
  | 'banner_440'
  | 'banner_460_cast_3_2m'
  | 'banner_mesh_380_3_2m'
  | 'banner_510_cast_3_2m'
  | 'self_adhesive_film_gloss'
  | 'perforated_film_1_37'
  | 'paper_dupaper_blue_120'
  | 'paper_trans_skylight'
  | 'trans_film_1_27'
  | 'polyester_fabric_140'
  | 'flag_fabric_with_liner'
  | 'canvas_cotton_350'
  | 'canvas_poly_260'
  | 'backlit_1_07'
  | 'photo_paper_220';

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
