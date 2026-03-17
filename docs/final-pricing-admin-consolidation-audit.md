# Final pricing admin consolidation audit

## Scope and method
This pass reviewed pricing logic and pricing-related constants across:
- runtime pricing services (`src/lib/*/*Pricing*.ts`),
- public calculators/pages (`src/components/*Pricing*.tsx`, `src/app/(public)/**`),
- static pricing config files (`src/lib/pricing-config/*.ts`, `data/*.json`).

Goal: confirm what is still outside admin-managed pricing and classify final migration candidates.

## Current status summary
- **Admin-managed and persisted in DB (`pricingEntry`)**:
  - Baguette extras pricing (non-catalog pricing rules).
  - Wide format pricing.
  - Plotter cutting pricing.
  - Heat transfer pricing.
  - Print pricing formula coefficients (new print pricing module).
- **Intentionally outside admin for now**:
  - Baguette catalog/base frame prices in Google Sheets.

## Remaining non-admin-managed pricing sources

| Source | Affected service/page | File path | What remains outside admin | Priority | Decision |
|---|---|---|---|---|---|
| Business cards calculator constants (`getUnitPrice`, lamination multiplier, quantity tiers) | Public print calculator (`/print`) | `src/lib/pricing-config/business-cards.ts`, `src/components/PrintPricingCalculator.tsx` | Live calculator still uses hardcoded tiers/prices and does not read admin print pricing config. | **Must migrate next** | Migrate calculator to `getPrintPricingConfig()` + `calculatePrintPricing()` so admin values are the runtime source. |
| Milling price table values embedded in frontend config | Milling page and milling order UX | `src/lib/pricing-config/milling.ts`, `src/app/(public)/milling/page.tsx`, `src/components/MillingMaterialsAccordion.tsx` | Material/thickness price rows are static strings in code. | Optional later | Keep static for now unless office explicitly needs frequent price edits. |
| Heat-transfer hero marketing copy with numeric price text | Heat transfer landing hero text fallback | `src/app/(public)/heat-transfer/page.tsx`, `src/components/heat-transfer/TshirtsLanding.tsx` | Text fallback contains explicit "250 ₽" marketing number; not calculation source-of-truth but can become stale. | Optional later | Move to admin content values only (already content-manageable) and avoid price literals in fallback text. |
| Baguette catalog/base frame prices in Google Sheets | Baguette catalog cards/base frame pricing | `src/lib/baget/sheetsCatalog.ts` (+ Sheets document) | Base baguette `price_per_meter` remains in Sheets by design. | Intentionally static integration | Keep as-is; this is an approved external source of truth. |

## Hidden dependencies / fallback behavior check
- Migrated admin pricing modules use a common pattern:
  - seed defaults into `pricingEntry` (`ensure*Entries`),
  - validate values with zod key schemas,
  - apply explicit fallback diagnostics (`missing` / `invalid`),
  - expose `missingKeys`, `unknownKeys`, `isComplete`, `fallbackUsedKeys` for admin UI.
- Defaults JSON files in `data/*-pricing-defaults.json` are now **fallback/seed sources**, not intended primary source after DB initialization.

## Consolidation pass changes (this task)
- Admin pricing page UX made more uniform across migrated service sections:
  - shared diagnostics presentation,
  - shared read-only history presentation,
  - numeric value inputs standardized (number/min/step),
  - quick navigation anchors for services,
  - clearer section naming and service separation in-page.

## Final migration candidates

### Must migrate next
1. **Public print calculator to admin pricing runtime**
   - Replace hardcoded business-card pricing table logic with admin-backed print pricing config.
   - Keep UI behavior simple; only data source changes.

### Optional later
1. Milling static table to admin-managed entries (only if office needs frequent edits).
2. Remove residual numeric literals from marketing fallback copy.

### Intentionally static / external
1. Baguette catalog/base frame prices via Google Sheets.

## Recommended next step after this pass
Execute one focused follow-up ticket: **"Public print calculator: switch from `business-cards.ts` constants to admin `printPricing` config"**. This is the only remaining practical gap preventing admin panel from being the single operational pricing control point for everyday office work.
