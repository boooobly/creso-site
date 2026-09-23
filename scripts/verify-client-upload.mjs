import { upload } from '@vercel/blob/client';
import { get, del } from '@vercel/blob';
import { randomUUID } from 'node:crypto';

const baseUrl = process.env.UPLOAD_TEST_BASE_URL || 'http://localhost:3100';
const token = process.env.PRIVATE_READ_WRITE_TOKEN;
if (!token) throw new Error('PRIVATE_READ_WRITE_TOKEN is unavailable.');
const idempotencyKey = randomUUID();
const pathname = `uploads/customers/lead/${idempotencyKey}/${randomUUID()}.txt`;
const size = Number(process.env.UPLOAD_TEST_BYTES || 27);
const bytes = Buffer.alloc(size, 0x43);
const blob = await upload(pathname, bytes, {
  access: 'private',
  handleUploadUrl: `${baseUrl}/api/customer-uploads`,
  clientPayload: JSON.stringify({ scope: 'lead', idempotencyKey }),
  contentType: 'text/plain',
  multipart: size > 5 * 1024 * 1024,
  headers: { origin: baseUrl, 'user-agent': 'Credomir-production-verification' },
});
try {
  const response = await get(blob.url, { access: 'private', token });
  const actual = response?.stream ? Buffer.from(await new Response(response.stream).arrayBuffer()) : null;
  if (!actual?.equals(bytes)) throw new Error('Client upload bytes do not match.');
  console.log(JSON.stringify({ clientUpload: true, privateRead: true, bytes: size }));
} finally {
  await del(blob.url, { token });
}
