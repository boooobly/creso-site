# Build failure fix notes

## Reproduced failure
Running `npm run build` (without forcing a fresh Prisma client first) failed during Next.js type checking with:

- `Property 'pricingEntryHistory' does not exist on type 'PrismaClient<...>'`
- File: `src/lib/admin/baguette-extras-pricing-service.ts`

## Root cause
The code now uses the new Prisma model delegate `prisma.pricingEntryHistory`, but build could start with a stale generated Prisma client that does not include this delegate yet. In that state, TypeScript checks fail during `next build` even though runtime schema/code are correct.

## Fix applied
- Added a deterministic build-time guard in `package.json`:
  - `"prebuild": "prisma generate"`
- This ensures `prisma generate` is always executed immediately before `next build`, so generated client types match `prisma/schema.prisma`.

## Affected files
- `package.json`

## Verification
- Re-ran `npm run build`.
- The original Prisma type error no longer appears.
- Build then proceeded to a separate environment issue in this container (`ENABLE_DATABASE` disabled during static generation), which is unrelated to the Prisma type mismatch itself.
