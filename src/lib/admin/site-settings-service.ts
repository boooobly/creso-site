import { prisma } from '@/lib/db/prisma';
import { listQuerySchema, siteSettingSchema } from './validation';

type SiteSettingsFilters = {
  page?: unknown;
  pageSize?: unknown;
  group?: string;
};

export async function listSiteSettings(filters: SiteSettingsFilters) {
  const pagination = listQuerySchema.parse(filters);
  const where = filters.group ? { group: filters.group } : {};

  const [items, total] = await Promise.all([
    prisma.siteSetting.findMany({
      where,
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize
    }),
    prisma.siteSetting.count({ where })
  ]);

  return { items, total, page: pagination.page, pageSize: pagination.pageSize };
}

export async function createSiteSetting(payload: unknown) {
  const data = siteSettingSchema.parse(payload);
  return prisma.siteSetting.create({ data });
}

export async function updateSiteSetting(id: string, payload: unknown) {
  const data = siteSettingSchema.partial().parse(payload);
  return prisma.siteSetting.update({ where: { id }, data });
}

export async function deleteSiteSetting(id: string) {
  return prisma.siteSetting.delete({ where: { id } });
}

export async function listSiteSettingsByKeys(keys: string[]) {
  const items = await prisma.siteSetting.findMany({
    where: { key: { in: keys } },
    orderBy: { key: 'asc' }
  });

  return new Map(items.map((item) => [item.key, item]));
}

export async function upsertSiteSettings(
  entries: Array<{ key: string; label: string; group: string; description?: string; value: string }>
) {
  await prisma.$transaction(
    entries.map((entry) =>
      prisma.siteSetting.upsert({
        where: { key: entry.key },
        update: {
          value: entry.value,
          label: entry.label,
          group: entry.group,
          description: entry.description,
          type: 'string'
        },
        create: {
          key: entry.key,
          value: entry.value,
          label: entry.label,
          group: entry.group,
          description: entry.description,
          type: 'string'
        }
      })
    )
  );
}
