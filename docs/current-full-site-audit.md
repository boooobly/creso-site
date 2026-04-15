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
- A **new SEO inconsistency** remains in metadata: `metadataBase` is still hardcoded to `https://example.com` in `src/lib/seo.ts`.
- Several **reliability/security hardening gaps** remain (CSRF hardening for cookie-auth admin APIs, upload and memory-pressure controls, dependency vulnerabilities, distributed rate-limit state).

---

## 3) Findings

> Legend: If runtime behavior cannot be proven from static code alone, it is marked **Needs verification**.

### A-001
- **Severity:** High
- **Area:** Dependency security / platform
- **Files:** `package.json`
- **What is wrong:** `next` is pinned to `14.2.7`, and `npm audit` currently reports multiple critical/high vulnerabilities in dependency graph (including Next.js advisories and axios advisories).
- **Why it matters:** Exposed production apps can be impacted by known CVEs or receive poor security posture scores.
- **Suggested fix:** Upgrade `next` and vulnerable dependencies to patched versions compatible with the app; then rerun regression checks.
- **Suggested regression test / QA:** CI job with `npm audit --audit-level=high`; smoke-test all API routes and payment/order flows after upgrade.

### A-002
- **Severity:** High
- **Area:** SEO / metadata
- **Files:** `src/lib/seo.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`
- **What is wrong:** `metadataBase` is hardcoded to `https://example.com` while robots/sitemap already use env-driven base URL.
- **Why it matters:** Canonical/OpenGraph metadata can point to the wrong domain even if robots/sitemap are correct.
- **Suggested fix:** Build `metadataBase` from `getBaseUrl()` (or validated env URL) consistently.
- **Suggested regression test / QA:** Add test asserting metadata canonical host equals `PUBLIC_BASE_URL` host in production config.

### A-003
- **Severity:** Medium
- **Area:** Admin auth / CSRF hardening
- **Files:** `middleware.ts`, `src/lib/admin/api-auth.ts`, `src/app/api/admin/**`
- **What is wrong:** Admin API authorization checks only session cookie validity; no explicit CSRF token or strict Origin/Referer validation for state-changing endpoints.
- **Why it matters:** `SameSite=Lax` reduces risk but does not provide explicit anti-CSRF guarantees for all browser/request edge cases.
- **Suggested fix:** Add CSRF token (double-submit or synchronizer token) or at minimum enforce trusted `Origin` for non-GET admin API calls.
- **Suggested regression test / QA:** Security test suite that submits cross-origin style requests with valid cookie but invalid origin and expects 403.

### A-004
- **Severity:** Medium
- **Area:** Rate-limiting reliability
- **Files:** `src/lib/rate-limit.ts`, `src/lib/admin/login-rate-limit.ts`
- **What is wrong:** Public and admin rate limiting are in-memory maps only.
- **Why it matters:** Multi-instance/serverless deployments can bypass limits per instance; restarts reset counters.
- **Suggested fix:** Move counters to shared storage (Redis/Upstash/DB with TTL).
- **Suggested regression test / QA:** **Needs verification** in preview/prod with multi-instance traffic simulation.

### A-005
- **Severity:** Medium
- **Area:** File upload / abuse resistance
- **Files:** `src/app/api/orders/route.ts`, `src/app/api/leads/route.ts`
- **What is wrong:** Multipart flows convert uploaded files to memory buffers (`arrayBuffer` → `Buffer`) without aggregate request limits at route level.
- **Why it matters:** Large/many uploads can increase memory pressure and degrade API stability.
- **Suggested fix:** Add strict per-file and total-size limits for all multipart entrypoints; reject oversize before buffering whole payloads.
- **Suggested regression test / QA:** Add tests for oversized multipart submissions returning 413/400 and monitor memory during load test.

### A-006
- **Severity:** Medium
- **Area:** Webhook/payment integrity
- **Files:** `src/app/api/payments/webhook/route.ts`
- **What is wrong:** For `paid` status, webhook stores `paidAmount` from payload when provided, otherwise computed amount.
- **Why it matters:** Even signed webhooks are safer if persisted amount is deterministic from internal order data (unless gateway amount is independently validated and required).
- **Suggested fix:** Persist internal computed amount (or add strict gateway amount reconciliation rules and mismatch handling).
- **Suggested regression test / QA:** Test signed webhook with mismatched `paidAmount`; ensure stored amount and state follow policy.

### A-007
- **Severity:** Medium
- **Area:** Logging consistency / observability
- **Files:** `src/app/api/reviews/route.ts`, `src/app/api/admin/media/route.ts`, `src/lib/notifications/notifyNewOrder.ts`, `src/lib/baget/sheetsCatalog.ts`
- **What is wrong:** Mixed logging style (`console.error` and structured logger) across sensitive routes.
- **Why it matters:** Incident triage and centralized log parsing become inconsistent.
- **Suggested fix:** Standardize on `src/lib/logger.ts` with event keys and metadata.
- **Suggested regression test / QA:** Lint rule or code-search check blocking raw `console.*` in server routes/libs.

### A-008
- **Severity:** Low
- **Area:** Public diagnostics exposure
- **Files:** `src/app/api/baget/catalog-debug/route.ts`
- **What is wrong:** Endpoint is hidden in production but still available in non-production and exposes sheet IDs, tab names, parse errors, and sample items.
- **Why it matters:** Preview links can leak internal integration details.
- **Suggested fix:** Gate behind admin auth or temporary debug token even in non-production previews.
- **Suggested regression test / QA:** Verify preview endpoint requires auth/token.

### A-009
- **Severity:** Medium
- **Area:** UX / localization consistency (RU)
- **Files:** `src/app/(public)/order/[number]/page.tsx`, `src/app/api/orders/[number]/route.ts`, `src/app/api/payments/create/route.ts`, `src/app/api/payments/mock/complete/route.ts`
- **What is wrong:** Mixed EN/RU API and UI messages (`Forbidden`, `Order not found`, payment status `unpaid`) appear in RU customer flow.
- **Why it matters:** Owner-facing production UX becomes inconsistent and less understandable for Russian-speaking users.
- **Suggested fix:** Centralize localized user-safe message catalog; keep internal logs in technical English if needed.
- **Suggested regression test / QA:** Manual RU flow check: place order → open status page → payment start/failure states all fully localized.

### A-010
- **Severity:** Medium
- **Area:** Deprecated/parallel moderation path
- **Files:** `src/app/api/reviews/[id]/moderate/route.ts`, `src/app/api/admin/reviews/[id]/route.ts`, `.env.example`
- **What is wrong:** Two moderation mechanisms coexist: admin cookie-protected API and separate token-header moderation endpoint.
- **Why it matters:** Duplicate auth surfaces create maintenance and security drift risk.
- **Suggested fix:** Consolidate to admin-auth API only (or clearly mark one as legacy and disable it by default).
- **Suggested regression test / QA:** Ensure review moderation works only through one documented endpoint.

### A-011
- **Severity:** Medium
- **Area:** API design / dead-logic risk
- **Files:** `src/app/api/lead/route.ts`, `src/app/api/leads/route.ts`
- **What is wrong:** Two similarly named endpoints overlap in purpose but with different behavior (one mostly validation echo, one real notification pipeline).
- **Why it matters:** Integrations can call wrong endpoint; future changes likely diverge.
- **Suggested fix:** Define one canonical lead endpoint and deprecate/remove the other, or document strict ownership/use-cases.
- **Suggested regression test / QA:** API contract test verifying front-end points only to canonical route.

### A-012
- **Severity:** Low
- **Area:** Data privacy minimization
- **Files:** `src/app/api/orders/[number]/route.ts`
- **What is wrong:** Authorized order response returns full customer PII and quote payload by default.
- **Why it matters:** Even with token protection, least-privilege response modeling reduces accidental exposure and client-side leakage.
- **Suggested fix:** Split response modes (customer-safe subset vs full admin detail) or redact unnecessary fields for customer view.
- **Suggested regression test / QA:** Snapshot test for customer response schema excluding non-required fields.

### A-013
- **Severity:** Medium
- **Area:** Deployment/runtime reliability
- **Files:** `src/lib/env.ts`, `src/lib/pricing/loadPricingConfigWithFallback.ts`, `src/lib/db/prisma.ts`
- **What is wrong:** App is designed to run with `ENABLE_DATABASE=false` and fallback configs; build output shows many fallback warnings.
- **Why it matters:** Silent fallback can hide stale prices/config in production unless actively monitored.
- **Suggested fix:** Add hard fail or prominent health alarms for production when fallback mode is active unexpectedly.
- **Suggested regression test / QA:** **Needs verification** on deployed environment: admin health page should clearly surface live/fallback state and owner notification.

### A-014
- **Severity:** Low
- **Area:** Docs/config mismatch
- **Files:** `README.md`, `docs/ENV.md`, `.env.example`
- **What is wrong:** README is minimal and does not document runbook/check commands; docs mention env expectations but not a practical owner checklist for production hardening decisions (especially around fallback mode and moderation legacy route).
- **Why it matters:** Non-technical owner may apply partial configuration and miss hidden risk modes.
- **Suggested fix:** Add “Owner deployment checklist” and “Security baseline checklist” docs linked from README.
- **Suggested regression test / QA:** Manual doc QA: fresh operator can configure preview/prod without additional tribal knowledge.

### A-015
- **Severity:** Medium
- **Area:** Tests coverage gaps
- **Files:** `src/app/api/admin/**`, `src/app/(public)/**`, `src/app/api/orders/route.ts`, `src/app/api/leads/route.ts`
- **What is wrong:** Unit tests exist for many security/price flows, but limited end-to-end coverage for critical user journey (order create → pay mock → status page → PDF download; admin content updates).
- **Why it matters:** Regression risk remains high for integration edges and owner-visible flows.
- **Suggested fix:** Add Playwright/Vitest integration suites around complete customer and admin workflows.
- **Suggested regression test / QA:** Full e2e happy path and key failure path tests in CI.

---

## 4) Public API risk overview

- Customer-sensitive endpoints (`/api/orders/[number]`, `/api/orders/[number]/pdf`, `/api/payments/create`, `/api/payments/mock/complete`) now enforce signed token or admin auth.
- Anti-spam guard is applied broadly for public forms, but relies on in-memory rate limits.
- Legacy moderation route introduces extra token-auth surface and should be simplified.

---

## 5) Admin auth & CSRF risk overview

- Session signing and cookie flags are generally implemented correctly.
- Login throttling exists (in-memory, IP-based).
- Explicit CSRF defense layer for admin mutations is still missing (recommend origin+token hardening).

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

- SEO: robots/sitemap fixed to env base URL, but metadata canonical base still hardcoded to example.com.
- Mobile/adaptive: no obvious catastrophic layout break found from static read; **Needs verification** on real devices for calculators/order pages with long text and validation states.
- UX bugs visible from code:
  - mixed-language status/errors in customer order/payment flow,
  - possible endpoint confusion from `/api/lead` vs `/api/leads` split.

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

