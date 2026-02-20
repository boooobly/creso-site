const TELEGRAM_API_BASE = 'https://api.telegram.org';

export async function sendTelegramDocument(params: {
  chatId: string;
  token: string;
  caption: string;
  file: File;
  filename?: string;
}): Promise<void> {
  const bytes = Buffer.from(await params.file.arrayBuffer());

  await sendTelegramDocumentBuffer({
    chatId: params.chatId,
    token: params.token,
    caption: params.caption,
    bytes,
    filename: params.filename || params.file.name || 'upload.bin',
    contentType: params.file.type || 'application/octet-stream',
  });
}

export async function sendTelegramDocumentBuffer(params: {
  chatId: string;
  token: string;
  caption: string;
  bytes: Buffer;
  filename: string;
  contentType?: string;
}): Promise<void> {
  const formData = new FormData();
  formData.set('chat_id', params.chatId);
  formData.set('caption', params.caption.slice(0, 1024));

  const documentBlob = new Blob([new Uint8Array(params.bytes)], {
    type: params.contentType || 'application/octet-stream',
  });
  formData.set('document', documentBlob, params.filename);

  const response = await fetch(`${TELEGRAM_API_BASE}/bot${params.token}/sendDocument`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Telegram document send failed: ${response.status} ${details}`);
  }
}
