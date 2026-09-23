import { get } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/api-auth';
import { isPrivateCustomerBlobUrl, privateBlobToken } from '@/lib/customer-uploads/server';
import { prisma } from '@/lib/db/prisma';
import { sanitizeUploadFileName } from '@/lib/file-validation';
import { getPersistedBagetOrderSummary } from '@/lib/orders/bagetOrderSummary';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;
  const { id } = await context.params;
  const order = await prisma.order.findUnique({ where: { id }, select: { payloadJson: true, quoteJson: true } });
  if (!order) return NextResponse.json({ error: 'Файл не найден.' }, { status: 404 });
  const upload = getPersistedBagetOrderSummary(order.payloadJson, order.quoteJson)?.uploadedImage;
  if (!upload?.url || !isPrivateCustomerBlobUrl(upload.url)) return NextResponse.json({ error: 'Файл не найден.' }, { status: 404 });

  const result = await get(upload.url, { access: 'private', token: privateBlobToken() });
  if (!result?.stream) return NextResponse.json({ error: 'Файл не найден.' }, { status: 404 });
  const name = sanitizeUploadFileName(upload.fileName, 'customer-upload.bin');
  return new Response(result.stream, {
    headers: {
      'Content-Type': upload.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
