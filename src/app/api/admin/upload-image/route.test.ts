import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const putMock = vi.fn();

vi.mock('@vercel/blob', () => ({
  put: putMock,
}));

vi.mock('@/lib/admin/api-auth', () => ({
  requireAdminApiAuth: vi.fn(async () => null),
}));

describe('POST /api/admin/upload-image', () => {
  it('rejects unknown upload folder', async () => {
    const { POST } = await import('@/app/api/admin/upload-image/route');

    const formData = new FormData();
    formData.set('file', new File([new Uint8Array([0xFF, 0xD8, 0xFF])], 'test.jpg', { type: 'image/jpeg' }));
    formData.set('folder', '../unsafe');

    const request = new NextRequest('http://localhost:3000/api/admin/upload-image', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const json = (await response.json()) as { ok: boolean; error?: string };

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(json.error).toBe('Недопустимая папка для загрузки.');
    expect(putMock).not.toHaveBeenCalled();
  });
});
