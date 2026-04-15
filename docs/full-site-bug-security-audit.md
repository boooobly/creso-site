# Full-site bug and security audit

## Executive summary
The highest-risk issues are concentrated in **order and payment flows** and **public data exposure**. The current implementation allows unauthenticated access to full order details by order number (including customer PII), and the public payment initiation route can be triggered for any discovered order number. In parallel, the public mock payment page cannot successfully update payment state because webhook signing is required but not implemented client-side, so the visible payment UX is effectively broken in real use. Several API routes also have inconsistent anti-spam and validation hardening, and production SEO infrastructure still points to `example.com`.

## Critical findings

| ID | Severity | Area | File(s) | Problem | Why it matters | Suggested fix | Suggested test |
|---|---|---|---|---|---|---|---|
| F-001 | **Critical** | Orders / data privacy | `src/app/api/orders/[number]/route.ts`, `src/app/(public)/order/[number]/page.tsx` | Public `GET /api/orders/:number` returns full order details (name, phone, email, comment, payment fields) with no auth/token. | Any guessed/leaked order number exposes personal data and payment metadata. | Require signed token (same pattern as PDF), or require authenticated session for full payload; return minimal public-safe status only for customer portal. | Attempt GET with and without token; verify PII hidden without authorization. |
| F-002 | **Critical** | Payments / abuse | `src/app/api/payments/create/route.ts`, `src/app/(public)/order/[number]/page.tsx` | Public payment session creation accepts only `orderNumber` and has no ownership proof/auth. | If order numbers are discoverable, attacker can change payment state to pending/generate refs and disrupt operations. | Require signed order token or short-lived customer session token on payment creation. | Verify `/api/payments/create` rejects unsigned requests; accepts valid signed customer token only. |
| F-003 | **High** | Payment reliability / UX | `src/app/(public)/pay/mock/page.tsx`, `src/app/api/payments/webhook/route.ts` | Mock payment page posts webhook JSON without HMAC signature and with `paymentRef` field; webhook expects signature + `orderNumber`. | “Mark paid/failed” buttons always fail in normal user flow, creating false payment UX and support burden. | Create dedicated internal mock callback API (no public webhook signature requirement), or make page call backend action that signs server-side and sends correct payload schema. | End-to-end test: create order → pay mock → mark paid → order status becomes paid. |
| F-004 | **High** | PDF access UX | `src/app/(public)/order/[number]/page.tsx`, `src/app/api/orders/[number]/pdf/route.ts` | Order page links to `/api/orders/:number/pdf` **without** token; PDF route requires signed token or admin bearer. | Customers likely see 403 when clicking “Download PDF”, breaking core post-order UX. | Add tokenized URL to order page data contract or backend-issued short-lived PDF URL endpoint. | UI test: order page “Download PDF” opens PDF successfully for valid customer context. |
| F-005 | **High** | Auth hardening | `src/app/admin/actions.ts`, `src/lib/admin-auth.ts` | Admin login has no brute-force/rate-limit/lockout controls. | Password stuffing risk on `/admin/login` despite signed sessions. | Add IP + username attempt throttling and temporary lockout; log suspicious attempts. | Simulate repeated failed logins from same IP; verify cooldown and audit log entry. |
| F-006 | **High** | Public diagnostics exposure | `src/app/api/baget/catalog-debug/route.ts` | Public debug endpoint reveals data source status, sheet metadata and parse errors. | Leaks internals useful for reconnaissance and can expose operational issues publicly. | Remove in production or guard with admin auth/feature flag. | Verify endpoint returns 404/401 in production mode. |
| F-007 | **High** | SEO / discoverability | `src/app/sitemap.ts`, `src/app/robots.txt` | Sitemap and robots hardcode `https://example.com`. | Search engines index incorrect domain; real site pages can be under-indexed. | Build URL from validated env base URL and fail-safe on misconfiguration. | Verify generated `/sitemap.xml` and `/robots.txt` contain production domain. |


## PR 1 resolution status (this PR)

- **F-001 — Resolved:** `GET /api/orders/:number` now requires a valid signed order token or admin bearer auth.
- **F-002 — Resolved:** `/api/payments/create` now requires a valid signed order token or admin bearer auth.
- **F-003 — Resolved:** mock payment now uses a dedicated safe endpoint (`/api/payments/mock/complete`) that validates order+paymentRef and updates status without weakening real webhook signature checks.
- **F-004 — Resolved:** order page now uses tokenized order context and a server-issued tokenized PDF URL.
- **F-005 — Resolved:** admin login now has best-effort in-memory IP-based throttling (failed-attempt window + temporary lockout) with reset on successful login and structured warning logs.
- **F-006 — Resolved:** baget catalog debug endpoint now returns 404 in production.
- **F-007 — Resolved:** sitemap and robots now use env-driven base URL (`PUBLIC_BASE_URL`) via `getBaseUrl()`.

## PR 2 resolution status (this PR)

- **Public request hardening — In progress:** `enforcePublicRequestGuard` is now applied on public customer-facing submission routes that accept lead/order/request data, while preserving route-specific validation and delivery logic.
- **Covered routes:**
  - `/api/reviews`
  - `/api/plotter`
  - `/api/heat-transfer`
  - `/api/lead`
  - `/api/leads`
  - `/api/outdoor`
  - `/api/wide-format-order`
  - `/api/requests/mugs`
  - `/api/requests/tshirts`
  - `/api/requests/business-cards`
  - `/api/requests/milling`
- **Intentionally left unchanged:**
  - `/api/orders` — currently contains order creation + order access-token flow integration; left unchanged in this PR per scope constraint to avoid touching order/payment token logic.
  - `/api/payments/create`, `/api/payments/webhook`, `/api/payments/mock/complete` — payment/token/webhook routes are intentionally excluded from this anti-spam hardening pass.
  - `/api/quotes/print`, `/api/quotes/wide-format`, `/api/quotes/heat-transfer` — calculator quote endpoints do not accept contact/order/request submission data and remain out of scope for customer form anti-spam hardening.
- **Reviews rate-limit gap — Resolved:** `/api/reviews` uses standardized anti-spam guard with explicit per-IP request throttling.


## PR 3 resolution status (this PR)

- **File uploads and media hardening — Partially resolved:** centralized image validation now verifies MIME + extension and magic bytes for JPG/PNG/WEBP/GIF while preserving existing size limits.
- **Admin upload folder allowlist — Resolved:** `/api/admin/upload-image` now accepts only predefined folders (`site`, `portfolio`, `orders`, `temp`) and rejects unknown folders with a safe Russian 400 error.
- **SVG upload policy — Resolved:** SVG uploads are now rejected in hardened upload flows because the project does not implement SVG sanitization.
- **Filename/path safety — Resolved:** upload filename normalization now strips control/path characters, and customer upload blob paths no longer include user-provided raw filenames.
- **Customer blob privacy — Partially resolved (documented limitation):** customer image blobs remain `public` to keep existing admin/order link behavior working without redesign; risk is reduced via unguessable random path IDs and minimizing URL exposure to required admin/order contexts.
- **Regression coverage — Resolved for this scope:** added tests for valid/invalid image signatures, extension/MIME mismatch, admin folder allowlist rejection, and safe customer blob path generation.

## PR 5 resolution status (this PR)

- **Calculator/pricing drift risk — Partially addressed:** added regression tests that cross-check quote endpoints, order endpoint server-side recomputation, and shared calculation modules for wide format, heat transfer, plotter cutting, print/business cards, and baguette fallback configs.
- **Confirmed business-rule fix included:** `/api/wide-format-order` now rejects oversized non-banner dimensions (`max_width_exceeded`) instead of silently allowing a zeroed calculation path.
- **Scope clarification:** this pass improves automated reliability coverage and catches drift regressions; it is **not** a full business-pricing audit of every commercial rule/value.

## PR 4 resolution status (this PR)

- **Admin health visibility — Resolved:** added a dedicated admin health page (`/admin/health`) with owner-friendly status cards for DB, `PUBLIC_BASE_URL`, SMTP/email, Telegram, Vercel Blob, admin auth safety, pricing DB-vs-fallback source, and baguette Google Sheets configuration presence.
- **Scope note:** this is a **visibility layer** for configuration risks inside admin; it is **not** a full monitoring/alerting system and does not replace external uptime/error monitoring.

## Detailed findings by area

### 1. Auth and admin

1. **No admin login throttling** (**High**): login action compares plain password and creates session, but lacks attempt limits, cooldowns or CAPTCHA fallback. (`src/app/admin/actions.ts`)
2. **Single-factor static admin password** (**Medium**): password-only auth may be acceptable for micro-admin, but production risk is elevated without MFA/IP allowlist. (`src/lib/admin-auth.ts`)
3. **Session cookie security is mostly good** (**Low / good practice note**): `httpOnly`, `sameSite=lax`, `secure` in production are present; TTL is configurable and signed payload includes expiry. (`src/lib/admin-auth.ts`)
4. **Needs verification: CSRF on admin API mutations** (**Medium, Needs verification**): admin APIs rely on cookie auth and do not require explicit CSRF token. With `sameSite=lax`, cross-site POST is reduced but not fully future-proof for same-site/subdomain attack models. (`middleware.ts`, `src/lib/admin/api-auth.ts`, `src/app/api/admin/**`)

### 2. Public APIs and forms

1. **Order details API leaks PII** (**Critical**): full customer record exposed without auth. (`src/app/api/orders/[number]/route.ts`)
2. **Inconsistent anti-spam hardening across routes** (**Medium**): some routes enforce user-agent/rate-limit/honeypot, others do not (e.g., `/api/reviews`, `/api/plotter`, `/api/heat-transfer` use weaker or no anti-spam controls). (`src/app/api/**/*.ts`)
3. **Reviews submission lacks explicit rate-limit** (**Medium**): can be abused for DB growth/spam queue pressure. (`src/app/api/reviews/route.ts`)
4. **Public debug endpoint available** (**High**): operational diagnostics exposed. (`src/app/api/baget/catalog-debug/route.ts`)

### 3. Orders, PDFs, payments

1. **Public payment creation without ownership proof** (**Critical**): relies on order number only. (`src/app/api/payments/create/route.ts`)
2. **Webhook mismatch with UI flow** (**High**): mock page sends wrong payload and lacks required signature; buttons likely never work. (`src/app/(public)/pay/mock/page.tsx`, `src/app/api/payments/webhook/route.ts`)
3. **Order page PDF link currently unusable for customer** (**High**): missing token in link. (`src/app/(public)/order/[number]/page.tsx`, `src/app/api/orders/[number]/pdf/route.ts`)
4. **Payment webhook accepts client-provided `paidAmount`** (**Medium**): signed source mitigates risk, but safer to always use computed amount unless trusted gateway amount is separately verified. (`src/app/api/payments/webhook/route.ts`)
5. **Needs verification: idempotency/replay handling for webhook** (**Medium, Needs verification**): no explicit replay nonce/timestamp check observed; repeated signed events could rewrite state. (`src/app/api/payments/webhook/route.ts`)

### 4. File uploads and media

1. **File validation trusts MIME + extension only** (**Medium**): no magic-byte/content sniffing, so renamed or malformed files may pass. (`src/lib/file-validation.ts`)
2. **Admin upload folder input not constrained to allowlist** (**Low/Medium**): path is sanitized by naming strategy but folder string is user-controlled; should be allowlisted (`site`, `portfolio`, etc.). (`src/app/api/admin/upload-image/route.ts`)
3. **Public blob storage for customer uploads** (**Medium, business decision risk, partially mitigated**): baget customer images are still uploaded as `public` for compatibility, but blob paths now use unguessable random IDs and no raw customer filename segments. (`src/lib/orders/storeCustomerImage.ts`)

### 5. Calculators and pricing

1. **Good server-side recalculation in several flows** (**Low / positive**): `plotter`, `heat-transfer`, `wide-format-order` recalculate pricing on server instead of trusting client totals.
2. **Needs verification: business rule parity between quote and order endpoints** (**Medium, Needs verification**): multiple calculators + pricing loaders increase drift risk; no cross-flow integration tests confirm quote equals order summary for same inputs. (`src/app/api/quotes/**`, `src/app/api/*order*`, `src/lib/calculations/**`)
3. **Fallback-to-default pricing can mask data/admin outages** (**Medium reliability risk**): if DB disabled/unavailable, app silently uses fallback defaults (warn logs only), which may diverge from intended live pricing. (`src/lib/pricing/loadPricingConfigWithFallback.ts`, pricing loader libs)

### 6. Database and env

1. **Strong env validation exists** (**Low / positive**): server env schema checks many required combinations and DB URL format. (`src/lib/env.ts`)
2. **Operational risk from `ENABLE_DATABASE=false` mode** (**Medium reliability risk, visibility improved**): build/runtime can proceed with fallback behavior, but admin now has a dedicated health panel that clearly surfaces DB/pricing fallback risks to the owner. (`src/lib/db/prisma.ts`, pricing loaders, `src/lib/admin/system-health.ts`, `src/app/admin/(panel)/health/page.tsx`)
3. **Needs verification: graceful degradation paths for DB-disabled state in admin pages** (**Medium, Needs verification**): API/runtime errors may surface as generic 500 for owner.

### 7. Content/admin CMS

1. **Admin APIs are consistently behind auth middleware and explicit auth checks** (**Low / positive**): good defense-in-depth. (`middleware.ts`, `src/lib/admin/api-auth.ts`, `src/app/api/admin/**`)
2. **Validation quality is generally strong in admin schema definitions** (**Low / positive**): strict Zod schemas for content/pricing/media reduce malformed writes. (`src/lib/admin/validation.ts`)
3. **Needs verification: authorization scope model** (**Low/Medium, Needs verification**): single admin role only; no granular permissions for future multi-user admin operation.

### 8. Frontend UX and accessibility

1. **Order portal customer-facing text is English-heavy while site is Russian** (**Low UX consistency**): order and pay pages use mixed-language labels/errors. (`src/app/(public)/order/[number]/page.tsx`, `src/app/(public)/pay/mock/page.tsx`)
2. **Order page error handling is generic and not actionable** (**Medium UX**): key failures (403 PDF, webhook fail) do not guide customer next step.
3. **Potentially confusing success states in mock payment page** (**High UX reliability**): user can click actions that fail due to signature mismatch without clear technical reason.

### 9. SEO/routing

1. **Hardcoded `example.com` in sitemap and robots** (**High**): breaks canonical indexing. (`src/app/sitemap.ts`, `src/app/robots.txt`)
2. **Needs verification: metadata completeness across all service pages** (**Medium, Needs verification**): top-level metadata exists, but per-page canonical/OG specialization should be checked for marketing pages.

### 10. Tests and observability

1. **Critical flow tests are missing** (**High gap**): no end-to-end tests for order creation → payment → PDF access → admin update.
2. **Security regression tests missing** (**High gap**): no automated tests proving unauthorized order/PDF/payment requests are blocked.
3. **Logging is present but mixed (`console.*` + structured logger)** (**Medium observability**): normalize to structured logs for incident triage. (`src/app/api/**`, `src/lib/logger.ts`)

### Checks run for this audit

- `npm run lint` → **Could not complete automatically**: command entered interactive Next.js ESLint setup prompt (no preconfigured lint profile detected in this environment).
- `npm run test` → **Passed** (40 tests).
- `npm run build` → **Passed** (Next.js production build succeeded), with warnings about outdated browser data and fallback pricing/database-disabled warnings.

## Quick win fix plan

### PR 1: Critical security/data leaks
- Lock down `GET /api/orders/:number` to tokenized access and redact PII in public responses.
- Require ownership proof token for `/api/payments/create`.
- Disable or protect `/api/baget/catalog-debug` in production.

### PR 2: Public forms and spam hardening
- Standardize anti-spam middleware/helpers across **all** public submission routes.
- Add route-level rate limits for reviews and calculator/form endpoints lacking throttling.
- Add centralized validation + normalized error responses for public forms.

### PR 3: Order/payment/PDF reliability
- Fix pay mock flow contract (signed server-side callback + correct schema).
- Add customer-safe PDF retrieval flow (tokenized link from server).
- Add webhook idempotency and replay protection metadata.

### PR 4: Calculator correctness and tests
- Add integration tests that compare quote API outputs with order API recomputation for same payloads.
- Add drift-detection tests for pricing fallback vs DB-configured values.
- Add min/max constraint tests for edge dimensions/quantities.

### PR 5: Admin UX and content/pricing safety
- Add login attempt throttling and owner-facing lockout messaging.
- Add explicit admin health indicators (DB enabled, pricing fallback active, notification channels active). **Done in PR 4 as owner-facing visibility.**
- Improve admin error surfacing for env/db misconfiguration.

### PR 6: Frontend/mobile/SEO polish
- Replace hardcoded `example.com` with env-driven canonical base URL for sitemap/robots.
- Harmonize RU localization on order/payment status pages.
- Improve customer-facing failure messages and next-step guidance.

## Manual QA checklist

Use this on deployed Vercel preview as a non-technical owner checklist:

1. **Public pages open correctly**
   - Open Home, Services, Baget, Wide-format, Plotter, Heat-transfer, Milling, Print, Outdoor, Contacts, Portfolio.
   - Confirm no page shows obvious server errors.

2. **Calculator sanity checks**
   - For each calculator, enter small/medium/large values.
   - Confirm price changes logically and no “NaN”, negative, or zero anomalies for valid inputs.

3. **Order flow**
   - Place a baget order with valid phone/email.
   - Open resulting order page link.
   - Confirm order number, totals, and status render correctly.

4. **PDF access**
   - Click “Download PDF” from order page.
   - Confirm PDF opens (this currently appears at risk and needs fix verification).

5. **Payment flow**
   - Start payment from order page.
   - On mock payment page, click paid/failed once each in separate tests.
   - Return to order page and verify payment status updates.

6. **Public forms and spam controls**
   - Submit each public form once with valid data (mugs, milling, wide format, leads, etc.).
   - Attempt one obviously invalid submission (bad phone/email).
   - Ensure clear validation message appears.

7. **Admin access**
   - Confirm `/admin` redirects to login when signed out.
   - Log in and verify dashboard loads, no blank blocks.
   - Update one order status and one content field; verify saved changes persist.

8. **Media upload**
   - Upload a valid image in admin media.
   - Try invalid file type and oversize file; verify rejection message.

9. **Reviews moderation**
   - Submit a public review.
   - Approve/reject from admin panel.
   - Confirm public reviews page reflects moderation state.

10. **SEO smoke checks**
   - Open `/sitemap.xml` and `/robots.txt`.
   - Confirm they contain the real production domain (currently likely incorrect).
