import nodemailer from 'nodemailer';

export type EmailLeadPayload = {
  subject: string;
  html: string;
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.LEADS_TO_EMAIL;
  const from = process.env.LEADS_FROM_EMAIL;

  if (!host || !port || !user || !pass || !to || !from) {
    return null;
  }

  return { host, port, user, pass, to, from };
}

export async function sendEmailLead(payload: EmailLeadPayload): Promise<void> {
  const config = getSmtpConfig();

  if (!config) {
    console.warn('[leads] SMTP is not configured. Skip email sending.');
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
    to: config.to,
    subject: payload.subject,
    html: payload.html,
  });
}
