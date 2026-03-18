import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

type EnsurePricingEntry = {
  category: string;
  subcategory: string;
  key: string;
  label: string;
  type: string;
  unit?: string;
  sortOrder: number;
  value: Prisma.InputJsonValue;
  isActive?: boolean;
};

export async function ensurePricingEntries(entries: EnsurePricingEntry[]) {
  if (entries.length === 0) return;

  await prisma.$transaction(
    entries.map((entry) =>
      prisma.pricingEntry.upsert({
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
          value: entry.value,
          type: entry.type,
          unit: entry.unit ?? null,
          sortOrder: entry.sortOrder,
          isActive: entry.isActive ?? true,
        },
      })
    )
  );
}
