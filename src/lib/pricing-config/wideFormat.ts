import type { WideFormatMaterialType } from '@/lib/calculations/types';

const BANNER_MATERIALS: ReadonlySet<WideFormatMaterialType> = new Set([
  'banner_240_gloss_3_2m',
  'banner_340_matte_3_2m',
  'banner_440_matte_3_2m',
  'banner_460_cast_3_2m',
]);

const FILM_MATERIALS: ReadonlySet<WideFormatMaterialType> = new Set([
  'self_adhesive_film_matte_1_5',
  'self_adhesive_film_gloss_1_5',
  'perforated_film_1_37',
  'clear_film_matte_1_5',
]);

export function isBannerMaterial(material: WideFormatMaterialType): boolean {
  return BANNER_MATERIALS.has(material);
}

export function isFilmMaterial(material: WideFormatMaterialType): boolean {
  return FILM_MATERIALS.has(material);
}

export function isExtrasAllowedForWideFormat(material: WideFormatMaterialType): boolean {
  return isBannerMaterial(material) || isFilmMaterial(material);
}

export const WIDE_FORMAT_MATERIAL_OPTIONS = [
  { value: 'banner_240_gloss_3_2m', label: 'Баннер 240 г/м² глянец, 3.2 м' },
  { value: 'banner_340_matte_3_2m', label: 'Баннер 340 г/м² матовый, 3.2 м' },
  { value: 'banner_440_matte_3_2m', label: 'Баннер 440 г/м² матовый, 3.2 м' },
  { value: 'banner_460_cast_3_2m', label: 'Баннер 460 г/м² литой, 3.2 м' },
  { value: 'self_adhesive_film_matte_1_5', label: 'Самоклеящаяся плёнка матовая, 1.5 м' },
  { value: 'self_adhesive_film_gloss_1_5', label: 'Самоклеящаяся плёнка глянцевая, 1.5 м' },
  { value: 'perforated_film_1_37', label: 'Перфорированная плёнка, 1.37 м' },
  { value: 'clear_film_matte_1_5', label: 'Прозрачная плёнка матовая, 1.5 м' },
  { value: 'paper_trans_skylight', label: 'Бумага транслюцентная Skylight, 1.6 м' },
  { value: 'backlit_1_07', label: 'Бэклит, 1.07 м' },
  { value: 'fxflex_translucent_banner_1_07', label: 'Баннер транслюцентный FXFlex, 1.07 м' },
  { value: 'polyester_fabric_140_1_5', label: 'Полиэстеровая ткань 140 г/м², 1.5 м' },
  { value: 'polyester_fabric_100_0_9', label: 'Полиэстеровая ткань 100 г/м², 0.9 м' },
  { value: 'canvas_cotton_350', label: 'Холст хлопчатобумажный 350 г/м², 1.5 м' },
  { value: 'canvas_poly_250', label: 'Холст полиэстеровый 250 г/м², 1.5 м' },
] as const;

export type WideFormatCategory =
  | 'banner'
  | 'film'
  | 'paper'
  | 'backlit'
  | 'fabric'
  | 'canvas';

export const WIDE_FORMAT_CATEGORY_OPTIONS: ReadonlyArray<{ id: WideFormatCategory; label: string }> = [
  { id: 'banner', label: 'Баннер' },
  { id: 'film', label: 'Плёнка' },
  { id: 'paper', label: 'Бумага' },
  { id: 'backlit', label: 'Светорассеивающие' },
  { id: 'fabric', label: 'Ткань' },
  { id: 'canvas', label: 'Холст' },
];

export const WIDE_FORMAT_VARIANTS_BY_CATEGORY: Record<WideFormatCategory, Array<{ id: WideFormatMaterialType; label: string }>> = {
  banner: [
    { id: 'banner_240_gloss_3_2m', label: 'Баннер 240 г/м² глянец, 3.2 м' },
    { id: 'banner_340_matte_3_2m', label: 'Баннер 340 г/м² матовый, 3.2 м' },
    { id: 'banner_440_matte_3_2m', label: 'Баннер 440 г/м² матовый, 3.2 м' },
    { id: 'banner_460_cast_3_2m', label: 'Баннер 460 г/м² литой, 3.2 м' },
  ],
  film: [
    { id: 'self_adhesive_film_matte_1_5', label: 'Самоклеящаяся плёнка матовая, 1.5 м' },
    { id: 'self_adhesive_film_gloss_1_5', label: 'Самоклеящаяся плёнка глянцевая, 1.5 м' },
    { id: 'perforated_film_1_37', label: 'Перфорированная плёнка, 1.37 м' },
    { id: 'clear_film_matte_1_5', label: 'Прозрачная плёнка матовая, 1.5 м' },
  ],
  backlit: [
    { id: 'backlit_1_07', label: 'Бэклит, 1.07 м' },
    { id: 'fxflex_translucent_banner_1_07', label: 'Баннер транслюцентный FXFlex, 1.07 м' },
  ],
  paper: [
    { id: 'paper_trans_skylight', label: 'Бумага транслюцентная Skylight, 1.6 м' },
  ],
  fabric: [
    { id: 'polyester_fabric_140_1_5', label: 'Полиэстеровая ткань 140 г/м², 1.5 м' },
    { id: 'polyester_fabric_100_0_9', label: 'Полиэстеровая ткань 100 г/м², 0.9 м' },
  ],
  canvas: [
    { id: 'canvas_cotton_350', label: 'Холст хлопчатобумажный 350 г/м², 1.5 м' },
    { id: 'canvas_poly_250', label: 'Холст полиэстеровый 250 г/м², 1.5 м' },
  ],
};

export function getWideFormatCategoryByMaterial(material: WideFormatMaterialType): WideFormatCategory {
  const matchedCategory = (Object.keys(WIDE_FORMAT_VARIANTS_BY_CATEGORY) as WideFormatCategory[])
    .find((category) => WIDE_FORMAT_VARIANTS_BY_CATEGORY[category].some((variant) => variant.id === material));

  return matchedCategory ?? 'banner';
}

const WIDE_FORMAT_MATERIAL_LABELS: Record<WideFormatMaterialType, string> = Object.fromEntries(
  WIDE_FORMAT_MATERIAL_OPTIONS.map((option) => [option.value, option.label]),
) as Record<WideFormatMaterialType, string>;

export function getWideFormatMaterialLabel(material: WideFormatMaterialType): string {
  return WIDE_FORMAT_MATERIAL_LABELS[material] ?? material;
}

export function getWideFormatMaterialMaxWidth(material: WideFormatMaterialType): number {
  return WIDE_FORMAT_PRICING_CONFIG.maxWidthByMaterial[material] ?? WIDE_FORMAT_PRICING_CONFIG.maxWidth;
}

export const WIDE_FORMAT_PRICING_CONFIG = {
  maxWidth: 3.2,
  bannerJoinSeamWidthThreshold: 3.1,
  edgeGluingPerimeterPrice: 50,
  imageWeldingPerimeterPrice: 150,
  grommetPrice: 20,
  grommetStepM: 0.30,
  plotterCutPerimeterPrice: 25,
  plotterCutMinimumFee: 250,
  positioningMarksCutPercent: 0.3,
  minimumPrintPriceRUB: 400,
  pricesRUBPerM2: {
    banner_240_gloss_3_2m: 450,
    banner_340_matte_3_2m: 450,
    banner_440_matte_3_2m: 500,
    banner_460_cast_3_2m: 550,
    self_adhesive_film_matte_1_5: 500,
    self_adhesive_film_gloss_1_5: 500,
    perforated_film_1_37: 650,
    clear_film_matte_1_5: 500,
    paper_trans_skylight: 500,
    polyester_fabric_140_1_5: 450,
    polyester_fabric_100_0_9: 400,
    canvas_cotton_350: 1500,
    canvas_poly_250: 1000,
    backlit_1_07: 1300,
    fxflex_translucent_banner_1_07: 700,
  } as Record<WideFormatMaterialType, number>,
  maxWidthByMaterial: {
    banner_240_gloss_3_2m: 3.2,
    banner_340_matte_3_2m: 3.2,
    banner_440_matte_3_2m: 3.2,
    banner_460_cast_3_2m: 3.2,
    self_adhesive_film_matte_1_5: 1.5,
    self_adhesive_film_gloss_1_5: 1.5,
    perforated_film_1_37: 1.37,
    clear_film_matte_1_5: 1.5,
    paper_trans_skylight: 1.6,
    polyester_fabric_140_1_5: 1.5,
    polyester_fabric_100_0_9: 0.9,
    canvas_cotton_350: 1.5,
    canvas_poly_250: 1.5,
    backlit_1_07: 1.07,
    fxflex_translucent_banner_1_07: 1.07,
  } as Record<WideFormatMaterialType, number>,
} as const;
