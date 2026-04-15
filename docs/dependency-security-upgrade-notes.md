# Dependency security upgrade notes

Date: 2026-04-15  
Repository: `boooobly/creso-site`

## Scope and approach
This pass focused only on dependency security remediation with the smallest safe upgrade path:
1. Patch/minor updates and lockfile refresh first.
2. Major upgrades only where high advisories could not be fixed otherwise.
3. Keep React 18 unless forced by compatibility.

## Commands executed for investigation
- `npm audit --audit-level=high`
- `npm outdated`
- `npm explain next`
- `npm explain eslint-config-next`
- `npm explain axios`
- `npm explain nodemailer`

## What was upgraded
- `next`: `14.2.35` → `15.5.15` (major, staged step; React kept at `18.3.1`).
- `eslint-config-next`: `14.2.35` → `15.5.15` (major, aligned with Next 15).
- `vitest`: `2.1.9` → `3.2.4` (major, removes vulnerable vite/esbuild chain reported in audit).
- `tailwindcss`: `3.4.17` → `3.4.19` (patch line).
- Lockfile/transitive updates from `npm audit fix`, `npm update glob`, and reinstall flow to pull fixed transitive versions.

## Advisory analysis (before remediation)

### High severity advisories that remained initially
1. **next**
   - Severity: **high**
   - Direct/transitive: **direct**
   - Required fixed version from audit: beyond vulnerable ranges ending at `<15.5.15`
   - Major required: **yes** (from Next 14 to at least 15.x)
   - App risk: **high** for self-hosted/server-exposed deployments because advisories include DoS/request handling classes.

2. **eslint-config-next** via `@next/eslint-plugin-next` → `glob`
   - Severity: **high**
   - Direct/transitive: **direct (`eslint-config-next`) + transitive (`glob`)**
   - Required fixed version from audit path: move off vulnerable range (`14.x` / early `15` prerelease chain)
   - Major required: **yes** (14.x → 15.x)
   - App risk: **medium** (primarily development/CI lint chain, not production runtime path).

3. **glob** (transitive via Tailwind/Sucrase chain)
   - Severity: **high**
   - Direct/transitive: **transitive**
   - Required fixed version: `>=10.5.0`
   - Major required: **no** (transitive update)
   - App risk: **low-medium** (CLI injection vector typically requires local command usage with untrusted patterns, mostly build/tooling context).

### Moderate advisories that remained initially
- `vitest`/`vite`/`vite-node`/`esbuild` chain (dev/test tooling), fix path required upgrading Vitest major.

## Current state after staged remediation
- `npm audit --audit-level=high` => **0 vulnerabilities**.
- No remaining high-severity advisories.

## Why no Next 16 / React 19 migration was forced
- Remaining high issues were resolved by moving to **Next 15.5.15** and aligned tooling.
- React 18 remained compatible in this upgrade path.
- Since security objective was achieved without a larger framework migration, no risky Next 16/React 19 jump was necessary.

## Validation run after changes
- `npm install`
- `npm run test`
- `npm run build` *(fails in this environment due to inability to fetch Google Fonts from `fonts.gstatic.com`, not due to dependency resolution itself)*
- `npm run lint`
- `npm audit --audit-level=high`

## Next 15 compatibility follow-up
- Updated App Router page prop typing for `searchParams` to the Next 15 Promise-based shape (`searchParams?: Promise<...>`), then awaited inside page components before reading values.
- Applied this compatibility fix to `src/app/(public)/baget/page.tsx` and other server `page.tsx` files that declared typed `searchParams`, without changing page behavior or business logic.
- Updated dynamic App Router page prop typing for `params` to the Next 15 Promise-based shape (`params: Promise<...>`), then awaited in server `page.tsx` components before reading route params.
- Updated dynamic API route handler context typing to Next 15 Promise-based params (`{ params: Promise<...> }`) and awaited them before usage for `/api/admin/*/[id]` and `/api/orders/[number]*` handlers.

## If a future migration is needed
If policy later requires latest major baselines (Next 16 / React 19), do it as a separate staged effort:
1. Create dedicated migration branch and run official Next codemods.
2. Migrate lint command from `next lint` to ESLint CLI (Next 16 deprecation path).
3. Validate React 19 compatibility for UI and calculator/admin flows with full regression suite.
4. Re-run full smoke tests for order/payment/PDF/admin and SEO metadata behavior.
5. Roll out with preview soak period before production.
