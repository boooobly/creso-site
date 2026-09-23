import { describe, expect, it } from 'vitest';
import { readFormDataLimited, readJsonLimited } from './request-body';

describe('bounded request bodies', () => {
  it('rejects an oversized body without Content-Length', async () => {
    const request = new Request('http://localhost', { method: 'POST', body: 'x'.repeat(32) });
    await expect(readJsonLimited(request, 16)).rejects.toMatchObject({ status: 413 });
  });
  it('rejects malformed JSON as a client error', async () => {
    await expect(readJsonLimited(new Request('http://localhost', { method: 'POST', body: '{' }))).rejects.toMatchObject({ status: 400 });
  });
  it('preserves multipart files and fields within the bound', async () => {
    const form = new FormData();
    form.set('name', 'Тест');
    form.set('file', new File(['image-bytes'], 'sample.png', { type: 'image/png' }));
    const parsed = await readFormDataLimited(new Request('http://localhost', { method: 'POST', body: form }), 2048);
    expect(parsed.get('name')).toBe('Тест');
    expect(await (parsed.get('file') as File).text()).toBe('image-bytes');
  });
  it('rejects malformed multipart as a client error', async () => {
    await expect(readFormDataLimited(new Request('http://localhost', { method: 'POST', body: 'bad' }), 1024)).rejects.toMatchObject({ status: 400 });
  });
});
