# Print / General Print pricing migration

## What changed
- Print calculator pricing is now managed through admin `PricingEntry` records in category `print-pricing`.
- Runtime quote path (`/api/quotes/print`) loads pricing from DB via `getPrintPricingConfig()`.
- Existing formula behavior is preserved by seeding/backfilling previous hardcoded values as defaults.
- Admin pricing screen now includes a dedicated **"Общая печать — параметры калькулятора"** section with grouped business-friendly fields.
- Every update writes a `PricingEntryHistory` record (`oldValue`, `newValue`, timestamp, optional note).

## Pricing input audit (Print / General Print only)

| Pricing input | File path | Previous source of truth | Unit / type | Effect on total | Admin key/group |
|---|---|---|---|---|---|
| Minimum quantity | `src/lib/pricing-config/print.ts` | Hardcoded `PRINT_PRICING_CONFIG.minimumQuantity` | number, `шт` | Rejects calculation when quantity below threshold | `global.minimum_quantity` / Общие правила |
| Base per 100: cards | `src/lib/pricing-config/print.ts` | Hardcoded `basePer100.cards` | number, `₽/100 шт` | Base amount in formula `(qty/100)*base*...` | `base_per_100.cards` / Базовые ставки |
| Base per 100: flyers | `src/lib/pricing-config/print.ts` | Hardcoded `basePer100.flyers` | number, `₽/100 шт` | Same base component for flyer product type | `base_per_100.flyers` / Базовые ставки |
| Density coefficient 300 | `src/lib/pricing-config/print.ts` | Hardcoded `densityCoefficient[300]` | number, coefficient | Multiplies total for 300 gsm | `density_coefficient.300` / Коэффициенты плотности |
| Density coefficient 350 | `src/lib/pricing-config/print.ts` | Hardcoded `densityCoefficient[350]` | number, coefficient | Multiplies total for 350 gsm | `density_coefficient.350` / Коэффициенты плотности |
| Density coefficient 400 | `src/lib/pricing-config/print.ts` | Hardcoded `densityCoefficient[400]` | number, coefficient | Multiplies total for 400 gsm | `density_coefficient.400` / Коэффициенты плотности |
| Side coefficient: single | `src/lib/pricing-config/print.ts` | Hardcoded `sideCoefficient.single` | number, coefficient | Multiplies total for single-sided print | `side_coefficient.single` / Коэффициенты сторон печати |
| Side coefficient: double | `src/lib/pricing-config/print.ts` | Hardcoded `sideCoefficient.double` | number, coefficient | Multiplies total for double-sided print | `side_coefficient.double` / Коэффициенты сторон печати |
| Lamination coefficient: false | `src/lib/pricing-config/print.ts` | Hardcoded `laminationCoefficient.false` | number, coefficient | Multiplies total when lamination disabled | `lamination_coefficient.false` / Коэффициенты ламинации |
| Lamination coefficient: true | `src/lib/pricing-config/print.ts` | Hardcoded `laminationCoefficient.true` | number, coefficient | Multiplies total when lamination enabled | `lamination_coefficient.true` / Коэффициенты ламинации |
| Size coefficient: cards 90x50 | `src/lib/pricing-config/print.ts` | Hardcoded `sizeCoefficient.cards['90x50']` | number, coefficient | Multiplies total by chosen cards size | `size_coefficient.cards_90x50` / Коэффициенты форматов |
| Size coefficient: cards 85x55 | `src/lib/pricing-config/print.ts` | Hardcoded `sizeCoefficient.cards['85x55']` | number, coefficient | Same, alternative card size | `size_coefficient.cards_85x55` / Коэффициенты форматов |
| Size coefficient: flyers A6 | `src/lib/pricing-config/print.ts` | Hardcoded `sizeCoefficient.flyers.A6` | number, coefficient | Multiplies total by chosen flyer size | `size_coefficient.flyers_A6` / Коэффициенты форматов |
| Size coefficient: flyers A5 | `src/lib/pricing-config/print.ts` | Hardcoded `sizeCoefficient.flyers.A5` | number, coefficient | Same, alternative flyer size | `size_coefficient.flyers_A5` / Коэффициенты форматов |

## Runtime and fallback behavior
- Required key list is generated from `data/print-pricing-defaults.json`.
- On startup/read, `ensurePrintPricingEntries()` upserts missing keys so pricing works immediately after deploy.
- If key is missing or malformed, runtime uses fallback default and records diagnostic in `fallbackUsedKeys`.
- Fallback usage is visible:
  - `console.warn` in runtime loader,
  - highlighted messages in admin pricing UI.

## Validation and safety
- All editable keys are validated by key-specific Zod schemas before save.
- Invalid values are rejected with a human-readable admin error message.
- Bounds enforce safe ranges (non-negative/positive, coefficient and integer limits) to avoid broken calculations.

## History logging
- `updatePrintPricingEntry()` updates value in a transaction and writes `PricingEntryHistory` with:
  - pricing entry reference (`pricingEntryId`, category/subcategory/key),
  - previous value,
  - new value,
  - timestamp (`createdAt`),
  - optional change note.

## Extending Print pricing later
1. Add new key metadata to `data/print-pricing-defaults.json`.
2. Add key validation in `PRINT_KEY_SCHEMAS`.
3. Map key in `buildConfig()`.
4. Place key in an admin `groupedSections` block for office editing.
5. Update tests for at least one representative scenario.

This keeps pricing centralized in admin data and avoids reintroducing hardcoded formula constants.
