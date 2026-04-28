# Environment Variables

This project validates runtime server environment variables when API requests execute (`getServerEnv()`), while keeping builds import-safe.

## Vercel scope by environment

Use this matrix when configuring variables in Vercel:

| Variable | Local | Preview | Production | Notes |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Required for API routes that touch DB | Required at runtime | Required at runtime | **Pooled** Neon connection used by app runtime queries. |
| `DATABASE_URL_UNPOOLED` | Optional for local (required when running Prisma migrations) | Required for deploy-time migrations | Required for deploy-time migrations | **Direct non-pooled** Neon connection used by Prisma `migrate deploy` via `directUrl`. |
| `ADMIN_PASSWORD` | Optional (uses development fallback) | Required at runtime for admin login | **Required at runtime** | Password for `/admin/login` (single-admin model). |
| `ADMIN_SESSION_SECRET` | Optional (uses development fallback) | Required at runtime for admin auth | **Required at runtime** | Secret used to sign and verify admin session cookies. |
| `ADMIN_SESSION_TTL_SECONDS` | Optional | Optional | Optional | Session lifetime in seconds. Defaults to `86400` (24h). |
| `ADMIN_TOKEN` | Required at runtime | Required at runtime | Required at runtime | Service token used by non-browser internal API flows (for example order PDF bearer access). Not used by `/api/admin/*` browser session auth. |
| `MAIL_TO` | Required at runtime | Required at runtime | Required at runtime | Primary recipient for incoming request notifications. |
| `PUBLIC_BASE_URL` | Optional (falls back to `http://localhost:3000` for local/non-production contexts) | Optional (fallback applies in preview/non-production contexts) | **Required at runtime** | Required in production deploy/runtime (`NODE_ENV=production` + `VERCEL_ENV=production`). |
| `SEND_CUSTOMER_EMAILS` | Optional | Optional | Optional | Boolean flag, defaults to `false` when omitted. |
| `PAYMENT_WEBHOOK_SECRET` | Deprecated (unused) | Deprecated (unused) | Deprecated (unused) | Online payment is disabled; keep unset. |
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | Optional | Optional | Optional | If Telegram sending is enabled, both values must be set together. |
| `BLOB_READ_WRITE_TOKEN` | Optional for local image upload testing | Required if admin image uploads are enabled | Required if admin image uploads are enabled | Vercel Blob token used by `/api/admin/upload-image` for portfolio and site images. |
| `NEXT_PUBLIC_YANDEX_METRIKA_ID` | Optional | Optional | Optional | Public Yandex Metrica counter ID. When empty or invalid, metrica script/events are skipped safely. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional | Optional | Optional | Public Google Search Console verification token for Next Metadata `verification.google`. |
| `NEXT_PUBLIC_YANDEX_VERIFICATION` | Optional | Optional | Optional | Public Yandex Webmaster verification token for Next Metadata `verification.yandex`. |

`PAYMENT_WEBHOOK_SECRET` is kept only for backward compatibility in env templates and is not used while online payment is disabled.

## Quick setup notes

- Keep **Production** values separate from **Preview** values in Vercel.
- For local development, copy `.env.example` to `.env.local` and fill in the values you need.
- In production, missing `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` fail fast with clear `[env] ... must be configured in production.` errors.
- If a required runtime variable is missing, API routes fail fast with a clear `[env] Invalid environment configuration: ...` error.

- For Neon on Vercel: keep `DATABASE_URL` pointed at the pooler host (`-pooler`) for runtime, and set `DATABASE_URL_UNPOOLED` to the direct host for Prisma migrations.

- Deploy behavior: Vercel runs Prisma migrations only when `VERCEL_ENV=production`; preview deployments skip migrations and run `npm run build` only to avoid shared-DB migration lock contention.


## Production deploy behavior (Vercel)

- `vercel.json` runs `npm run vercel-build`.
- `scripts/vercel-build.mjs` enforces this behavior:
  - `VERCEL_ENV=production`: validate DB URLs, run `prisma migrate deploy`, then `next build`.
  - any other environment: skip migrations and run `next build` only.
- The script fails fast with explicit `[deploy]` messages for:
  - missing DB variables,
  - malformed DB variables,
  - invalid DB URL protocol,
  - Prisma `P1001` unreachable database errors.

### Neon URL contract

- `DATABASE_URL` (runtime): pooled Neon URL (usually pooler host).
- `DATABASE_URL_UNPOOLED` (migrations): direct/non-pooled Neon URL (direct host), used by Prisma `directUrl`.
- In production with `ENABLE_DATABASE=true`, both URLs must be set.

## Sitemap/robots fallback behavior

- In production deploy/runtime, set `PUBLIC_BASE_URL` explicitly. Missing value is treated as an error.
- For local/test/non-production preview contexts, sitemap/robots generation falls back to `http://localhost:3000` when `PUBLIC_BASE_URL` is missing.
- `https://example.com` is never used as a fallback base URL.

## Public SEO/analytics variables

- `NEXT_PUBLIC_YANDEX_METRIKA_ID`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, and `NEXT_PUBLIC_YANDEX_VERIFICATION` are optional.
- Keep these values in Vercel per-environment scopes as needed (Local/Preview/Production).
- Empty values do not break build/runtime: metadata omits verification fields, and Yandex helpers no-op when counter or `window.ym` is unavailable.
