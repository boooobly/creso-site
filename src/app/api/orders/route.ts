import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { bagetQuote } from '@/lib/calculations/bagetQuote';
import { getBaguetteExtrasPricingConfig } from '@/lib/baget/baguetteExtrasPricing';
import { prisma } from '@/lib/db/prisma';
import { notifyNewOrder } from '@/lib/notifications/notifyNewOrder';
import { sendCustomerOrderEmail } from '@/lib/notifications/sendCustomerOrderEmail';
import { getBaseUrl } from '@/lib/url/getBaseUrl';
import { generateOrderNumber } from '@/lib/orders/generateOrderNumber';
import { createOrderAccessToken } from '@/lib/orders/pdfAccessToken';
import { normalizePhone } from '@/lib/utils/phone';
import { logger } from '@/lib/logger';
import { getServerEnv } from '@/lib/env';
import { getBagetCatalogFromSheet, mapSheetItemsToBagetItems } from '@/lib/baget/sheetsCatalog';
import { buildBagetOrderSummary, type PersistedOrderUpload } from '@/lib/orders/bagetOrderSummary';
import { MAX_ORDER_IMAGE_SIZE_BYTES, storeBagetCustomerImage } from '@/lib/orders/storeCustomerImage';
import { validateUploadedImageFile } from '@/lib/file-validation';
import { multipartErrorResponse, validateMultipartContentLength, validateMultipartFiles } from '@/lib/upload-safety';
import { normalizeBagetWidths } from '@/lib/baget/widths';
import { enforcePublicRequestGuard } from '@/lib/anti-spam';

export const runtime = 'nodejs';

const bagetItemSchema = z.object({
  id: z.string(),
  article: z.string(),
  name: z.string(),
  color: z.string(),
  style: z.string(),
  width_mm: z.number(),
  width_with_quarter_mm: z.number(),
  price_per_meter: z.number(),
  image: z.string(),
});

const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(1).max(32),
    email: z.string().trim().email().max(254).optional(),
    comment: z.string().trim().max(3000).optional(),
  }),
  baget: z.object({
    width: z.number().min(50).max(10_000),
    height: z.number().min(50).max(10_000),
    quantity: z.number().int().min(1).max(100).default(1),
    selectedBagetId: z.string().min(1).max(200).optional().nullable(),
    workType: z.enum(['canvas', 'stretchedCanvas', 'canvasOnStretcher', 'rhinestone', 'embroideryBeads', 'stretcherOnly', 'photo', 'other', 'embroidery', 'beads']),
    glazing: z.enum(['none', 'glass', 'antiReflectiveGlass', 'plexiglass', 'pet1mm']),
    hasPassepartout: z.boolean(),
    passepartoutSize: z.number().min(0).max(2000).optional(),
    passepartoutBottomSize: z.number().min(0).max(2000).optional(),
    backPanel: z.boolean(),
    hangerType: z.enum(['crocodile', 'wire']).nullable().optional(),
    stand: z.boolean(),
    stretcherType: z.enum(['narrow', 'wide']).nullable().optional(),
    frameMode: z.enum(['framed', 'noFrame']).nullable().optional(),
    requiresPrint: z.boolean().default(false),
    printMaterial: z.enum(['paper', 'canvas']).nullable().default(null),
    transferSource: z.enum(['manual', 'wide-format']).nullable().default('manual'),
  }),
  fulfillmentType: z.enum(['pickup', 'selfPickup', 'delivery']).default('pickup'),
  company: z.string().max(200).optional(),
});

type ParsedOrderInput = z.infer<typeof orderSchema>;

type ParsedOrderRequest = {
  payload: unknown;
  customerImageFile: File | null;
};
const ORDER_MAX_FILES = 1;
const ORDER_MAX_TOTAL_SIZE_BYTES = MAX_ORDER_IMAGE_SIZE_BYTES;
const ORDER_MAX_CONTENT_LENGTH_BYTES = MAX_ORDER_IMAGE_SIZE_BYTES + (1024 * 1024);
const ORDER_MAX_JSON_SIZE_BYTES = 256 * 1024;

class OrderPayloadTooLargeError extends Error {}

function parseJsonPayload(rawPayload: string): unknown {
  if (new TextEncoder().encode(rawPayload).byteLength > ORDER_MAX_JSON_SIZE_BYTES) {
    throw new OrderPayloadTooLargeError('Order payload is too large.');
  }

  if (!rawPayload) return null;

  try {
    return JSON.parse(rawPayload);
  } catch {
    return null;
  }
}

async function readLimitedJsonBody(request: NextRequest): Promise<string> {
  if (!request.body) return '';

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let rawPayload = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    totalBytes += value.byteLength;
    if (totalBytes > ORDER_MAX_JSON_SIZE_BYTES) {
      await reader.cancel();
      throw new OrderPayloadTooLargeError('Order payload is too large.');
    }

    rawPayload += decoder.decode(value, { stream: true });
  }

  return rawPayload + decoder.decode();
}

async function parseOrderRequest(request: NextRequest): Promise<ParsedOrderRequest> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const payloadRaw = formData.get('payload');
    const payloadText = typeof payloadRaw === 'string' ? payloadRaw : '';
    const payload = parseJsonPayload(payloadText);
    const fileValue = formData.get('customerImage');

    return {
      payload,
      customerImageFile: fileValue instanceof File && fileValue.size > 0 ? fileValue : null,
    };
  }

  const payload = parseJsonPayload(await readLimitedJsonBody(request));
  return { payload, customerImageFile: null };
}

const CUSTOMER_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const CUSTOMER_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

async function getSafeCustomerImageFile(file: File | null): Promise<File | null> {
  if (!file) return null;

  const validation = await validateUploadedImageFile({
    file,
    allowedMimeTypes: CUSTOMER_IMAGE_MIME_TYPES,
    allowedExtensions: CUSTOMER_IMAGE_EXTENSIONS,
    maxBytes: MAX_ORDER_IMAGE_SIZE_BYTES,
    rejectSvg: true,
  });

  if (!validation.ok) {
    logger.warn('orders.customer_image.invalid', { type: file.type, name: file.name, size: file.size, reason: validation.error });
    return null;
  }

  return file;
}

async function createOrderWithRetry(data: {
  payloadJson: Prisma.InputJsonValue;
  quote: ReturnType<typeof bagetQuote>;
  prepayRequired: boolean;
  prepayAmount: number | null;
  customer: {
    name: string;
    phone: string;
    email?: string;
    comment?: string;
  };
}): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const orderNumber = generateOrderNumber();

    try {
      await prisma.order.create({
        data: {
          number: orderNumber,
          source: 'baget',
          status: 'new',
          customerName: data.customer.name,
          phone: data.customer.phone,
          email: data.customer.email,
          comment: data.customer.comment,
          total: data.quote.total,
          prepayRequired: data.prepayRequired,
          prepayAmount: data.prepayAmount,
          payloadJson: data.payloadJson,
          quoteJson: data.quote as unknown as Prisma.InputJsonValue,
        },
      });

      return orderNumber;
    } catch (error) {
      if (
        typeof error === 'object'
        && error !== null
        && 'code' in error
        && (error as { code?: string }).code === 'P2002'
        && attempt < 9
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new Error('Failed to create unique order number after 10 collision retries.');
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const contentLengthValidation = validateMultipartContentLength(request, {
      maxContentLengthBytes: contentType.includes('multipart/form-data')
        ? ORDER_MAX_CONTENT_LENGTH_BYTES
        : ORDER_MAX_JSON_SIZE_BYTES,
    });
    if (!contentLengthValidation.ok) {
      return multipartErrorResponse(contentLengthValidation);
    }

    const { payload, customerImageFile } = await parseOrderRequest(request);
    const blockedResponse = enforcePublicRequestGuard(request, {
      route: '/api/orders',
      payload,
      honeypotFields: ['company'],
      requirePayload: true,
    });
    if (blockedResponse) {
      return blockedResponse;
    }

    const env = getServerEnv();

    const filesValidation = validateMultipartFiles(customerImageFile ? [customerImageFile] : [], {
      maxFiles: ORDER_MAX_FILES,
      maxFileBytes: MAX_ORDER_IMAGE_SIZE_BYTES,
      maxTotalBytes: ORDER_MAX_TOTAL_SIZE_BYTES,
      messages: {
        FILE_TOO_LARGE: 'Размер файла не должен превышать 10 МБ.',
        TOTAL_TOO_LARGE: 'Размер файла не должен превышать 10 МБ.',
      },
    });
    if (!filesValidation.ok) {
      return multipartErrorResponse(filesValidation);
    }
    const parsed = orderSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Не заполнены обязательные поля.' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(parsed.data.customer.phone);
    if (!normalizedPhone) {
      return NextResponse.json({ ok: false, error: 'Укажите телефон в формате +7XXXXXXXXXX.' }, { status: 400 });
    }

    const sheetItems = await getBagetCatalogFromSheet();
    const rawCatalog = mapSheetItemsToBagetItems(sheetItems).map((item) => {
      const widths = normalizeBagetWidths(item.width_mm, item.width_with_quarter_mm);
      return {
        ...item,
        width_mm: widths.visibleWidthMm,
        width_with_quarter_mm: widths.fullWidthMm,
      };
    });
    const allBagets = z.array(bagetItemSchema).parse(rawCatalog);
    const requiresBaget = parsed.data.baget.workType !== 'stretcherOnly' && !(parsed.data.baget.workType === 'stretchedCanvas' && parsed.data.baget.frameMode === 'noFrame');
    const selectedBaget = parsed.data.baget.selectedBagetId
      ? allBagets.find((item) => item.id === parsed.data.baget.selectedBagetId) ?? null
      : null;

    if (requiresBaget && !selectedBaget) {
      return NextResponse.json({ ok: false, error: 'Выбранный багет не найден.' }, { status: 400 });
    }

    const extrasPricing = await getBaguetteExtrasPricingConfig();
    const quote = bagetQuote({
      ...parsed.data.baget,
      selectedBaget,
    }, extrasPricing.config);

    if (quote.total <= 0) {
      return NextResponse.json({ ok: false, error: 'Не удалось рассчитать стоимость заказа.' }, { status: 400 });
    }

    const safeCustomerImageFile = await getSafeCustomerImageFile(customerImageFile);
    let uploadedImage: PersistedOrderUpload | null = null;

    if (safeCustomerImageFile) {
      uploadedImage = await storeBagetCustomerImage(safeCustomerImageFile).catch((error) => {
        logger.error('orders.customer_image.upload_failed', { error, name: safeCustomerImageFile.name, size: safeCustomerImageFile.size });
        return null;
      });
    }

    const normalizedPayload: ParsedOrderInput & {
      orderSummary: ReturnType<typeof buildBagetOrderSummary>;
      uploadedImage: PersistedOrderUpload | null;
    } = {
      ...parsed.data,
      customer: {
        ...parsed.data.customer,
        phone: normalizedPhone,
      },
      orderSummary: buildBagetOrderSummary({
        baget: parsed.data.baget,
        selectedBaget,
        quote,
        uploadedImage,
      }),
      uploadedImage,
    };

    const prepayRequired = false;
    const prepayAmount = null;

    const orderNumber = await createOrderWithRetry({
      payloadJson: normalizedPayload as unknown as Prisma.InputJsonValue,
      quote,
      prepayRequired,
      prepayAmount,
      customer: normalizedPayload.customer,
    });

    await notifyNewOrder({
      orderNumber,
      customer: normalizedPayload.customer,
      effectiveSize: quote.effectiveSize,
      quote,
      orderSummary: normalizedPayload.orderSummary,
      customerImageFile: safeCustomerImageFile,
    });

    const shouldSendCustomerEmail = env.SEND_CUSTOMER_EMAILS;
    const customerEmail = parsed.data.customer.email?.trim();
    const tokenSecret = env.ORDER_TOKEN_SECRET || env.ADMIN_TOKEN;
    const accessToken = createOrderAccessToken(orderNumber, tokenSecret);
    const secureOrderUrl = `${getBaseUrl()}/order/${encodeURIComponent(orderNumber)}?token=${encodeURIComponent(accessToken)}`;

    if (shouldSendCustomerEmail && customerEmail) {
      await sendCustomerOrderEmail({
        toEmail: customerEmail,
        customerName: parsed.data.customer.name,
        orderNumber,
        total: quote.total,
        orderUrl: secureOrderUrl,
      }).catch((error) => {
        logger.error('orders.customer_email.send_failed', { error, orderNumber, customerEmail });
      });
    }
    return NextResponse.json({
      orderNumber,
      quote,
      prepayRequired,
      prepayAmount,
      secureOrderUrl,
      accessToken,
    });
  } catch (error) {
    if (error instanceof OrderPayloadTooLargeError) {
      return NextResponse.json({ ok: false, error: 'Размер загружаемых данных превышает допустимый лимит.' }, { status: 413 });
    }

    const message = error instanceof Error ? error.message : 'Unknown server error.';
    if (message.startsWith('[env]')) {
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
    logger.error('orders.post.failed', { error });
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заказа.' }, { status: 500 });
  }
}
