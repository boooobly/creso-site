# Baguette pricing admin system

## 1) Source of truth boundary
- **Google Sheets only**: baguette catalog/base frame data (`availability`, `article`/SKU, title, images, `price_per_meter`).
- **Admin DB only**: every other value used by baguette calculation/order flow (materials, print rates, thresholds, hangers, stretcher values, auto-addition rules).

## 2) Where baguette pricing lives
- Data is stored in `PricingEntry` with category `baguette-extra-pricing`.
- Required key set + safe defaults are defined in `data/baguette-extras-pricing-defaults.json`.
- Loader/parser/completeness logic is centralized in `src/lib/baget/baguetteExtrasPricing.ts`.

## 3) Runtime behavior
1. `getBaguetteExtrasPricingConfig()` loads active admin keys.
2. Keys are validated by per-key schemas.
3. If a key is missing or invalid, fallback default is applied.
4. Any fallback usage is logged on server (`console.warn`) with key + reason.
5. `bagetQuote()` uses only:
   - base baguette frame price from Google Sheets,
   - non-frame extras from this admin pricing config.

## 4) Required keys / completeness check
- `BAGUETTE_PRICING_REQUIRED_KEYS` defines the required baguette pricing keys.
- `checkBaguettePricingCompleteness()` returns:
  - `isComplete`,
  - `missingRequiredKeys`,
  - `unknownKeys`.
- This check is used by admin/runtime to make missing config visible during maintenance.

## 5) Admin UX and safety
- Baguette pricing is grouped into business sections (materials, backing/support, mounting, passepartout, stretcher, print, other).
- Edit validation uses key-specific schemas with range limits and friendly error messages.
- Invalid values are rejected and cannot silently break calculations.
- Admin page shows:
  - completeness status,
  - fallback usage warning,
  - missing keys warning,
  - unknown key warning.

## 6) History logging
- Every edit writes a read-only `PricingEntryHistory` record with old/new value, key identity and optional note.
- Admin page shows recent changes in a human-readable list (what key changed, when, before/after, note).

## 7) How to extend safely
When adding a new baguette pricing parameter:
1. Add key/default metadata to `data/baguette-extras-pricing-defaults.json`.
2. Add schema mapping in `BAGUETTE_KEY_SCHEMAS`.
3. Add the key into `buildConfig()` mapping and admin group section.
4. Verify the key appears in completeness check and admin warnings.

This prevents reintroducing hardcoded constants or hidden secondary sources of truth.
