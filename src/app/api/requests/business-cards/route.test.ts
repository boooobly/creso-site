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

  it('returns 400 when consent is not provided', async () => {
    const { POST } = await import('@/app/api/requests/business-cards/route');

    const formData = new FormData();
    formData.set('name', 'Иван');
    formData.set('phone', '+7 999 123-45-67');
    formData.set('product', 'Business cards');
    formData.set('quantity', '1000');
    formData.set('printSide', 'single');
    formData.set('lamination', 'false');
    formData.set('needDesign', 'false');
    formData.set('unitPrice', '10');
    formData.set('totalPrice', '10000');
    formData.set('turnaround', '7–10 business days');
    formData.set('size', '90x50');
    formData.set('stock', '300 г/м²');
    formData.set('printType', 'offset');
    formData.set('notes', '[]');
    formData.set('flyersRequested', 'false');

    const request = new NextRequest('http://localhost:3000/api/requests/business-cards', {
      method: 'POST',
      headers: {
        'user-agent': 'Vitest',
        'x-forwarded-for': '203.0.113.80',
      },
      body: formData,
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toMatchObject({ ok: false, error: 'Необходимо согласие на обработку персональных данных.' });
  });

  it('passes consent validation when consent=true', async () => {
    const { POST } = await import('@/app/api/requests/business-cards/route');

    const formData = new FormData();
    formData.set('name', 'Иван');
    formData.set('phone', '+7 999 123-45-67');
    formData.set('consent', 'true');
    formData.set('product', 'Business cards');
    formData.set('quantity', '1000');
    formData.set('printSide', 'single');
    formData.set('lamination', 'false');
    formData.set('needDesign', 'false');
    formData.set('unitPrice', '10');
    formData.set('totalPrice', '10000');
    formData.set('turnaround', '7–10 business days');
    formData.set('size', '90x50');
    formData.set('stock', '300 г/м²');
    formData.set('printType', 'offset');
    formData.set('notes', '[]');
    formData.set('flyersRequested', 'false');

    const request = new NextRequest('http://localhost:3000/api/requests/business-cards', {
      method: 'POST',
      headers: {
        'user-agent': 'Vitest',
        'x-forwarded-for': '203.0.113.81',
      },
      body: formData,
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toMatchObject({ ok: false, error: 'Не удалось отправить уведомление. Проверьте настройки SMTP/Telegram.' });
  });
});
