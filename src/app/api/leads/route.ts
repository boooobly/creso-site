import { readFormDataLimited, RequestBodyError, readJsonLimited } from '@/lib/request-body';
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { buildLeadNotificationText, type LeadNotificationFile } from '@/lib/notifications/leadNotificationUtils';
import { normalizePhone } from '@/lib/utils/phone';
import { enforcePublicRequestGuard, getClientIp } from '@/lib/anti-spam';
import { sourceTitle } from '@/lib/utils/sourceTitle';
import { readCustomerUploadRefs, storeLegacyCustomerFile } from '@/lib/customer-uploads/server';
import type { CustomerUploadRef } from '@/lib/customer-uploads/shared';

import { logger } from '@/lib/logger';
import { multipartErrorResponse, validateMultipartContentLength, validateMultipartFiles } from '@/lib/upload-safety';
import { createServiceRequestOrder } from '@/lib/orders/createServiceRequestOrder';
import { createRequestFingerprint, idempotencyErrorResponse, readIdempotencyKey } from '@/lib/orders/idempotency';
import { buildManagerNotificationJobs, buildTelegramDocumentUrlJob, processNotificationJobsBestEffort } from '@/lib/notifications/outbox';
export const runtime = 'nodejs';

const optionalTrimmedString = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  },
  z.string().optional(),
);

const optionalEmail = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  },
  z.string().email().optional(),
);

const optionalPositiveNumber = z.preprocess(
  (value) => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : value;
  },
  z.number().positive().optional(),
);

const leadSchema = z.object({
  source: z.string().trim().min(1),
  name: z.string().trim().min(2),
  phone: optionalTrimmedString,
  email: optionalEmail,
  widthMm: optionalPositiveNumber,
  heightMm: optionalPositiveNumber,
  comment: optionalTrimmedString,
  pageUrl: optionalTrimmedString,
  extras: z.record(z.unknown()).optional(),
  company: optionalTrimmedString,
}).superRefine((value, ctx) => {
  if (!value.phone && !value.email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['phone'],
      message: 'Укажите телефон или e-mail.',
    });
  }
});

type ParsedLeadRequest = {
  payload: unknown;
  files: File[];
  formData?: FormData;
};

const LEADS_MAX_FILES = 5;
const LEADS_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const LEADS_MAX_TOTAL_SIZE_BYTES = 20 * 1024 * 1024;
const LEADS_MAX_CONTENT_LENGTH_BYTES = 22 * 1024 * 1024;

async function parseLeadRequest(request: NextRequest): Promise<ParsedLeadRequest> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await readFormDataLimited(request, LEADS_MAX_CONTENT_LENGTH_BYTES);
    const extrasRaw = formData.get('extras');
    let extras: Record<string, unknown> | undefined;

    if (typeof extrasRaw === 'string' && extrasRaw.trim()) {
      try {
        const parsed = JSON.parse(extrasRaw) as unknown;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          extras = parsed as Record<string, unknown>;
        }
      } catch (error) {
        logger.warn('leads.multipart.invalid_extras_json', { error });
      }
    }

    const files = formData
      .getAll('files')
      .filter((value): value is File => value instanceof File && value.size > 0);

    return {
      payload: {
        source: typeof formData.get('source') === 'string' ? formData.get('source') : undefined,
        name: typeof formData.get('name') === 'string' ? formData.get('name') : undefined,
        phone: typeof formData.get('phone') === 'string' ? formData.get('phone') : undefined,
        email: typeof formData.get('email') === 'string' ? formData.get('email') : undefined,
        widthMm: typeof formData.get('widthMm') === 'string' ? formData.get('widthMm') : undefined,
        heightMm: typeof formData.get('heightMm') === 'string' ? formData.get('heightMm') : undefined,
        comment: typeof formData.get('comment') === 'string' ? formData.get('comment') : undefined,
        pageUrl: typeof formData.get('pageUrl') === 'string' ? formData.get('pageUrl') : undefined,
        company: typeof formData.get('company') === 'string' ? formData.get('company') : undefined,
        extras,
      },
      files,
      formData,
    };
  }

  return {
    payload: await readJsonLimited(request),
    files: [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const contentLengthValidation = validateMultipartContentLength(request, {
        maxContentLengthBytes: LEADS_MAX_CONTENT_LENGTH_BYTES,
      });
      if (!contentLengthValidation.ok) {
        return multipartErrorResponse(contentLengthValidation);
      }
    }

    const ip = getClientIp(request);
    const { payload, files, formData } = await parseLeadRequest(request);
    const filesValidation = validateMultipartFiles(files, {
      maxFiles: LEADS_MAX_FILES,
      maxFileBytes: LEADS_MAX_FILE_SIZE_BYTES,
      maxTotalBytes: LEADS_MAX_TOTAL_SIZE_BYTES,
    });
    if (!filesValidation.ok) {
      return multipartErrorResponse(filesValidation);
    }

    const blockedResponse = await enforcePublicRequestGuard(request, {
      route: '/api/leads',
      payload,
      requirePayload: true,
    });

    if (blockedResponse) {
      return blockedResponse;
    }
    const parsed = leadSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Не заполнены обязательные поля.' }, { status: 400 });
    }

    if (parsed.data.company?.trim()) {
      return NextResponse.json({ ok: true });
    }

    const normalizedPhone = parsed.data.phone ? normalizePhone(parsed.data.phone) || undefined : undefined;
    if (parsed.data.phone && !normalizedPhone) {
      return NextResponse.json({ ok: false, error: 'Укажите телефон в формате +7XXXXXXXXXX.' }, { status: 400 });
    }

    const referer = request.headers.get('referer') || request.headers.get('origin') || '';
    const idempotencyKey = readIdempotencyKey(request.headers);
    const uploadedRefs = formData ? await readCustomerUploadRefs(formData, 'lead', idempotencyKey) : [];
    if (files.length + uploadedRefs.length > LEADS_MAX_FILES || uploadedRefs.reduce((sum, ref) => sum + ref.size, 0) + files.reduce((sum, file) => sum + file.size, 0) > LEADS_MAX_TOTAL_SIZE_BYTES || uploadedRefs.some((ref) => ref.size > LEADS_MAX_FILE_SIZE_BYTES || ref.field !== 'files')) {
      return NextResponse.json({ ok: false, error: 'Превышен лимит вложений.' }, { status: 413 });
    }
    const legacyRefs = await Promise.all(files.map((file) => storeLegacyCustomerFile(file, 'lead', idempotencyKey)));
    const allRefs: CustomerUploadRef[] = [...uploadedRefs, ...legacyRefs];
    const notificationFiles: LeadNotificationFile[] = allRefs.map((ref) => ({ name: ref.name, size: ref.size, type: ref.type }));
    const requestHash = idempotencyKey
      ? createRequestFingerprint({
        ...parsed.data,
        phone: normalizedPhone ?? null,
        company: null,
        files: notificationFiles,
      })
      : undefined;
    const createdOrder = await createServiceRequestOrder({
      source: 'lead',
      customer: { name: parsed.data.name, phone: normalizedPhone, email: parsed.data.email, comment: parsed.data.comment },
      total: 0,
      payloadJson: JSON.parse(JSON.stringify({ service: 'lead', source: parsed.data.source, customer: { name: parsed.data.name, phone: normalizedPhone || null, email: parsed.data.email || null, comment: parsed.data.comment || null }, fields: { ...parsed.data, phone: normalizedPhone ?? null, company: null }, files: allRefs, referer, ip })),
      idempotencyKey,
      requestHash,
      buildNotificationJobs: (orderNumber) => {
        const text = [`Номер заявки: #${orderNumber}`, buildLeadNotificationText({
          ...parsed.data,
          phone: normalizedPhone,
          pageUrl: parsed.data.pageUrl || referer,
          files: notificationFiles,
        })].join('\n');

        return [...buildManagerNotificationJobs({
          subject: `Новая заявка: ${sourceTitle(parsed.data.source)}`,
          text,
        }), ...allRefs.map((ref, index) => buildTelegramDocumentUrlJob({
          url: ref.url,
          filename: ref.name,
          mime: ref.type,
          caption: `Файл к заявке #${orderNumber}: ${ref.name}`,
          dedupeSuffix: `manager-document-${index}`,
        }))];
      },
    });

    await processNotificationJobsBestEffort((createdOrder.notificationJobs ?? []).map((job) => job.id));

    return NextResponse.json(
      { ok: true },
      { headers: createdOrder.reused ? { 'X-Idempotent-Replay': 'true' } : undefined },
    );
  } catch (error) {
    if (error instanceof RequestBodyError) return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    const idempotencyResponse = idempotencyErrorResponse(error);
    if (idempotencyResponse) return idempotencyResponse;
    logger.error('api.request.failed', { error });
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 500 });
  }
}
