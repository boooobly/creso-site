# Calculator & pricing regression tests

## What is covered

This pass adds regression coverage for pricing consistency and safety checks across shared calculators and public API flows:

- **Wide format printing**
  - Quote endpoint matches shared `calculateWideFormatPricing` totals for the same payload.
  - Small valid dimensions still apply the minimum print price floor.
  - Higher quantity does not decrease total.
  - Oversized non-banner dimensions are now rejected by `/api/wide-format-order` using existing width business rules.
- **Heat transfer**
  - Quote endpoint matches shared `calculateHeatTransferPricing`.
  - Film minimum order floor is preserved.
  - `/api/heat-transfer` recalculates pricing server-side and ignores client-submitted totals.
- **Plotter cutting**
  - `/api/plotter` rejects invalid complexity values.
  - `/api/plotter` recalculates and uses server totals in outgoing notifications.
  - Shared plotter calculator no longer allows negative totals when complexity is invalid.
- **Print / business cards**
  - `/api/quotes/print` stable baseline case covered (cards).
  - Malformed quote payloads are rejected with `400`.
- **Baguette quote module**
  - `getBaguetteExtrasPricingConfigFromRows` fallback behavior is covered without live DB/Sheets.
  - `bagetQuote` remains calculable from fallback/default pricing config only.

## What is intentionally not covered yet

- Full E2E browser flow between UI calculators and submitted order forms.
- Google Sheets transport (`getBagetCatalogFromSheet`) and live external source correctness.
- Admin pricing UI editing workflow (this pass focuses on runtime pricing usage and fallback safety).
- Formal business audit of every single pricing coefficient and commercial rule.

## How to add a new calculator regression case

1. Pick the closest existing test file:
   - Route-level parity/safety: `src/app/api/calculator-pricing-regression.test.ts`
   - Pure formula checks: `src/lib/calculations/*.test.ts`
   - Pricing loader fallback behavior: `src/lib/**/**Pricing*.test.ts`
2. Build a payload that mirrors real route input (avoid synthetic shapes that production never sends).
3. Assert both:
   - **Safety** (no `NaN`, no negative totals for valid flow, proper rejection for invalid business constraints).
   - **Parity** (route result or recomputation equals shared calculation output).
4. If route doesn’t return a total directly, assert the recalculated value propagated to internal output (for example mail/notification payload) rather than trusting client-provided totals.
5. Keep mocks local and deterministic; prefer fallback/default pricing configs for expected values.

## Known external dependencies mocked in these tests

- SMTP transport (`nodemailer`) is mocked.
- Telegram/network notification side effects are not called as real external requests.
- Public request anti-spam guard is mocked in route regression tests to isolate pricing logic.
- Admin/runtime pricing loaders are mocked to return fallback/default in-memory configs.
- Baguette pricing fallback tests use in-memory rows and defaults (no live DB, no Google Sheets).
