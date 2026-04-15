import { logger } from '@/lib/logger';

const warnedPricingFallbackLabels = new Set<string>();

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return 'Unknown database error';
}

export async function loadPricingConfigWithFallback<Row, Result>(options: {
  label: string;
  loadRows: () => Promise<Row[]>;
  buildFromRows: (rows: Row[]) => Result;
  fallbackRows?: Row[];
}) {
  try {
    const rows = await options.loadRows();
    return options.buildFromRows(rows);
  } catch (error) {
    if (!warnedPricingFallbackLabels.has(options.label)) {
      warnedPricingFallbackLabels.add(options.label);
      logger.warn('pricing.config.load_fallback', {
        label: options.label,
        reason: getErrorMessage(error),
      });
    }

    return options.buildFromRows(options.fallbackRows ?? []);
  }
}
