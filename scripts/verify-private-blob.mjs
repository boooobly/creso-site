import { put, get, head, del } from '@vercel/blob';
import { randomUUID } from 'node:crypto';

const token = process.env.PRIVATE_READ_WRITE_TOKEN;
if (!token) throw new Error('PRIVATE_READ_WRITE_TOKEN is unavailable.');
const bytes = Buffer.from('blob-private-check');
const blob = await put(`uploads/customers/verification/${randomUUID()}.txt`, bytes, { access: 'private', token, contentType: 'text/plain' });
try {
  const unauthenticated = await fetch(blob.url, { redirect: 'manual' });
  const authenticated = await get(blob.url, { access: 'private', token });
  const metadata = await head(blob.url, { token });
  const actual = authenticated?.stream ? Buffer.from(await new Response(authenticated.stream).arrayBuffer()) : null;
  if (unauthenticated.ok || !actual?.equals(bytes) || metadata?.size !== bytes.length || metadata.pathname !== blob.pathname || metadata.contentType !== 'text/plain') throw new Error('Private Blob verification failed.');
  console.log(JSON.stringify({ unauthenticatedStatus: unauthenticated.status, authenticatedRead: true, metadataVerified: true }));
} finally {
  await del(blob.url, { token });
}
