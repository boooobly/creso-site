import type { NotificationOutbox, Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getServerEnv } from '@/lib/env';
import { sanitizeUploadFileName } from '@/lib/file-validation';
import { logger } from '@/lib/logger';
import { getSmtpConfig, sendEmailLead, sendSmtpEmail } from '@/lib/notifications/email';
import { sendTelegramDocumentBuffer, sendTelegramLead } from '@/lib/notifications/telegram';
import type { PendingNotificationJob } from '@/lib/orders/createOrder';
import { buildEmailHtmlFromText } from '@/lib/utils/email';

const TELEGRAM_TEXT_KIND = 'telegram.text';
const EMAIL_LEAD_KIND = 'email.lead';
const EMAIL_DIRECT_KIND = 'email.direct';
const TELEGRAM_DOCUMENT_URL_KIND = 'telegram.document-url';
const LOCK_TIMEOUT_MS = 5 * 60 * 1000;
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const DOCUMENT_FETCH_TIMEOUT_MS = 15_000;

const telegramTextSchema = z.object({ text: z.string().min(1).max(100_000) });
const emailLeadSchema = z.object({
  subject: z.string().min(1).max(500),
  html: z.string().min(1).max(500_000),
});
const emailDirectSchema = z.object({
  to: z.string().email().max(254),
  subject: z.string().min(1).max(500),
  html: z.string().max(500_000).optional(),
  text: z.string().max(500_000).optional(),
}).refine((payload) => Boolean(payload.html || payload.text), 'Email body is required.');
const telegramDocumentUrlSchema = z.object({
  url: z.string().url().max(2_048),
  filename: z.string().min(1).max(255),
  mime: z.string().max(255).optional(),
  caption: z.string().max(1_024).optional(),
});

function jsonPayload(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function buildManagerNotificationJobs(params: {
  subject: string;
  text: string;
}): PendingNotificationJob[] {
  return [
    {
      kind: TELEGRAM_TEXT_KIND,
      dedupeSuffix: 'manager-telegram',
      payloadJson: jsonPayload({ text: params.text }),
    },
    {
      kind: EMAIL_LEAD_KIND,
      dedupeSuffix: 'manager-email',
      payloadJson: jsonPayload({
        subject: params.subject,
        html: buildEmailHtmlFromText(params.text),
      }),
    },
  ];
}

export function buildDirectEmailJob(params: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  dedupeSuffix?: string;
}): PendingNotificationJob {
  return {
    kind: EMAIL_DIRECT_KIND,
    dedupeSuffix: params.dedupeSuffix ?? 'customer-email',
    payloadJson: jsonPayload({ to: params.to, subject: params.subject, text: params.text, html: params.html }),
  };
}

export function buildTelegramDocumentUrlJob(params: {
  url: string;
  filename: string;
  mime?: string | null;
  caption?: string;
}): PendingNotificationJob {
  return {
    kind: TELEGRAM_DOCUMENT_URL_KIND,
    dedupeSuffix: 'manager-telegram-document',
    payloadJson: jsonPayload({
      url: params.url,
      filename: params.filename,
      mime: params.mime || undefined,
      caption: params.caption,
    }),
  };
}

function assertAllowedBlobUrl(rawUrl: string): URL {
  const url = new URL(rawUrl);
  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== 'https:'
    || url.username
    || url.password
    || url.port
    || !hostname.endsWith('.public.blob.vercel-storage.com')
  ) {
    throw new Error('Notification document URL is not an allowed public Vercel Blob URL.');
  }
  return url;
}

async function downloadNotificationDocument(rawUrl: string): Promise<{ bytes: Buffer; mime?: string }> {
  const url = assertAllowedBlobUrl(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DOCUMENT_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'error',
      headers: { Accept: 'application/octet-stream,image/*' },
    });
    if (!response.ok || !response.body) {
      throw new Error(`Notification document fetch failed with status ${response.status}.`);
    }

    assertAllowedBlobUrl(response.url);
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_DOCUMENT_BYTES) {
      throw new Error('Notification document exceeds the 10 MB limit.');
    }

    const chunks: Uint8Array[] = [];
    const reader = response.body.getReader();
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_DOCUMENT_BYTES) {
        await reader.cancel();
        throw new Error('Notification document exceeds the 10 MB limit.');
      }
      chunks.push(value);
    }

    return {
      bytes: Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))),
      mime: response.headers.get('content-type')?.slice(0, 255) || undefined,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function dispatchNotification(job: NotificationOutbox): Promise<void> {
  if (job.kind === TELEGRAM_TEXT_KIND) {
    const payload = telegramTextSchema.parse(job.payloadJson);
    const env = getServerEnv();
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      throw new Error('Telegram is not configured for notification delivery.');
    }
    await sendTelegramLead(payload.text);
    return;
  }

  if (job.kind === EMAIL_LEAD_KIND) {
    if (!getSmtpConfig()) throw new Error('SMTP is not configured for notification delivery.');
    await sendEmailLead(emailLeadSchema.parse(job.payloadJson));
    return;
  }

  if (job.kind === EMAIL_DIRECT_KIND) {
    if (!getSmtpConfig()) throw new Error('SMTP is not configured for notification delivery.');
    await sendSmtpEmail(emailDirectSchema.parse(job.payloadJson));
    return;
  }

  if (job.kind === TELEGRAM_DOCUMENT_URL_KIND) {
    const payload = telegramDocumentUrlSchema.parse(job.payloadJson);
    const env = getServerEnv();
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      throw new Error('Telegram is not configured for notification delivery.');
    }

    const document = await downloadNotificationDocument(payload.url);
    await sendTelegramDocumentBuffer({
      token: env.TELEGRAM_BOT_TOKEN,
      chatId: env.TELEGRAM_CHAT_ID,
      bytes: document.bytes,
      filename: sanitizeUploadFileName(payload.filename, 'customer-upload.bin'),
      mime: payload.mime || document.mime || 'application/octet-stream',
      caption: payload.caption,
    });
    return;
  }

  throw new Error(`Unsupported notification outbox kind: ${job.kind}`);
}

function retryDelayMs(attempts: number): number {
  return Math.min(60 * 60 * 1000, 30_000 * (2 ** Math.max(0, attempts - 1)));
}

function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.slice(0, 2_000);
}

async function claimJob(job: NotificationOutbox, now: Date, staleBefore: Date): Promise<NotificationOutbox | null> {
  if (job.attempts >= job.maxAttempts) return null;

  const claimed = await prisma.notificationOutbox.updateMany({
    where: {
      id: job.id,
      attempts: job.attempts,
      OR: [
        { status: 'pending', nextAttemptAt: { lte: now } },
        { status: 'processing', lockedAt: { lt: staleBefore } },
      ],
    },
    data: {
      status: 'processing',
      lockedAt: now,
      attempts: { increment: 1 },
    },
  });

  if (claimed.count !== 1) return null;
  return prisma.notificationOutbox.findUnique({ where: { id: job.id } });
}

async function completeJob(job: NotificationOutbox, now: Date): Promise<void> {
  await prisma.notificationOutbox.updateMany({
    where: { id: job.id, status: 'processing', lockedAt: job.lockedAt },
    data: {
      status: 'completed',
      processedAt: now,
      lockedAt: null,
      lastError: null,
      payloadJson: { completed: true, kind: job.kind },
    },
  });
}

async function failJob(job: NotificationOutbox, error: unknown, now: Date): Promise<void> {
  const terminal = job.attempts >= job.maxAttempts;
  await prisma.notificationOutbox.updateMany({
    where: { id: job.id, status: 'processing', lockedAt: job.lockedAt },
    data: {
      status: terminal ? 'failed' : 'pending',
      lockedAt: null,
      lastError: safeErrorMessage(error),
      nextAttemptAt: terminal ? now : new Date(now.getTime() + retryDelayMs(job.attempts)),
    },
  });
}

export type ProcessNotificationJobsResult = {
  selected: number;
  claimed: number;
  completed: number;
  failed: number;
};

export async function processNotificationJobs(params: {
  limit?: number;
  jobIds?: string[];
} = {}): Promise<ProcessNotificationJobsResult> {
  const limit = Math.max(1, Math.min(50, Math.floor(params.limit ?? 20)));
  const now = new Date();
  const staleBefore = new Date(now.getTime() - LOCK_TIMEOUT_MS);
  const candidates = await prisma.notificationOutbox.findMany({
    where: {
      ...(params.jobIds?.length ? { id: { in: params.jobIds } } : {}),
      OR: [
        { status: 'pending', nextAttemptAt: { lte: now } },
        { status: 'processing', lockedAt: { lt: staleBefore } },
      ],
    },
    orderBy: [{ nextAttemptAt: 'asc' }, { createdAt: 'asc' }],
    take: limit,
  });

  const result: ProcessNotificationJobsResult = {
    selected: candidates.length,
    claimed: 0,
    completed: 0,
    failed: 0,
  };

  for (const candidate of candidates) {
    const claimed = await claimJob(candidate, now, staleBefore);
    if (!claimed) continue;
    result.claimed += 1;

    try {
      await dispatchNotification(claimed);
      await completeJob(claimed, new Date());
      result.completed += 1;
    } catch (error) {
      await failJob(claimed, error, new Date());
      result.failed += 1;
      logger.error('notifications.outbox.delivery_failed', {
        error,
        jobId: claimed.id,
        orderId: claimed.orderId,
        kind: claimed.kind,
        attempt: claimed.attempts,
      });
    }
  }

  return result;
}

export async function processNotificationJobsBestEffort(jobIds: string[]): Promise<void> {
  if (jobIds.length === 0) return;

  try {
    await processNotificationJobs({ jobIds, limit: jobIds.length });
  } catch (error) {
    logger.error('notifications.outbox.process_failed', { error, jobCount: jobIds.length });
  }
}
