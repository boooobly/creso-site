import type { WideFormatMaterialType } from '@/lib/calculations/types';

const BANNER_MATERIALS: ReadonlySet<WideFormatMaterialType> = new Set([
  'banner_240_gloss_3_2m',
  'banner_330',
  'banner_440',
  'banner_460_cast_3_2m',
  'banner_mesh_380_3_2m',
  'banner_510_cast_3_2m',
]);

const FILM_MATERIALS: ReadonlySet<WideFormatMaterialType> = new Set([
  'self_adhesive_film_gloss',
  'perforated_film_1_37',
  'trans_film_1_27',
]);

export function isBannerMaterial(material: WideFormatMaterialType): boolean {
  return BANNER_MATERIALS.has(material);
}

export function isFilmMaterial(material: WideFormatMaterialType): boolean {
  return FILM_MATERIALS.has(material);
}

export const WIDE_FORMAT_MATERIAL_OPTIONS = [
  { value: 'banner_240_gloss_3_2m', label: 'Баннер 240 г/м² глянец, 3.2 м' },
  { value: 'banner_330', label: 'Баннер 330 г/м²' },
  { value: 'banner_440', label: 'Баннер 440 г/м²' },
  { value: 'banner_460_cast_3_2m', label: 'Баннер 460 г/м² литой, 3.2 м' },
  { value: 'banner_mesh_380_3_2m', label: 'Баннерная сетка 380 г/м², 3.2 м' },
  { value: 'banner_510_cast_3_2m', label: 'Баннер 510 г/м² литой, 3.2 м' },
  { value: 'self_adhesive_film_gloss', label: 'Самоклеящаяся плёнка глянец' },
  { value: 'perforated_film_1_37', label: 'Перфорированная плёнка 1.37 м' },
  { value: 'paper_dupaper_blue_120', label: 'Бумага Dupaper Blue 120 г/м²' },
  { value: 'paper_trans_skylight', label: 'Бумага транслюцентная Skylight' },
  { value: 'trans_film_1_27', label: 'Транслюцентная плёнка 1.27 м' },
  { value: 'polyester_fabric_140', label: 'Полиэстеровая ткань 140 г/м²' },
  { value: 'flag_fabric_with_liner', label: 'Флажная ткань с подложкой' },
  { value: 'canvas_cotton_350', label: 'Холст хлопковый 350 г/м²' },
  { value: 'canvas_poly_260', label: 'Холст полиэстеровый 260 г/м²' },
  { value: 'backlit_1_07', label: 'Бэклит 1.07 м' },
  { value: 'photo_paper_220', label: 'Фотобумага 220 г/м²' },
  { value: 'customer_roll_textured', label: 'Свой материал (текстурный)' },
  { value: 'customer_roll_smooth', label: 'Свой материал (гладкий)' },
] as const;

export const WIDE_FORMAT_MATERIAL_GROUPS: ReadonlyArray<{
  label: string;
  items: ReadonlyArray<{ id: WideFormatMaterialType; label: string }>;
}> = [
  {
    label: 'Баннер',
    items: [
      { id: 'banner_240_gloss_3_2m', label: 'Баннер 240 г/м² глянец, 3.2 м' },
      { id: 'banner_330', label: 'Баннер 330 г/м²' },
      { id: 'banner_440', label: 'Баннер 440 г/м²' },
      { id: 'banner_460_cast_3_2m', label: 'Баннер 460 г/м² литой, 3.2 м' },
      { id: 'banner_mesh_380_3_2m', label: 'Баннерная сетка 380 г/м², 3.2 м' },
      { id: 'banner_510_cast_3_2m', label: 'Баннер 510 г/м² литой, 3.2 м' },
    ],
  },
  {
    label: 'Плёнка',
    items: [
      { id: 'self_adhesive_film_gloss', label: 'Самоклеящаяся плёнка глянец' },
      { id: 'perforated_film_1_37', label: 'Перфорированная плёнка 1.37 м' },
      { id: 'trans_film_1_27', label: 'Транслюцентная плёнка 1.27 м' },
      { id: 'backlit_1_07', label: 'Бэклит 1.07 м' },
    ],
  },
  {
    label: 'Бумага',
    items: [
      { id: 'paper_dupaper_blue_120', label: 'Бумага Dupaper Blue 120 г/м²' },
      { id: 'paper_trans_skylight', label: 'Бумага транслюцентная Skylight' },
      { id: 'photo_paper_220', label: 'Фотобумага 220 г/м²' },
    ],
  },
  {
    label: 'Ткань',
    items: [
      { id: 'polyester_fabric_140', label: 'Полиэстеровая ткань 140 г/м²' },
      { id: 'flag_fabric_with_liner', label: 'Флажная ткань с подложкой' },
    ],
  },
  {
    label: 'Холст',
    items: [
      { id: 'canvas_cotton_350', label: 'Холст хлопковый 350 г/м²' },
      { id: 'canvas_poly_260', label: 'Холст полиэстеровый 260 г/м²' },
    ],
  },
  {
    label: 'Свой материал',
    items: [
      { id: 'customer_roll_textured', label: 'Свой материал (текстурный)' },
      { id: 'customer_roll_smooth', label: 'Свой материал (гладкий)' },
    ],
  },
];

const WIDE_FORMAT_MATERIAL_LABELS: Record<WideFormatMaterialType, string> = Object.fromEntries(
  WIDE_FORMAT_MATERIAL_OPTIONS.map((option) => [option.value, option.label]),
) as Record<WideFormatMaterialType, string>;

export function getWideFormatMaterialLabel(material: WideFormatMaterialType): string {
  return WIDE_FORMAT_MATERIAL_LABELS[material] ?? material;
}

export const WIDE_FORMAT_PRICING_CONFIG = {
  maxWidth: 3.2,
  edgeGluingPerimeterPrice: 50,
  imageWeldingPerimeterPrice: 150,
  plotterCutPerimeterPrice: 25,
  positioningMarksCutPercent: 0.3,
  passesStandard: 6,
  customerRollPerPass: {
    textured: 100,
    smooth: 60,
  },
  pricesRUBPerM2: {
    banner_240_gloss_3_2m: 450,
    banner_330: 450,
    banner_440: 500,
    banner_460_cast_3_2m: 550,
    banner_mesh_380_3_2m: 500,
    banner_510_cast_3_2m: 550,
    self_adhesive_film_gloss: 500,
    perforated_film_1_37: 650,
    paper_dupaper_blue_120: 500,
    paper_trans_skylight: 500,
    trans_film_1_27: 750,
    polyester_fabric_140: 450,
    flag_fabric_with_liner: 660,
    canvas_cotton_350: 1500,
    canvas_poly_260: 1000,
    backlit_1_07: 1300,
    photo_paper_220: 510,
    customer_roll_textured: 0,
    customer_roll_smooth: 0,
  } as Record<WideFormatMaterialType, number>,
};
