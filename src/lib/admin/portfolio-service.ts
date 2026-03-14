import { prisma } from '@/lib/db/prisma';
import { listQuerySchema, portfolioItemSchema } from './validation';

type PortfolioFilters = {
  page?: unknown;
  pageSize?: unknown;
  category?: string;
  published?: boolean;
  search?: string;
};

export async function listPortfolioItems(filters: PortfolioFilters) {
  const pagination = listQuerySchema.parse(filters);

  const search = filters.search?.trim();
  const where = {
    ...(filters.category ? { category: filters.category } : {}),
    ...(typeof filters.published === 'boolean' ? { published: filters.published } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { category: { contains: search, mode: 'insensitive' as const } },
            { shortDescription: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.portfolioItem.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize
    }),
    prisma.portfolioItem.count({ where })
  ]);

  return { items, total, page: pagination.page, pageSize: pagination.pageSize };
}

export async function getPortfolioItemById(id: string) {
  return prisma.portfolioItem.findUnique({ where: { id } });
}

export async function createPortfolioItem(payload: unknown) {
  const data = portfolioItemSchema.parse(payload);
  return prisma.portfolioItem.create({ data });
}

export async function updatePortfolioItem(id: string, payload: unknown) {
  const data = portfolioItemSchema.partial().parse(payload);
  return prisma.portfolioItem.update({ where: { id }, data });
}

export async function deletePortfolioItem(id: string) {
  return prisma.portfolioItem.delete({ where: { id } });
}
