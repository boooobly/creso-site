import { prisma } from '@/lib/db/prisma';
import { listQuerySchema, pricingEntrySchema } from './validation';

type PricingFilters = {
  page?: unknown;
  pageSize?: unknown;
  category?: string;
  isActive?: boolean;
};

export async function listPricingEntries(filters: PricingFilters) {
  const pagination = listQuerySchema.parse(filters);

  const where = {
    ...(filters.category ? { category: filters.category } : {}),
    ...(typeof filters.isActive === 'boolean' ? { isActive: filters.isActive } : {})
  };

  const [items, total] = await Promise.all([
    prisma.pricingEntry.findMany({
      where,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { key: 'asc' }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize
    }),
    prisma.pricingEntry.count({ where })
  ]);

  return { items, total, page: pagination.page, pageSize: pagination.pageSize };
}

export async function createPricingEntry(payload: unknown) {
  const data = pricingEntrySchema.parse(payload);
  return prisma.pricingEntry.create({ data });
}

export async function updatePricingEntry(id: string, payload: unknown) {
  const data = pricingEntrySchema.partial().parse(payload);
  return prisma.pricingEntry.update({ where: { id }, data });
}

export async function deletePricingEntry(id: string) {
  return prisma.pricingEntry.delete({ where: { id } });
}
