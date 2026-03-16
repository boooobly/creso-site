import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { listQuerySchema, mediaAssetSchema } from './validation';

type MediaFilters = {
  page?: unknown;
  pageSize?: unknown;
  scope?: 'site' | 'portfolio';
  search?: string;
};

export async function listMediaAssets(filters: MediaFilters = {}) {
  const pagination = listQuerySchema.parse(filters);
  const search = filters.search?.trim();

  const where: Prisma.MediaAssetWhereInput = {
    ...(filters.scope ? { scope: filters.scope } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { altText: { contains: search, mode: 'insensitive' } },
            { fileName: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize
    }),
    prisma.mediaAsset.count({ where })
  ]);

  return { items, total, page: pagination.page, pageSize: pagination.pageSize };
}

export async function getMediaAssetById(id: string) {
  return prisma.mediaAsset.findUnique({ where: { id } });
}

export async function createMediaAsset(payload: unknown) {
  const data = mediaAssetSchema.parse(payload);
  return prisma.mediaAsset.create({ data });
}

export async function updateMediaAsset(id: string, payload: unknown) {
  const data = mediaAssetSchema.partial().parse(payload);
  return prisma.mediaAsset.update({ where: { id }, data });
}

export async function deleteMediaAsset(id: string) {
  const linkedPortfolioCount = await prisma.portfolioItem.count({ where: { coverImageAssetId: id } });

  if (linkedPortfolioCount > 0) {
    throw new Error('Изображение используется в портфолио. Сначала замените его в карточках работ.');
  }

  return prisma.mediaAsset.delete({ where: { id } });
}
