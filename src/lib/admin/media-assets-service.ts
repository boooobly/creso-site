import { prisma } from '@/lib/db/prisma';
import { mediaAssetSchema } from './validation';

export async function listMediaAssets() {
  return prisma.mediaAsset.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
  });
}

export async function createMediaAsset(payload: unknown) {
  const data = mediaAssetSchema.parse(payload);
  return prisma.mediaAsset.create({ data });
}
