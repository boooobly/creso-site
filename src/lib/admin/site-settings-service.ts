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
