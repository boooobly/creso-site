'use client';

import { useRef } from 'react';
import {
  getSubmissionIdempotencyKey,
  completeSubmissionIdempotencyKey,
  settleSubmissionIdempotencyKey,
  type SubmissionIdempotencyState,
} from '@/lib/orders/clientIdempotency';

export function useSubmissionIdempotency(scope: string): {
  getKey: (fingerprintValue: unknown) => string;
  settle: (key: string, responseStatus: number) => void;
  complete: (key: string) => void;
} {
  const stateRef = useRef<SubmissionIdempotencyState>(null);

  return {
    getKey: (fingerprintValue) => getSubmissionIdempotencyKey(stateRef, scope, fingerprintValue),
    settle: (key, responseStatus) => settleSubmissionIdempotencyKey(stateRef, key, responseStatus),
    complete: (key) => completeSubmissionIdempotencyKey(stateRef, key),
  };
}
