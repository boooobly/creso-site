import { createHash } from 'node:crypto';
import { prisma } from '@/lib/db/prisma';
import { isIpRateLimited } from '@/lib/rate-limit';

const localQuota = new Map<string, number>();

export async function claimPublicQuota(params: { ip: string; kind: string; max: number; windowMs: number; now?: number }): Promise<boolean> {
  const now = params.now ?? Date.now();
  if (process.env.ENABLE_DATABASE?.toLowerCase() !== 'true') {
    if (params.kind === 'requests') return !isIpRateLimited(params.ip, now);
    const localKey = `${params.kind}:${Math.floor(now / params.windowMs)}:${params.ip}`;
    const count = (localQuota.get(localKey) ?? 0) + 1;
    localQuota.set(localKey, count);
    if (localQuota.size > 10_000) localQuota.clear();
    return count <= params.max;
  }

  const hash = createHash('sha256').update(params.ip).digest('hex');
  const id = `${params.kind}:${Math.floor(now / params.windowMs)}:${hash}`;
  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "PublicUploadQuota" ("id", "count") VALUES (${id}, 1)
    ON CONFLICT ("id") DO UPDATE SET "count" = "PublicUploadQuota"."count" + 1
    WHERE "PublicUploadQuota"."count" < ${params.max}
    RETURNING "count"
  `;
  return rows.length === 1;
}

export async function pruneExpiredPublicQuotas(now = Date.now()): Promise<void> {
  if (process.env.ENABLE_DATABASE?.toLowerCase() !== 'true') return;
  await prisma.publicUploadQuota.deleteMany({ where: { createdAt: { lt: new Date(now - 48 * 60 * 60_000) } } });
}
