import { Prisma } from '@prisma/client';
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

export async function listPageContentByPageKey(pageKey: string) {
  return prisma.pageContent.findMany({
    where: { pageKey },
    orderBy: [{ sectionKey: 'asc' }, { sortOrder: 'asc' }, { fieldKey: 'asc' }]
  });
}

export function toPageContentStringMap(items: Array<{ sectionKey: string; fieldKey: string; value: Prisma.JsonValue }>) {
  const map = new Map<string, string>();

  for (const item of items) {
    const key = `${item.sectionKey}.${item.fieldKey}`;
    const value = typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
    map.set(key, value);
  }

  return map;
}

export async function upsertPageContentFields(
  pageKey: string,
  entries: Array<{
    sectionKey: string;
    fieldKey: string;
    label: string;
    value: string;
    type: string;
    sortOrder: number;
  }>
) {
  return prisma.$transaction(
    entries.map((entry) =>
      prisma.pageContent.upsert({
        where: {
          pageKey_sectionKey_fieldKey: {
            pageKey,
            sectionKey: entry.sectionKey,
            fieldKey: entry.fieldKey
          }
        },
        create: {
          pageKey,
          sectionKey: entry.sectionKey,
          fieldKey: entry.fieldKey,
          value: entry.value,
          type: entry.type,
          label: entry.label,
          sortOrder: entry.sortOrder
        },
        update: {
          value: entry.value,
          label: entry.label,
          sortOrder: entry.sortOrder,
          type: entry.type
        }
      })
    )
  );
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
