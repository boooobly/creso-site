import { Prisma } from '@prisma/client';
import { z } from 'zod';
import defaultsJson from '../../../data/wide-format-pricing-defaults.json';
import { prisma } from '@/lib/db/prisma';
import { getFriendlyNumericValidationMessage, parseNumericInput } from '@/lib/admin/pricing-input';
import { ensurePricingEntries } from '@/lib/admin/pricing-defaults';
import { loadPricingConfigWithFallback } from '@/lib/pricing/loadPricingConfigWithFallback';
import type { WideFormatMaterialType } from '@/lib/calculations/types';
import {
  WIDE_FORMAT_PRICING_FALLBACK_CONFIG,
  type WideFormatPricingConfig,
} from '@/lib/pricing-config/wideFormat';

export { WIDE_FORMAT_PRICING_FALLBACK_CONFIG };

export const WIDE_FORMAT_PRICING_CATEGORY = 'wide-format-pricing';

export type RawWideFormatDefaultEntry = {
  category: string;
  subcategory: string;
  key: string;
  label: string;
  description?: string;
  type: 'number' | 'boolean';
  unit?: string;
  sortOrder: number;
  value: number | boolean;
};

export const WIDE_FORMAT_DEFAULT_ENTRIES = defaultsJson as RawWideFormatDefaultEntry[];

const MATERIAL_KEYS: ReadonlyArray<WideFormatMaterialType> = [
  'banner_240_gloss_3_2m',
  'banner_340_matte_3_2m',
  'banner_440_matte_3_2m',
  'banner_460_cast_3_2m',
  'self_adhesive_film_matte_1_5',
  'self_adhesive_film_gloss_1_5',
  'perforated_film_1_37',
  'clear_film_matte_1_5',
  'paper_trans_skylight',
  'backlit_1_07',
  'fxflex_translucent_banner_1_07',
  'polyester_fabric_140_1_5',
  'polyester_fabric_100_0_9',
  'canvas_cotton_350',
  'canvas_poly_250',
] as const;

const nonNegativeSchema = z.number().min(0).max(1_000_000);
const percentSchema = z.number().min(0).max(5);
const booleanSchema = z.boolean();

const WIDE_FORMAT_KEY_SCHEMAS: Record<string, z.ZodTypeAny> = {
  'global.max_width': z.number().positive().max(10),
  'global.banner_join_seam_width_threshold': z.number().positive().max(10),
  'global.edge_gluing_perimeter_price': nonNegativeSchema,
  'global.image_welding_perimeter_price': nonNegativeSchema,
  'global.grommet_price': nonNegativeSchema,
  'global.grommet_step_m': z.number().positive().max(5),
  'global.plotter_cut_perimeter_price': nonNegativeSchema,
  'global.plotter_cut_minimum_fee': nonNegativeSchema,
  'global.positioning_marks_cut_percent': percentSchema,
  'global.minimum_print_price_rub': nonNegativeSchema,
};

for (const material of MATERIAL_KEYS) {
  WIDE_FORMAT_KEY_SCHEMAS[`price_per_m2.${material}`] = nonNegativeSchema;
  WIDE_FORMAT_KEY_SCHEMAS[`max_width_by_material.${material}`] = z.number().positive().max(10);
  WIDE_FORMAT_KEY_SCHEMAS[`visibility_in_constructor.${material}`] = booleanSchema;
}

type ConfigValueMap = Record<string, unknown>;
type FallbackReason = 'missing' | 'invalid';
export type WideFormatPricingFallbackItem = { key: string; reason: FallbackReason };

function mapDefaults(entries: RawWideFormatDefaultEntry[]): ConfigValueMap {
  return entries.reduce<ConfigValueMap>((acc, entry) => {
    acc[`${entry.subcategory}.${entry.key}`] = entry.value;
    return acc;
  }, {});
}

const fallbackValues = mapDefaults(WIDE_FORMAT_DEFAULT_ENTRIES);
export const WIDE_FORMAT_REQUIRED_KEYS = Object.keys(fallbackValues);

function readWithFallback<T>(
  source: ConfigValueMap,
  compositeKey: string,
  diagnostics: WideFormatPricingFallbackItem[],
): T {
  const schema = WIDE_FORMAT_KEY_SCHEMAS[compositeKey] ?? nonNegativeSchema;
  const parsed = schema.safeParse(source[compositeKey]);
  if (parsed.success) return parsed.data as T;

  diagnostics.push({ key: compositeKey, reason: compositeKey in source ? 'invalid' : 'missing' });
  const fallbackParsed = schema.safeParse(fallbackValues[compositeKey]);
  if (fallbackParsed.success) return fallbackParsed.data as T;

  throw new Error(`[wide-format-pricing] invalid fallback for key ${compositeKey}`);
}

function mapRowsToValues(rows: Array<{ subcategory: string; key: string; value: unknown }>): ConfigValueMap {
  return rows.reduce<ConfigValueMap>((acc, row) => {
    acc[`${row.subcategory}.${row.key}`] = row.value;
    return acc;
  }, {});
}

function buildConfig(source: ConfigValueMap) {
  const diagnostics: WideFormatPricingFallbackItem[] = [];

  const pricesRUBPerM2 = MATERIAL_KEYS.reduce<Record<WideFormatMaterialType, number>>((acc, material) => {
    acc[material] = readWithFallback<number>(source, `price_per_m2.${material}`, diagnostics);
    return acc;
  }, {} as Record<WideFormatMaterialType, number>);

  const maxWidthByMaterial = MATERIAL_KEYS.reduce<Record<WideFormatMaterialType, number>>((acc, material) => {
    acc[material] = readWithFallback<number>(source, `max_width_by_material.${material}`, diagnostics);
    return acc;
  }, {} as Record<WideFormatMaterialType, number>);

  const visibleInConstructorByMaterial = MATERIAL_KEYS.reduce<Record<WideFormatMaterialType, boolean>>((acc, material) => {
    acc[material] = readWithFallback<boolean>(source, `visibility_in_constructor.${material}`, diagnostics);
    return acc;
  }, {} as Record<WideFormatMaterialType, boolean>);

  const config: WideFormatPricingConfig = {
    maxWidth: readWithFallback<number>(source, 'global.max_width', diagnostics),
    bannerJoinSeamWidthThreshold: readWithFallback<number>(source, 'global.banner_join_seam_width_threshold', diagnostics),
    edgeGluingPerimeterPrice: readWithFallback<number>(source, 'global.edge_gluing_perimeter_price', diagnostics),
    imageWeldingPerimeterPrice: readWithFallback<number>(source, 'global.image_welding_perimeter_price', diagnostics),
    grommetPrice: readWithFallback<number>(source, 'global.grommet_price', diagnostics),
    grommetStepM: readWithFallback<number>(source, 'global.grommet_step_m', diagnostics),
    plotterCutPerimeterPrice: readWithFallback<number>(source, 'global.plotter_cut_perimeter_price', diagnostics),
    plotterCutMinimumFee: readWithFallback<number>(source, 'global.plotter_cut_minimum_fee', diagnostics),
    positioningMarksCutPercent: readWithFallback<number>(source, 'global.positioning_marks_cut_percent', diagnostics),
    minimumPrintPriceRUB: readWithFallback<number>(source, 'global.minimum_print_price_rub', diagnostics),
    pricesRUBPerM2,
    maxWidthByMaterial,
    visibleInConstructorByMaterial,
  };

  return { config, fallbackUsedKeys: diagnostics };
}

export async function ensureWideFormatPricingEntries() {
  await ensurePricingEntries(
    WIDE_FORMAT_DEFAULT_ENTRIES.map((entry) => ({
      ...entry,
      value: entry.value as Prisma.InputJsonValue,
    }))
  );
}

function parseBooleanInput(rawValue: string) {
  const normalized = rawValue.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'on') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'off' || normalized === '') return false;
  throw new Error('Выберите, показывать ли материал в конструкторе.');
}

export function parseAndValidateWideFormatPricingValue(compositeKey: string, rawValue: string) {
  const schema = WIDE_FORMAT_KEY_SCHEMAS[compositeKey] ?? nonNegativeSchema;

  if (schema === booleanSchema) {
    return parseBooleanInput(rawValue);
  }

  const parsedValue = parseNumericInput(rawValue);
  const parsed = schema.safeParse(parsedValue);

  if (!parsed.success) {
    throw new Error(getFriendlyNumericValidationMessage(rawValue, parsed.error.issues[0]));
  }

  return parsed.data;
}

export function isWideFormatMaterialVisibleInConstructor(
  material: WideFormatMaterialType,
  config: Pick<WideFormatPricingConfig, 'visibleInConstructorByMaterial'>,
) {
  return config.visibleInConstructorByMaterial[material] ?? true;
}

export function getVisibleWideFormatMaterials(
  config: Pick<WideFormatPricingConfig, 'visibleInConstructorByMaterial'>,
): WideFormatMaterialType[] {
  return MATERIAL_KEYS.filter((material) => isWideFormatMaterialVisibleInConstructor(material, config));
}

export async function getWideFormatPricingConfig() {
  return loadPricingConfigWithFallback({
    label: 'wide-format-pricing',
    loadRows: () => prisma.pricingEntry.findMany({
      where: {
        category: WIDE_FORMAT_PRICING_CATEGORY,
        isActive: true,
      },
      select: {
        subcategory: true,
        key: true,
        value: true,
      },
    }),
    buildFromRows: getWideFormatPricingConfigFromRows,
  });
}

export function getWideFormatPricingConfigFromRows(rows: Array<{ subcategory: string; key: string; value: unknown }>) {
  const source = mapRowsToValues(rows);
  const loadedKeys = Object.keys(source);
  const { config, fallbackUsedKeys } = buildConfig(source);

  const loadedSet = new Set(loadedKeys);
  const missingKeys = WIDE_FORMAT_REQUIRED_KEYS.filter((key) => !loadedSet.has(key));
  const unknownKeys = loadedKeys.filter((key) => !(key in fallbackValues));

  if (fallbackUsedKeys.length > 0) {
    const summary = fallbackUsedKeys.map((item) => `${item.key} (${item.reason})`).join(', ');
    console.warn(`[wide-format-pricing] Fallback defaults are used for keys: ${summary}`);
  }

  return {
    config,
    loadedKeys,
    fallbackUsedKeys,
    missingKeys,
    unknownKeys,
    isComplete: missingKeys.length === 0,
  };
}

export async function updateWideFormatPricingEntry(entryId: string, rawValue: string, note?: string) {
  const entry = await prisma.pricingEntry.findUnique({ where: { id: entryId } });
  if (!entry) throw new Error('Позиция не найдена.');
  if (entry.category !== WIDE_FORMAT_PRICING_CATEGORY) {
    throw new Error('Разрешено редактировать только конфигурацию широкоформатной печати.');
  }

  const compositeKey = `${entry.subcategory}.${entry.key}`;
  const newValue = parseAndValidateWideFormatPricingValue(compositeKey, rawValue) as Prisma.InputJsonValue;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.pricingEntry.update({ where: { id: entry.id }, data: { value: newValue } });
    await tx.pricingEntryHistory.create({
      data: {
        pricingEntryId: entry.id,
        category: entry.category,
        subcategory: entry.subcategory,
        key: entry.key,
        oldValue: entry.value === null ? Prisma.JsonNull : (entry.value as Prisma.InputJsonValue),
        newValue,
        note: note?.trim() || null,
      },
    });
    return updated;
  });
}

export async function listWideFormatPricingAdminData() {
  await ensureWideFormatPricingEntries();
  const [entries, histories] = await Promise.all([
    prisma.pricingEntry.findMany({
      where: { category: WIDE_FORMAT_PRICING_CATEGORY },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    }),
    prisma.pricingEntryHistory.findMany({
      where: { category: WIDE_FORMAT_PRICING_CATEGORY },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);
  const runtimeConfig = getWideFormatPricingConfigFromRows(entries);

  const descriptionByCompositeKey = WIDE_FORMAT_DEFAULT_ENTRIES.reduce<Record<string, string>>((acc, entry) => {
    acc[`${entry.subcategory}.${entry.key}`] = entry.description ?? '';
    return acc;
  }, {});

  const entriesWithDescription = entries.map((entry) => ({
    ...entry,
    description: descriptionByCompositeKey[`${entry.subcategory}.${entry.key}`] ?? '',
  }));

  const sections = [
    { id: 'global', title: 'Общие правила расчёта', description: 'Минимальный чек, наценки и ставки доп. работ.', subcategory: 'global' },
    { id: 'price_per_m2', title: 'Цены материалов за м²', description: 'Тариф печати для каждого материала.', subcategory: 'price_per_m2' },
    { id: 'visibility_in_constructor', title: 'Показ материалов в конструкторе', description: 'Включайте только те материалы, которые должны видеть клиенты в публичном конструкторе.', subcategory: 'visibility_in_constructor' },
    { id: 'max_width_by_material', title: 'Максимальная ширина рулона', description: 'Ограничения для проверки размеров.', subcategory: 'max_width_by_material' },
  ] as const;

  return {
    histories,
    fallbackUsedKeys: runtimeConfig.fallbackUsedKeys,
    missingKeys: runtimeConfig.missingKeys,
    unknownKeys: runtimeConfig.unknownKeys,
    isComplete: runtimeConfig.isComplete,
    groupedSections: sections.map((section) => ({
      ...section,
      entries: entriesWithDescription.filter((entry) => entry.subcategory === section.subcategory),
    })),
  };
}
