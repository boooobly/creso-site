import { z } from 'zod';

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}, z.string().optional());

const optionalUrl = z.preprocess((value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}, z.string().url('PUBLIC_BASE_URL must be a valid URL.').optional());

const sendCustomerEmailsSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return value;
}, z.boolean({ invalid_type_error: 'SEND_CUSTOMER_EMAILS must be a boolean (true/false).' }));

const enableDatabaseSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return value;
}, z.boolean({ invalid_type_error: 'ENABLE_DATABASE must be a boolean (true/false).' }));

const publicEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PUBLIC_BASE_URL: optionalUrl,
});

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  ENABLE_DATABASE: enableDatabaseSchema,
  DATABASE_URL: optionalTrimmedString,
  PUBLIC_BASE_URL: optionalUrl,
  SEND_CUSTOMER_EMAILS: sendCustomerEmailsSchema,
  ADMIN_TOKEN: z.string().trim().min(1, 'ADMIN_TOKEN is required.'),
  MAIL_TO: z.string().trim().min(1, 'MAIL_TO is required.'),
  CONTENTFUL_SPACE_ID: optionalTrimmedString,
  CONTENTFUL_ACCESS_TOKEN: optionalTrimmedString,
  SMTP_HOST: optionalTrimmedString,
  SMTP_PORT: z.preprocess((value) => (value === '' ? undefined : value), z.coerce.number().int().positive().optional()),
  SMTP_USER: optionalTrimmedString,
  SMTP_PASS: optionalTrimmedString,
  LEADS_TO_EMAIL: optionalTrimmedString,
  LEADS_FROM_EMAIL: optionalTrimmedString,
  TELEGRAM_BOT_TOKEN: optionalTrimmedString,
  TELEGRAM_CHAT_ID: optionalTrimmedString,
  REVIEW_MODERATION_TOKEN: optionalTrimmedString,
  ORDER_TOKEN_SECRET: optionalTrimmedString,
  PAYMENT_WEBHOOK_SECRET: optionalTrimmedString,
  BAGET_SHEET_ID: optionalTrimmedString,
  BAGET_SHEET_TAB: optionalTrimmedString,
  BAGET_SHEET_CACHE_SECONDS: z.preprocess((value) => (value === '' ? undefined : value), z.coerce.number().int().positive().optional()),
}).superRefine((value, ctx) => {
  if (value.NODE_ENV === 'production' && !value.PUBLIC_BASE_URL) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['PUBLIC_BASE_URL'],
      message: 'PUBLIC_BASE_URL is required when NODE_ENV=production.',
    });
  }

  if (value.ENABLE_DATABASE && !value.DATABASE_URL) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['DATABASE_URL'],
      message: 'DATABASE_URL is required when ENABLE_DATABASE=true.',
    });
  }

  const hasAnySmtp = Boolean(value.SMTP_HOST || value.SMTP_PORT || value.SMTP_USER || value.SMTP_PASS);
  if (hasAnySmtp) {
    if (!value.SMTP_HOST) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['SMTP_HOST'], message: 'SMTP_HOST is required when SMTP is configured.' });
    if (!value.SMTP_PORT) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['SMTP_PORT'], message: 'SMTP_PORT is required when SMTP is configured.' });
    if (!value.SMTP_USER) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['SMTP_USER'], message: 'SMTP_USER is required when SMTP is configured.' });
    if (!value.SMTP_PASS) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['SMTP_PASS'], message: 'SMTP_PASS is required when SMTP is configured.' });
  }

  const hasAnyTelegram = Boolean(value.TELEGRAM_BOT_TOKEN || value.TELEGRAM_CHAT_ID);
  if (hasAnyTelegram) {
    if (!value.TELEGRAM_BOT_TOKEN) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['TELEGRAM_BOT_TOKEN'], message: 'TELEGRAM_BOT_TOKEN is required when Telegram is configured.' });
    if (!value.TELEGRAM_CHAT_ID) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['TELEGRAM_CHAT_ID'], message: 'TELEGRAM_CHAT_ID is required when Telegram is configured.' });
  }

  if (value.SEND_CUSTOMER_EMAILS) {
    if (!value.PUBLIC_BASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['PUBLIC_BASE_URL'],
        message: 'PUBLIC_BASE_URL is required when SEND_CUSTOMER_EMAILS=true.',
      });
    }

    if (!value.SMTP_HOST || !value.SMTP_PORT || !value.SMTP_USER || !value.SMTP_PASS || !value.LEADS_FROM_EMAIL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SEND_CUSTOMER_EMAILS'],
        message: 'SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and LEADS_FROM_EMAIL are required when SEND_CUSTOMER_EMAILS=true.',
      });
    }
  }
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedServerEnv: ServerEnv | null = null;

function buildEnvError(error: z.ZodError): Error {
  const details = error.issues
    .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join('; ');

  return new Error(`[env] Invalid environment configuration: ${details}`);
}

export function getPublicEnv(): PublicEnv {
  const parsed = publicEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    return {
      NODE_ENV: process.env.NODE_ENV === 'production' ? 'production' : process.env.NODE_ENV === 'test' ? 'test' : 'development',
      PUBLIC_BASE_URL: undefined,
    };
  }

  return parsed.data;
}

export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw buildEnvError(parsed.error);
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

export function requireDatabaseEnv(): void {
  const enabledRaw = process.env.ENABLE_DATABASE;
  const isEnabled = typeof enabledRaw === 'string' ? enabledRaw.trim().toLowerCase() === 'true' : enabledRaw === true;

  if (!isEnabled) {
    throw new Error('[env] Database is disabled. Set ENABLE_DATABASE=true to use Prisma/database routes.');
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error('[env] DATABASE_URL is required when ENABLE_DATABASE=true.');
  }
}
