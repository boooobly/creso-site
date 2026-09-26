/** Read-only verification of curated database records and public image URLs. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const directory = path.dirname(fileURLToPath(import.meta.url));
const cases = JSON.parse(await readFile(path.join(directory, 'cases.json'), 'utf8'));
const prisma = new PrismaClient();
try {
  const published = await prisma.portfolioItem.findMany({ where: { published: true }, include: { coverImageAsset: true } });
  const bySlug = new Map(published.map((item) => [item.slug, item]));
  const missingCases = cases.filter((item) => !bySlug.has(item.slug)).map((item) => item.slug);
  const images = [];
  const missingAlt = [];
  for (const item of cases) {
    const record = bySlug.get(item.slug);
    if (!record) continue;
    if (!record.coverImageAsset?.altText) missingAlt.push(item.slug);
    const gallery = Array.isArray(record.galleryImages) ? record.galleryImages : [];
    if (gallery.length < item.images.length) missingCases.push(`${item.slug}: gallery size ${gallery.length}`);
    for (const entry of gallery) {
      const image = typeof entry === 'string' ? { url: entry, alt: '' } : entry;
      if (!image?.alt) missingAlt.push(item.slug);
      if (image?.url) images.push(image.url);
    }
  }
  const urls = [...new Set(images.filter((url) => url.includes('/portfolio/curated/')))];
  const failed = [];
  for (let offset = 0; offset < urls.length; offset += 8) {
    await Promise.all(urls.slice(offset, offset + 8).map(async (url) => {
      try {
        const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
        if (!response.ok || !response.headers.get('content-type')?.includes('image/')) failed.push(response.status);
      } catch { failed.push('network'); }
    }));
  }
  const summary = {
    curatedCases: cases.length,
    publishedCases: published.length,
    verifiedCuratedImages: urls.length,
    missingCases,
    missingAlt: [...new Set(missingAlt)],
    failedImages: failed.length,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (missingCases.length || missingAlt.length || failed.length || urls.length !== cases.reduce((count, item) => count + item.images.length, 0)) process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
