export const PLOTTER_MATERIAL_OPTIONS = [
  { value: 'selfAdhesive', label: 'Самоклеящаяся плёнка' },
  { value: 'oracal', label: 'Оракал (цветная плёнка)' },
] as const;

export const PLOTTER_COMPLEXITY_OPTIONS = [
  { value: 1, label: 'Простая (1.0)' },
  { value: 1.3, label: 'Средняя (1.3)' },
  { value: 1.6, label: 'Сложная (1.6)' },
] as const;

export type PlotterMaterialType = typeof PLOTTER_MATERIAL_OPTIONS[number]['value'];

export type PlotterCuttingPricingInput = {
  cutLength: number;
  area: number;
  complexity: number;
  weeding: boolean;
  mountingFilm: boolean;
  transfer: boolean;
  urgent: boolean;
};

export type PlotterCuttingCalculationResult = {
  valuesValid: boolean;
  positiveValues: boolean;
  baseCost: number;
  weedingCost: number;
  mountingFilmCost: number;
  transferCost: number;
  extrasCost: number;
  subtotal: number;
  urgentTotal: number;
  minimumApplied: boolean;
  totalCost: number;
};

export function calculatePlotterCuttingPricing(input: PlotterCuttingPricingInput): PlotterCuttingCalculationResult {
  const valuesValid = Number.isFinite(input.cutLength) && Number.isFinite(input.area);
  const positiveValues = input.cutLength >= 0 && input.area >= 0;

  const baseCost = valuesValid && positiveValues ? input.cutLength * 30 * input.complexity : 0;
  const weedingCost = input.weeding && valuesValid && positiveValues ? input.cutLength * 15 : 0;
  const mountingFilmCost = input.mountingFilm && valuesValid && positiveValues ? input.area * 100 : 0;
  const transferCost = input.transfer ? 300 : 0;
  const extrasCost = weedingCost + mountingFilmCost + transferCost;
  const subtotal = baseCost + extrasCost;
  const urgentTotal = input.urgent ? subtotal * 1.3 : subtotal;

  const minimumApplied = urgentTotal > 0 && urgentTotal < 400;
  const totalCost = minimumApplied ? 400 : urgentTotal;

  return {
    valuesValid,
    positiveValues,
    baseCost,
    weedingCost,
    mountingFilmCost,
    transferCost,
    extrasCost,
    subtotal,
    urgentTotal,
    minimumApplied,
    totalCost,
  };
}
