import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const PROJECT_ROOT = path.resolve(process.cwd(), 'src');
const SCOPES_TO_CHECK = ['components', 'app/(public)'];
const ALLOWED_FILES = new Set([
  'app/api/lead/route.ts',
  'app/api/lead/route.test.ts',
]);

function walkFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkFiles(fullPath);
    return [fullPath];
  });
}

describe('canonical lead endpoint usage', () => {
  it('does not use /api/lead in public frontend code', () => {
    const checkedFiles = SCOPES_TO_CHECK
      .flatMap((scope) => walkFiles(path.join(PROJECT_ROOT, scope)))
      .filter((filePath) => filePath.endsWith('.ts') || filePath.endsWith('.tsx'))
      .map((filePath) => ({
        absolutePath: filePath,
        relativePath: path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/'),
      }))
      .filter((file) => !ALLOWED_FILES.has(file.relativePath));

    const legacyEndpointPattern = /\/api\/lead(?!s)/;
    const violatingFiles = checkedFiles
      .filter((file) => legacyEndpointPattern.test(fs.readFileSync(file.absolutePath, 'utf8')))
      .map((file) => file.relativePath);

    expect(violatingFiles).toEqual([]);
  });
});
