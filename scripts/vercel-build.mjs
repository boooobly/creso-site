#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const VERCEL_ENV = process.env.VERCEL_ENV;
const isProductionDeploy = VERCEL_ENV === 'production';

function runOrFail(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status === 0) {
    return;
  }

  process.exit(result.status ?? 1);
}

function parsePostgresUrl(rawValue, variableName) {
  const value = rawValue?.trim();

  if (!value) {
    throw new Error(`[deploy] Missing ${variableName}. Set it in Vercel Production environment variables.`);
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`[deploy] Malformed ${variableName}. Expected a full postgres:// or postgresql:// URL.`);
  }

  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new Error(`[deploy] Invalid ${variableName} protocol (${parsed.protocol}). Expected postgres:// or postgresql://.`);
  }

  return parsed;
}

function printConnectionHint(variableName, parsed) {
  const port = parsed.port || '5432';
  const databaseName = parsed.pathname?.replace(/^\//, '') || '<missing-db-name>';
  const hasSslMode = parsed.searchParams.has('sslmode');
  console.log(`[deploy] ${variableName}: host=${parsed.hostname} port=${port} db=${databaseName} sslmode=${hasSslMode ? parsed.searchParams.get('sslmode') : '<not-set>'}`);
}

function runProductionBuildWithMigrations() {
  console.log('[deploy] VERCEL_ENV=production detected. Running Prisma migrations before build.');

  const runtimeUrl = parsePostgresUrl(process.env.DATABASE_URL, 'DATABASE_URL');
  const directUrl = parsePostgresUrl(process.env.DATABASE_URL_UNPOOLED, 'DATABASE_URL_UNPOOLED');

  printConnectionHint('DATABASE_URL', runtimeUrl);
  printConnectionHint('DATABASE_URL_UNPOOLED', directUrl);

  if (runtimeUrl.hostname === directUrl.hostname) {
    console.log('[deploy] Note: DATABASE_URL and DATABASE_URL_UNPOOLED use the same host. For Neon, runtime should typically use the pooler host and migrations should use the direct host.');
  }

  const migrationResult = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    stdio: 'pipe',
    encoding: 'utf8',
    env: process.env,
  });

  if (migrationResult.stdout) process.stdout.write(migrationResult.stdout);
  if (migrationResult.stderr) process.stderr.write(migrationResult.stderr);

  if (migrationResult.status !== 0) {
    const combined = `${migrationResult.stdout || ''}\n${migrationResult.stderr || ''}`;

    if (combined.includes('P1001')) {
      console.error('[deploy] Prisma reported P1001 (database unreachable). Check Vercel Production DATABASE_URL_UNPOOLED connectivity, host, credentials, and network allowlist.');
    }

    if (combined.includes('Environment variable not found')) {
      console.error('[deploy] Prisma could not read one or more required env vars. Ensure DATABASE_URL and DATABASE_URL_UNPOOLED are set for Production scope in Vercel.');
    }

    process.exit(migrationResult.status ?? 1);
  }

  runOrFail('npm', ['run', 'build']);
}

try {
  if (!isProductionDeploy) {
    console.log(`[deploy] VERCEL_ENV=${VERCEL_ENV || '<unset>'}. Skipping Prisma migrations and running build only.`);
    runOrFail('npm', ['run', 'build']);
  } else {
    runProductionBuildWithMigrations();
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
