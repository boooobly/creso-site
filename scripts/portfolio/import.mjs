/** Idempotent curated portfolio import through the existing Blob and Prisma models. */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';

const directory = path.dirname(fileURLToPath(import.meta.url));
const cases = JSON.parse(await readFile(path.join(directory, 'cases.json'), 'utf8'));
const webDirectory = process.env.PORTFOLIO_WEB_DIR || path.join(directory, '..', 'audit-results', 'portfolio-2026-09-26', 'web');
const statePath = path.join(webDirectory, 'upload-state.json');
const dryRun = process.argv.includes('--dry-run');
const forceUpload = process.argv.includes('--force-upload');
const imageCount = cases.reduce((sum, item) => sum + item.images.length, 0);

if (dryRun) {
  console.log(`${cases.length} cases, ${imageCount} images, ${new Set(cases.map((item) => item.category)).size} categories`);
  process.exit(0);
}
if (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.DATABASE_URL) {
  throw new Error('BLOB_READ_WRITE_TOKEN and DATABASE_URL are required');
}

let state = {};
try { state = JSON.parse(await readFile(statePath, 'utf8')); } catch { /* first run */ }

// Upload in small batches. Persist each completed URL so an interrupted run resumes.
const entries = cases.flatMap((item) => item.images.map((image, index) => ({
  item, image, index,
  pathname: `portfolio/curated/${item.slug}-${String(index + 1).padStart(2, '0')}.webp`,
})));
let uploaded = 0;
for (let offset = 0; offset < entries.length; offset += 4) {
  const batch = entries.slice(offset, offset + 4);
  const results = await Promise.all(batch.map(async (entry) => {
    if (state[entry.pathname] && !forceUpload) return null;
    const file = await readFile(path.join(webDirectory, path.basename(entry.pathname)));
    const blob = await put(entry.pathname, file, {
      access: 'public',
      contentType: 'image/webp',
      addRandomSuffix: false,
      allowOverwrite: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return { pathname: entry.pathname, url: blob.url, sizeBytes: file.length };
  }));
  for (const result of results) {
    if (!result) continue;
    state[result.pathname] = { url: result.url, sizeBytes: result.sizeBytes };
    uploaded += 1;
  }
  if (results.some(Boolean)) await writeFile(statePath, JSON.stringify(state, null, 2));
  console.log(`Blob ${Math.min(offset + batch.length, entries.length)}/${entries.length} (${uploaded} uploaded this run)`);
}

const prisma = new PrismaClient();
try {
  for (const [position, item] of cases.entries()) {
    const images = [];
    for (const [index, image] of item.images.entries()) {
      const pathname = `portfolio/curated/${item.slug}-${String(index + 1).padStart(2, '0')}.webp`;
      const uploadedImage = state[pathname];
      if (!uploadedImage?.url) throw new Error(`Missing upload: ${pathname}`);
      let asset = await prisma.mediaAsset.findFirst({ where: { url: uploadedImage.url } });
      const data = {
        title: `${item.title} — фото ${index + 1}`,
        altText: image.alt,
        kind: 'image',
        scope: 'portfolio',
        url: uploadedImage.url,
        fileName: path.basename(pathname),
        mimeType: 'image/webp',
        sizeBytes: uploadedImage.sizeBytes,
        isActive: true,
        sortOrder: index,
      };
      asset = asset
        ? await prisma.mediaAsset.update({ where: { id: asset.id }, data })
        : await prisma.mediaAsset.create({ data });
      images.push({ url: asset.url, assetId: asset.id, alt: image.alt });
    }
    const data = {
      title: item.title,
      category: item.category,
      shortDescription: item.shortDescription,
      coverImage: images[0].url,
      coverImageAssetId: images[0].assetId,
      galleryImages: images,
      featured: Boolean(item.featured),
      published: true,
      sortOrder: item.sortOrder,
    };
    await prisma.portfolioItem.upsert({
      where: { slug: item.slug },
      create: { slug: item.slug, ...data },
      update: data,
    });
    if ((position + 1) % 10 === 0 || position + 1 === cases.length) {
      console.log(`Database ${position + 1}/${cases.length} cases`);
    }
  }
  // The three earlier real examples remain in the same portfolio model. Merge
  // alternate views of the two projects represented in this new collection.
  for (const [oldSlug, targetSlug] of [
    ['vyveskaa', 'perfume-facade'],
    ['vyveska-firdaus', 'firdaus-facade'],
  ]) {
    const [oldItem, target] = await Promise.all([
      prisma.portfolioItem.findUnique({ where: { slug: oldSlug } }),
      prisma.portfolioItem.findUnique({ where: { slug: targetSlug } }),
    ]);
    if (!oldItem || !target) continue;
    const existing = Array.isArray(target.galleryImages) ? target.galleryImages : [];
    const oldGallery = Array.isArray(oldItem.galleryImages) ? oldItem.galleryImages : [];
    const urls = [oldItem.coverImage, ...oldGallery.map((image) => typeof image === 'string' ? image : image?.url)]
      .filter((url) => typeof url === 'string' && /^https?:\/\//.test(url));
    const seen = new Set(existing.map((image) => typeof image === 'string' ? image : image?.url));
    const additions = urls.filter((url) => { if (seen.has(url)) return false; seen.add(url); return true; })
      .map((url, index) => ({ url, alt: `${target.title}: дополнительный ракурс ${index + 1}` }));
    await prisma.portfolioItem.update({ where: { id: target.id }, data: { galleryImages: [...existing, ...additions] } });
    await prisma.portfolioItem.update({ where: { id: oldItem.id }, data: { published: false } });
  }
  const computerClub = await prisma.portfolioItem.findUnique({ where: { slug: 'vyveska' } });
  if (computerClub) {
    await prisma.portfolioItem.update({ where: { id: computerClub.id }, data: {
      title: 'Вывеска компьютерного клуба',
      category: 'Световые вывески',
      sortOrder: cases.length,
    } });
  }
  console.log('Import complete. Existing unrelated cases were preserved.');
} finally {
  await prisma.$disconnect();
}
