export const CUSTOMER_UPLOAD_FIELD = 'customerUploadRefs';
export const CUSTOMER_UPLOAD_MAX_FILES = 12;
export const CUSTOMER_UPLOAD_MAX_FILE_BYTES = 50 * 1024 * 1024;

export type CustomerUploadScope = 'baget' | 'lead' | 'wide-format' | 'tshirts' | 'mugs' | 'milling' | 'business-cards';

export type CustomerUploadRef = {
  field: string;
  url: string;
  pathname: string;
  name: string;
  size: number;
  type: string;
};

export function isCustomerUploadScope(value: unknown): value is CustomerUploadScope {
  return typeof value === 'string' && ['baget', 'lead', 'wide-format', 'tshirts', 'mugs', 'milling', 'business-cards'].includes(value);
}

export function isSafeUploadKey(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 8 && value.length <= 128 && /^[A-Za-z0-9._:-]+$/.test(value);
}
