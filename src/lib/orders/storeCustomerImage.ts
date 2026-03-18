import { put } from '@vercel/blob';
import type { PersistedOrderUpload } from '@/lib/orders/bagetOrderSummary';

export const MAX_ORDER_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function sanitizeFileName(fileName: string): string {
  return fileName
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '') || 'customer-upload.bin';
}

export async function storeBagetCustomerImage(file: File): Promise<PersistedOrderUpload> {
  const cleanName = sanitizeFileName(file.name || 'customer-upload.bin');
  const pathname = `uploads/orders/baget/${Date.now()}-${cleanName}`;

  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    fileName: file.name || cleanName,
    mimeType: file.type || null,
    sizeBytes: file.size,
  };
}
