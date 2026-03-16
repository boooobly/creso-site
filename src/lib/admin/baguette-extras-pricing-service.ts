import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import {
  BAGUETTE_EXTRAS_DEFAULT_ENTRIES,
  BAGUETTE_EXTRAS_PRICING_CATEGORY,
  getBaguetteExtrasPricingConfig,
  parseAndValidateBaguettePricingValue,
} from '@/lib/baget/baguetteExtrasPricing';

export const BAGUETTE_PRICING_ADMIN_GROUPS = [
  { id: 'glazing-materials', title: 'Стекло и лицевые материалы', description: 'Стекло, оргстекло, ПЭТ и их резка.', keys: ['materials.glass', 'materials.anti_reflective_glass', 'materials.plexiglass', 'materials.pet1mm'] },
  { id: 'backing-support', title: 'Основа и поддержка', description: 'Картон, ПВХ, Orabond, базовые правила подложки.', keys: ['materials.cardboard', 'materials.pvc3', 'materials.pvc4', 'materials.orabond', 'auto_additions.default', 'auto_additions.photo', 'auto_additions.rhinestone', 'auto_additions.embroidery', 'auto_additions.beads'] },
  { id: 'hanging-mounting', title: 'Подвесы и крепёж', description: 'Крокодильчики, тросики и петли.', keys: ['hanging.crocodile_price', 'hanging.crocodile_double_threshold_width_mm', 'hanging.wire_price_per_meter_width', 'hanging.wire_loop_price', 'hanging.wire_loop_default_qty'] },
  { id: 'passepartout-options', title: 'Паспарту и оформление', description: 'Паспарту и параметры оформления.', keys: ['materials.passepartout'] },
  { id: 'stretcher-structural', title: 'Подрамник и конструкция', description: 'Тарифы подрамника и ограничения по размерам.', keys: ['stretcher.stretcher_price_per_meter_narrow', 'stretcher.stretcher_price_per_meter_wide', 'stretcher.stretcher_narrow_max_width_mm', 'stretcher.stretcher_narrow_max_height_mm', 'auto_additions.stretched_canvas'] },
  { id: 'print-related', title: 'Печать для багета', description: 'Тариф печати и минимальная тарифицируемая площадь.', keys: ['print.paper_price_per_m2', 'print.canvas_price_per_m2', 'print.minimum_billable_area_m2'] },
  { id: 'other-baguette', title: 'Прочие параметры', description: 'Подставка и прочие настройки калькулятора.', keys: ['stand.stand_price', 'stand.stand_max_width_mm', 'stand.stand_max_height_mm'] },
] as const;

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
    unknownKeys: runtimeConfig.unknownKeys,
    isComplete: runtimeConfig.isComplete,
    groupedSections: BAGUETTE_PRICING_ADMIN_GROUPS.map((section) => ({
      ...section,
      entries: entriesWithDescription.filter((entry) => (section.keys as readonly string[]).includes(`${entry.subcategory}.${entry.key}`)),
    })).filter((section) => section.entries.length > 0),
  };
}

export async function updateBaguetteExtrasPricingEntry(entryId: string, rawValue: string, note?: string) {
  const entry = await prisma.pricingEntry.findUnique({ where: { id: entryId } });
  if (!entry) {
    throw new Error('Позиция не найдена.');
  }

  if (entry.category !== BAGUETTE_EXTRAS_PRICING_CATEGORY) {
    throw new Error('Разрешено редактировать только конфигурацию доп. материалов багета.');
  }

  const compositeKey = `${entry.subcategory}.${entry.key}`;
  const newValue = parseAndValidateBaguettePricingValue(compositeKey, entry.type, rawValue) as Prisma.InputJsonValue;

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
