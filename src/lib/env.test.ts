import { afterEach, describe, expect, it, vi } from 'vitest';

type EnvSnapshot = Record<string, string | undefined>;

const ENV_KEYS = ['NODE_ENV', 'ENABLE_DATABASE', 'DATABASE_URL', 'DATABASE_URL_UNPOOLED', 'PUBLIC_BASE_URL', 'ADMIN_TOKEN', 'MAIL_TO'] as const;

function snapshotEnv(): EnvSnapshot {
  return Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
}

function restoreEnv(snapshot: EnvSnapshot): void {
  for (const key of ENV_KEYS) {
    if (snapshot[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = snapshot[key];
    }
  }
}

describe('env database validation', () => {
  const beforeEachSnapshot = snapshotEnv();

  afterEach(() => {
    restoreEnv(beforeEachSnapshot);
    vi.resetModules();
  });

  it('requireDatabaseEnv rejects non-postgres DATABASE_URL', async () => {
    process.env.ENABLE_DATABASE = 'true';
    process.env.DATABASE_URL = 'https://example.com/db';

    const { requireDatabaseEnv } = await import('@/lib/env');
    expect(() => requireDatabaseEnv()).toThrow('[env] DATABASE_URL must start with postgres:// or postgresql://.');
  });

  it('getServerEnv requires DATABASE_URL_UNPOOLED in production when database is enabled', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ENABLE_DATABASE = 'true';
    process.env.DATABASE_URL = 'postgresql://user:pass@runtime-host:5432/app?sslmode=require';
    delete process.env.DATABASE_URL_UNPOOLED;
    process.env.PUBLIC_BASE_URL = 'https://example.com';
    process.env.ADMIN_TOKEN = 'token';
    process.env.MAIL_TO = 'ops@example.com';

    const { getServerEnv } = await import('@/lib/env');

    expect(() => getServerEnv()).toThrow(
      '[env] Invalid environment configuration: DATABASE_URL_UNPOOLED: DATABASE_URL_UNPOOLED is required in production when ENABLE_DATABASE=true for Prisma migrations.',
    );
  });
});
