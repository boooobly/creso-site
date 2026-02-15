export const PLOTTER_MATERIAL_OPTIONS = [
  { value: 'selfAdhesive', label: 'Самоклеящаяся плёнка' },
  { value: 'oracal', label: 'Оракал (цветная плёнка)' },
] as const;

export const PLOTTER_COMPLEXITY_OPTIONS = [
  { value: 1, label: 'Простая (1.0)' },
  { value: 1.3, label: 'Средняя (1.3)' },
  { value: 1.6, label: 'Сложная (1.6)' },
] as const;

export const PLOTTER_CUTTING_PRICING_CONFIG = {
  baseCutPricePerMeter: 30,
  weedingPricePerMeter: 15,
  mountingFilmPricePerSquareMeter: 100,
  transferPrice: 300,
  urgentMultiplier: 1.3,
  minimumOrderTotal: 400,
};
