import { describe, expect, it } from 'vitest';
import { validateUploadedImageFile } from '@/lib/file-validation';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function makeFile(bytes: number[], name: string, type: string) {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe('validateUploadedImageFile', () => {
  it('accepts valid jpg/png/webp files', async () => {
    const jpg = makeFile([0xFF, 0xD8, 0xFF, 0xE0], 'photo.jpg', 'image/jpeg');
    const png = makeFile([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], 'photo.png', 'image/png');
    const webp = makeFile([0x52, 0x49, 0x46, 0x46, 0x2A, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50], 'photo.webp', 'image/webp');

    await expect(validateUploadedImageFile({ file: jpg, allowedMimeTypes, allowedExtensions })).resolves.toEqual({ ok: true });
    await expect(validateUploadedImageFile({ file: png, allowedMimeTypes, allowedExtensions })).resolves.toEqual({ ok: true });
    await expect(validateUploadedImageFile({ file: webp, allowedMimeTypes, allowedExtensions })).resolves.toEqual({ ok: true });
  });

  it('rejects invalid extension', async () => {
    const file = makeFile([0xFF, 0xD8, 0xFF, 0xE0], 'photo.txt', 'image/jpeg');

    await expect(validateUploadedImageFile({ file, allowedMimeTypes, allowedExtensions })).resolves.toEqual({ ok: false, error: 'Invalid file type' });
  });

  it('rejects mime mismatch', async () => {
    const file = makeFile([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], 'photo.jpg', 'image/png');

    await expect(validateUploadedImageFile({ file, allowedMimeTypes, allowedExtensions })).resolves.toEqual({ ok: false, error: 'Invalid file type' });
  });

  it('rejects spoofed magic bytes', async () => {
    const file = makeFile([0x00, 0x11, 0x22, 0x33], 'photo.jpg', 'image/jpeg');

    await expect(validateUploadedImageFile({ file, allowedMimeTypes, allowedExtensions })).resolves.toEqual({ ok: false, error: 'Invalid file content' });
  });
});
