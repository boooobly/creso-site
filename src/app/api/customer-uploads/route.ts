import { handleUpload } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';
import { claimPublicQuota } from '@/lib/distributed-rate-limit';
import { getClientIp } from '@/lib/anti-spam';
import { logger } from '@/lib/logger';
import { CUSTOMER_UPLOAD_MAX_FILE_BYTES, isCustomerUploadScope, isSafeUploadKey } from '@/lib/customer-uploads/shared';
import { MUGS_ALLOWED_MIME_TYPES } from '@/lib/pricing-config/mugs';
import { MILLING_ALLOWED_MIME_TYPES } from '@/lib/pricing-config/milling';

export const runtime = 'nodejs';

const MAX_TOKEN_REQUEST_BYTES = 8 * 1024;
const MAX_TOKENS_PER_HOUR = 30;
const MB = 1024 * 1024;
const MAX_BYTES_BY_SCOPE = { baget: 10 * MB, lead: 10 * MB, 'wide-format': CUSTOMER_UPLOAD_MAX_FILE_BYTES, tshirts: 20 * MB, mugs: 10 * MB, milling: 5 * MB, 'business-cards': 5 * MB } as const;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const PRINT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/pdf', 'application/postscript', 'application/vnd.adobe.photoshop', 'application/illustrator'];

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try { return new URL(origin).host === request.nextUrl.host; } catch { return false; }
}

async function consumeQuota(request: NextRequest): Promise<boolean> {
  return claimPublicQuota({ ip: getClientIp(request), kind: 'uploads', max: MAX_TOKENS_PER_HOUR, windowMs: 60 * 60_000 });
}

export async function POST(request: NextRequest) {
  try {
    const token = process.env.PRIVATE_READ_WRITE_TOKEN;
    if (!token) throw new Error('Private customer storage is not configured.');
    if (!sameOrigin(request) || !request.headers.get('user-agent')) {
      return NextResponse.json({ error: 'Недопустимый запрос.' }, { status: 403 });
    }
    const bodyText = await request.text();
    if (new TextEncoder().encode(bodyText).length > MAX_TOKEN_REQUEST_BYTES) {
      return NextResponse.json({ error: 'Слишком большой запрос.' }, { status: 413 });
    }
    const body = JSON.parse(bodyText);
    const result = await handleUpload({
      request,
      body,
      token,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload || '{}') as Record<string, unknown>;
        if (!isCustomerUploadScope(payload.scope) || !isSafeUploadKey(payload.idempotencyKey)) throw new Error('Invalid upload request.');
        if (!pathname.startsWith(`uploads/customers/${payload.scope}/${payload.idempotencyKey}/`) || pathname.length > 300) throw new Error('Invalid upload pathname.');
        if (!(await consumeQuota(request))) throw new Error('Upload limit exceeded.');
        if (payload.scope === 'wide-format' && !(await claimPublicQuota({ ip: getClientIp(request), kind: 'uploads-wide', max: 6, windowMs: 60 * 60_000 }))) throw new Error('Upload limit exceeded.');
        return {
          maximumSizeInBytes: MAX_BYTES_BY_SCOPE[payload.scope],
          allowedContentTypes: payload.scope === 'baget' ? IMAGE_TYPES
            : payload.scope === 'lead' ? undefined
            : payload.scope === 'mugs' || payload.scope === 'tshirts' ? [...MUGS_ALLOWED_MIME_TYPES]
            : payload.scope === 'milling' ? [...MILLING_ALLOWED_MIME_TYPES]
            : PRINT_TYPES,
          validUntil: Date.now() + 10 * 60 * 1000,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({ scope: payload.scope, idempotencyKey: payload.idempotencyKey }),
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    logger.warn('customer_upload.token_failed', { error });
    return NextResponse.json({ error: 'Не удалось загрузить файл.' }, { status: 400 });
  }
}
