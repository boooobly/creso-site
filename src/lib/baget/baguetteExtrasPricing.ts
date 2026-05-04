import { z } from 'zod';
import defaultsJson from '../../../data/baguette-extras-pricing-defaults.json';
import { prisma } from '@/lib/db/prisma';
import { getFriendlyNumericValidationMessage, parseNumericInput } from '@/lib/admin/pricing-input';
import { loadPricingConfigWithFallback } from '@/lib/pricing/loadPricingConfigWithFallback';
import type { WorkType } from '@/components/baget/BagetFilters';
import type { BagetPrintMaterial } from '@/lib/baget/printRequirement';

export const BAGUETTE_EXTRAS_PRICING_CATEGORY = 'baguette-extra-pricing';

export type RawDefaultEntry = {
  category: string;
  subcategory: string;
  key: string;
  label: string;
  description?: string;
  type: 'number' | 'json';
  unit?: string;
  sortOrder: number;
  value: unknown;
};

export const BAGUETTE_EXTRAS_DEFAULT_ENTRIES = defaultsJson as RawDefaultEntry[];

const nonNegativePriceSchema = z.number().min(0).max(1_000_000);
const positiveDistanceSchema = z.number().positive().max(100);
const positiveAreaSchema = z.number().positive().max(50);
const nonNegativeMinimumPriceSchema = z.number().min(0).max(1_000_000);
const millimeterLimitSchema = z.number().min(0).max(10_000);
const discreteQtySchema = z.number().int().min(1).max(10);

const materialRateSchema = z.object({
  areaPricePerM2: nonNegativePriceSchema,
  cuttingPricePerM: nonNegativePriceSchema,
});

const autoAdditionSchema = z.object({
  pvcType: z.enum(['none', 'pvc3', 'pvc4']),
  addOrabond: z.boolean(),
  forceCardboard: z.boolean(),
  stretchingRequired: z.boolean(),
  removeCardboard: z.boolean(),
});

type MaterialRate = z.infer<typeof materialRateSchema>;
export type AutoAdditionRule = z.infer<typeof autoAdditionSchema>;

export type BaguetteExtrasPricingConfig = {
  hanging: {
    crocodilePrice: number;
    crocodileDoubleThresholdWidthMm: number;
    wirePricePerMeterWidth: number;
    wireLoopPrice: number;
    wireLoopDefaultQty: number;
  };
  stand: {
    price: number;
    maxWidthMm: number;
    maxHeightMm: number;
  };
  print: {
    paperPricePerM2: number;
    canvasPricePerM2: number;
    minimumPrintPriceRUB: number;
    minimumBillableAreaM2: number;
  };
  stretcher: {
    pricesPerMeter: {
      narrow: number;
      wide: number;
    };
    narrowMaxWidthMm: number;
    narrowMaxHeightMm: number;
  };
  stretching: {
    areaRate: number;
    perimeterDividedByAreaRate: number;
  };
  fasteners: {
    clampPrice: number;
    clampStepM: number;
  };
  materials: {
    glass: MaterialRate;
    antiReflectiveGlass: MaterialRate;
    plexiglass: MaterialRate;
    pet1mm: MaterialRate;
    passepartout: MaterialRate;
    cardboard: MaterialRate;
    pvc3: MaterialRate;
    pvc4: MaterialRate;
    orabond: MaterialRate;
  };
  autoAdditions: {
    default: AutoAdditionRule;
    rhinestone: AutoAdditionRule;
    embroidery: AutoAdditionRule;
    beads: AutoAdditionRule;
    photo: AutoAdditionRule;
    stretchedCanvas: AutoAdditionRule;
  };
};

type ConfigKeyMap = Record<string, number | MaterialRate | AutoAdditionRule>;
type FallbackReason = 'missing' | 'invalid';
export type BaguettePricingFallbackItem = { key: string; reason: FallbackReason };
type BuildDiagnostics = {
  fallbackUsedKeys: BaguettePricingFallbackItem[];
};

const BAGUETTE_KEY_SCHEMAS: Record<string, z.ZodTypeAny> = {
  'hanging.crocodile_price': nonNegativePriceSchema,
  'hanging.crocodile_double_threshold_width_mm': millimeterLimitSchema,
  'hanging.wire_price_per_meter_width': nonNegativePriceSchema,
  'hanging.wire_loop_price': nonNegativePriceSchema,
  'hanging.wire_loop_default_qty': discreteQtySchema,
  'stand.stand_price': nonNegativePriceSchema,
  'stand.stand_max_width_mm': millimeterLimitSchema,
  'stand.stand_max_height_mm': millimeterLimitSchema,
  'print.paper_price_per_m2': nonNegativePriceSchema,
  'print.canvas_price_per_m2': nonNegativePriceSchema,
  'print.minimum_print_price_rub': nonNegativeMinimumPriceSchema,
  'print.minimum_billable_area_m2': positiveAreaSchema,
  'stretcher.stretcher_price_per_meter_narrow': nonNegativePriceSchema,
  'stretcher.stretcher_price_per_meter_wide': nonNegativePriceSchema,
  'stretching.stretching_area_rate': nonNegativePriceSchema,
  'stretching.stretching_perimeter_divided_by_area_rate': nonNegativePriceSchema,
  'fasteners.clamp_price': nonNegativePriceSchema,
  'fasteners.clamp_step_m': positiveDistanceSchema,
  'stretcher.stretcher_narrow_max_width_mm': millimeterLimitSchema,
  'stretcher.stretcher_narrow_max_height_mm': millimeterLimitSchema,
  'materials.glass': materialRateSchema,
  'materials.anti_reflective_glass': materialRateSchema,
  'materials.plexiglass': materialRateSchema,
  'materials.pet1mm': materialRateSchema,
  'materials.passepartout': materialRateSchema,
  'materials.cardboard': materialRateSchema,
  'materials.pvc3': materialRateSchema,
  'materials.pvc4': materialRateSchema,
  'materials.orabond': materialRateSchema,
  'auto_additions.default': autoAdditionSchema,
  'auto_additions.rhinestone': autoAdditionSchema,
  'auto_additions.embroidery': autoAdditionSchema,
  'auto_additions.beads': autoAdditionSchema,
  'auto_additions.photo': autoAdditionSchema,
  'auto_additions.stretched_canvas': autoAdditionSchema,
};

function mapDefaultEntries(entries: RawDefaultEntry[]): ConfigKeyMap {
  const mapped: ConfigKeyMap = {};
  for (const entry of entries) {
    mapped[`${entry.subcategory}.${entry.key}`] = entry.value as number | MaterialRate | AutoAdditionRule;
  }
  return mapped;
}

const fallbackValues = mapDefaultEntries(BAGUETTE_EXTRAS_DEFAULT_ENTRIES);
export const BAGUETTE_PRICING_REQUIRED_KEYS = Object.keys(fallbackValues);

export function getBaguettePricingValidationSchema(compositeKey: string): z.ZodTypeAny {
  return BAGUETTE_KEY_SCHEMAS[compositeKey] ?? z.any();
}

export function parseAndValidateBaguettePricingValue(compositeKey: string, type: string, rawValue: string) {
  const parsedInput = type === 'number' ? parseNumericInput(rawValue) : JSON.parse(rawValue);
  const schema = getBaguettePricingValidationSchema(compositeKey);
  const parsed = schema.safeParse(parsedInput);

  if (!parsed.success) {
    if (type === 'number') {
      throw new Error(getFriendlyNumericValidationMessage(rawValue, parsed.error.issues[0]));
    }

    throw new Error(parsed.error.issues[0]?.message ?? 'Проверьте заполнение правила расчёта.');
  }

  return parsed.data as number | MaterialRate | AutoAdditionRule;
}

export function checkBaguettePricingCompleteness(loadedKeys: string[]) {
  const loadedSet = new Set(loadedKeys);
  const missingRequiredKeys = BAGUETTE_PRICING_REQUIRED_KEYS.filter((key) => !loadedSet.has(key));
  const unknownKeys = loadedKeys.filter((key) => !(key in fallbackValues));

  return {
    isComplete: missingRequiredKeys.length === 0,
    missingRequiredKeys,
    unknownKeys,
  };
}

function readWithFallback<T>(
  source: ConfigKeyMap,
  key: string,
  parser: z.ZodType<T>,
  diagnostics: BuildDiagnostics,
): T {
  if (!(key in source)) {
    diagnostics.fallbackUsedKeys.push({ key, reason: 'missing' });
    return parser.parse(fallbackValues[key]);
  }

  const parsed = parser.safeParse(source[key]);
  if (!parsed.success) {
    diagnostics.fallbackUsedKeys.push({ key, reason: 'invalid' });
    return parser.parse(fallbackValues[key]);
  }

  return parsed.data;
}

function buildConfig(source: ConfigKeyMap) {
  const diagnostics: BuildDiagnostics = { fallbackUsedKeys: [] };

  const config: BaguetteExtrasPricingConfig = {
    hanging: {
      crocodilePrice: readWithFallback(source, 'hanging.crocodile_price', nonNegativePriceSchema, diagnostics),
      crocodileDoubleThresholdWidthMm: readWithFallback(source, 'hanging.crocodile_double_threshold_width_mm', millimeterLimitSchema, diagnostics),
      wirePricePerMeterWidth: readWithFallback(source, 'hanging.wire_price_per_meter_width', nonNegativePriceSchema, diagnostics),
      wireLoopPrice: readWithFallback(source, 'hanging.wire_loop_price', nonNegativePriceSchema, diagnostics),
      wireLoopDefaultQty: readWithFallback(source, 'hanging.wire_loop_default_qty', discreteQtySchema, diagnostics),
    },
    stand: {
      price: readWithFallback(source, 'stand.stand_price', nonNegativePriceSchema, diagnostics),
      maxWidthMm: readWithFallback(source, 'stand.stand_max_width_mm', millimeterLimitSchema, diagnostics),
      maxHeightMm: readWithFallback(source, 'stand.stand_max_height_mm', millimeterLimitSchema, diagnostics),
    },
    print: {
      paperPricePerM2: readWithFallback(source, 'print.paper_price_per_m2', nonNegativePriceSchema, diagnostics),
      canvasPricePerM2: readWithFallback(source, 'print.canvas_price_per_m2', nonNegativePriceSchema, diagnostics),
      minimumPrintPriceRUB: (() => {
        const minimumPrintPrice = source['print.minimum_print_price_rub'];
        if (typeof minimumPrintPrice === 'number') {
          const parsed = nonNegativeMinimumPriceSchema.safeParse(minimumPrintPrice);
          if (parsed.success) {
            return parsed.data;
          }
          diagnostics.fallbackUsedKeys.push({ key: 'print.minimum_print_price_rub', reason: 'invalid' });
        } else if (minimumPrintPrice === undefined) {
          diagnostics.fallbackUsedKeys.push({ key: 'print.minimum_print_price_rub', reason: 'missing' });
        }

        return 400;
      })(),
      // Legacy field kept for backward compatibility with existing admin rows.
      minimumBillableAreaM2: readWithFallback(source, 'print.minimum_billable_area_m2', positiveAreaSchema, diagnostics),
    },
    stretcher: {
      pricesPerMeter: {
        narrow: readWithFallback(source, 'stretcher.stretcher_price_per_meter_narrow', nonNegativePriceSchema, diagnostics),
        wide: readWithFallback(source, 'stretcher.stretcher_price_per_meter_wide', nonNegativePriceSchema, diagnostics),
      },
      narrowMaxWidthMm: readWithFallback(source, 'stretcher.stretcher_narrow_max_width_mm', millimeterLimitSchema, diagnostics),
      narrowMaxHeightMm: readWithFallback(source, 'stretcher.stretcher_narrow_max_height_mm', millimeterLimitSchema, diagnostics),
    },
    stretching: {
      areaRate: readWithFallback(source, 'stretching.stretching_area_rate', nonNegativePriceSchema, diagnostics),
      perimeterDividedByAreaRate: readWithFallback(source, 'stretching.stretching_perimeter_divided_by_area_rate', nonNegativePriceSchema, diagnostics),
    },
    fasteners: {
      clampPrice: readWithFallback(source, 'fasteners.clamp_price', nonNegativePriceSchema, diagnostics),
      clampStepM: readWithFallback(source, 'fasteners.clamp_step_m', positiveDistanceSchema, diagnostics),
    },
    materials: {
      glass: readWithFallback(source, 'materials.glass', materialRateSchema, diagnostics),
      antiReflectiveGlass: readWithFallback(source, 'materials.anti_reflective_glass', materialRateSchema, diagnostics),
      plexiglass: readWithFallback(source, 'materials.plexiglass', materialRateSchema, diagnostics),
      pet1mm: readWithFallback(source, 'materials.pet1mm', materialRateSchema, diagnostics),
      passepartout: readWithFallback(source, 'materials.passepartout', materialRateSchema, diagnostics),
      cardboard: readWithFallback(source, 'materials.cardboard', materialRateSchema, diagnostics),
      pvc3: readWithFallback(source, 'materials.pvc3', materialRateSchema, diagnostics),
      pvc4: readWithFallback(source, 'materials.pvc4', materialRateSchema, diagnostics),
      orabond: readWithFallback(source, 'materials.orabond', materialRateSchema, diagnostics),
    },
    autoAdditions: {
      default: readWithFallback(source, 'auto_additions.default', autoAdditionSchema, diagnostics),
      rhinestone: readWithFallback(source, 'auto_additions.rhinestone', autoAdditionSchema, diagnostics),
      embroidery: readWithFallback(source, 'auto_additions.embroidery', autoAdditionSchema, diagnostics),
      beads: readWithFallback(source, 'auto_additions.beads', autoAdditionSchema, diagnostics),
      photo: readWithFallback(source, 'auto_additions.photo', autoAdditionSchema, diagnostics),
      stretchedCanvas: readWithFallback(source, 'auto_additions.stretched_canvas', autoAdditionSchema, diagnostics),
    },
  };

  return { config, diagnostics };
}

function mapRowsToValues(rows: Array<{ subcategory: string; key: string; value: unknown }>): ConfigKeyMap {
  return rows.reduce<ConfigKeyMap>((acc, row) => {
    acc[`${row.subcategory}.${row.key}`] = row.value as number | MaterialRate | AutoAdditionRule;
    return acc;
  }, {});
}

export function getBaguetteExtrasDefaultConfig(): BaguetteExtrasPricingConfig {
  return buildConfig(fallbackValues).config;
}

export async function getBaguetteExtrasPricingConfig() {
  return loadPricingConfigWithFallback({
    label: 'baguette-pricing',
    loadRows: () => prisma.pricingEntry.findMany({
      where: {
        category: BAGUETTE_EXTRAS_PRICING_CATEGORY,
        isActive: true,
      },
      select: {
        subcategory: true,
        key: true,
        value: true,
      },
    }),
    buildFromRows: getBaguetteExtrasPricingConfigFromRows,
  });
}

export function getBaguetteExtrasPricingConfigFromRows(rows: Array<{ subcategory: string; key: string; value: unknown }>) {
  const source = mapRowsToValues(rows);
  const loadedKeys = Object.keys(source);
  const { config, diagnostics } = buildConfig(source);
  const completeness = checkBaguettePricingCompleteness(loadedKeys);

  if (diagnostics.fallbackUsedKeys.length > 0) {
    const fallbackSummary = diagnostics.fallbackUsedKeys
      .map((item) => `${item.key} (${item.reason})`)
      .join(', ');
    console.warn(`[baguette-pricing] Fallback defaults are used for keys: ${fallbackSummary}`);
  }

  if (!completeness.isComplete) {
    console.warn(`[baguette-pricing] Missing required admin keys: ${completeness.missingRequiredKeys.join(', ')}`);
  }

  if (completeness.unknownKeys.length > 0) {
    console.warn(`[baguette-pricing] Unknown baguette pricing keys found in DB: ${completeness.unknownKeys.join(', ')}`);
  }

  return {
    config,
    loadedKeys,
    fallbackUsedKeys: diagnostics.fallbackUsedKeys,
    missingKeys: completeness.missingRequiredKeys,
    unknownKeys: completeness.unknownKeys,
    isComplete: completeness.isComplete,
  };
}

export function getBaguettePrintPricePerM2(material: BagetPrintMaterial, config: BaguetteExtrasPricingConfig): number {
  return material === 'paper' ? config.print.paperPricePerM2 : config.print.canvasPricePerM2;
}

export function resolveAutoAdditionsFromConfig(workType: WorkType, config: BaguetteExtrasPricingConfig): AutoAdditionRule {
  if (workType === 'rhinestone') return config.autoAdditions.rhinestone;
  if (workType === 'embroidery') return config.autoAdditions.embroidery;
  if (workType === 'beads') return config.autoAdditions.beads;
  if (workType === 'photo') return config.autoAdditions.photo;
  if (workType === 'stretchedCanvas') return config.autoAdditions.stretchedCanvas;
  return config.autoAdditions.default;
}
