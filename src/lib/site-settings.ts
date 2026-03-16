import { cache } from 'react';
import { prisma } from '@/lib/db/prisma';
import { BRAND } from '@/lib/constants';

export const SITE_SETTING_KEYS = {
  companyName: 'company.name',
  companyShortInfo: 'company.shortInfo',
  phone: 'contact.phone',
  whatsapp: 'contact.whatsapp',
  telegram: 'contact.telegram',
  email: 'contact.email',
  address: 'contact.address',
  workingHours: 'contact.workingHours',
  vkLink: 'social.vk',
  footerText: 'footer.text',
  seoTitle: 'seo.defaultTitle',
  seoDescription: 'seo.defaultDescription',
  seoSiteName: 'seo.siteName',
  seoOgImage: 'seo.ogImage',
} as const;

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePhoneHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits ? `+${digits}` : '';
}

const getSettingsMap = cache(async () => {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: Object.values(SITE_SETTING_KEYS) } },
      select: { key: true, value: true },
    });

    return new Map(rows.map((row) => [row.key, asString(row.value)]));
  } catch {
    return new Map<string, string>();
  }
});

export async function getPublicSiteSettings() {
  const settings = await getSettingsMap();

  const companyName = settings.get(SITE_SETTING_KEYS.companyName) || BRAND.name;
  const phone = settings.get(SITE_SETTING_KEYS.phone) || BRAND.phone;
  const email = settings.get(SITE_SETTING_KEYS.email) || BRAND.email;
  const address = settings.get(SITE_SETTING_KEYS.address) || BRAND.address;
  const telegram = settings.get(SITE_SETTING_KEYS.telegram) || '@Credomir';
  const whatsapp = settings.get(SITE_SETTING_KEYS.whatsapp) || phone;

  return {
    companyName,
    companyShortInfo: settings.get(SITE_SETTING_KEYS.companyShortInfo) || 'Рекламно-производственная компания полного цикла.',
    phone,
    phoneHref: normalizePhoneHref(phone),
    whatsapp,
    telegram,
    email,
    address,
    workingHours: settings.get(SITE_SETTING_KEYS.workingHours) || 'Пн–Пт: 9:00–17:30',
    vkLink: settings.get(SITE_SETTING_KEYS.vkLink),
    footerText: settings.get(SITE_SETTING_KEYS.footerText) || `© 2026 ${companyName}. Все права защищены.`,
    seoTitle: settings.get(SITE_SETTING_KEYS.seoTitle) || `${companyName} — рекламно-производственная компания`,
    seoDescription:
      settings.get(SITE_SETTING_KEYS.seoDescription) ||
      'Багетное оформление, фрезеровка, широкоформатная печать, наружная реклама в Невинномысске.',
    seoSiteName: settings.get(SITE_SETTING_KEYS.seoSiteName) || companyName,
    seoOgImage: settings.get(SITE_SETTING_KEYS.seoOgImage) || '/og-image.png',
  };
}
