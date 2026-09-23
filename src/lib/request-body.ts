export class RequestBodyError extends Error {
  constructor(public readonly status: 400 | 413) {
    super(status === 413 ? 'Размер загружаемых данных превышает допустимый лимит.' : 'Некорректные данные запроса.');
  }
}

// Count bytes from the stream: Content-Length can be absent or untrusted.
async function readBody(request: Request, maxBytes: number): Promise<Uint8Array<ArrayBuffer>> {
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new RequestBodyError(413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

export async function readFormDataLimited(request: Request, maxBytes: number): Promise<FormData> {
  const bytes = await readBody(request, maxBytes);
  try {
    return await new Response(bytes, { headers: { 'Content-Type': request.headers.get('content-type') ?? '' } }).formData();
  } catch {
    throw new RequestBodyError(400);
  }
}

export async function readJsonLimited(request: Request, maxBytes = 256 * 1024): Promise<unknown> {
  const bytes = await readBody(request, maxBytes);
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new RequestBodyError(400); }
}
