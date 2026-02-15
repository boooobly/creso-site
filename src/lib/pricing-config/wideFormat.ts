import type { BannerDensity, WideFormatMaterialType } from '@/lib/calculations/types';

export const WIDE_FORMAT_MATERIAL_OPTIONS = [
  { value: 'banner', label: 'Баннер' },
  { value: 'selfAdhesiveFilm', label: 'Самоклеящаяся пленка' },
  { value: 'backlit', label: 'Бэклит' },
  { value: 'perforatedFilm', label: 'Перфорированная пленка' },
  { value: 'posterPaper', label: 'Постерная бумага' },
] as const;

export const WIDE_FORMAT_PRICING_CONFIG = {
  maxWidth: 3.2,
  bannerWidthRange: { min: 1.2, max: 3 },
  sheetWidthRange: { min: 1.06, max: 1.6 },
  edgeGluingPerimeterPrice: 40,
  grommetPrice: 5,
  bannerDensityPrice: {
    220: 350,
    300: 420,
    440: 520,
  } as Record<BannerDensity, number>,
  materialPrice: {
    selfAdhesiveFilm: 600,
    backlit: 750,
    perforatedFilm: 700,
    posterPaper: 300,
  } as Record<Exclude<WideFormatMaterialType, 'banner'>, number>,
};
