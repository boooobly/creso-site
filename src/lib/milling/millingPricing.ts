import { Prisma } from '@prisma/client';
import { z } from 'zod';
import defaultsJson from '../../../data/milling-pricing-defaults.json';
import { prisma } from '@/lib/db/prisma';
import { getFriendlyNumericValidationMessage, parseNumericInput } from '@/lib/admin/pricing-input';
import { ensurePricingEntries } from '@/lib/admin/pricing-defaults';
import { loadPricingConfigWithFallback } from '@/lib/pricing/loadPricingConfigWithFallback';
import {
  MILLING_ADDITIONAL_SERVICE_GROUPS,
  MILLING_MATERIAL_GROUP_DEFINITIONS,
  type MillingAdditionalServiceGroup,
  type MillingMaterialGroup,
} from '@/lib/pricing-config/milling';

export const MILLING_PRICING_CATEGORY = 'milling-pricing';

export type RawMillingDefaultEntry = {
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

const MILLING_DEFAULT_ENTRIES = defaultsJson as RawMillingDefaultEntry[];

const nonNegativeSchema = z.number().min(0).max(1_000_000);
const percentSchema = z.number().min(0).max(100);

const MILLING_KEY_SCHEMAS = MILLING_DEFAULT_ENTRIES.reduce<Record<string, z.ZodTypeAny>>((acc, entry) => {
  const compositeKey = `${entry.subcategory}.${entry.key}`;
  acc[compositeKey] = entry.unit === '%' ? percentSchema : nonNegativeSchema;
  return acc;
}, {});

type ConfigKeyMap = Record<string, number>;
type FallbackReason = 'missing' | 'invalid';
export type MillingPricingFallbackItem = { key: string; reason: FallbackReason };

const descriptionByCompositeKey = MILLING_DEFAULT_ENTRIES.reduce<Record<string, string>>((acc, entry) => {
  acc[`${entry.subcategory}.${entry.key}`] = entry.description ?? '';
  return acc;
}, {});

function mapDefaults(entries: RawMillingDefaultEntry[]): ConfigKeyMap {
  return entries.reduce<ConfigKeyMap>((acc, entry) => {
    acc[`${entry.subcategory}.${entry.key}`] = entry.value;
    return acc;
  }, {});
}

const fallbackValues = mapDefaults(MILLING_DEFAULT_ENTRIES);
export const MILLING_REQUIRED_KEYS = Object.keys(fallbackValues);

function readWithFallback(source: ConfigKeyMap, compositeKey: string, diagnostics: MillingPricingFallbackItem[]) {
  const schema = MILLING_KEY_SCHEMAS[compositeKey] ?? nonNegativeSchema;
  const parsed = schema.safeParse(source[compositeKey]);
  if (parsed.success) return parsed.data as number;

  diagnostics.push({ key: compositeKey, reason: compositeKey in source ? 'invalid' : 'missing' });
  const fallbackParsed = schema.safeParse(fallbackValues[compositeKey]);
  if (fallbackParsed.success) return fallbackParsed.data as number;

  throw new Error(`[milling-pricing] invalid fallback for key ${compositeKey}`);
}

function mapRowsToValues(rows: Array<{ subcategory: string; key: string; value: unknown }>): ConfigKeyMap {
  return rows.reduce<ConfigKeyMap>((acc, row) => {
    acc[`${row.subcategory}.${row.key}`] = Number(row.value);
    return acc;
  }, {});
}

function buildConfig(source: ConfigKeyMap) {
  const diagnostics: MillingPricingFallbackItem[] = [];
  const values = MILLING_REQUIRED_KEYS.reduce<ConfigKeyMap>((acc, compositeKey) => {
    acc[compositeKey] = readWithFallback(source, compositeKey, diagnostics);
    return acc;
  }, {});

  return { values, fallbackUsedKeys: diagnostics };
}

function formatNumber(value: number) {
  return value.toLocaleString('ru-RU', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 0,
    maximumFractionDigits: 2,
  });
}

function formatCurrency(value: number) {
  return `${formatNumber(value)} ₽`;
}

function formatPricePerMeter(value: number) {
  return `${formatNumber(value)} ₽/м.п.`;
}

function formatPricePerSheet(value: number) {
  return `${formatNumber(value)} ₽/лист`;
}

function formatPricePerDay(value: number) {
  return `${formatNumber(value)} ₽/сутки`;
}

function formatPercent(value: number) {
  return `+${formatNumber(value)}%`;
}

const MILLING_ADMIN_SECTIONS = [
  {
    id: 'sheet-plastics',
    title: 'Пластики и прозрачные листовые материалы',
    description: 'Основные цены за погонный метр для ПВХ, оргстекла, полистирола, литого поликарбоната и А-ПЭТ.',
    subcategories: ['pvc', 'acrylic', 'polystyrene', 'cast-polycarbonate', 'apet'],
  },
  {
    id: 'composite-and-engineering-materials',
    title: 'Композитные и инженерные материалы',
    description: 'Цены для АКП, V-канавки, инженерных пластиков и XPS.',
    subcategories: ['acp', 'v-groove', 'polyamide-polyethylene-polypropylene', 'xps'],
  },
  {
    id: 'wood-sheet-materials',
    title: 'Древесные листовые материалы',
    description: 'Ставки фрезеровки для ДСП, фанеры и МДФ.',
    subcategories: ['chipboard', 'plywood', 'mdf'],
  },
  {
    id: 'extra-services',
    title: 'Срочность, подготовка и сопутствующие услуги',
    description: 'Минимальный заказ, срочные наценки, подготовка макета, логистика и хранение.',
    subcategories: ['global', 'urgency', 'preparation', 'logistics'],
  },
] as const;

export async function ensureMillingPricingEntries() {
  await ensurePricingEntries(
    MILLING_DEFAULT_ENTRIES.map((entry) => ({
      ...entry,
      value: entry.value as Prisma.InputJsonValue,
    })),
  );
}

export function parseAndValidateMillingPricingValue(compositeKey: string, rawValue: string) {
  const schema = MILLING_KEY_SCHEMAS[compositeKey] ?? nonNegativeSchema;
  const parsedValue = parseNumericInput(rawValue);
  const parsed = schema.safeParse(parsedValue);

  if (!parsed.success) {
    throw new Error(getFriendlyNumericValidationMessage(rawValue, parsed.error.issues[0]));
  }

  return parsed.data;
}

export async function getMillingPricingConfig() {
  return loadPricingConfigWithFallback({
    label: 'milling-pricing',
    loadRows: () => prisma.pricingEntry.findMany({
      where: { category: MILLING_PRICING_CATEGORY, isActive: true },
      select: { subcategory: true, key: true, value: true },
    }),
    buildFromRows: getMillingPricingConfigFromRows,
  });
}

export function getMillingPricingConfigFromRows(rows: Array<{ subcategory: string; key: string; value: unknown }>) {
  const source = mapRowsToValues(rows);
  const loadedKeys = Object.keys(source);
  const { values, fallbackUsedKeys } = buildConfig(source);

  const loadedSet = new Set(loadedKeys);
  const missingKeys = MILLING_REQUIRED_KEYS.filter((key) => !loadedSet.has(key));
  const unknownKeys = loadedKeys.filter((key) => !(key in fallbackValues));

  if (fallbackUsedKeys.length > 0) {
    const summary = fallbackUsedKeys.map((item) => `${item.key} (${item.reason})`).join(', ');
    console.warn(`[milling-pricing] Fallback defaults are used for keys: ${summary}`);
  }

  return {
    values,
    loadedKeys,
    fallbackUsedKeys,
    missingKeys,
    unknownKeys,
    isComplete: missingKeys.length === 0,
  };
}

export async function updateMillingPricingEntry(entryId: string, rawValue: string, note?: string) {
  const entry = await prisma.pricingEntry.findUnique({ where: { id: entryId } });
  if (!entry) throw new Error('Позиция не найдена.');
  if (entry.category !== MILLING_PRICING_CATEGORY) {
    throw new Error('Разрешено редактировать только конфигурацию фрезеровки листовых материалов.');
  }

  const compositeKey = `${entry.subcategory}.${entry.key}`;
  const newValue = parseAndValidateMillingPricingValue(compositeKey, rawValue) as Prisma.InputJsonValue;

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

export async function listMillingPricingAdminData() {
  await ensureMillingPricingEntries();

  const [entries, histories] = await Promise.all([
    prisma.pricingEntry.findMany({
      where: { category: MILLING_PRICING_CATEGORY },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    }),
    prisma.pricingEntryHistory.findMany({
      where: { category: MILLING_PRICING_CATEGORY },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const runtimeConfig = getMillingPricingConfigFromRows(entries);

  const entriesWithDescription = entries.map((entry) => ({
    ...entry,
    description: descriptionByCompositeKey[`${entry.subcategory}.${entry.key}`] ?? '',
  }));

  const groupedSections = MILLING_ADMIN_SECTIONS.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    entries: entriesWithDescription.filter((entry) => section.subcategories.some((subcategory) => subcategory === entry.subcategory)),
  }));

  return {
    ...runtimeConfig,
    entries: entriesWithDescription,
    groupedSections,
    histories,
  };
}

export async function getMillingPricingPublicData(): Promise<{
  materialGroups: MillingMaterialGroup[];
  additionalServiceGroups: MillingAdditionalServiceGroup[];
  minimumOrderTotal: number;
  startingPricePerMeter: number;
}> {
  const { values } = await getMillingPricingConfig();

  const materialGroups = MILLING_MATERIAL_GROUP_DEFINITIONS.map<MillingMaterialGroup>((group) => ({
    id: group.id,
    title: group.title,
    description: group.description,
    rows: group.rows.map((row) => ({
      thickness: row.thickness,
      price: formatPricePerMeter(values[`${group.id}.${row.key}`]),
    })),
  }));

  const additionalServiceGroups = MILLING_ADDITIONAL_SERVICE_GROUPS.map<MillingAdditionalServiceGroup>((group) => {
    if (group.id === 'urgency') {
      const sameDayPercent = values['urgency.same_day_markup_percent'];
      const sameDayMinimum = values['urgency.same_day_minimum_total'];
      const whileYouWaitPercent = values['urgency.while_you_wait_markup_percent'];
      const whileYouWaitMinimum = values['urgency.while_you_wait_minimum_total'];

      return {
        ...group,
        items: [
          {
            ...group.items[0],
            details: `${formatNumber(sameDayPercent)}%, минимум ${formatCurrency(sameDayMinimum)}`,
            badges: [formatPercent(sameDayPercent), `минимум ${formatCurrency(sameDayMinimum)}`],
          },
          {
            ...group.items[1],
            details: `${formatNumber(whileYouWaitPercent)}%, минимум ${formatCurrency(whileYouWaitMinimum)}`,
            badges: [formatPercent(whileYouWaitPercent), `минимум ${formatCurrency(whileYouWaitMinimum)}`],
          },
        ],
      };
    }

    if (group.id === 'preparation-and-complexity') {
      const layoutPreparation = values['preparation.layout_preparation_from'];
      const partsNesting = values['preparation.parts_nesting_from'];
      const smallPartsComplexity = values['preparation.small_parts_complexity_markup_percent'];
      const acrylicEdgePolishing = values['preparation.transparent_acrylic_edge_polishing_per_meter'];

      return {
        ...group,
        items: [
          { ...group.items[0], details: `от ${formatCurrency(layoutPreparation)}` },
          { ...group.items[1], details: `от ${formatCurrency(partsNesting)}` },
          {
            ...group.items[2],
            details: `${formatNumber(smallPartsComplexity)}%`,
            badges: [formatPercent(smallPartsComplexity)],
          },
          { ...group.items[3], details: formatPricePerMeter(acrylicEdgePolishing) },
        ],
      };
    }

    const customerMaterialPieceMarkup = values['logistics.customer_material_piece_markup_percent'];
    const loadingPrice = values['logistics.customer_material_loading_per_sheet'];
    const storagePrice = values['logistics.storage_after_free_period_per_day'];
    const deliveryPrice = values['logistics.city_delivery_from'];

    return {
      ...group,
      items: [
        {
          ...group.items[0],
          details: `${formatNumber(customerMaterialPieceMarkup)}% за каждый последующий кусок`,
          badges: [formatPercent(customerMaterialPieceMarkup)],
        },
        { ...group.items[1], details: formatPricePerSheet(loadingPrice) },
        {
          ...group.items[2],
          details: `бесплатно 3 суток до фрезеровки и 3 суток после, далее ${formatPricePerDay(storagePrice)}`,
        },
        { ...group.items[3], details: `от ${formatCurrency(deliveryPrice)}` },
      ],
    };
  });

  const startingPricePerMeter = MILLING_MATERIAL_GROUP_DEFINITIONS
    .flatMap((group) => group.rows.map((row) => values[`${group.id}.${row.key}`]))
    .reduce((min, value) => Math.min(min, value), Number.POSITIVE_INFINITY);

  return {
    materialGroups,
    additionalServiceGroups,
    minimumOrderTotal: values['global.minimum_order_total'],
    startingPricePerMeter,
  };
}
