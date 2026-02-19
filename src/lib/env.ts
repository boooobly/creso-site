import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PUBLIC_BASE_URL: z.string().trim().url().optional(),
  SEND_CUSTOMER_EMAILS: z.enum(['true', 'false']).optional(),
  CONTENTFUL_SPACE_ID: z.string().trim().optional(),
  CONTENTFUL_ACCESS_TOKEN: z.string().trim().optional(),
  SMTP_HOST: z.string().trim().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().trim().optional(),
  SMTP_PASS: z.string().trim().optional(),
  MAIL_TO: z.string().trim().optional(),
  LEADS_TO_EMAIL: z.string().trim().optional(),
  LEADS_FROM_EMAIL: z.string().trim().optional(),
  TELEGRAM_BOT_TOKEN: z.string().trim().optional(),
  TELEGRAM_CHAT_ID: z.string().trim().optional(),
}).superRefine((value, ctx) => {
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

  if (value.SEND_CUSTOMER_EMAILS === 'true') {
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

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join('; ');

  throw new Error(`[env] Invalid environment configuration. ${details}`);
}

export const env = parsedEnv.data;
