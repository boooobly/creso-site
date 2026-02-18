const TELEGRAM_API_BASE = 'https://api.telegram.org';

export async function sendTelegramDocument(params: {
  chatId: string;
  token: string;
  caption: string;
  file: File;
  filename?: string;
}): Promise<void> {
  const formData = new FormData();
  formData.set('chat_id', params.chatId);
  formData.set('caption', params.caption.slice(0, 1024));
  formData.set('document', params.file, params.filename || params.file.name || 'upload.bin');

  const response = await fetch(`${TELEGRAM_API_BASE}/bot${params.token}/sendDocument`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Telegram document send failed: ${response.status} ${details}`);
  }
}
