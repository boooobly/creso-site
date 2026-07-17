import { describe, expect, it } from 'vitest';
import {
  createRequestFingerprint,
  InvalidIdempotencyKeyError,
  readIdempotencyKey,
} from '@/lib/orders/idempotency';

describe('order idempotency helpers', () => {
  it('creates the same fingerprint regardless of object key order', () => {
    expect(createRequestFingerprint({ customer: { phone: '+7999', name: 'Иван' }, quantity: 2 }))
      .toBe(createRequestFingerprint({ quantity: 2, customer: { name: 'Иван', phone: '+7999' } }));
  });

  it('creates a different fingerprint when a request value changes', () => {
    expect(createRequestFingerprint({ quantity: 2 }))
      .not.toBe(createRequestFingerprint({ quantity: 3 }));
  });

  it('accepts valid keys and rejects unsafe or undersized keys', () => {
    expect(readIdempotencyKey(new Headers({ 'Idempotency-Key': 'baget:12345678-abcd' })))
      .toBe('baget:12345678-abcd');
    expect(readIdempotencyKey(new Headers())).toBeUndefined();
    expect(() => readIdempotencyKey(new Headers({ 'Idempotency-Key': 'short' })))
      .toThrow(InvalidIdempotencyKeyError);
    expect(() => readIdempotencyKey(new Headers({ 'Idempotency-Key': 'invalid key value' })))
      .toThrow(InvalidIdempotencyKeyError);
  });
});
