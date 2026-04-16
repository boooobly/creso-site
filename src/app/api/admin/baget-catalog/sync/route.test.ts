import { describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const requireAdminApiAuthMock = vi.fn();
const syncBagetCatalogSnapshotMock = vi.fn();

vi.mock('@/lib/admin/api-auth', () => ({
  requireAdminApiAuth: requireAdminApiAuthMock,
}));

vi.mock('@/lib/baget/catalogSnapshot', () => ({
  syncBagetCatalogSnapshot: syncBagetCatalogSnapshotMock,
}));

describe('POST /api/admin/baget-catalog/sync', () => {
  it('requires admin auth', async () => {
    requireAdminApiAuthMock.mockResolvedValueOnce(
      NextResponse.json({ ok: false, error: 'Требуется авторизация администратора.' }, { status: 401 })
    );

    const { POST } = await import('./route');
    const response = await POST(new NextRequest('http://localhost:3000/api/admin/baget-catalog/sync', { method: 'POST' }));

    expect(response.status).toBe(401);
    expect(syncBagetCatalogSnapshotMock).not.toHaveBeenCalled();
  });

  it('returns sync summary on success', async () => {
    requireAdminApiAuthMock.mockResolvedValueOnce(null);
    syncBagetCatalogSnapshotMock.mockResolvedValueOnce({
      ok: true,
      itemCount: 42,
      syncedAt: '2026-04-16T10:00:00.000Z',
      sheetId: 'sheet-id',
      tab: 'baget_catalog',
    });

    const { POST } = await import('./route');
    const response = await POST(new NextRequest('http://localhost:3000/api/admin/baget-catalog/sync', { method: 'POST' }));
    const json = (await response.json()) as { ok: boolean; message: string; itemCount: number };

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.itemCount).toBe(42);
    expect(json.message).toContain('Каталог багета обновлён');
  });
});
