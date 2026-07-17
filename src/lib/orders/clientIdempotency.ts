export type SubmissionIdempotencyState = {
  key: string;
  fingerprint: string;
} | null;

type RefLike<T> = { current: T };

function randomId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  const randomPart = Math.random().toString(36).slice(2);
  return `${Date.now().toString(36)}-${randomPart}`;
}

export function getSubmissionIdempotencyKey(
  ref: RefLike<SubmissionIdempotencyState>,
  scope: string,
  fingerprintValue: unknown,
): string {
  const fingerprint = JSON.stringify(fingerprintValue);
  if (!ref.current || ref.current.fingerprint !== fingerprint) {
    ref.current = {
      key: `${scope}:${randomId()}`,
      fingerprint,
    };
  }

  return ref.current.key;
}

export function settleSubmissionIdempotencyKey(
  ref: RefLike<SubmissionIdempotencyState>,
  key: string,
  responseStatus: number,
): void {
  if (responseStatus >= 400 && responseStatus < 500 && ref.current?.key === key) {
    ref.current = null;
  }
}

export function completeSubmissionIdempotencyKey(
  ref: RefLike<SubmissionIdempotencyState>,
  key: string,
): void {
  if (ref.current?.key === key) {
    ref.current = null;
  }
}
