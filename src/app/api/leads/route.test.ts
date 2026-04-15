import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const sendEmailLeadMock = vi.fn(async () => undefined);
const sendTelegramLeadMock = vi.fn(async () => undefined);
const sendTelegramDocumentBufferMock = vi.fn(async () => undefined);

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

  it('accepts valid multipart files and sends notifications', async () => {
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
    expect(sendEmailLeadMock).toHaveBeenCalledTimes(1);
    expect(sendTelegramLeadMock).toHaveBeenCalledTimes(1);
    expect(sendTelegramDocumentBufferMock).toHaveBeenCalledTimes(1);
  });
});
