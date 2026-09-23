import { PrismaClient } from '@prisma/client';
import { put, head, del } from '@vercel/blob';
import { randomUUID } from 'node:crypto';

const apply = process.argv.includes('--apply');
const prisma = new PrismaClient();
const privateToken = process.env.PRIVATE_READ_WRITE_TOKEN;
const publicToken = process.env.BLOB_READ_WRITE_TOKEN;
if (apply && (!privateToken || !publicToken)) throw new Error('Both Blob store tokens are required.');

let migrated = 0;
let removedPublic = 0;
try {
  const orders = await prisma.order.findMany({ where: { source: 'baget' }, select: { id: true, payloadJson: true } });
  const candidates = orders.filter((order) => {
    const payload = order.payloadJson;
    const url = payload && typeof payload === 'object' && !Array.isArray(payload) && payload.uploadedImage && typeof payload.uploadedImage === 'object'
      ? payload.uploadedImage.url : null;
    return typeof url === 'string' && /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\/uploads\//.test(url);
  });
  if (!apply) {
    console.log(JSON.stringify({ candidates: candidates.length, dryRun: true }));
    process.exitCode = 0;
  } else {
    for (const order of candidates) {
      const payload = JSON.parse(JSON.stringify(order.payloadJson));
      const oldUrl = payload.uploadedImage.url;
      const response = await fetch(oldUrl, { redirect: 'error' });
      if (!response.ok) throw new Error(`Legacy file read failed: ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length || bytes.length > 10 * 1024 * 1024) throw new Error('Legacy file size is invalid.');
      const extension = /^\.(jpg|jpeg|png|webp|gif|avif)$/.test(oldUrl.match(/\.[^.?#]+(?=[?#]|$)/)?.[0] ?? '')
        ? oldUrl.match(/\.[^.?#]+(?=[?#]|$)/)[0] : '.bin';
      const pathname = `uploads/customers/baget/migrated/${randomUUID()}${extension}`;
      const blob = await put(pathname, bytes, { access: 'private', token: privateToken, contentType: payload.uploadedImage.mimeType || response.headers.get('content-type') || 'application/octet-stream' });
      try {
        const metadata = await head(blob.url, { token: privateToken });
        if (metadata?.size !== bytes.length) throw new Error('Private Blob verification failed.');
        payload.uploadedImage = { ...payload.uploadedImage, url: blob.url, pathname: blob.pathname, sizeBytes: bytes.length };
        if (payload.orderSummary?.uploadedImage) payload.orderSummary.uploadedImage = { ...payload.orderSummary.uploadedImage, url: blob.url, pathname: blob.pathname, sizeBytes: bytes.length };
        await prisma.$transaction(async (tx) => {
          await tx.order.update({ where: { id: order.id }, data: { payloadJson: payload } });
          const jobs = await tx.notificationOutbox.findMany({ where: { orderId: order.id, kind: 'telegram.document-url' } });
          for (const job of jobs) {
            const jobPayload = job.payloadJson;
            if (jobPayload && typeof jobPayload === 'object' && !Array.isArray(jobPayload) && jobPayload.url === oldUrl) {
              await tx.notificationOutbox.update({ where: { id: job.id }, data: { payloadJson: { ...jobPayload, url: blob.url } } });
            }
          }
        });
        migrated += 1;
      } catch (error) {
        await del(blob.url, { token: privateToken });
        throw error;
      }
      await del(oldUrl, { token: publicToken });
      removedPublic += 1;
    }
    console.log(JSON.stringify({ candidates: candidates.length, migrated, removedPublic }));
  }
} finally {
  await prisma.$disconnect();
}
