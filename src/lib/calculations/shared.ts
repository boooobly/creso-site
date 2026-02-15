import type { NumericInput, QuantityResolutionInput, QuantityResolutionResult } from './types';

export function parseNumericInput(input: NumericInput): number {
  return typeof input === 'number' ? input : Number(input);
}

export function resolveQuantity(input: QuantityResolutionInput): QuantityResolutionResult {
  const hasCustom = input.customQuantityInput.trim() !== '';
  const parsedCustom = parseNumericInput(input.customQuantityInput);
  const quantity = hasCustom ? parsedCustom : input.presetQuantity;

  return {
    quantity,
    isValid: Number.isFinite(quantity) && quantity >= input.minimumQuantity,
    source: hasCustom ? 'custom' : 'preset',
  };
}

export function parseIntegerInput(input: NumericInput, fallback = 0): number {
  const parsed = Math.trunc(parseNumericInput(input));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function clampMinimum(value: number, minimum: number): number {
  return value < minimum ? minimum : value;
}
