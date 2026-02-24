# Environment Variables

This project validates runtime server environment variables when API requests execute (`getServerEnv()`), while keeping builds import-safe.

## Vercel scope by environment

Use this matrix when configuring variables in Vercel:

| Variable | Local | Preview | Production | Notes |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Required for API routes that touch DB | Required at runtime | Required at runtime | Prisma/database connection string. |
| `ADMIN_TOKEN` | Required at runtime | Required at runtime | Required at runtime | Used for protected admin endpoints. |
| `MAIL_TO` | Required at runtime | Required at runtime | Required at runtime | Primary recipient for incoming request notifications. |
| `PUBLIC_BASE_URL` | Optional (falls back to `http://localhost:3000` in development) | Optional | **Required at runtime** | Must be set in production runtime. |
| `SEND_CUSTOMER_EMAILS` | Optional | Optional | Optional | Boolean flag, defaults to `false` when omitted. |
| `PAYMENT_WEBHOOK_SECRET` | Optional* | Optional* | Optional* | Set this if/when payment webhook signature verification is enabled in your deployment. |
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | Optional | Optional | Optional | If Telegram sending is enabled, both values must be set together. |

\* `PAYMENT_WEBHOOK_SECRET` is included here for deployment completeness, but only needs to be configured if your project/environment uses payment webhook signing.

## Quick setup notes

- Keep **Production** values separate from **Preview** values in Vercel.
- For local development, copy `.env.example` to `.env.local` and fill in the values you need.
- If a required runtime variable is missing, API routes fail fast with a clear `[env] Invalid environment configuration: ...` error.
