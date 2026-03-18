import { Prisma } from '@prisma/client';
import { z } from 'zod';
import defaultsJson from '../../../data/plotter-cutting-pricing-defaults.json';
import { prisma } from '@/lib/db/prisma';
import { getFriendlyNumericValidationMessage, parseNumericInput } from '@/lib/admin/pricing-input';
import { ensurePricingEntries } from '@/lib/admin/pricing-defaults';
import type { PlotterCuttingPricingConfig } from '@/lib/pricing-config/plotterCutting';

export const PLOTTER_CUTTING_PRICING_CATEGORY = 'plotter-cutting-pricing';

type RawPlotterCuttingDefaultEntry = {
  category: string;
  subcategory: string;
  key: string;
  label: string;
  description?: string;
  type: 'number';
  unit?: string;
  sortOrder: number;
  value: number;
};

const PLOTTER_CUTTING_DEFAULT_ENTRIES = defaultsJson as RawPlotterCuttingDefaultEntry[];

const nonNegativeSchema = z.number().min(0).max(1_000_000);

const PLOTTER_CUTTING_KEY_SCHEMAS: Record<string, z.ZodTypeAny> = {
  'global.base_cut_price_per_meter': nonNegativeSchema,
  'global.weeding_price_per_meter': nonNegativeSchema,
  'global.mounting_film_price_per_square_meter': nonNegativeSchema,
  'global.transfer_price': nonNegativeSchema,
  'global.urgent_multiplier': z.number().min(1).max(5),
  'global.minimum_order_total': nonNegativeSchema,
};

type ConfigKeyMap = Record<string, number>;
type FallbackReason = 'missing' | 'invalid';
export type PlotterCuttingPricingFallbackItem = { key: string; reason: FallbackReason };

function mapDefaults(entries: RawPlotterCuttingDefaultEntry[]): ConfigKeyMap {
  return entries.reduce<ConfigKeyMap>((acc, entry) => {
    acc[`${entry.subcategory}.${entry.key}`] = entry.value;
    return acc;
  }, {});
}

const fallbackValues = mapDefaults(PLOTTER_CUTTING_DEFAULT_ENTRIES);
export const PLOTTER_CUTTING_REQUIRED_KEYS = Object.keys(fallbackValues);

function readWithFallback(source: ConfigKeyMap, compositeKey: string, diagnostics: PlotterCuttingPricingFallbackItem[]) {
  const schema = PLOTTER_CUTTING_KEY_SCHEMAS[compositeKey] ?? nonNegativeSchema;
  const parsed = schema.safeParse(source[compositeKey]);
  if (parsed.success) return parsed.data as number;

  diagnostics.push({ key: compositeKey, reason: compositeKey in source ? 'invalid' : 'missing' });
  const fallbackParsed = schema.safeParse(fallbackValues[compositeKey]);
  if (fallbackParsed.success) return fallbackParsed.data as number;

  throw new Error(`[plotter-cutting-pricing] invalid fallback for key ${compositeKey}`);
}

function mapRowsToValues(rows: Array<{ subcategory: string; key: string; value: unknown }>): ConfigKeyMap {
  return rows.reduce<ConfigKeyMap>((acc, row) => {
    acc[`${row.subcategory}.${row.key}`] = Number(row.value);
    return acc;
  }, {});
}

function buildConfig(source: ConfigKeyMap) {
  const diagnostics: PlotterCuttingPricingFallbackItem[] = [];

  const config: PlotterCuttingPricingConfig = {
    baseCutPricePerMeter: readWithFallback(source, 'global.base_cut_price_per_meter', diagnostics),
    weedingPricePerMeter: readWithFallback(source, 'global.weeding_price_per_meter', diagnostics),
    mountingFilmPricePerSquareMeter: readWithFallback(source, 'global.mounting_film_price_per_square_meter', diagnostics),
    transferPrice: readWithFallback(source, 'global.transfer_price', diagnostics),
    urgentMultiplier: readWithFallback(source, 'global.urgent_multiplier', diagnostics),
    minimumOrderTotal: readWithFallback(source, 'global.minimum_order_total', diagnostics),
  };

  return { config, fallbackUsedKeys: diagnostics };
}

export const PLOTTER_CUTTING_PRICING_FALLBACK_CONFIG: PlotterCuttingPricingConfig = buildConfig(fallbackValues).config;

export async function ensurePlotterCuttingPricingEntries() {
  await ensurePricingEntries(
    PLOTTER_CUTTING_DEFAULT_ENTRIES.map((entry) => ({
      ...entry,
      value: entry.value as Prisma.InputJsonValue,
    }))
  );
}

export function parseAndValidatePlotterCuttingPricingValue(compositeKey: string, rawValue: string) {
  const schema = PLOTTER_CUTTING_KEY_SCHEMAS[compositeKey] ?? nonNegativeSchema;
  const parsedValue = parseNumericInput(rawValue);
  const parsed = schema.safeParse(parsedValue);

  if (!parsed.success) {
    throw new Error(getFriendlyNumericValidationMessage(rawValue, parsed.error.issues[0]));
  }

  return parsed.data;
}

async function listActivePlotterCuttingPricingRows() {
  return prisma.pricingEntry.findMany({
    where: { category: PLOTTER_CUTTING_PRICING_CATEGORY, isActive: true },
    select: { subcategory: true, key: true, value: true },
  });
}

export async function getPlotterCuttingPricingConfig() {
  const rows = await listActivePlotterCuttingPricingRows();

  return getPlotterCuttingPricingConfigFromRows(rows);
}

export function getPlotterCuttingPricingConfigFromRows(rows: Array<{ subcategory: string; key: string; value: unknown }>) {
  const source = mapRowsToValues(rows);
  const loadedKeys = Object.keys(source);
  const { config, fallbackUsedKeys } = buildConfig(source);

  const loadedSet = new Set(loadedKeys);
  const missingKeys = PLOTTER_CUTTING_REQUIRED_KEYS.filter((key) => !loadedSet.has(key));
  const unknownKeys = loadedKeys.filter((key) => !(key in fallbackValues));

  if (fallbackUsedKeys.length > 0) {
    const summary = fallbackUsedKeys.map((item) => `${item.key} (${item.reason})`).join(', ');
    console.warn(`[plotter-cutting-pricing] Fallback defaults are used for keys: ${summary}`);
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

export async function updatePlotterCuttingPricingEntry(entryId: string, rawValue: string, note?: string) {
  const entry = await prisma.pricingEntry.findUnique({ where: { id: entryId } });
  if (!entry) throw new Error('Позиция не найдена.');
  if (entry.category !== PLOTTER_CUTTING_PRICING_CATEGORY) {
    throw new Error('Разрешено редактировать только конфигурацию плоттерной резки.');
  }

  const compositeKey = `${entry.subcategory}.${entry.key}`;
  const newValue = parseAndValidatePlotterCuttingPricingValue(compositeKey, rawValue) as Prisma.InputJsonValue;

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

export async function listPlotterCuttingPricingAdminData() {
  await ensurePlotterCuttingPricingEntries();

  const [entries, histories] = await Promise.all([
    prisma.pricingEntry.findMany({
      where: { category: PLOTTER_CUTTING_PRICING_CATEGORY },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    }),
    prisma.pricingEntryHistory.findMany({
      where: { category: PLOTTER_CUTTING_PRICING_CATEGORY },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);
  const runtimeConfig = getPlotterCuttingPricingConfigFromRows(entries);

  const sections = [
    {
      id: 'global',
      title: 'Основные ставки и коэффициенты',
      description: 'Базовые цены, срочность и минимальный чек для расчёта плоттерной резки.',
      subcategory: 'global',
    },
  ] as const;

  const groupedSections = sections.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    entries: entries.filter((entry) => entry.subcategory === section.subcategory),
  }));

  return {
    ...runtimeConfig,
    entries,
    groupedSections,
    histories,
  };
}
