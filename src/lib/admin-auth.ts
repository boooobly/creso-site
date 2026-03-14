import { cookies } from 'next/headers';

export const ADMIN_SESSION_COOKIE = 'admin_session';

const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24;
const SESSION_VERSION = 'v1';
const textEncoder = new TextEncoder();

type AdminSessionPayload = {
  sub: 'admin';
  iat: number;
  exp: number;
};

function getEnvValue(key: 'ADMIN_PASSWORD' | 'ADMIN_SESSION_SECRET', fallback: string) {
  const value = process.env[key]?.trim();

  if (value && value.length > 0) {
    return value;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`[env] ${key} must be configured in production.`);
  }

  return fallback;
}

function parseSessionTtlSeconds() {
  const rawValue = process.env.ADMIN_SESSION_TTL_SECONDS?.trim();

  if (!rawValue) {
    return DEFAULT_SESSION_TTL_SECONDS;
  }

  const ttlSeconds = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
    throw new Error('[env] ADMIN_SESSION_TTL_SECONDS must be a positive integer.');
  }

  return ttlSeconds;
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }

  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function toBase64Url(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? textEncoder.encode(input) : input;

  return bytesToBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);

  return base64ToBytes(base64 + padding);
}

async function signSessionData(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(data));
  return toBase64Url(new Uint8Array(signature));
}

async function verifySessionSignature(data: string, signature: string, secret: string): Promise<boolean> {
  let signatureBytes: Uint8Array;

  try {
    signatureBytes = fromBase64Url(signature);
  } catch {
    return false;
  }

  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  return crypto.subtle.verify('HMAC', key, signatureBytes, textEncoder.encode(data));
}

function decodeSessionPayload(payloadPart: string): AdminSessionPayload | null {
  try {
    const payloadJson = new TextDecoder().decode(fromBase64Url(payloadPart));
    const payload = JSON.parse(payloadJson) as AdminSessionPayload;

    if (payload.sub !== 'admin') return null;
    if (!Number.isInteger(payload.iat) || !Number.isInteger(payload.exp)) return null;
    if (payload.exp <= payload.iat) return null;

    return payload;
  } catch {
    return null;
  }
}

export function getAdminPassword() {
  return getEnvValue('ADMIN_PASSWORD', 'change-me-admin-password');
}

export function getAdminSessionSecret() {
  return getEnvValue('ADMIN_SESSION_SECRET', 'change-me-admin-secret');
}

export async function createSignedAdminSessionToken() {
  const issuedAt = Math.floor(Date.now() / 1000);
  const ttlSeconds = parseSessionTtlSeconds();
  const payload: AdminSessionPayload = {
    sub: 'admin',
    iat: issuedAt,
    exp: issuedAt + ttlSeconds,
  };

  const payloadPart = toBase64Url(JSON.stringify(payload));
  const tokenData = `${SESSION_VERSION}.${payloadPart}`;
  const signaturePart = await signSessionData(tokenData, getAdminSessionSecret());

  return `${tokenData}.${signaturePart}`;
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }

  const [version, payloadPart, signaturePart, ...extraParts] = token.split('.');
  if (extraParts.length > 0 || version !== SESSION_VERSION || !payloadPart || !signaturePart) {
    return false;
  }

  const payload = decodeSessionPayload(payloadPart);
  if (!payload) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    return false;
  }

  return verifySessionSignature(`${version}.${payloadPart}`, signaturePart, getAdminSessionSecret());
}

export async function isAdminAuthenticated() {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return verifyAdminSessionToken(token);
}

export async function createAdminSession() {
  const cookieStore = cookies();
  const token = await createSignedAdminSessionToken();

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: parseSessionTtlSeconds()
  });
}

export async function clearAdminSession() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
