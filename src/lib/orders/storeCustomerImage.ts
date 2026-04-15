import { randomUUID } from 'node:crypto';
import { put } from '@vercel/blob';
import type { PersistedOrderUpload } from '@/lib/orders/bagetOrderSummary';
import { sanitizeUploadFileName } from '@/lib/file-validation';

export const MAX_ORDER_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

function getExtensionFromName(fileName: string): string {
  if (!fileName.includes('.')) return '';
  return `.${fileName.split('.').pop()?.toLowerCase() ?? ''}`;
}

export function buildCustomerImagePath(input: { fileName: string; mimeType: string; now?: number; id?: string }): string {
  const normalizedName = sanitizeUploadFileName(input.fileName || 'customer-upload.bin', 'customer-upload.bin');
  const extensionFromMime = MIME_TO_EXTENSION[input.mimeType.toLowerCase()] || '';
  const extensionFromName = getExtensionFromName(normalizedName);
  const safeExtension = extensionFromMime || extensionFromName || '.bin';
  const timestamp = input.now ?? Date.now();
  const safeId = (input.id ?? randomUUID()).replace(/[^a-zA-Z0-9-]/g, '');

  return `uploads/orders/baget/${timestamp}-${safeId}${safeExtension}`;
}

export async function storeBagetCustomerImage(file: File): Promise<PersistedOrderUpload> {
  const pathname = buildCustomerImagePath({
    fileName: file.name || 'customer-upload.bin',
    mimeType: file.type || 'application/octet-stream',
  });

  const blob = await put(pathname, file, {
    // NOTE: Customer upload blobs remain public for now because order/admin flows
    // render direct URLs. We keep paths unguessable and avoid exposing raw filenames.
    access: 'public',
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    fileName: sanitizeUploadFileName(file.name || 'customer-upload.bin', 'customer-upload.bin'),
    mimeType: file.type || null,
    sizeBytes: file.size,
  };
}
