import { describe, expect, it } from 'vitest';
import { getAdminSystemHealth } from './system-health';

function buildBaseEnv(overrides: Record<string, string | undefined> = {}): Record<string, string | undefined> {
  return {
    NODE_ENV: 'development',
    VERCEL_ENV: 'development',
    ENABLE_DATABASE: 'true',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/app',
    PUBLIC_BASE_URL: 'https://example.com',
    ADMIN_PASSWORD: 'safe-admin-password',
    ADMIN_SESSION_SECRET: 'safe-admin-secret',
    SMTP_HOST: undefined,
    SMTP_PORT: undefined,
    SMTP_USER: undefined,
    SMTP_PASS: undefined,
    LEADS_TO_EMAIL: undefined,
    LEADS_FROM_EMAIL: undefined,
    TELEGRAM_BOT_TOKEN: undefined,
    TELEGRAM_CHAT_ID: undefined,
    BLOB_READ_WRITE_TOKEN: undefined,
    VERCEL_BLOB_READ_WRITE_TOKEN: undefined,
    BAGET_SHEET_ID: undefined,
    BAGET_SHEET_TAB: undefined,
    ...overrides,
  };
}

describe('getAdminSystemHealth', () => {
  it('returns warning/error statuses when critical env values are missing', async () => {
    const health = await getAdminSystemHealth({
      env: buildBaseEnv({
        NODE_ENV: 'production',
        PUBLIC_BASE_URL: undefined,
        ENABLE_DATABASE: 'true',
        DATABASE_URL: undefined,
      }),
      checkDbConnection: async () => true,
      loadPricingEntryCount: async () => 0,
      loadLatestBagetPageLoadDiagnostics: async () => null,
    });

    const database = health.items.find((item) => item.key === 'database');
    const baseUrl = health.items.find((item) => item.key === 'public_base_url');

    expect(database?.status).toBe('error');
    expect(baseUrl?.status).toBe('error');
  });

  it('marks SMTP, Telegram and Blob as OK when fully configured', async () => {
    const health = await getAdminSystemHealth({
      env: buildBaseEnv({
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: '465',
        SMTP_USER: 'mailer',
        SMTP_PASS: 'top-secret',
        LEADS_TO_EMAIL: 'ops@example.com',
        LEADS_FROM_EMAIL: 'noreply@example.com',
        TELEGRAM_BOT_TOKEN: 'tg-token',
        TELEGRAM_CHAT_ID: '123456',
        BLOB_READ_WRITE_TOKEN: 'blob-token',
        BAGET_SHEET_ID: 'sheet-id',
        BAGET_SHEET_TAB: 'baget_catalog',
      }),
      checkDbConnection: async () => true,
      loadPricingEntryCount: async () => 12,
      loadLatestBagetPageLoadDiagnostics: async () => null,
    });

    expect(health.items.find((item) => item.key === 'smtp')?.status).toBe('ok');
    expect(health.items.find((item) => item.key === 'telegram')?.status).toBe('ok');
    expect(health.items.find((item) => item.key === 'blob')?.status).toBe('ok');
  });

  it('returns admin auth error in production when secret/password are missing or default', async () => {
    const health = await getAdminSystemHealth({
      env: buildBaseEnv({
        NODE_ENV: 'production',
        ADMIN_PASSWORD: 'change-me-admin-password',
        ADMIN_SESSION_SECRET: undefined,
      }),
      checkDbConnection: async () => true,
      loadPricingEntryCount: async () => 4,
      loadLatestBagetPageLoadDiagnostics: async () => null,
    });

    expect(health.items.find((item) => item.key === 'admin_auth')?.status).toBe('error');
  });

  it('never includes secret values in status messages', async () => {
    const smtpSecret = 'smtp-super-secret';
    const tgSecret = 'telegram-secret';
    const blobSecret = 'blob-secret';

    const health = await getAdminSystemHealth({
      env: buildBaseEnv({
        SMTP_PASS: smtpSecret,
        TELEGRAM_BOT_TOKEN: tgSecret,
        BLOB_READ_WRITE_TOKEN: blobSecret,
      }),
      checkDbConnection: async () => true,
      loadPricingEntryCount: async () => 1,
      loadLatestBagetPageLoadDiagnostics: async () => null,
    });

    const combined = health.items.map((item) => `${item.summary} ${item.details}`).join(' ');

    expect(combined).not.toContain(smtpSecret);
    expect(combined).not.toContain(tgSecret);
    expect(combined).not.toContain(blobSecret);
  });

  it('shows owner-facing fallback warning when production runs without database', async () => {
    const health = await getAdminSystemHealth({
      env: buildBaseEnv({
        NODE_ENV: 'production',
        ENABLE_DATABASE: 'false',
        DATABASE_URL: undefined,
      }),
      checkDbConnection: async () => true,
      loadPricingEntryCount: async () => 0,
      loadLatestBagetPageLoadDiagnostics: async () => null,
    });

    const database = health.items.find((item) => item.key === 'database');
    const pricingSource = health.items.find((item) => item.key === 'pricing_source');

    expect(database?.status).toBe('warning');
    expect(database?.summary).toContain('Продакшен');
    expect(pricingSource?.status).toBe('warning');
    expect(pricingSource?.details).toContain('Предупреждение для владельца');
  });

  it('includes baget snapshot metadata in health output', async () => {
    const health = await getAdminSystemHealth({
      env: buildBaseEnv(),
      checkDbConnection: async () => true,
      loadPricingEntryCount: async () => 5,
      loadLatestBagetPageLoadDiagnostics: async () => ({
        totalDurationMs: 3400,
        loadPublicBagetCatalogMs: 120,
        getPageContentMapMs: 2800,
        getBaguetteExtrasPricingConfigMs: 480,
        catalogSource: 'snapshot',
        bagetItemsCount: 77,
        snapshotExists: true,
        snapshotSyncedAt: '2026-04-16T10:00:00.000Z',
        createdAt: '2026-04-16T10:05:00.000Z',
      }),
      loadBagetCatalogSnapshotStatus: async () => ({
        sheetId: 'sheet-id',
        tab: 'baget_catalog',
        itemCount: 77,
        syncedAt: '2026-04-16T10:00:00.000Z',
        error: null,
      }),
    });

    const snapshot = health.items.find((item) => item.key === 'baguette_catalog_snapshot');
    expect(snapshot?.status).toBe('ok');
    expect(snapshot?.details).toContain('sheet-id/baget_catalog');
    expect(snapshot?.details).toContain('77');
    expect(snapshot?.summary).toContain('использует snapshot');
    expect(snapshot?.details).toContain('/api/admin/baget-catalog/sync');
  });

  it('shows actionable warning when baget snapshot is missing', async () => {
    const health = await getAdminSystemHealth({
      env: buildBaseEnv(),
      checkDbConnection: async () => true,
      loadPricingEntryCount: async () => 5,
      loadBagetCatalogSnapshotStatus: async () => null,
      loadLatestBagetPageLoadDiagnostics: async () => null,
    });

    const snapshot = health.items.find((item) => item.key === 'baguette_catalog_snapshot');
    expect(snapshot?.status).toBe('warning');
    expect(snapshot?.summary).toContain('не создан');
    expect(snapshot?.details).toContain('/api/admin/baget-catalog/sync');
  });


  it('shows latest baget page timings and highlights the slowest part', async () => {
    const health = await getAdminSystemHealth({
      env: buildBaseEnv(),
      checkDbConnection: async () => true,
      loadPricingEntryCount: async () => 5,
      loadBagetCatalogSnapshotStatus: async () => ({
        sheetId: 'sheet-id',
        tab: 'baget_catalog',
        itemCount: 77,
        syncedAt: '2026-04-16T10:00:00.000Z',
        error: null,
      }),
      loadLatestBagetPageLoadDiagnostics: async () => ({
        totalDurationMs: 3200,
        loadPublicBagetCatalogMs: 140,
        getPageContentMapMs: 2500,
        getBaguetteExtrasPricingConfigMs: 200,
        catalogSource: 'snapshot',
        bagetItemsCount: 77,
        snapshotExists: true,
        snapshotSyncedAt: '2026-04-16T10:00:00.000Z',
        createdAt: '2026-04-16T10:10:00.000Z',
      }),
    });

    const perf = health.items.find((item) => item.key === 'baget_page_performance');
    expect(perf?.title).toBe('Производительность страницы Багет');
    expect(perf?.details).toContain('getPageContentMapMs=2500');
    expect(perf?.details).toContain('Самая медленная часть: getPageContentMap (2500 мс)');
  });

});
