import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import {
  BAGUETTE_EXTRAS_DEFAULT_ENTRIES,
  BAGUETTE_EXTRAS_PRICING_CATEGORY,
  getBaguetteExtrasPricingConfig,
} from '@/lib/baget/baguetteExtrasPricing';

const numberValueSchema = z.number().nonnegative();
const materialSchema = z.object({
  areaPricePerM2: z.number().nonnegative(),
  cuttingPricePerM: z.number().nonnegative(),
});
const autoSchema = z.object({
  pvcType: z.enum(['none', 'pvc3', 'pvc4']),
  addOrabond: z.boolean(),
  forceCardboard: z.boolean(),
  stretchingRequired: z.boolean(),
  removeCardboard: z.boolean(),
});

export async function ensureBaguetteExtrasPricingEntries() {
  for (const entry of BAGUETTE_EXTRAS_DEFAULT_ENTRIES) {
    await prisma.pricingEntry.upsert({
      where: {
        category_subcategory_key: {
          category: entry.category,
          subcategory: entry.subcategory,
          key: entry.key,
        },
      },
      update: {
        label: entry.label,
        type: entry.type,
        unit: entry.unit ?? null,
        sortOrder: entry.sortOrder,
      },
      create: {
        category: entry.category,
        subcategory: entry.subcategory,
        key: entry.key,
        label: entry.label,
        value: entry.value as Prisma.InputJsonValue,
        type: entry.type,
        unit: entry.unit ?? null,
        sortOrder: entry.sortOrder,
        isActive: true,
      },
    });
  }
}

export async function listBaguetteExtrasPricingAdminData() {
  await ensureBaguetteExtrasPricingEntries();

  const [entries, histories, runtimeConfig] = await Promise.all([
    prisma.pricingEntry.findMany({
      where: { category: BAGUETTE_EXTRAS_PRICING_CATEGORY },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    }),
    prisma.pricingEntryHistory.findMany({
      where: { category: BAGUETTE_EXTRAS_PRICING_CATEGORY },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    getBaguetteExtrasPricingConfig(),
  ]);

  const descriptionByCompositeKey = BAGUETTE_EXTRAS_DEFAULT_ENTRIES.reduce<Record<string, string>>((acc, entry) => {
    acc[`${entry.subcategory}.${entry.key}`] = entry.description ?? '';
    return acc;
  }, {});

  const entriesWithDescription = entries.map((entry) => ({
    ...entry,
    description: descriptionByCompositeKey[`${entry.subcategory}.${entry.key}`] ?? '',
  }));

  return {
    entries: entriesWithDescription,
    histories,
    fallbackUsedKeys: runtimeConfig.fallbackUsedKeys,
    missingKeys: runtimeConfig.missingKeys,
  };
}

function parseUpdatedValue(type: string, rawValue: string): Prisma.InputJsonValue {
  if (type === 'number') {
    return numberValueSchema.parse(Number(rawValue));
  }

  const parsedJson = JSON.parse(rawValue) as unknown;
  if (parsedJson && typeof parsedJson === 'object' && 'pvcType' in parsedJson) {
    return autoSchema.parse(parsedJson);
  }

  return materialSchema.parse(parsedJson);
}

export async function updateBaguetteExtrasPricingEntry(entryId: string, rawValue: string, note?: string) {
  const entry = await prisma.pricingEntry.findUnique({ where: { id: entryId } });
  if (!entry) {
    throw new Error('Позиция не найдена.');
  }

  if (entry.category !== BAGUETTE_EXTRAS_PRICING_CATEGORY) {
    throw new Error('Разрешено редактировать только конфигурацию доп. материалов багета.');
  }

  const newValue = parseUpdatedValue(entry.type, rawValue);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.pricingEntry.update({
      where: { id: entry.id },
      data: {
        value: newValue,
      },
    });

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
