import { Prisma } from '@prisma/client';
import { z } from 'zod';
import defaultsJson from '../../../data/heat-transfer-pricing-defaults.json';
import { prisma } from '@/lib/db/prisma';
import { getFriendlyNumericValidationMessage, parseNumericInput } from '@/lib/admin/pricing-input';
import { ensurePricingEntries } from '@/lib/admin/pricing-defaults';
import { loadPricingConfigWithFallback } from '@/lib/pricing/loadPricingConfigWithFallback';
import type { HeatTransferPricingConfig } from '@/lib/pricing-config/heatTransfer';

export const HEAT_TRANSFER_PRICING_CATEGORY = 'heat-transfer-pricing';

type RawHeatTransferDefaultEntry = {
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

const HEAT_TRANSFER_DEFAULT_ENTRIES = defaultsJson as RawHeatTransferDefaultEntry[];

const nonNegativeSchema = z.number().min(0).max(1_000_000);
const fractionSchema = z.number().min(0).max(1);

const HEAT_TRANSFER_KEY_SCHEMAS: Record<string, z.ZodTypeAny> = {
  'global.discount_threshold': z.number().int().min(1).max(1_000_000),
  'global.discount_rate': fractionSchema,
  'mug_prices.white330_single': nonNegativeSchema,
  'mug_prices.white330_wrap': nonNegativeSchema,
  'mug_prices.chameleon_single': nonNegativeSchema,
  'mug_prices.chameleon_wrap': nonNegativeSchema,
  'tshirt.own_clothes': nonNegativeSchema,
  'tshirt.company_clothes': nonNegativeSchema,
  'film.unit_price_per_meter': nonNegativeSchema,
  'film.transfer_price': nonNegativeSchema,
  'film.urgent_multiplier': z.number().min(1).max(5),
  'film.minimum_order_total': nonNegativeSchema,
};

type ConfigKeyMap = Record<string, number>;
type FallbackReason = 'missing' | 'invalid';
export type HeatTransferPricingFallbackItem = { key: string; reason: FallbackReason };

function mapDefaults(entries: RawHeatTransferDefaultEntry[]): ConfigKeyMap {
  return entries.reduce<ConfigKeyMap>((acc, entry) => {
    acc[`${entry.subcategory}.${entry.key}`] = entry.value;
    return acc;
  }, {});
}

const fallbackValues = mapDefaults(HEAT_TRANSFER_DEFAULT_ENTRIES);
export const HEAT_TRANSFER_REQUIRED_KEYS = Object.keys(fallbackValues);

function readWithFallback(source: ConfigKeyMap, compositeKey: string, diagnostics: HeatTransferPricingFallbackItem[]) {
  const schema = HEAT_TRANSFER_KEY_SCHEMAS[compositeKey] ?? nonNegativeSchema;
  const parsed = schema.safeParse(source[compositeKey]);
  if (parsed.success) return parsed.data as number;

  diagnostics.push({ key: compositeKey, reason: compositeKey in source ? 'invalid' : 'missing' });
  const fallbackParsed = schema.safeParse(fallbackValues[compositeKey]);
  if (fallbackParsed.success) return fallbackParsed.data as number;

  throw new Error(`[heat-transfer-pricing] invalid fallback for key ${compositeKey}`);
}

function mapRowsToValues(rows: Array<{ subcategory: string; key: string; value: unknown }>): ConfigKeyMap {
  return rows.reduce<ConfigKeyMap>((acc, row) => {
    acc[`${row.subcategory}.${row.key}`] = Number(row.value);
    return acc;
  }, {});
}

function buildConfig(source: ConfigKeyMap) {
  const diagnostics: HeatTransferPricingFallbackItem[] = [];

  const config: HeatTransferPricingConfig = {
    discountThreshold: readWithFallback(source, 'global.discount_threshold', diagnostics),
    discountRate: readWithFallback(source, 'global.discount_rate', diagnostics),
    mugPrices: {
      white330: {
        single: readWithFallback(source, 'mug_prices.white330_single', diagnostics),
        wrap: readWithFallback(source, 'mug_prices.white330_wrap', diagnostics),
      },
      chameleon: {
        single: readWithFallback(source, 'mug_prices.chameleon_single', diagnostics),
        wrap: readWithFallback(source, 'mug_prices.chameleon_wrap', diagnostics),
      },
    },
    tshirtPrice: {
      ownClothes: readWithFallback(source, 'tshirt.own_clothes', diagnostics),
      companyClothes: readWithFallback(source, 'tshirt.company_clothes', diagnostics),
    },
    film: {
      unitPricePerMeter: readWithFallback(source, 'film.unit_price_per_meter', diagnostics),
      transferPrice: readWithFallback(source, 'film.transfer_price', diagnostics),
      urgentMultiplier: readWithFallback(source, 'film.urgent_multiplier', diagnostics),
      minimumOrderTotal: readWithFallback(source, 'film.minimum_order_total', diagnostics),
    },
  };

  return { config, fallbackUsedKeys: diagnostics };
}

export const HEAT_TRANSFER_PRICING_FALLBACK_CONFIG: HeatTransferPricingConfig = buildConfig(fallbackValues).config;

export async function ensureHeatTransferPricingEntries() {
  await ensurePricingEntries(
    HEAT_TRANSFER_DEFAULT_ENTRIES.map((entry) => ({
      ...entry,
      value: entry.value as Prisma.InputJsonValue,
    }))
  );
}

export function parseAndValidateHeatTransferPricingValue(compositeKey: string, rawValue: string) {
  const schema = HEAT_TRANSFER_KEY_SCHEMAS[compositeKey] ?? nonNegativeSchema;
  const parsedValue = parseNumericInput(rawValue);
  const parsed = schema.safeParse(parsedValue);

  if (!parsed.success) {
    throw new Error(getFriendlyNumericValidationMessage(rawValue, parsed.error.issues[0]));
  }

  return parsed.data;
}

export async function getHeatTransferPricingConfig() {
  return loadPricingConfigWithFallback({
    label: 'heat-transfer-pricing',
    loadRows: () => prisma.pricingEntry.findMany({
      where: { category: HEAT_TRANSFER_PRICING_CATEGORY, isActive: true },
      select: { subcategory: true, key: true, value: true },
    }),
    buildFromRows: getHeatTransferPricingConfigFromRows,
  });
}

export function getHeatTransferPricingConfigFromRows(rows: Array<{ subcategory: string; key: string; value: unknown }>) {
  const source = mapRowsToValues(rows);
  const loadedKeys = Object.keys(source);
  const { config, fallbackUsedKeys } = buildConfig(source);

  const loadedSet = new Set(loadedKeys);
  const missingKeys = HEAT_TRANSFER_REQUIRED_KEYS.filter((key) => !loadedSet.has(key));
  const unknownKeys = loadedKeys.filter((key) => !(key in fallbackValues));

  if (fallbackUsedKeys.length > 0) {
    const summary = fallbackUsedKeys.map((item) => `${item.key} (${item.reason})`).join(', ');
    console.warn(`[heat-transfer-pricing] Fallback defaults are used for keys: ${summary}`);
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

export async function updateHeatTransferPricingEntry(entryId: string, rawValue: string, note?: string) {
  const entry = await prisma.pricingEntry.findUnique({ where: { id: entryId } });
  if (!entry) throw new Error('Позиция не найдена.');
  if (entry.category !== HEAT_TRANSFER_PRICING_CATEGORY) {
    throw new Error('Разрешено редактировать только конфигурацию термопереноса.');
  }

  const compositeKey = `${entry.subcategory}.${entry.key}`;
  const newValue = parseAndValidateHeatTransferPricingValue(compositeKey, rawValue) as Prisma.InputJsonValue;

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

export async function listHeatTransferPricingAdminData() {
  await ensureHeatTransferPricingEntries();

  const [entries, histories] = await Promise.all([
    prisma.pricingEntry.findMany({
      where: { category: HEAT_TRANSFER_PRICING_CATEGORY },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    }),
    prisma.pricingEntryHistory.findMany({
      where: { category: HEAT_TRANSFER_PRICING_CATEGORY },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);
  const runtimeConfig = getHeatTransferPricingConfigFromRows(entries);

  const sections = [
    { id: 'global', title: 'Скидки', description: 'Порог и размер скидки для тиражных заказов.', subcategory: 'global' },
    { id: 'mug_prices', title: 'Кружки', description: 'Тарифы по типу кружки и формату печати.', subcategory: 'mug_prices' },
    { id: 'tshirt', title: 'Футболки', description: 'Цена печати на своей и нашей одежде.', subcategory: 'tshirt' },
    { id: 'film', title: 'Термоплёнка', description: 'Ставки за метр, перенос, срочность и минимальный чек.', subcategory: 'film' },
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
