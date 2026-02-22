import { env } from '@/lib/env';
const TELEGRAM_API_BASE = 'https://api.telegram.org';

function escapeMarkdownV2(value: string): string {
  return value.replace(/[_*\[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

export async function sendTelegramLead(text: string): Promise<void> {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[leads] Telegram is not configured. Skip sending.');
    return;
  }

  const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: escapeMarkdownV2(text),
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Telegram send failed: ${response.status} ${details}`);
  }
}

export async function sendTelegramPhotoBuffer(params: {
  token: string;
  chatId: string;
  bytes: Buffer;
  caption?: string;
  filename?: string;
}): Promise<void> {
  const formData = new FormData();
  formData.set('chat_id', params.chatId);
  if (params.caption) formData.set('caption', params.caption.slice(0, 1024));

  const photoBlob = new Blob([new Uint8Array(params.bytes)], { type: 'image/png' });
  formData.set('photo', photoBlob, params.filename || 'mug-mock-preview.png');

  const response = await fetch(`${TELEGRAM_API_BASE}/bot${params.token}/sendPhoto`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Telegram photo send failed: ${response.status} ${details}`);
  }
}
