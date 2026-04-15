# Current full-site audit (main branch)

Date: 2026-04-15  
Repository: `boooobly/creso-site`  
Scope: full static code audit + non-interactive checks (`npm install`, `npm run test`, `npm run build`, `npm run lint`, `npm audit`).

---

## 1) What was checked

### Project structure reviewed
- `src/app` public routes (`src/app/(public)/**`) and root metadata/robots/sitemap.
- `src/app/api/**` public, payment, order, review, and admin endpoints.
- `src/app/admin/**` panel/login/actions.
- `src/components/**` (spot-checked where relevant to UX consistency).
- `src/lib/**` (auth, env, anti-spam, pricing, uploads, notifications, SEO).
- `prisma/schema.prisma` and `prisma/migrations/**`.
- `scripts/vercel-build.mjs`.
- `docs/**` (including previous audit baseline).
- Deployment/env files: `.env.example`, `vercel.json`, `next.config.js`, `Dockerfile`.

### Commands run
1. `npm install` ✅
2. `npm run test` ✅ (85 tests passed)
3. `npm run build` ✅ (build passed, with warnings)
4. `npm run lint` ⚠️ (blocked by interactive first-time ESLint setup prompt)
5. `npm audit --audit-level=moderate` ⚠️ (completed and reported vulnerabilities)

---

## 2) Comparison with previous audit (`docs/full-site-bug-security-audit.md`)

| Previous ID | Prior status claim | Current code status | Notes |
|---|---|---|---|
| F-001 Order PII exposure | Resolved | **Resolved** | `/api/orders/[number]` now requires signed order token or admin bearer. |
| F-002 Payment creation abuse | Resolved | **Resolved** | `/api/payments/create` now requires signed order token or admin bearer. |
| F-003 Mock payment/webhook mismatch | Resolved | **Resolved** | Dedicated `/api/payments/mock/complete` exists and uses token + paymentRef checks. |
| F-004 PDF access UX | Resolved | **Resolved** | Order page requests tokenized data and uses `securePdfUrl`/tokenized fallback link. |
| F-005 Admin login throttling | Resolved | **Resolved (single-instance)** | In-memory IP lockout added; still not distributed across instances. |
| F-006 Public baget debug exposure | Resolved | **Resolved** | Debug endpoint returns 404 in production. |
| F-007 Sitemap/robots `example.com` | Resolved | **Resolved for sitemap/robots only** | `robots.ts` and `sitemap.ts` now use env base URL. |

### New delta after re-audit
- **PR #591 update:** metadata base URL now uses env-driven logic and no longer hardcodes `https://example.com` (**A-002 resolved**).
- **PR #591 update:** dependencies were upgraded in a staged path (`next` 14→15.5.15, `eslint-config-next` 14→15.5.15, `vitest` 2→3, `tailwindcss` 3.4.17→3.4.19, plus transitive refresh), and `npm audit --audit-level=high` now reports zero vulnerabilities (**A-001 resolved**).
- Remaining reliability/security hardening gaps include CSRF/origin protections for admin mutations, upload and memory-pressure controls, and distributed rate-limit state.

---

## 3) Findings

> Legend: If runtime behavior cannot be proven from static code alone, it is marked **Needs verification**.

### A-001
- **Severity:** High
- **Area:** Dependency security / platform
- **Status:** **Resolved (staged dependency security upgrade completed)**
- **Files:** `package.json`, `package-lock.json`
- **What was wrong:** Previous dependency baseline left high-severity advisories in `npm audit`, primarily from Next.js/tooling dependency chains.
- **Why it mattered:** Known high advisories increased exposure for build/runtime and CI tooling.
- **Fix delivered:** Completed a smallest-safe staged upgrade path without jumping to Next 16/React 19: upgraded to `next@15.5.15` (keeping React 18), aligned `eslint-config-next@15.5.15`, moved `vitest` to `3.2.4`, updated `tailwindcss` to `3.4.19`, and refreshed transitive dependencies (`glob` to fixed line) via lockfile updates.
- **Verification:** `npm audit --audit-level=high` now returns `found 0 vulnerabilities`.
- **Suggested regression test / QA:** Keep CI gates for `npm audit --audit-level=high`, `npm run test`, `npm run lint`, and periodic build smoke tests in an environment with Google Fonts egress.

### A-002
- **Severity:** High
- **Area:** SEO / metadata
- **Status:** **Resolved in PR #591**
- **Files:** `src/lib/seo.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/lib/seo.test.ts`
- **What was wrong:** `metadataBase` was hardcoded to `https://example.com` while robots/sitemap already used env-driven base URL.
- **Why it mattered:** Canonical/OpenGraph metadata could point to the wrong domain even when sitemap/robots were correct.
- **Fix delivered:** `metadataBase` now uses the same env-driven base URL path (`getBaseUrl()`), with regression tests to prevent reintroduction.
- **Suggested regression test / QA:** Keep metadata base URL tests in CI and verify production host values in preview/prod smoke checks.

### A-003
- **Severity:** Medium
- **Area:** Admin auth / CSRF hardening
- **Status:** **Resolved in this PR (origin-based mutation protection)**
- **Files:** `middleware.ts`, `src/lib/admin/api-auth.ts`, `src/app/api/admin/**`, `src/lib/admin/api-auth.test.ts`
- **What was wrong:** Admin API authorization previously checked only session cookie validity, with no explicit origin check on state-changing endpoints.
- **Why it mattered:** `SameSite=Lax` reduces risk but is not a complete CSRF defense layer by itself.
- **Fix delivered:** Non-GET `/api/admin/*` requests now require a trusted same-origin `Origin` value (request origin / forwarded host origin / configured public base origin). Cross-origin or missing-origin mutation attempts are rejected with `403`. GET endpoints remain compatible.
- **Suggested regression test / QA:** Keep admin origin-hardening tests in CI for allow/deny mutation scenarios plus GET compatibility checks.

### A-004
- **Severity:** Medium
- **Area:** Rate-limiting reliability
- **Status:** **Partially resolved in PR-5 (extensible limiter store abstraction)**
- **Files:** `src/lib/rate-limit.ts`, `src/lib/admin/login-rate-limit.ts`
- **What was wrong:** Public and admin rate limiting were in-memory maps only.
- **Why it matters:** Multi-instance/serverless deployments can bypass limits per instance; restarts reset counters.
- **Fix delivered:** Introduced explicit rate-limit store abstractions (with current in-memory default) so shared/distributed backing storage can be plugged in without rewriting limiter logic.
- **Remaining gap:** Runtime still uses in-memory fallback by default; distributed shared store is not yet wired.
- **Suggested regression test / QA:** Keep unit tests for limiter behavior and add preview/prod multi-instance simulation when shared store is introduced.

### A-005
- **Severity:** Medium
- **Area:** File upload / abuse resistance
- **Status:** **Resolved in PR-3 (multipart upload hardening)**
- **Files:** `src/app/api/orders/route.ts`, `src/app/api/leads/route.ts`
- **What is wrong:** Multipart flows convert uploaded files to memory buffers (`arrayBuffer` → `Buffer`) without aggregate request limits at route level.
- **Why it matters:** Large/many uploads can increase memory pressure and degrade API stability.
- **Fix delivered:** Added centralized multipart guardrails (content-length precheck, per-file limit, total-size limit, max file count) and applied them across public upload routes before any notification buffering (`arrayBuffer`). Added coverage for oversized and multi-file rejection with RU user-safe messages plus admin upload compatibility checks.
- **Suggested regression test / QA:** Keep multipart limit tests in CI and periodically run burst/load checks for multipart endpoints to monitor memory usage under parallel uploads.

### A-006
- **Severity:** Medium
- **Area:** Webhook/payment integrity
- **Status:** **Resolved in this PR (strict paid amount reconciliation)**
- **Files:** `src/app/api/payments/webhook/route.ts`
- **What was wrong:** For `paid` status, webhook previously stored payload `paidAmount` when present.
- **Why it mattered:** Signed webhooks should still enforce deterministic server-side amount policy to avoid persisting mismatched payment values.
- **Fix delivered:** `paid` webhook events now strictly reconcile provided `paidAmount` against internally computed expected amount; mismatches are rejected (`400`) and order payment state is not updated. Successful paid updates always persist computed internal amount.
- **Suggested regression test / QA:** Keep mismatched/matching signed `paidAmount` tests in CI.

### A-007
- **Severity:** Medium
- **Area:** Logging consistency / observability
- **Status:** **Partially resolved in PR-5 (structured logger standardization on sensitive paths)**
- **Files:** `src/app/api/reviews/route.ts`, `src/app/api/admin/media/route.ts`, `src/lib/notifications/notifyNewOrder.ts`, `src/lib/baget/sheetsCatalog.ts`
- **What was wrong:** Mixed logging style (`console.error` and structured logger) across sensitive routes.
- **Why it matters:** Incident triage and centralized log parsing become inconsistent.
- **Fix delivered:** Replaced raw console logging with structured `logger` calls on key sensitive server routes/libs; added regression test guard that blocks new raw `console.*` usage in selected sensitive server files.
- **Remaining gap:** Some non-sensitive/dev-oriented modules still use console output and can be migrated in follow-up cleanup.
- **Suggested regression test / QA:** Keep logging-guard test in CI and gradually widen protected file scope as remaining modules migrate.

### A-008
- **Severity:** Low
- **Area:** Public diagnostics exposure
- **Status:** **Resolved in this PR (auth/token gate in non-production)**
- **Files:** `src/app/api/baget/catalog-debug/route.ts`
- **What was wrong:** Endpoint was hidden in production but openly available in non-production.
- **Why it mattered:** Preview links could expose integration internals (sheet IDs/tab/errors/sample data).
- **Fix delivered:** Non-production access now requires either admin bearer auth or a configured debug token (`BAGET_CATALOG_DEBUG_TOKEN` via `debugToken` query or `x-debug-token` header). Production remains hard-blocked (`404`).
- **Suggested regression test / QA:** Keep unauthenticated preview rejection tests in CI.

### A-009
- **Severity:** Medium
- **Area:** UX / localization consistency (RU)
- **Status:** **Resolved in PR-4 (API RU localization cleanup)**
- **Files:** `src/app/(public)/order/[number]/page.tsx`, `src/app/api/orders/[number]/route.ts`, `src/app/api/payments/create/route.ts`, `src/app/api/payments/mock/complete/route.ts`
- **What was wrong:** Mixed EN/RU API and UI messages (`Forbidden`, `Order not found`, payment status `unpaid`) appeared in RU customer flow.
- **Why it mattered:** Owner-facing production UX was inconsistent and less understandable for Russian-speaking users.
- **Fix delivered:** Customer-facing errors in order/payment APIs were localized to Russian; order/payment pages now display Russian payment status labels and updated RU-friendly mock-payment messages.
- **Suggested regression test / QA:** Manual RU flow check: place order → open status page → payment start/failure states all fully localized.

### A-010
- **Severity:** Medium
- **Area:** Deprecated/parallel moderation path
- **Status:** **Resolved in PR-4 (legacy token route disabled)**
- **Files:** `src/app/api/reviews/[id]/moderate/route.ts`, `src/app/api/admin/reviews/[id]/route.ts`, `.env.example`
- **What was wrong:** Two moderation mechanisms coexisted: admin cookie-protected API and separate token-header moderation endpoint.
- **Why it mattered:** Duplicate auth surfaces created maintenance and security drift risk.
- **Fix delivered:** Legacy `/api/reviews/[id]/moderate` token route now returns explicit `410 Gone` deprecation response; active moderation path is `/api/admin/reviews/[id]`. `REVIEW_MODERATION_TOKEN` is marked deprecated in env docs.
- **Suggested regression test / QA:** Ensure review moderation works only through one documented endpoint.

### A-011
- **Severity:** Medium
- **Area:** API design / dead-logic risk
- **Status:** **Resolved in PR-4 (canonical lead endpoint)**
- **Files:** `src/app/api/lead/route.ts`, `src/app/api/leads/route.ts`
- **What was wrong:** Two similarly named endpoints overlapped in purpose but with different behavior (one mostly validation echo, one real notification pipeline).
- **Why it mattered:** Integrations could call wrong endpoint and behavior could diverge over time.
- **Fix delivered:** `/api/leads` is the canonical route; `/api/lead` now acts as a backward-compatible wrapper forwarding to canonical processing and sets deprecation headers. Added regression test preventing accidental `/api/lead` usage in public frontend code.
- **Suggested regression test / QA:** API contract test verifying front-end points only to canonical route.

### A-012
- **Severity:** Low
- **Area:** Data privacy minimization
- **Status:** **Resolved in this PR (customer-safe order response split)**
- **Files:** `src/app/api/orders/[number]/route.ts`
- **What was wrong:** Token-authorized customer response used the same full payload shape as admin and could include unnecessary internals.
- **Why it mattered:** Least-privilege response design lowers accidental exposure risk in browser/client logs.
- **Fix delivered:** `/api/orders/[number]` now returns a minimized customer-safe payload for signed token access (only fields required by public order page, with quote payload reduced to `effectiveSize` + item `title/total`); admin bearer access retains full details.
- **Suggested regression test / QA:** Keep schema assertions proving customer response excludes admin-only/raw payload fields.

### A-013
- **Severity:** Medium
- **Area:** Deployment/runtime reliability
- **Status:** **Partially resolved in PR-5 (owner-facing fallback visibility)**
- **Files:** `src/lib/env.ts`, `src/lib/pricing/loadPricingConfigWithFallback.ts`, `src/lib/db/prisma.ts`
- **What was wrong:** App is designed to run with `ENABLE_DATABASE=false` and fallback configs; build output shows many fallback warnings.
- **Why it matters:** Silent fallback can hide stale prices/config in production unless actively monitored.
- **Fix delivered:** Admin health now surfaces stronger Russian owner-facing warnings for production fallback/database-disabled scenarios; pricing fallback logging now emits structured warning events.
- **Remaining gap:** Production hard-fail policy is still intentionally not enforced.
- **Suggested regression test / QA:** Verify deployed admin health screen highlights fallback mode clearly and that structured fallback logs are visible in runtime logging pipeline.

### A-014
- **Severity:** Low
- **Area:** Docs/config mismatch
- **Status:** **Partially resolved in PR-6 (owner smoke checklist added)**
- **Files:** `README.md`, `docs/ENV.md`, `.env.example`
- **What is wrong:** README is minimal and does not document runbook/check commands; docs mention env expectations but not a practical owner checklist for production hardening decisions (especially around fallback mode and moderation legacy route).
- **Why it matters:** Non-technical owner may apply partial configuration and miss hidden risk modes.
- **Fix delivered:** Added `docs/e2e-smoke-checklist.md` with a practical owner smoke checklist covering customer order/payment/PDF flow, admin auth/health, upload, moderation, and safe pricing/content edits.
- **Remaining gap:** README/ENV docs still do not include full runbook/security-baseline guidance.
- **Suggested regression test / QA:** Manual doc QA: fresh operator can configure preview/prod without additional tribal knowledge.

### A-015
- **Severity:** Medium
- **Area:** Tests coverage gaps
- **Status:** **Resolved in PR-6 (integration smoke suites for critical flows)**
- **Files:** `src/app/api/admin/**`, `src/app/(public)/**`, `src/app/api/orders/route.ts`, `src/app/api/leads/route.ts`
- **What is wrong:** Unit tests exist for many security/price flows, but limited end-to-end coverage for critical user journey (order create → pay mock → status page → PDF download; admin content updates).
- **Why it matters:** Regression risk remains high for integration edges and owner-visible flows.
- **Fix delivered:** Added Vitest integration-style workflow coverage for customer order/payment/PDF happy path, admin protected API smoke (session auth + moderation + pricing/content read/update), and failure paths (invalid order/payment token, disabled legacy moderation route, canonical lead wrapper behavior).
- **Suggested regression test / QA:** Keep new integration smoke suite in CI (`critical-flows.integration.test.ts`) plus targeted unit tests.

---

## 4) Public API risk overview

- Customer-sensitive endpoints (`/api/orders/[number]`, `/api/orders/[number]/pdf`, `/api/payments/create`, `/api/payments/mock/complete`) now enforce signed token or admin auth.
- Anti-spam guard is applied broadly for public forms, but relies on in-memory rate limits.
- Legacy moderation token route is disabled (`410 Gone`); moderation is consolidated to admin-auth API.

---

## 5) Admin auth & CSRF risk overview

- Session signing and cookie flags are generally implemented correctly.
- Login throttling exists (in-memory, IP-based).
- Non-GET admin API routes now enforce trusted same-origin `Origin` validation in shared auth helper (cross-origin and missing-origin mutations are rejected).

---

## 6) File upload risk overview

- Admin upload validates extension+MIME and magic bytes for common image types.
- SVG is rejected in hardened flows.
- Customer image blobs are public by design (unguessable paths reduce but do not eliminate exposure risk).
- Multipart memory pressure and aggregate upload-size protections should be strengthened.

---

## 7) Order/payment/PDF risk overview

- Tokenized access model is now in place and substantially improved.
- Mock payment completion path appears coherent with order page token flow.
- Webhook replay/idempotency protections are present.
- Amount trust policy can be hardened further.

---

## 8) Calculator/pricing consistency overview

- Strong regression tests are present for pricing parity and calculations.
- Build logs indicate heavy fallback usage when DB config is absent.
- **Needs verification:** real production DB pricing vs fallback values and admin override behavior on deployed environment.

---

## 9) SEO, mobile/adaptive, and UX code-level notes

- SEO: robots/sitemap and metadata base URL now consistently use env-driven base URL logic.
- Mobile/adaptive: no obvious catastrophic layout break found from static read; **Needs verification** on real devices for calculators/order pages with long text and validation states.
- UX/API notes after PR-4:
  - customer order/payment flow messages are RU-localized,
  - lead capture now has canonical `/api/leads` endpoint with `/api/lead` compatibility wrapper.

---

## 10) Prioritized fix plan (small future PRs)

### PR-1 (Security dependencies + SEO canonical)
1. Upgrade vulnerable dependencies (especially `next`, `axios`, related tree).
2. Replace hardcoded `metadataBase` with env-driven base URL.
3. Add automated checks (`npm audit` threshold + metadata test).

### PR-2 (Admin mutation hardening)
1. Add CSRF token/origin checks for `/api/admin/*` mutating endpoints.
2. Add tests for cross-origin request rejection.

### PR-3 (Upload and memory safety)
1. Add strict aggregate multipart limits and per-file caps where missing.
2. Add explicit rejection handling with user-friendly RU messages.
3. Add load-oriented tests for oversized multipart payloads.

### PR-4 (API consolidation and localization)
1. Consolidate/deprecate duplicated lead endpoints.
2. Remove/disable legacy review moderation token route or isolate with stricter controls.
3. Normalize RU-facing user messages for order/payment APIs and UI.

### PR-5 (Reliability & observability)
1. Move rate limiting to shared store for distributed deployments.
2. Standardize server logging via structured logger.
3. Add alerting/visibility when production runs in fallback pricing mode.

### PR-6 (E2E confidence)
1. Add full customer journey e2e (order → payment mock → status → PDF).
2. Add admin panel e2e smoke (login, review moderation, pricing/content updates).
3. Add preview smoke checklist script for owner.

---

## 11) Check output summary (for traceability)

- `npm install`: succeeded; Prisma client generated.
- `npm run test`: passed (85/85).
- `npm run build`: succeeded; warnings about outdated browser datasets and fallback pricing/data sources.
- `npm run lint`: blocked by interactive ESLint setup prompt (non-interactive CI style run unavailable until ESLint config is committed).
- `npm audit --audit-level=moderate`: reported 20 vulnerabilities (including critical/high).
