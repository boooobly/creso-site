import { randomBytes } from 'crypto';

const ORDER_NUMBER_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const DEFAULT_ORDER_NUMBER_LENGTH = 10;

/**
 * Generates a short public-facing order number.
 *
 * Strategy:
 * - keep it human-friendly and shareable (uppercase alphanumeric)
 * - keep it short (10 chars)
 * - rely on DB unique constraint + retry loop for collision safety
 */
export function generateOrderNumber(length = DEFAULT_ORDER_NUMBER_LENGTH): string {
  const size = Math.max(8, Math.min(10, Math.floor(length)));
  const bytes = randomBytes(size);

  let value = '';
  for (let i = 0; i < size; i += 1) {
    value += ORDER_NUMBER_ALPHABET[bytes[i] % ORDER_NUMBER_ALPHABET.length];
  }

  return value;
}
