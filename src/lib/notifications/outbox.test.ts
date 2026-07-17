import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  findManyMock,
  findUniqueMock,
  updateManyMock,
  sendTelegramLeadMock,
} = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  findUniqueMock: vi.fn(),
  updateManyMock: vi.fn(),
  sendTelegramLeadMock: vi.fn(),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    notificationOutbox: {
      findMany: findManyMock,
      findUnique: findUniqueMock,
      updateMany: updateManyMock,
    },
  },
}));

vi.mock('@/lib/notifications/telegram', () => ({
  sendTelegramLead: sendTelegramLeadMock,
  sendTelegramDocumentBuffer: vi.fn(),
}));

vi.mock('@/lib/notifications/email', () => ({
  getSmtpConfig: vi.fn(() => ({ to: 'manager@example.com' })),
  sendEmailLead: vi.fn(),
  sendSmtpEmail: vi.fn(),
}));

vi.mock('@/lib/env', () => ({
  getServerEnv: () => ({ TELEGRAM_BOT_TOKEN: 'token', TELEGRAM_CHAT_ID: 'chat' }),
}));

function pendingJob(overrides: Record<string, unknown> = {}) {
  return {
    id: 'job-1',
    orderId: 'order-1',
    kind: 'telegram.text',
    dedupeKey: 'ORDER-123:manager-telegram',
    payloadJson: { text: 'New order' },
    status: 'pending',
    attempts: 0,
    maxAttempts: 8,
    nextAttemptAt: new Date('2026-07-17T20:00:00.000Z'),
    lockedAt: null,
    processedAt: null,
    lastError: null,
    createdAt: new Date('2026-07-17T20:00:00.000Z'),
    updatedAt: new Date('2026-07-17T20:00:00.000Z'),
    ...overrides,
  };
}

describe('notification outbox processor', () => {
  beforeEach(() => {
    findManyMock.mockReset();
    findUniqueMock.mockReset();
    updateManyMock.mockReset();
    sendTelegramLeadMock.mockReset();
  });

  it('claims and completes a due job', async () => {
    const candidate = pendingJob();
    const claimed = pendingJob({ status: 'processing', attempts: 1, lockedAt: new Date() });
    findManyMock.mockResolvedValue([candidate]);
    updateManyMock.mockResolvedValue({ count: 1 });
    findUniqueMock.mockResolvedValue(claimed);
    sendTelegramLeadMock.mockResolvedValue(undefined);
    const { processNotificationJobs } = await import('@/lib/notifications/outbox');

    const result = await processNotificationJobs({ limit: 1 });

    expect(result).toEqual({ selected: 1, claimed: 1, completed: 1, failed: 0 });
    expect(sendTelegramLeadMock).toHaveBeenCalledWith('New order');
    expect(updateManyMock).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        status: 'completed',
        lockedAt: null,
        payloadJson: { completed: true, kind: 'telegram.text' },
      }),
    }));
  });

  it('returns a failed delivery to pending with a delayed retry', async () => {
    const candidate = pendingJob();
    const claimed = pendingJob({ status: 'processing', attempts: 1, lockedAt: new Date() });
    findManyMock.mockResolvedValue([candidate]);
    updateManyMock.mockResolvedValue({ count: 1 });
    findUniqueMock.mockResolvedValue(claimed);
    sendTelegramLeadMock.mockRejectedValue(new Error('Telegram unavailable'));
    const { processNotificationJobs } = await import('@/lib/notifications/outbox');

    const result = await processNotificationJobs({ limit: 1 });

    expect(result).toEqual({ selected: 1, claimed: 1, completed: 0, failed: 1 });
    expect(updateManyMock).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        status: 'pending',
        lockedAt: null,
        lastError: 'Telegram unavailable',
        nextAttemptAt: expect.any(Date),
      }),
    }));
  });
});
