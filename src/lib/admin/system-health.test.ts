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
    });

    const combined = health.items.map((item) => `${item.summary} ${item.details}`).join(' ');

    expect(combined).not.toContain(smtpSecret);
    expect(combined).not.toContain(tgSecret);
    expect(combined).not.toContain(blobSecret);
  });
});
