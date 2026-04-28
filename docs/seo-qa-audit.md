# SEO QA Audit (Next.js 15 App Router)

Date: 2026-04-28
Project: CredoMir (`/workspace/creso-site`)

## Scope checked

- `src/app/sitemap.ts` against real public routes in `src/app/(public)`.
- `src/app/robots.ts` route access rules and sitemap location.
- Public page metadata usage via `buildPublicPageMetadata()` in service/content pages.
- SEO helper integrity in `src/lib/seo.ts` (canonical, icons, JSON-LD builders).
- JSON-LD usage points (Organization, LocalBusiness, WebSite, Service, BreadcrumbList, FAQPage).
- Yandex Metrica integration boundaries and event semantics.
- Favicon asset file presence and metadata path references.
- Validation commands: `npm run lint`, `npm run test`, `npm run build`.

## Findings

### 1) Sitemap vs public routes

- Sitemap currently contains only public marketing/service pages and excludes admin/API/payment/order routes.
- Important service routes are present (`/services`, `/milling`, `/wide-format-printing`, `/plotter-cutting`, `/heat-transfer`, `/services/mugs`, `/services/stands`, `/outdoor-advertising`, etc.).
- Public route `/blog` exists in app routes but is not listed in sitemap.
  - This is not a runtime break, but it is an indexation coverage gap if `/blog` is intended to be indexable.

### 2) Robots

- `robots.ts` allows public crawling and disallows private paths (`/admin`, `/api`, `/pay/mock`, `/order/`).
- Sitemap URL points to `${base}/sitemap.xml` and is structurally correct.
- No public service pages are blocked.

### 3) Metadata

- Public pages consistently use `buildPublicPageMetadata({ title, description, path })`.
- Canonical URL generation is stable and absolute through `getBaseUrl()` + path conversion.
- Default icons are present in metadata helper for both public-page metadata and default metadata.
- No clearly broken metadata shape found.

### 4) JSON-LD

- Organization, LocalBusiness and WebSite JSON-LD are injected in public layout.
- Service + BreadcrumbList JSON-LD is present on service pages.
- FAQPage JSON-LD is conditionally rendered only when valid Q/A pairs exist (`buildFaqPageJsonLd` returns `null` for empty/invalid data).
- Homepage FAQ JSON-LD uses `faqItems.slice(0, 5)`, matching visible FAQ slice rendered by `HomePageContent`.
- No invalid empty JSON-LD object emission found.
- No server page importing data from client component found in checked SEO flow.

### 5) Yandex Metrica

- `YandexMetrica` is rendered only in `src/app/(public)/layout.tsx`.
- Initial pageview is sent via inline `ym(..., 'hit', window.location.href)`.
- SPA route hits are sent via `trackHit(absoluteUrl)` where URL is converted to absolute (`new URL(..., window.location.origin).href`).
- Goal usage references existing keys from `YANDEX_GOALS`.
- No goal additions or behavior changes required.

### 6) Favicons

- Verified files exist:
  - `public/favicon.ico`
  - `public/icon-192.png`
  - `public/icon-512.png`
- Metadata references these exact paths in SEO helper icons config.

## What was fixed

- No application code changes were required.
- Added this audit report only: `docs/seo-qa-audit.md`.

## What was intentionally left unchanged

- No layout/UI/content/business/admin/API logic was modified.
- No analytics events/goals were added or changed.
- No font configuration changes were made.

## Validation

- `npm run lint` ✅ passed.
- `npm run test` ✅ passed (all test files passed).
- `npm run build` ⚠️ failed due to inability to fetch Google Fonts (`Onest`) from `fonts.gstatic.com` in environment; this was not changed per constraints.

## Recommendations (not implemented)

1. Decide whether `/blog` should be indexable. If yes, add it to `src/app/sitemap.ts`.
2. Optionally add a lightweight CI check that compares sitemap routes against known public route allowlist to prevent drift.
3. If build reliability is critical in isolated CI, consider self-hosting font files or a fallback strategy (separate task).
