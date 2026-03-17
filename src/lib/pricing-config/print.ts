import type { PrintProductType } from '@/lib/calculations/types';

export const PRINT_SIZE_OPTIONS: Record<PrintProductType, readonly string[]> = {
  cards: ['90x50', '85x55'],
  flyers: ['A6', 'A5'],
};

export const PRINT_QUANTITY_PRESETS = [100, 500, 1000] as const;
