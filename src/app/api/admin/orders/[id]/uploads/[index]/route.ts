import { get } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/api-auth';
import { getOrderCustomerUploadRefs, privateBlobToken } from '@/lib/customer-uploads/server';
import { prisma } from '@/lib/db/prisma';
import { sanitizeUploadFileName } from '@/lib/file-validation';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string; index: string }> }) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;
  const { id, index } = await context.params;
  if (!/^\d{1,2}$/.test(index)) return NextResponse.json({ error: 'Файл не найден.' }, { status: 404 });
  const order = await prisma.order.findUnique({ where: { id }, select: { payloadJson: true } });
  const ref = order ? getOrderCustomerUploadRefs(order.payloadJson)[Number(index)] : undefined;
  if (!ref) return NextResponse.json({ error: 'Файл не найден.' }, { status: 404 });
  const result = await get(ref.url, { access: 'private', token: privateBlobToken() });
  if (!result?.stream) return NextResponse.json({ error: 'Файл не найден.' }, { status: 404 });
  return new Response(result.stream, {
    headers: {
      'Content-Type': ref.type,
      'Content-Disposition': `attachment; filename="${sanitizeUploadFileName(ref.name, 'customer-upload.bin')}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
