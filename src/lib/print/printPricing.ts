import { Prisma } from '@prisma/client';
import { z } from 'zod';
import defaultsJson from '../../../data/print-pricing-defaults.json';
import { prisma } from '@/lib/db/prisma';
import { getFriendlyNumericValidationMessage, parseNumericInput } from '@/lib/admin/pricing-input';
import { ensurePricingEntries } from '@/lib/admin/pricing-defaults';
import type { PrintDensity, PrintProductType, PrintType } from '@/lib/calculations/types';

export const PRINT_PRICING_CATEGORY = 'print-pricing';

type RawPrintDefaultEntry = {
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

const PRINT_DEFAULT_ENTRIES = defaultsJson as RawPrintDefaultEntry[];

const positiveSchema = z.number().positive().max(1_000_000);
const coefficientSchema = z.number().positive().max(10);

const PRINT_KEY_SCHEMAS: Record<string, z.ZodTypeAny> = {
  'global.minimum_quantity': z.number().int().min(1).max(1_000_000),
  'base_per_100.cards': positiveSchema,
  'base_per_100.flyers': positiveSchema,
  'density_coefficient.300': coefficientSchema,
  'density_coefficient.350': coefficientSchema,
  'density_coefficient.400': coefficientSchema,
  'side_coefficient.single': coefficientSchema,
  'side_coefficient.double': coefficientSchema,
  'lamination_coefficient.false': coefficientSchema,
  'lamination_coefficient.true': coefficientSchema,
  'size_coefficient.cards_90x50': coefficientSchema,
  'size_coefficient.cards_85x55': coefficientSchema,
  'size_coefficient.flyers_A6': coefficientSchema,
  'size_coefficient.flyers_A5': coefficientSchema,
};

type ConfigKeyMap = Record<string, number>;
type FallbackReason = 'missing' | 'invalid';
export type PrintPricingFallbackItem = { key: string; reason: FallbackReason };

export type PrintPricingConfig = {
  minimumQuantity: number;
  basePer100: Record<PrintProductType, number>;
  densityCoefficient: Record<PrintDensity, number>;
  sideCoefficient: Record<PrintType, number>;
  laminationCoefficient: Record<'true' | 'false', number>;
  sizeCoefficient: Record<PrintProductType, Record<string, number>>;
};

function mapDefaults(entries: RawPrintDefaultEntry[]): ConfigKeyMap {
  return entries.reduce<ConfigKeyMap>((acc, entry) => {
    acc[`${entry.subcategory}.${entry.key}`] = entry.value;
    return acc;
  }, {});
}

const fallbackValues = mapDefaults(PRINT_DEFAULT_ENTRIES);
export const PRINT_REQUIRED_KEYS = Object.keys(fallbackValues);

function readWithFallback(source: ConfigKeyMap, compositeKey: string, diagnostics: PrintPricingFallbackItem[]) {
  const schema = PRINT_KEY_SCHEMAS[compositeKey] ?? positiveSchema;
  const parsed = schema.safeParse(source[compositeKey]);
  if (parsed.success) return parsed.data as number;

  diagnostics.push({ key: compositeKey, reason: compositeKey in source ? 'invalid' : 'missing' });
  const fallbackParsed = schema.safeParse(fallbackValues[compositeKey]);
  if (fallbackParsed.success) return fallbackParsed.data as number;

  throw new Error(`[print-pricing] invalid fallback for key ${compositeKey}`);
}

function mapRowsToValues(rows: Array<{ subcategory: string; key: string; value: unknown }>): ConfigKeyMap {
  return rows.reduce<ConfigKeyMap>((acc, row) => {
    acc[`${row.subcategory}.${row.key}`] = Number(row.value);
    return acc;
  }, {});
}

function buildConfig(source: ConfigKeyMap) {
  const diagnostics: PrintPricingFallbackItem[] = [];

  const config: PrintPricingConfig = {
    minimumQuantity: readWithFallback(source, 'global.minimum_quantity', diagnostics),
    basePer100: {
      cards: readWithFallback(source, 'base_per_100.cards', diagnostics),
      flyers: readWithFallback(source, 'base_per_100.flyers', diagnostics),
    },
    densityCoefficient: {
      300: readWithFallback(source, 'density_coefficient.300', diagnostics),
      350: readWithFallback(source, 'density_coefficient.350', diagnostics),
      400: readWithFallback(source, 'density_coefficient.400', diagnostics),
    },
    sideCoefficient: {
      single: readWithFallback(source, 'side_coefficient.single', diagnostics),
      double: readWithFallback(source, 'side_coefficient.double', diagnostics),
    },
    laminationCoefficient: {
      false: readWithFallback(source, 'lamination_coefficient.false', diagnostics),
      true: readWithFallback(source, 'lamination_coefficient.true', diagnostics),
    },
    sizeCoefficient: {
      cards: {
        '90x50': readWithFallback(source, 'size_coefficient.cards_90x50', diagnostics),
        '85x55': readWithFallback(source, 'size_coefficient.cards_85x55', diagnostics),
      },
      flyers: {
        A6: readWithFallback(source, 'size_coefficient.flyers_A6', diagnostics),
        A5: readWithFallback(source, 'size_coefficient.flyers_A5', diagnostics),
      },
    },
  };

  return { config, fallbackUsedKeys: diagnostics };
}

export const PRINT_PRICING_FALLBACK_CONFIG: PrintPricingConfig = buildConfig(fallbackValues).config;

export async function ensurePrintPricingEntries() {
  await ensurePricingEntries(
    PRINT_DEFAULT_ENTRIES.map((entry) => ({
      ...entry,
      value: entry.value as Prisma.InputJsonValue,
    }))
  );
}

export function parseAndValidatePrintPricingValue(compositeKey: string, rawValue: string) {
  const schema = PRINT_KEY_SCHEMAS[compositeKey] ?? positiveSchema;
  const parsedValue = parseNumericInput(rawValue);
  const parsed = schema.safeParse(parsedValue);

  if (!parsed.success) {
    throw new Error(getFriendlyNumericValidationMessage(rawValue, parsed.error.issues[0]));
  }

  return parsed.data;
}

export async function getPrintPricingConfig() {
  await ensurePrintPricingEntries();

  const rows = await prisma.pricingEntry.findMany({
    where: { category: PRINT_PRICING_CATEGORY, isActive: true },
    select: { subcategory: true, key: true, value: true },
  });

  return getPrintPricingConfigFromRows(rows);
}

export function getPrintPricingConfigFromRows(rows: Array<{ subcategory: string; key: string; value: unknown }>) {
  const source = mapRowsToValues(rows);
  const loadedKeys = Object.keys(source);
  const { config, fallbackUsedKeys } = buildConfig(source);

  const loadedSet = new Set(loadedKeys);
  const missingKeys = PRINT_REQUIRED_KEYS.filter((key) => !loadedSet.has(key));
  const unknownKeys = loadedKeys.filter((key) => !(key in fallbackValues));

  if (fallbackUsedKeys.length > 0) {
    const summary = fallbackUsedKeys.map((item) => `${item.key} (${item.reason})`).join(', ');
    console.warn(`[print-pricing] Fallback defaults are used for keys: ${summary}`);
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

export async function updatePrintPricingEntry(entryId: string, rawValue: string, note?: string) {
  const entry = await prisma.pricingEntry.findUnique({ where: { id: entryId } });
  if (!entry) throw new Error('Позиция не найдена.');
  if (entry.category !== PRINT_PRICING_CATEGORY) {
    throw new Error('Разрешено редактировать только конфигурацию печати.');
  }

  const compositeKey = `${entry.subcategory}.${entry.key}`;
  const newValue = parseAndValidatePrintPricingValue(compositeKey, rawValue) as Prisma.InputJsonValue;

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

export async function listPrintPricingAdminData() {
  await ensurePrintPricingEntries();

  const [entries, histories] = await Promise.all([
    prisma.pricingEntry.findMany({
      where: { category: PRINT_PRICING_CATEGORY },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    }),
    prisma.pricingEntryHistory.findMany({
      where: { category: PRINT_PRICING_CATEGORY },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);
  const runtimeConfig = getPrintPricingConfigFromRows(entries);

  const groupedSections = [
    {
      id: 'global',
      title: 'Общие правила',
      description: 'Минимальный тираж для запуска расчёта.',
      entries: entries.filter((entry) => entry.subcategory === 'global'),
    },
    {
      id: 'base_per_100',
      title: 'Базовые ставки',
      description: 'База в рублях за каждые 100 штук для разных типов продукции.',
      entries: entries.filter((entry) => entry.subcategory === 'base_per_100'),
    },
    {
      id: 'density_coefficient',
      title: 'Коэффициенты плотности',
      description: 'Множители стоимости для плотности бумаги.',
      entries: entries.filter((entry) => entry.subcategory === 'density_coefficient'),
    },
    {
      id: 'side_coefficient',
      title: 'Коэффициенты сторон печати',
      description: 'Множители для односторонней и двусторонней печати.',
      entries: entries.filter((entry) => entry.subcategory === 'side_coefficient'),
    },
    {
      id: 'lamination_coefficient',
      title: 'Коэффициенты ламинации',
      description: 'Множители для расчёта с ламинацией и без неё.',
      entries: entries.filter((entry) => entry.subcategory === 'lamination_coefficient'),
    },
    {
      id: 'size_coefficient',
      title: 'Коэффициенты форматов',
      description: 'Множители для размеров визиток и флаеров.',
      entries: entries.filter((entry) => entry.subcategory === 'size_coefficient'),
    },
  ];

  return {
    ...runtimeConfig,
    groupedSections,
    histories,
  };
}
