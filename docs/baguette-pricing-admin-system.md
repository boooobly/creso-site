# Baguette pricing admin system (phase 1)

## Source of truth split
- **Google Sheets remains source of truth** for baguette catalog/base frame data: availability, SKU/article, title, images, base baguette `price_per_meter`.
- **Database/admin is now source of truth** for all non-baguette extra pricing/config used by baguette calculator/order flow.

## DB storage
- Config entries are stored in `PricingEntry` under category `baguette-extra-pricing`.
- Defaults/backfill are defined in `data/baguette-extras-pricing-defaults.json` and seeded via `prisma/seed.js`.
- Entry types:
  - `number` for scalar values,
  - `json` for structured configs (material pair rates, auto-addition rules).

## Runtime resolution flow
1. `getBaguetteExtrasPricingConfig()` loads active entries from `PricingEntry` (`baguette-extra-pricing`).
2. Values are parsed/validated by schema (`zod`) in `src/lib/baget/baguetteExtrasPricing.ts`.
3. Missing/malformed values automatically fall back to known-safe defaults from `data/baguette-extras-pricing-defaults.json`.
4. `bagetQuote()` receives this config and uses it instead of hardcoded constants.

Fallbacks are explicit and centralized to make later hard-fail mode easy.

## Admin editing
- Admin pricing page includes a dedicated baguette extras config section.
- Office staff can edit every calculator input key used in this phase.
- Numeric entries use numeric input; structured entries use JSON textarea.
- Optional note field is supported on save.

## History logging
- Every update creates a `PricingEntryHistory` row with:
  - entry reference (`pricingEntryId`),
  - key identity (`category`, `subcategory`, `key`),
  - `oldValue`, `newValue`,
  - `createdAt`, optional `note`.
- Admin page shows recent change history summary.

## Extension points
- Add new calculator-config keys by appending to `data/baguette-extras-pricing-defaults.json`.
- Add parser support in `parseUpdatedValue` and `buildConfig` mappings.
- When ready, remove fallback behavior by enforcing strict completeness checks in loader.
