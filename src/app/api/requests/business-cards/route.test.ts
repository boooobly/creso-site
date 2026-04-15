import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/env', () => ({
  getServerEnv: () => ({
    TELEGRAM_BOT_TOKEN: '',
    TELEGRAM_CHAT_ID: '',
    SMTP_HOST: '',
    SMTP_PORT: '0',
    SMTP_USER: '',
    SMTP_PASS: '',
    MAIL_TO: '',
  }),
}));


describe('POST /api/requests/business-cards', () => {
  it('blocks honeypot submission before business validation', async () => {
    const { POST } = await import('@/app/api/requests/business-cards/route');

    const formData = new FormData();
    formData.set('name', 'Иван');
    formData.set('phone', '+7 999 123-45-67');
    formData.set('website', 'spam.example');

    const request = new NextRequest('http://localhost:3000/api/requests/business-cards', {
      method: 'POST',
      headers: {
        'user-agent': 'Vitest',
        'x-forwarded-for': '203.0.113.70',
      },
      body: formData,
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
