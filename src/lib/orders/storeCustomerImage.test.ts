import { describe, expect, it } from 'vitest';
import { buildCustomerImagePath } from '@/lib/orders/storeCustomerImage';

describe('buildCustomerImagePath', () => {
  it('does not use unsafe raw filename in blob path', () => {
    const pathname = buildCustomerImagePath({
      fileName: '../../evil \\ name 😈.jpg',
      mimeType: 'image/jpeg',
      now: 123456789,
      id: 'abc-123',
    });

    expect(pathname).toBe('uploads/orders/baget/123456789-abc-123.jpg');
    expect(pathname).not.toContain('evil');
    expect(pathname).not.toContain('..');
    expect(pathname).not.toContain('\\');
    expect(pathname).not.toContain(' ');
  });
});
