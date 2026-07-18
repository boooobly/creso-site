import { describe, expect, it } from 'vitest';
import {
  getSubmissionIdempotencyKey,
  completeSubmissionIdempotencyKey,
  settleSubmissionIdempotencyKey,
  type SubmissionIdempotencyState,
} from '@/lib/orders/clientIdempotency';

describe('client submission idempotency', () => {
  it('reuses a key for retries and rotates it when the request changes', () => {
    const ref: { current: SubmissionIdempotencyState } = { current: null };
    const first = getSubmissionIdempotencyKey(ref, 'lead', { name: 'Иван' });
    const retry = getSubmissionIdempotencyKey(ref, 'lead', { name: 'Иван' });
    const changed = getSubmissionIdempotencyKey(ref, 'lead', { name: 'Пётр' });

    expect(retry).toBe(first);
    expect(changed).not.toBe(first);
  });

  it('keeps a key after 5xx and clears it after a definitive response', () => {
    const ref: { current: SubmissionIdempotencyState } = { current: null };
    const key = getSubmissionIdempotencyKey(ref, 'lead', { name: 'Иван' });

    settleSubmissionIdempotencyKey(ref, key, 502);
    expect(ref.current?.key).toBe(key);

    settleSubmissionIdempotencyKey(ref, key, 200);
    expect(ref.current?.key).toBe(key);

    settleSubmissionIdempotencyKey(ref, key, 409);
    expect(ref.current).toBeNull();
  });

  it('clears a successful request only after its response is confirmed', () => {
    const ref: { current: SubmissionIdempotencyState } = { current: null };
    const key = getSubmissionIdempotencyKey(ref, 'lead', { name: 'Иван' });

    settleSubmissionIdempotencyKey(ref, key, 200);
    expect(ref.current?.key).toBe(key);
    completeSubmissionIdempotencyKey(ref, key);
    expect(ref.current).toBeNull();
  });
});
