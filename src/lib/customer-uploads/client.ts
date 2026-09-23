import { upload } from '@vercel/blob/client';
import { CUSTOMER_UPLOAD_FIELD, type CustomerUploadRef, type CustomerUploadScope } from './shared';

export async function uploadCustomerFiles(formData: FormData, scope: CustomerUploadScope, idempotencyKey: string): Promise<FormData> {
  const refs: CustomerUploadRef[] = [];
  const entries = [...formData.entries()];

  for (const [field, value] of entries) {
    if (!(value instanceof File) || value.size === 0) continue;
    const safeName = value.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 120) || 'upload.bin';
    const pathname = `uploads/customers/${scope}/${idempotencyKey}/${crypto.randomUUID()}-${safeName}`;
    const blob = await upload(pathname, value, {
      access: 'private',
      handleUploadUrl: '/api/customer-uploads',
      clientPayload: JSON.stringify({ scope, idempotencyKey }),
      contentType: value.type || 'application/octet-stream',
      multipart: value.size > 5 * 1024 * 1024,
    });
    refs.push({ field, url: blob.url, pathname: blob.pathname, name: value.name, size: value.size, type: value.type || 'application/octet-stream' });
    formData.delete(field);
  }

  if (refs.length) formData.set(CUSTOMER_UPLOAD_FIELD, JSON.stringify(refs));
  return formData;
}
