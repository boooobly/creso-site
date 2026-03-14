import { prisma } from '@/lib/db/prisma';
import { listQuerySchema, pageContentSchema } from './validation';

type PageContentFilters = {
  page?: unknown;
  pageSize?: unknown;
  pageKey?: string;
  sectionKey?: string;
};

export async function listPageContentItems(filters: PageContentFilters) {
  const pagination = listQuerySchema.parse(filters);

  const where = {
    ...(filters.pageKey ? { pageKey: filters.pageKey } : {}),
    ...(filters.sectionKey ? { sectionKey: filters.sectionKey } : {})
  };

  const [items, total] = await Promise.all([
    prisma.pageContent.findMany({
      where,
      orderBy: [{ pageKey: 'asc' }, { sectionKey: 'asc' }, { sortOrder: 'asc' }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize
    }),
    prisma.pageContent.count({ where })
  ]);

  return { items, total, page: pagination.page, pageSize: pagination.pageSize };
}

export async function createPageContentItem(payload: unknown) {
  const data = pageContentSchema.parse(payload);
  return prisma.pageContent.create({ data });
}

export async function updatePageContentItem(id: string, payload: unknown) {
  const data = pageContentSchema.partial().parse(payload);
  return prisma.pageContent.update({ where: { id }, data });
}

export async function deletePageContentItem(id: string) {
  return prisma.pageContent.delete({ where: { id } });
}
