import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { MULTIPART_ERRORS_RU, validateMultipartContentLength, validateMultipartFiles } from '@/lib/upload-safety';

describe('upload-safety helpers', () => {
  it('returns russian error when too many files provided', () => {
    const files = [
      new File([new Uint8Array([1])], 'a.txt', { type: 'text/plain' }),
      new File([new Uint8Array([2])], 'b.txt', { type: 'text/plain' }),
    ];

    const result = validateMultipartFiles(files, { maxFiles: 1 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(MULTIPART_ERRORS_RU.TOO_MANY_FILES);
      expect(result.status).toBe(400);
    }
  });

  it('checks content-length and rejects oversized request', () => {
    const request = new NextRequest('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data; boundary=abc',
        'content-length': String(10),
      },
      body: 'x',
    });

    const result = validateMultipartContentLength(request, { maxContentLengthBytes: 5 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(MULTIPART_ERRORS_RU.REQUEST_TOO_LARGE);
      expect(result.status).toBe(413);
    }
  });
});
