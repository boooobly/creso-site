import nodemailer from 'nodemailer';
import { env } from '@/lib/env';

export type EmailLeadPayload = {
  subject: string;
  html: string;
};

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  to: string;
  from: string;
};

export function getSmtpConfig(): SmtpConfig | null {
  const host = env.SMTP_HOST;
  const port = Number(env.SMTP_PORT || 0);
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS;
  const to = env.LEADS_TO_EMAIL;
  const from = env.LEADS_FROM_EMAIL;

  if (!host || !port || !user || !pass || !to || !from) {
    return null;
  }

  return { host, port, user, pass, to, from };
}

export async function sendSmtpEmail(params: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}): Promise<void> {
  const config = getSmtpConfig();

  if (!config) {
    console.warn('[email] SMTP is not configured. Skip email sending.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}

export async function sendEmailLead(payload: EmailLeadPayload): Promise<void> {
  const config = getSmtpConfig();

  if (!config) {
    console.warn('[leads] SMTP is not configured. Skip email sending.');
    return;
  }

  await sendSmtpEmail({
    to: config.to,
    subject: payload.subject,
    html: payload.html,
  });
}
