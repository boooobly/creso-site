import { z } from 'zod';
import defaultsJson from '../../../data/baguette-extras-pricing-defaults.json';
import { prisma } from '@/lib/db/prisma';
import type { WorkType } from '@/components/baget/BagetFilters';
import type { BagetPrintMaterial } from '@/lib/baget/printRequirement';

export const BAGUETTE_EXTRAS_PRICING_CATEGORY = 'baguette-extra-pricing';

type RawDefaultEntry = {
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

const materialRateSchema = z.object({
  areaPricePerM2: z.number().nonnegative(),
  cuttingPricePerM: z.number().nonnegative(),
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
type BuildDiagnostics = {
  fallbackUsedKeys: Array<{ key: string; reason: FallbackReason }>;
};

function mapDefaultEntries(entries: RawDefaultEntry[]): ConfigKeyMap {
  const mapped: ConfigKeyMap = {};
  for (const entry of entries) {
    mapped[`${entry.subcategory}.${entry.key}`] = entry.value as number | MaterialRate | AutoAdditionRule;
  }
  return mapped;
}

const fallbackValues = mapDefaultEntries(BAGUETTE_EXTRAS_DEFAULT_ENTRIES);
const allDefaultKeys = Object.keys(fallbackValues);

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
      crocodilePrice: readWithFallback(source, 'hanging.crocodile_price', z.number().nonnegative(), diagnostics),
      crocodileDoubleThresholdWidthMm: readWithFallback(source, 'hanging.crocodile_double_threshold_width_mm', z.number().nonnegative(), diagnostics),
      wirePricePerMeterWidth: readWithFallback(source, 'hanging.wire_price_per_meter_width', z.number().nonnegative(), diagnostics),
      wireLoopPrice: readWithFallback(source, 'hanging.wire_loop_price', z.number().nonnegative(), diagnostics),
      wireLoopDefaultQty: Math.max(1, Math.round(readWithFallback(source, 'hanging.wire_loop_default_qty', z.number().nonnegative(), diagnostics))),
    },
    stand: {
      price: readWithFallback(source, 'stand.stand_price', z.number().nonnegative(), diagnostics),
      maxWidthMm: readWithFallback(source, 'stand.stand_max_width_mm', z.number().nonnegative(), diagnostics),
      maxHeightMm: readWithFallback(source, 'stand.stand_max_height_mm', z.number().nonnegative(), diagnostics),
    },
    print: {
      paperPricePerM2: readWithFallback(source, 'print.paper_price_per_m2', z.number().nonnegative(), diagnostics),
      canvasPricePerM2: readWithFallback(source, 'print.canvas_price_per_m2', z.number().nonnegative(), diagnostics),
      minimumBillableAreaM2: readWithFallback(source, 'print.minimum_billable_area_m2', z.number().positive(), diagnostics),
    },
    stretcher: {
      pricesPerMeter: {
        narrow: readWithFallback(source, 'stretcher.stretcher_price_per_meter_narrow', z.number().nonnegative(), diagnostics),
        wide: readWithFallback(source, 'stretcher.stretcher_price_per_meter_wide', z.number().nonnegative(), diagnostics),
      },
      narrowMaxWidthMm: readWithFallback(source, 'stretcher.stretcher_narrow_max_width_mm', z.number().nonnegative(), diagnostics),
      narrowMaxHeightMm: readWithFallback(source, 'stretcher.stretcher_narrow_max_height_mm', z.number().nonnegative(), diagnostics),
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
  const rows = await prisma.pricingEntry.findMany({
    where: {
      category: BAGUETTE_EXTRAS_PRICING_CATEGORY,
      isActive: true,
    },
    select: {
      subcategory: true,
      key: true,
      value: true,
    },
  });

  const source = mapRowsToValues(rows);
  const { config, diagnostics } = buildConfig(source);

  if (diagnostics.fallbackUsedKeys.length > 0) {
    const fallbackSummary = diagnostics.fallbackUsedKeys
      .map((item) => `${item.key} (${item.reason})`)
      .join(', ');
    console.warn(`[baguette-pricing] Fallback defaults are used for keys: ${fallbackSummary}`);
  }

  return {
    config,
    loadedKeys: Object.keys(source),
    fallbackUsedKeys: diagnostics.fallbackUsedKeys,
    missingKeys: allDefaultKeys.filter((key) => !(key in source)),
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
