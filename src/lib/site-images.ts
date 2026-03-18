import { cache } from 'react';
import { prisma } from '@/lib/db/prisma';
import { SITE_IMAGE_SLOTS } from '@/lib/site-image-slots';

export type SiteImageRecord = {
  key: string;
  url: string;
  altText: string;
};

const getSiteImagesMap = cache(async () => {
  try {
    const rows = await prisma.mediaAsset.findMany({
      where: {
        scope: 'site',
        kind: 'image',
        isActive: true,
        fileName: { in: SITE_IMAGE_SLOTS.map((slot) => slot.key) },
      },
      select: {
        fileName: true,
        url: true,
        altText: true,
      },
    });

    const map = new Map<string, SiteImageRecord>();

    for (const row of rows) {
      if (!row.fileName) continue;

      map.set(row.fileName, {
        key: row.fileName,
        url: row.url,
        altText: row.altText?.trim() || '',
      });
    }

    return map;
  } catch {
    return new Map<string, SiteImageRecord>();
  }
});

export async function getSiteImage(slotKey: string) {
  const map = await getSiteImagesMap();
  return map.get(slotKey) ?? null;
}

export async function getSiteImages(slotKeys: string[]) {
  const map = await getSiteImagesMap();
  return slotKeys.reduce<Record<string, SiteImageRecord | null>>((acc, key) => {
    acc[key] = map.get(key) ?? null;
    return acc;
  }, {});
}
