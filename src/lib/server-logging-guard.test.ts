import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const SENSITIVE_SERVER_FILES = [
  'src/app/api/reviews/route.ts',
  'src/app/api/admin/media/route.ts',
  'src/app/api/admin/media/[id]/route.ts',
  'src/app/api/leads/route.ts',
  'src/app/api/orders/route.ts',
  'src/lib/notifications/notifyNewOrder.ts',
  'src/lib/baget/sheetsCatalog.ts',
  'src/lib/pricing/loadPricingConfigWithFallback.ts',
] as const;

describe('server logging guard', () => {
  it('does not allow raw console.* in sensitive server files', () => {
    const offenders = SENSITIVE_SERVER_FILES.filter((filePath) => {
      const absolutePath = path.resolve(ROOT, filePath);
      const content = fs.readFileSync(absolutePath, 'utf8');
      return /console\.(error|warn|log|info)\(/.test(content);
    });

    expect(offenders).toEqual([]);
  });
});
