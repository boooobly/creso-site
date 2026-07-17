import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';

export const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9._:-]+$/;
const MIN_IDEMPOTENCY_KEY_LENGTH = 8;
const MAX_IDEMPOTENCY_KEY_LENGTH = 128;

export class InvalidIdempotencyKeyError extends Error {
  constructor(message = 'Invalid Idempotency-Key header.') {
    super(message);
    this.name = 'InvalidIdempotencyKeyError';
  }
}

export class IdempotencyConflictError extends Error {
  constructor() {
    super('This Idempotency-Key was already used with a different request.');
    this.name = 'IdempotencyConflictError';
  }
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => canonicalize(item));

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }

  if (typeof value === 'number' && !Number.isFinite(value)) return null;
  return value;
}

export function createRequestFingerprint(value: unknown): string {
  const canonicalJson = JSON.stringify(canonicalize(value));
  return createHash('sha256').update(canonicalJson ?? 'null').digest('hex');
}

export function readIdempotencyKey(headers: Headers): string | undefined {
  const rawValue = headers.get(IDEMPOTENCY_KEY_HEADER);
  if (rawValue === null) return undefined;

  const value = rawValue.trim();
  if (
    value.length < MIN_IDEMPOTENCY_KEY_LENGTH
    || value.length > MAX_IDEMPOTENCY_KEY_LENGTH
    || !IDEMPOTENCY_KEY_PATTERN.test(value)
  ) {
    throw new InvalidIdempotencyKeyError(
      `Idempotency-Key must be ${MIN_IDEMPOTENCY_KEY_LENGTH}-${MAX_IDEMPOTENCY_KEY_LENGTH} characters and contain only letters, numbers, dot, underscore, colon or hyphen.`,
    );
  }

  return value;
}

export function readRequestIdempotency(headers: Headers, fingerprintValue: unknown): {
  idempotencyKey?: string;
  requestHash?: string;
} {
  const idempotencyKey = readIdempotencyKey(headers);
  return {
    idempotencyKey,
    requestHash: idempotencyKey ? createRequestFingerprint(fingerprintValue) : undefined,
  };
}

export function idempotencyErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof InvalidIdempotencyKeyError) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  if (error instanceof IdempotencyConflictError) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 409 });
  }

  return null;
}
