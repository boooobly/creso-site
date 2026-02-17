const TELEGRAM_API_BASE = 'https://api.telegram.org';

function escapeMarkdownV2(value: string): string {
  return value.replace(/[_*\[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

export async function sendTelegramLead(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

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
