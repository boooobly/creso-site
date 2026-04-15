import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { createSignedAdminSessionToken } from '@/lib/admin-auth';
import { requireAdminApiAuth } from '@/lib/admin/api-auth';

async function makeAdminSessionCookie() {
  const token = await createSignedAdminSessionToken();
  return `admin_session=${token}`;
}

describe('requireAdminApiAuth origin hardening', () => {
  it('allows same-origin mutating requests with valid session', async () => {
    const cookie = await makeAdminSessionCookie();

    const request = new NextRequest('https://preview.example.vercel.app/api/admin/media', {
      method: 'POST',
      headers: {
        cookie,
        origin: 'https://preview.example.vercel.app',
      },
    });

    const response = await requireAdminApiAuth(request);
    expect(response).toBeNull();
  });

  it('rejects cross-origin mutating requests even with valid session', async () => {
    const cookie = await makeAdminSessionCookie();

    const request = new NextRequest('https://preview.example.vercel.app/api/admin/media', {
      method: 'PATCH',
      headers: {
        cookie,
        origin: 'https://evil.example',
      },
    });

    const response = await requireAdminApiAuth(request);
    expect(response?.status).toBe(403);
  });

  it('rejects missing origin for mutating requests', async () => {
    const cookie = await makeAdminSessionCookie();

    const request = new NextRequest('https://preview.example.vercel.app/api/admin/media', {
      method: 'DELETE',
      headers: {
        cookie,
      },
    });

    const response = await requireAdminApiAuth(request);
    expect(response?.status).toBe(403);
  });

  it('does not block GET admin requests by origin policy', async () => {
    const cookie = await makeAdminSessionCookie();

    const request = new NextRequest('https://preview.example.vercel.app/api/admin/media', {
      method: 'GET',
      headers: {
        cookie,
      },
    });

    const response = await requireAdminApiAuth(request);
    expect(response).toBeNull();
  });
});
