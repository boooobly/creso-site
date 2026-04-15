import { describe, expect, it } from 'vitest';
import {
  createOrderAccessToken,
  createOrderPdfAccessToken,
  verifyOrderAccessToken,
  verifyOrderPdfAccessToken,
} from '@/lib/orders/pdfAccessToken';

describe('order access token', () => {
  it('creates and validates order access token', () => {
    const secret = 'test-secret';
    const orderNumber = 'ORDER12345';
    const token = createOrderAccessToken(orderNumber, secret);

    expect(verifyOrderAccessToken({ token, orderNumber, secret })).toBe(true);
  });

  it('rejects token for another order number', () => {
    const secret = 'test-secret';
    const token = createOrderAccessToken('ORDER12345', secret);

    expect(verifyOrderAccessToken({ token, orderNumber: 'ORDER54321', secret })).toBe(false);
  });

  it('keeps pdf compatibility wrappers', () => {
    const secret = 'test-secret';
    const orderNumber = 'ORDER12345';
    const token = createOrderPdfAccessToken(orderNumber, secret);

    expect(verifyOrderPdfAccessToken({ token, orderNumber, secret })).toBe(true);
  });
});
