import { beforeEach, describe, expect, it, vi } from 'vitest';

const { headMock } = vi.hoisted(() => ({ headMock: vi.fn() }));
vi.mock('@vercel/blob', () => ({ head: headMock, get: vi.fn(), put: vi.fn() }));

const ref = {
  field: 'customerImage',
  url: 'https://store.private.blob.vercel-storage.com/uploads/customers/baget/order-key/file.jpg',
  pathname: 'uploads/customers/baget/order-key/file.jpg',
  name: 'file.jpg',
  size: 123,
  type: 'image/jpeg',
};

describe('customer upload references', () => {
  beforeEach(() => {
    process.env.PRIVATE_READ_WRITE_TOKEN = 'private-test-token';
    headMock.mockReset();
    headMock.mockResolvedValue({ size: 123, pathname: ref.pathname, contentType: 'image/jpeg' });
  });

  it('verifies private storage metadata before accepting a reference', async () => {
    const { verifyCustomerUploadRef } = await import('./server');
    await expect(verifyCustomerUploadRef(ref, 'baget', 'order-key')).resolves.toEqual(ref);
    expect(headMock).toHaveBeenCalledWith(ref.url, { token: 'private-test-token' });
  });

  it('rejects a reference from another submission before reading storage', async () => {
    const { verifyCustomerUploadRef } = await import('./server');
    await expect(verifyCustomerUploadRef(ref, 'baget', 'another-key')).rejects.toThrow('Invalid customer upload reference');
    expect(headMock).not.toHaveBeenCalled();
  });

  it('rejects public blobs and mismatched stored sizes', async () => {
    const { verifyCustomerUploadRef } = await import('./server');
    await expect(verifyCustomerUploadRef({ ...ref, url: ref.url.replace('.private.', '.public.') }, 'baget', 'order-key')).rejects.toThrow('Invalid customer upload reference');
    headMock.mockResolvedValue({ size: 124, pathname: ref.pathname, contentType: 'image/jpeg' });
    await expect(verifyCustomerUploadRef(ref, 'baget', 'order-key')).rejects.toThrow('does not match');
  });
});
