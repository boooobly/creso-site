import { parseNumericInput } from './shared';
import type { BagetInputValidation } from './types';

export function validateBagetDimensions(widthInput: string, heightInput: string): BagetInputValidation {
  const width = parseNumericInput(widthInput);
  const height = parseNumericInput(heightInput);
  const inputsFilled = widthInput !== '' && heightInput !== '';

  const isValid = inputsFilled && Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0;

  return {
    inputsFilled,
    isValid,
    width,
    height,
  };
}

export function calculateRequiredBagetLength(width: number, height: number, isValid: boolean): number | null {
  if (!isValid) return null;
  return (width + height) * 2;
}

export function isBaguetteSuitable(availableLength: number, requiredLength: number | null): boolean {
  return requiredLength !== null && availableLength >= requiredLength;
}
