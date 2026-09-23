import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
try {
  const orders = await prisma.order.findMany({ select: { source: true, payloadJson: true } });
  const totals = { orders: orders.length, publicBagetUploads: 0, privateBagetUploads: 0, privateServiceUploads: 0 };
  for (const order of orders) {
    const payload = order.payloadJson;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) continue;
    const image = payload.uploadedImage;
    if (order.source === 'baget' && image && typeof image === 'object' && typeof image.url === 'string') {
      if (image.url.includes('.public.blob.vercel-storage.com')) totals.publicBagetUploads += 1;
      if (image.url.includes('.private.blob.vercel-storage.com')) totals.privateBagetUploads += 1;
    }
    const refs = Array.isArray(payload.uploadRefs) ? payload.uploadRefs : Array.isArray(payload.files) ? payload.files : [];
    totals.privateServiceUploads += refs.filter((ref) => ref && typeof ref.url === 'string' && ref.url.includes('.private.blob.vercel-storage.com')).length;
  }
  console.log(JSON.stringify(totals));
} finally {
  await prisma.$disconnect();
}
