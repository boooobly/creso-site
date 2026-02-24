const FIVE_MB_IN_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXTENSIONS: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/tiff': ['.tif', '.tiff'],
  'application/pdf': ['.pdf'],
  'application/json': ['.json'],
  'image/svg+xml': ['.svg'],
  'application/postscript': ['.ps', '.eps'],
  'application/illustrator': ['.ai'],
  'application/vnd.adobe.photoshop': ['.psd'],
};

function getExtension(name: string): string {
  if (!name.includes('.')) return '';
  return `.${name.split('.').pop()?.toLowerCase() ?? ''}`;
}

function estimateBase64DecodedSize(base64Payload: string): number {
  const sanitized = base64Payload.replace(/\s/g, '');
  const padding = sanitized.endsWith('==') ? 2 : sanitized.endsWith('=') ? 1 : 0;
  return Math.floor((sanitized.length * 3) / 4) - padding;
}

export function validateUploadedFile(params: {
  file: File;
  allowedMimeTypes: ReadonlySet<string>;
  allowedExtensions: ReadonlySet<string>;
  maxBytes?: number;
}): { ok: true } | { ok: false; error: 'File too large' | 'Invalid file type' } {
  const { file, allowedMimeTypes, allowedExtensions } = params;
  const maxBytes = params.maxBytes ?? FIVE_MB_IN_BYTES;

  if (file.size <= 0 || file.size > maxBytes) {
    return { ok: false, error: 'File too large' };
  }

  const mime = (file.type || '').toLowerCase();
  const extension = getExtension(file.name);

  if (!allowedMimeTypes.has(mime) || !allowedExtensions.has(extension)) {
    return { ok: false, error: 'Invalid file type' };
  }

  const expectedExtensions = MIME_TO_EXTENSIONS[mime];
  if (expectedExtensions && !expectedExtensions.includes(extension)) {
    return { ok: false, error: 'Invalid file type' };
  }

  return { ok: true };
}

export function validateDataUrlFile(params: {
  dataUrl: string;
  allowedMimeTypes: ReadonlySet<string>;
  maxBytes?: number;
}): { ok: true; mime: string; base64: string } | { ok: false; error: 'File too large' | 'Invalid file type' } {
  const maxBytes = params.maxBytes ?? FIVE_MB_IN_BYTES;
  const match = params.dataUrl.match(/^data:([^;]+);base64,(.*)$/i);

  if (!match) {
    return { ok: false, error: 'Invalid file type' };
  }

  const mime = match[1].toLowerCase();
  const base64 = match[2] || '';

  if (!params.allowedMimeTypes.has(mime)) {
    return { ok: false, error: 'Invalid file type' };
  }

  const estimatedSize = estimateBase64DecodedSize(base64);
  if (!Number.isFinite(estimatedSize) || estimatedSize <= 0 || estimatedSize > maxBytes) {
    return { ok: false, error: 'File too large' };
  }

  return { ok: true, mime, base64 };
}

export { FIVE_MB_IN_BYTES };
