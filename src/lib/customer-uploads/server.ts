import { get, head, put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { sanitizeUploadFileName } from '@/lib/file-validation';
import { readFormDataLimited } from '@/lib/request-body';
import { readIdempotencyKey } from '@/lib/orders/idempotency';
import { claimPublicQuota } from '@/lib/distributed-rate-limit';
import { getClientIp } from '@/lib/utils/request';
import { NextResponse } from 'next/server';
import { CUSTOMER_UPLOAD_FIELD, CUSTOMER_UPLOAD_MAX_FILE_BYTES, CUSTOMER_UPLOAD_MAX_FILES, isSafeUploadKey, type CustomerUploadRef, type CustomerUploadScope } from './shared';

const uploadRefSchema = z.object({
  field: z.string().min(1).max(80),
  url: z.string().url().max(2048),
  pathname: z.string().min(1).max(300),
  name: z.string().min(1).max(255),
  size: z.number().int().positive().max(CUSTOMER_UPLOAD_MAX_FILE_BYTES),
  type: z.string().min(1).max(255),
});

export function privateBlobToken(): string {
  const token = process.env.PRIVATE_READ_WRITE_TOKEN;
  if (!token) throw new Error('Private customer storage is not configured.');
  return token;
}

export class CustomerUploadRateLimitError extends Error {}

export function customerUploadErrorResponse(error: unknown): NextResponse | null {
  return error instanceof CustomerUploadRateLimitError
    ? NextResponse.json({ ok: false, error: 'Слишком много запросов. Попробуйте позже.' }, { status: 429 })
    : null;
}

export function isPrivateCustomerBlobUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
      && url.hostname.endsWith('.private.blob.vercel-storage.com')
      && url.pathname.startsWith('/uploads/customers/');
  } catch { return false; }
}

export async function verifyCustomerUploadRef(ref: CustomerUploadRef, scope: CustomerUploadScope, idempotencyKey: string): Promise<CustomerUploadRef> {
  if (!isSafeUploadKey(idempotencyKey)) throw new Error('A valid Idempotency-Key is required for customer uploads.');
  const parsed = uploadRefSchema.parse(ref);
  const prefix = `uploads/customers/${scope}/${idempotencyKey}/`;
  if (!parsed.pathname.startsWith(prefix) || !isPrivateCustomerBlobUrl(parsed.url)
    || new URL(parsed.url).pathname.slice(1) !== parsed.pathname) throw new Error('Invalid customer upload reference.');
  const stored = await head(parsed.url, { token: privateBlobToken() });
  if (!stored || stored.size !== parsed.size || stored.contentType !== parsed.type || stored.pathname !== parsed.pathname) {
    throw new Error('Customer upload does not match the stored file.');
  }
  return parsed;
}

export async function readCustomerUploadRefs(formData: FormData, scope: CustomerUploadScope, idempotencyKey?: string): Promise<CustomerUploadRef[]> {
  const raw = formData.get(CUSTOMER_UPLOAD_FIELD);
  if (raw === null) return [];
  if (typeof raw !== 'string' || raw.length > 32_000 || !idempotencyKey) throw new Error('Invalid customer upload references.');
  const refs = z.array(uploadRefSchema).max(CUSTOMER_UPLOAD_MAX_FILES).parse(JSON.parse(raw)) as CustomerUploadRef[];
  return Promise.all(refs.map((ref) => verifyCustomerUploadRef(ref, scope, idempotencyKey)));
}

export async function storeLegacyCustomerFile(file: File, scope: CustomerUploadScope, idempotencyKey?: string): Promise<CustomerUploadRef> {
  const safeName = sanitizeUploadFileName(file.name, 'upload.bin');
  const path = `uploads/customers/${scope}/${idempotencyKey && isSafeUploadKey(idempotencyKey) ? idempotencyKey : randomUUID()}/${randomUUID()}-${safeName}`;
  const stored = await put(path, file, { token: privateBlobToken(), access: 'private', contentType: file.type || 'application/octet-stream' });
  return { field: 'file', url: stored.url, pathname: stored.pathname, name: file.name, size: file.size, type: file.type || 'application/octet-stream' };
}

export async function readCustomerUploadFile(ref: CustomerUploadRef): Promise<File> {
  const response = await get(ref.url, { token: privateBlobToken(), access: 'private' });
  if (!response?.stream) throw new Error('Customer upload is unavailable.');
  const bytes = await new Response(response.stream).arrayBuffer();
  if (bytes.byteLength !== ref.size) throw new Error('Customer upload size changed.');
  return new File([bytes], ref.name, { type: ref.type });
}

export async function readCustomerFormData(request: Request, maxBytes: number, scope: CustomerUploadScope, options: { maxMaterializeBytes?: number } = {}): Promise<{ formData: FormData; refs: CustomerUploadRef[] }> {
  const formData = await readFormDataLimited(request, maxBytes);
  const idempotencyKey = readIdempotencyKey(request.headers);
  if (formData.has(CUSTOMER_UPLOAD_FIELD) && !(await claimPublicQuota({ ip: getClientIp(request), kind: 'materialize', max: 10, windowMs: 10 * 60_000 }))) {
    throw new CustomerUploadRateLimitError('Customer upload request limit exceeded.');
  }
  const uploadedRefs = await readCustomerUploadRefs(formData, scope, idempotencyKey);
  const allowedFields = scope === 'mugs' ? new Set(['file', 'designerSourceFiles[]', 'mugDesignPreviewFile', 'mugPrintLayoutFile']) : new Set(['file']);
  if (uploadedRefs.some((ref) => !allowedFields.has(ref.field))) throw new Error('Invalid customer upload field.');
  const files = [...formData.entries()].filter((entry): entry is [string, File] => entry[1] instanceof File && entry[1].size > 0);
  if (files.length && uploadedRefs.length) throw new Error('Mixed customer upload modes are not allowed.');
  if (files.length + uploadedRefs.length > CUSTOMER_UPLOAD_MAX_FILES || files.some(([field, file]) => !allowedFields.has(field) || file.size > CUSTOMER_UPLOAD_MAX_FILE_BYTES)) throw new Error('Too many customer uploads.');
  for (const ref of uploadedRefs) {
    if (ref.size <= (options.maxMaterializeBytes ?? CUSTOMER_UPLOAD_MAX_FILE_BYTES)) {
      formData.append(ref.field, await readCustomerUploadFile(ref), ref.name);
    }
  }
  return { formData, refs: uploadedRefs };
}

export function getOrderCustomerUploadRefs(payload: unknown): CustomerUploadRef[] {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return [];
  const record = payload as Record<string, unknown>;
  const value = Array.isArray(record.uploadRefs) ? record.uploadRefs : Array.isArray(record.files) ? record.files : [];
  return z.array(uploadRefSchema).max(CUSTOMER_UPLOAD_MAX_FILES).safeParse(value).data?.filter((ref) => isPrivateCustomerBlobUrl(ref.url)) ?? [];
}
