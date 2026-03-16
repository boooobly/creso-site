import { z } from 'zod';
import defaultsJson from '../../../data/baguette-extras-pricing-defaults.json';
import { prisma } from '@/lib/db/prisma';
import type { WorkType } from '@/components/baget/BagetFilters';

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

function mapDefaultEntries(entries: RawDefaultEntry[]): ConfigKeyMap {
  const mapped: ConfigKeyMap = {};
  for (const entry of entries) {
    mapped[`${entry.subcategory}.${entry.key}`] = entry.value as number | MaterialRate | AutoAdditionRule;
  }
  return mapped;
}

const fallbackValues = mapDefaultEntries(BAGUETTE_EXTRAS_DEFAULT_ENTRIES);

function readNumber(source: ConfigKeyMap, key: string): number {
  const parsed = z.number().nonnegative().safeParse(source[key]);
  const fallback = z.number().nonnegative().parse(fallbackValues[key]);
  return parsed.success ? parsed.data : fallback;
}

function readMaterialRate(source: ConfigKeyMap, key: string): MaterialRate {
  const parsed = materialRateSchema.safeParse(source[key]);
  const fallback = materialRateSchema.parse(fallbackValues[key]);
  return parsed.success ? parsed.data : fallback;
}

function readAutoAddition(source: ConfigKeyMap, key: string): AutoAdditionRule {
  const parsed = autoAdditionSchema.safeParse(source[key]);
  const fallback = autoAdditionSchema.parse(fallbackValues[key]);
  return parsed.success ? parsed.data : fallback;
}

export function getBaguetteExtrasDefaultConfig(): BaguetteExtrasPricingConfig {
  return buildConfig(fallbackValues);
}

function buildConfig(source: ConfigKeyMap): BaguetteExtrasPricingConfig {
  return {
    hanging: {
      crocodilePrice: readNumber(source, 'hanging.crocodile_price'),
      crocodileDoubleThresholdWidthMm: readNumber(source, 'hanging.crocodile_double_threshold_width_mm'),
      wirePricePerMeterWidth: readNumber(source, 'hanging.wire_price_per_meter_width'),
      wireLoopPrice: readNumber(source, 'hanging.wire_loop_price'),
      wireLoopDefaultQty: Math.max(1, Math.round(readNumber(source, 'hanging.wire_loop_default_qty'))),
    },
    stand: {
      price: readNumber(source, 'stand.stand_price'),
      maxWidthMm: readNumber(source, 'stand.stand_max_width_mm'),
      maxHeightMm: readNumber(source, 'stand.stand_max_height_mm'),
    },
    stretcher: {
      pricesPerMeter: {
        narrow: readNumber(source, 'stretcher.stretcher_price_per_meter_narrow'),
        wide: readNumber(source, 'stretcher.stretcher_price_per_meter_wide'),
      },
      narrowMaxWidthMm: readNumber(source, 'stretcher.stretcher_narrow_max_width_mm'),
      narrowMaxHeightMm: readNumber(source, 'stretcher.stretcher_narrow_max_height_mm'),
    },
    materials: {
      glass: readMaterialRate(source, 'materials.glass'),
      antiReflectiveGlass: readMaterialRate(source, 'materials.anti_reflective_glass'),
      plexiglass: readMaterialRate(source, 'materials.plexiglass'),
      pet1mm: readMaterialRate(source, 'materials.pet1mm'),
      passepartout: readMaterialRate(source, 'materials.passepartout'),
      cardboard: readMaterialRate(source, 'materials.cardboard'),
      pvc3: readMaterialRate(source, 'materials.pvc3'),
      pvc4: readMaterialRate(source, 'materials.pvc4'),
      orabond: readMaterialRate(source, 'materials.orabond'),
    },
    autoAdditions: {
      default: readAutoAddition(source, 'auto_additions.default'),
      rhinestone: readAutoAddition(source, 'auto_additions.rhinestone'),
      embroidery: readAutoAddition(source, 'auto_additions.embroidery'),
      beads: readAutoAddition(source, 'auto_additions.beads'),
      photo: readAutoAddition(source, 'auto_additions.photo'),
      stretchedCanvas: readAutoAddition(source, 'auto_additions.stretched_canvas'),
    },
  };
}

function mapRowsToValues(rows: Array<{ subcategory: string; key: string; value: unknown }>): ConfigKeyMap {
  return rows.reduce<ConfigKeyMap>((acc, row) => {
    acc[`${row.subcategory}.${row.key}`] = row.value as number | MaterialRate | AutoAdditionRule;
    return acc;
  }, {});
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
  const config = buildConfig({ ...fallbackValues, ...source });

  return {
    config,
    loadedKeys: Object.keys(source),
  };
}

export function resolveAutoAdditionsFromConfig(workType: WorkType, config: BaguetteExtrasPricingConfig): AutoAdditionRule {
  if (workType === 'rhinestone') return config.autoAdditions.rhinestone;
  if (workType === 'embroidery') return config.autoAdditions.embroidery;
  if (workType === 'beads') return config.autoAdditions.beads;
  if (workType === 'photo') return config.autoAdditions.photo;
  if (workType === 'stretchedCanvas') return config.autoAdditions.stretchedCanvas;
  return config.autoAdditions.default;
}

export function isBaguetteExtrasConfigEntry(category: string) {
  return category === BAGUETTE_EXTRAS_PRICING_CATEGORY;
}
