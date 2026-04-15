import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const loadBagetCatalogMock = vi.fn();

vi.mock('@/lib/env', () => ({
  getServerEnv: () => ({
    ADMIN_TOKEN: 'admin-token',
  }),
}));

vi.mock('@/lib/baget/sheetsCatalog', () => ({
  loadBagetCatalog: loadBagetCatalogMock,
}));

describe('GET /api/baget/catalog-debug', () => {
  beforeEach(() => {
    loadBagetCatalogMock.mockReset();
    delete process.env.BAGET_CATALOG_DEBUG_TOKEN;
  });

  it('rejects unauthenticated preview access', async () => {
    process.env.NODE_ENV = 'test';
    const { GET } = await import('@/app/api/baget/catalog-debug/route');
    const request = new NextRequest('http://localhost:3000/api/baget/catalog-debug');

    const response = await GET(request);

    expect(response.status).toBe(403);
    expect(loadBagetCatalogMock).not.toHaveBeenCalled();
  });

  it('allows request with valid debug token in non-production', async () => {
    process.env.NODE_ENV = 'test';
    process.env.BAGET_CATALOG_DEBUG_TOKEN = 'debug-token';
    loadBagetCatalogMock.mockResolvedValue({
      source: 'sheet',
      sheetId: 'sheet-id',
      tab: 'tab-name',
      items: [{ sku: 'A1' }],
      error: null,
    });
    const { GET } = await import('@/app/api/baget/catalog-debug/route');
    const request = new NextRequest('http://localhost:3000/api/baget/catalog-debug?debugToken=debug-token');

    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('keeps production blocked', async () => {
    process.env.NODE_ENV = 'production';
    process.env.BAGET_CATALOG_DEBUG_TOKEN = 'debug-token';
    const { GET } = await import('@/app/api/baget/catalog-debug/route');
    const request = new NextRequest('http://localhost:3000/api/baget/catalog-debug?debugToken=debug-token');

    const response = await GET(request);

    expect(response.status).toBe(404);
    expect(loadBagetCatalogMock).not.toHaveBeenCalled();
  });
});
