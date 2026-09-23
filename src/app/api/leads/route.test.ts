import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const sendEmailLeadMock = vi.fn(async () => undefined);
const sendTelegramLeadMock = vi.fn(async () => undefined);
const sendTelegramDocumentBufferMock = vi.fn(async () => undefined);
const buildManagerNotificationJobsMock = vi.fn(() => [
  { kind: 'telegram.text', dedupeSuffix: 'manager-telegram', payloadJson: { text: 'lead' } },
  { kind: 'email.lead', dedupeSuffix: 'manager-email', payloadJson: { subject: 'lead', html: 'lead' } },
]);
const processNotificationJobsBestEffortMock = vi.fn(async () => undefined);
const storeLegacyCustomerFileMock = vi.fn(async (file: File) => ({ field: 'file', url: 'https://store.private.blob.vercel-storage.com/uploads/customers/lead/key/file.pdf', pathname: 'uploads/customers/lead/key/file.pdf', name: file.name, size: file.size, type: file.type }));

const orderCreateMock = vi.fn(async ({ data }) => ({
  id: 'order-1',
  ...data,
  notificationJobs: (data.notificationJobs?.create ?? []).map((job: Record<string, unknown>, index: number) => ({
    id: `job-${index + 1}`,
    orderId: 'order-1',
    status: 'pending',
    attempts: 0,
    maxAttempts: 8,
    nextAttemptAt: new Date(),
    lockedAt: null,
    processedAt: null,
    lastError: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...job,
  })),
}));
vi.mock('@/lib/db/prisma', () => ({
  prisma: { order: { create: orderCreateMock } },
}));

vi.mock('@/lib/anti-spam', () => ({
  enforcePublicRequestGuard: vi.fn(() => null),
  getClientIp: vi.fn(() => '203.0.113.77'),
}));

vi.mock('@/lib/notifications/email', () => ({
  sendEmailLead: sendEmailLeadMock,
}));

vi.mock('@/lib/notifications/telegram', () => ({
  sendTelegramLead: sendTelegramLeadMock,
  sendTelegramDocumentBuffer: sendTelegramDocumentBufferMock,
}));

vi.mock('@/lib/notifications/outbox', () => ({
  buildManagerNotificationJobs: buildManagerNotificationJobsMock,
  buildTelegramDocumentUrlJob: vi.fn((params) => ({ kind: 'telegram.document-url', dedupeSuffix: params.dedupeSuffix, payloadJson: params })),
  processNotificationJobsBestEffort: processNotificationJobsBestEffortMock,
}));

vi.mock('@/lib/customer-uploads/server', () => ({
  readCustomerUploadRefs: vi.fn(async () => []),
  storeLegacyCustomerFile: storeLegacyCustomerFileMock,
}));

vi.mock('@/lib/env', () => ({
  getServerEnv: () => ({
    TELEGRAM_BOT_TOKEN: 'token',
    TELEGRAM_CHAT_ID: 'chat',
  }),
}));

function createMultipartRequest(formData: FormData) {
  return new NextRequest('http://localhost:3000/api/leads', {
    method: 'POST',
    headers: {
      'user-agent': 'Vitest',
      'x-forwarded-for': '203.0.113.70',
    },
    body: formData,
  });
}

describe('POST /api/leads', () => {
  beforeEach(() => {
    sendEmailLeadMock.mockClear();
    sendTelegramLeadMock.mockClear();
    sendTelegramDocumentBufferMock.mockClear();
    orderCreateMock.mockClear();
    buildManagerNotificationJobsMock.mockClear();
    processNotificationJobsBestEffortMock.mockClear();
    storeLegacyCustomerFileMock.mockClear();
  });

  it('rejects oversized file before notifications', async () => {
    const { POST } = await import('@/app/api/leads/route');

    const formData = new FormData();
    formData.set('source', 'lead-form');
    formData.set('name', 'Иван');
    formData.set('phone', '+79991234567');
    formData.append('files', new File([new Uint8Array((10 * 1024 * 1024) + 1)], 'huge.pdf', { type: 'application/pdf' }));

    const response = await POST(createMultipartRequest(formData));
    const json = (await response.json()) as { ok: boolean; error?: string };

    expect(response.status).toBe(413);
    expect(json.ok).toBe(false);
    expect(json.error).toBe('Размер файла превышает допустимый лимит.');
    expect(sendEmailLeadMock).not.toHaveBeenCalled();
    expect(sendTelegramLeadMock).not.toHaveBeenCalled();
    expect(sendTelegramDocumentBufferMock).not.toHaveBeenCalled();
  });

  it('rejects too many files with russian message', async () => {
    const { POST } = await import('@/app/api/leads/route');

    const formData = new FormData();
    formData.set('source', 'lead-form');
    formData.set('name', 'Иван');
    formData.set('phone', '+79991234567');

    for (let i = 0; i < 6; i += 1) {
      formData.append('files', new File([new Uint8Array([1, 2, 3])], `f-${i}.pdf`, { type: 'application/pdf' }));
    }

    const response = await POST(createMultipartRequest(formData));
    const json = (await response.json()) as { ok: boolean; error?: string };

    expect(response.status).toBe(400);
    expect(json.error).toBe('Слишком много файлов. Уменьшите количество вложений.');
    expect(sendEmailLeadMock).not.toHaveBeenCalled();
    expect(sendTelegramLeadMock).not.toHaveBeenCalled();
  });

  it('persists multipart files and queues retryable document delivery', async () => {
    const { POST } = await import('@/app/api/leads/route');

    const formData = new FormData();
    formData.set('source', 'lead-form');
    formData.set('name', 'Иван');
    formData.set('phone', '+79991234567');
    formData.append('files', new File([new Uint8Array([1, 2, 3, 4])], 'ok.pdf', { type: 'application/pdf' }));

    const response = await POST(createMultipartRequest(formData));
    const json = (await response.json()) as { ok: boolean; error?: string };

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(buildManagerNotificationJobsMock).toHaveBeenCalledTimes(1);
    expect(storeLegacyCustomerFileMock).toHaveBeenCalledTimes(1);
    expect(orderCreateMock.mock.calls[0]?.[0].data.payloadJson.files[0].url).toContain('.private.blob.vercel-storage.com');
    expect(processNotificationJobsBestEffortMock).toHaveBeenCalledWith(['job-1', 'job-2', 'job-3']);
    expect(sendEmailLeadMock).not.toHaveBeenCalled();
    expect(sendTelegramLeadMock).not.toHaveBeenCalled();
    expect(sendTelegramDocumentBufferMock).not.toHaveBeenCalled();
  });
});
