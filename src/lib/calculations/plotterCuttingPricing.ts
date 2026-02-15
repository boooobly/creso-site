import { PLOTTER_CUTTING_PRICING_CONFIG } from '@/lib/pricing-config/plotterCutting';
import { parseNumericInput } from './shared';

export type PlotterCuttingPricingInput = {
  cutLengthInput: string;
  areaInput: string;
  complexity: number;
  weeding: boolean;
  mountingFilm: boolean;
  transfer: boolean;
  urgent: boolean;
};

export type PlotterCuttingCalculationResult = {
  cutLength: number;
  area: number;
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
  const cutLength = parseNumericInput(input.cutLengthInput);
  const area = parseNumericInput(input.areaInput);

  const valuesValid = Number.isFinite(cutLength) && Number.isFinite(area);
  const positiveValues = cutLength >= 0 && area >= 0;

  const baseCost = valuesValid && positiveValues ? cutLength * PLOTTER_CUTTING_PRICING_CONFIG.baseCutPricePerMeter * input.complexity : 0;
  const weedingCost = input.weeding && valuesValid && positiveValues
    ? cutLength * PLOTTER_CUTTING_PRICING_CONFIG.weedingPricePerMeter
    : 0;
  const mountingFilmCost = input.mountingFilm && valuesValid && positiveValues
    ? area * PLOTTER_CUTTING_PRICING_CONFIG.mountingFilmPricePerSquareMeter
    : 0;
  const transferCost = input.transfer ? PLOTTER_CUTTING_PRICING_CONFIG.transferPrice : 0;

  const extrasCost = weedingCost + mountingFilmCost + transferCost;
  const subtotal = baseCost + extrasCost;
  const urgentTotal = input.urgent ? subtotal * PLOTTER_CUTTING_PRICING_CONFIG.urgentMultiplier : subtotal;
  const minimumApplied = urgentTotal > 0 && urgentTotal < PLOTTER_CUTTING_PRICING_CONFIG.minimumOrderTotal;

  return {
    cutLength,
    area,
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
    totalCost: minimumApplied ? PLOTTER_CUTTING_PRICING_CONFIG.minimumOrderTotal : urgentTotal,
  };
}
