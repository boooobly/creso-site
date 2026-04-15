const FIVE_MB_IN_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXTENSIONS: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/tiff': ['.tif', '.tiff'],
  'image/avif': ['.avif'],
  'application/pdf': ['.pdf'],
  'application/json': ['.json'],
  'image/svg+xml': ['.svg'],
  'application/postscript': ['.ps', '.eps'],
  'application/illustrator': ['.ai'],
  'application/vnd.adobe.photoshop': ['.psd'],
};

const IMAGE_MAGIC_MIME_SET = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function getExtension(name: string): string {
  if (!name.includes('.')) return '';
  return `.${name.split('.').pop()?.toLowerCase() ?? ''}`;
}

function estimateBase64DecodedSize(base64Payload: string): number {
  const sanitized = base64Payload.replace(/\s/g, '');
  const padding = sanitized.endsWith('==') ? 2 : sanitized.endsWith('=') ? 1 : 0;
  return Math.floor((sanitized.length * 3) / 4) - padding;
}

function hasJpegSignature(buffer: Uint8Array): boolean {
  return buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
}

function hasPngSignature(buffer: Uint8Array): boolean {
  return buffer.length >= 8
    && buffer[0] === 0x89
    && buffer[1] === 0x50
    && buffer[2] === 0x4E
    && buffer[3] === 0x47
    && buffer[4] === 0x0D
    && buffer[5] === 0x0A
    && buffer[6] === 0x1A
    && buffer[7] === 0x0A;
}

function hasWebpSignature(buffer: Uint8Array): boolean {
  return buffer.length >= 12
    && buffer[0] === 0x52
    && buffer[1] === 0x49
    && buffer[2] === 0x46
    && buffer[3] === 0x46
    && buffer[8] === 0x57
    && buffer[9] === 0x45
    && buffer[10] === 0x42
    && buffer[11] === 0x50;
}

function hasGifSignature(buffer: Uint8Array): boolean {
  if (buffer.length < 6) return false;
  const header = new TextDecoder().decode(buffer.slice(0, 6));
  return header === 'GIF87a' || header === 'GIF89a';
}

function hasValidImageMagicBytes(mime: string, buffer: Uint8Array): boolean {
  if (mime === 'image/jpeg') return hasJpegSignature(buffer);
  if (mime === 'image/png') return hasPngSignature(buffer);
  if (mime === 'image/webp') return hasWebpSignature(buffer);
  if (mime === 'image/gif') return hasGifSignature(buffer);
  return true;
}

export function sanitizeUploadFileName(fileName: string, fallbackName = 'upload.bin'): string {
  const normalized = fileName
    .normalize('NFKC')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[\\/]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^\.+/, '')
    .replace(/\.{2,}/g, '.')
    .slice(0, 120);

  const safe = normalized.replace(/^-+/, '');
  return safe || fallbackName;
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

export async function validateUploadedImageFile(params: {
  file: File;
  allowedMimeTypes: ReadonlySet<string>;
  allowedExtensions: ReadonlySet<string>;
  maxBytes?: number;
  rejectSvg?: boolean;
}): Promise<{ ok: true } | { ok: false; error: 'File too large' | 'Invalid file type' | 'Invalid file content' }> {
  const baseValidation = validateUploadedFile({
    file: params.file,
    allowedMimeTypes: params.allowedMimeTypes,
    allowedExtensions: params.allowedExtensions,
    maxBytes: params.maxBytes,
  });

  if (!baseValidation.ok) return baseValidation;

  const mime = (params.file.type || '').toLowerCase();
  const extension = getExtension(params.file.name);

  if (!mime.startsWith('image/')) {
    return { ok: false, error: 'Invalid file type' };
  }

  const rejectSvg = params.rejectSvg ?? true;
  if (rejectSvg && (mime === 'image/svg+xml' || extension === '.svg')) {
    return { ok: false, error: 'Invalid file type' };
  }

  if (!IMAGE_MAGIC_MIME_SET.has(mime)) {
    return { ok: true };
  }

  const buffer = new Uint8Array(await params.file.slice(0, 64).arrayBuffer());
  if (!hasValidImageMagicBytes(mime, buffer)) {
    return { ok: false, error: 'Invalid file content' };
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

export { FIVE_MB_IN_BYTES, getExtension };
