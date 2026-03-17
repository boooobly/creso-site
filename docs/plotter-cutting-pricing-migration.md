# Plotter Cutting pricing migration (admin-managed)

## Audit of pricing inputs

| Pricing input | File path (before) | Current source of truth (before) | Unit / type | Effect on totals | Admin key/group (after) |
|---|---|---|---|---|---|
| Base cut rate | `src/lib/pricing-config/plotterCutting.ts` | Hardcoded constant | number, ₽/м.п. | `cutLength * baseCutPricePerMeter * complexity` | `plotter-cutting-pricing.global.base_cut_price_per_meter` |
| Weeding rate | `src/lib/pricing-config/plotterCutting.ts` | Hardcoded constant | number, ₽/м.п. | Adds `cutLength * weedingPricePerMeter` when weeding enabled | `plotter-cutting-pricing.global.weeding_price_per_meter` |
| Mounting film rate | `src/lib/pricing-config/plotterCutting.ts` | Hardcoded constant | number, ₽/м² | Adds `area * mountingFilmPricePerSquareMeter` when mounting enabled | `plotter-cutting-pricing.global.mounting_film_price_per_square_meter` |
| Transfer setup fee | `src/lib/pricing-config/plotterCutting.ts` | Hardcoded constant | number, ₽ | Adds fixed `transferPrice` when transfer enabled | `plotter-cutting-pricing.global.transfer_price` |
| Urgent multiplier | `src/lib/pricing-config/plotterCutting.ts` | Hardcoded constant | number, multiplier | Multiplies subtotal when urgent enabled | `plotter-cutting-pricing.global.urgent_multiplier` |
| Minimum order total | `src/lib/pricing-config/plotterCutting.ts` | Hardcoded constant | number, ₽ | Floors total when calculated total is below minimum | `plotter-cutting-pricing.global.minimum_order_total` |

## What is now admin-managed

Plotter Cutting formula inputs now come from `PricingEntry` rows in category `plotter-cutting-pricing` with runtime resolution in `src/lib/plotter-cutting/plotterCuttingPricing.ts`.

- Entries are auto-seeded/upserted from `data/plotter-cutting-pricing-defaults.json`.
- Admin editing is available in `/admin/pricing` in section “Плоттерная резка — параметры калькулятора”.
- The public pricing rows in `/plotter-cutting` read values from `/api/pricing/plotter-cutting`.

## Validation and fallback behavior

- All keys are validated with strict numeric schemas.
- Invalid or missing active DB values fall back to defaults from `data/plotter-cutting-pricing-defaults.json`.
- Fallback usage is surfaced:
  - in server logs (`[plotter-cutting-pricing] ...`),
  - in admin section status badges (`fallbackUsedKeys`, `missingKeys`, `unknownKeys`).

## History logging

Every admin update creates a `PricingEntryHistory` row with:

- `pricingEntryId`,
- `category/subcategory/key`,
- `oldValue`,
- `newValue`,
- optional `note`,
- `createdAt` timestamp.

## Extension notes

To add new Plotter Cutting pricing inputs without returning to hardcoded values:

1. Add a new row in `data/plotter-cutting-pricing-defaults.json`.
2. Add validation schema entry in `PLOTTER_CUTTING_KEY_SCHEMAS`.
3. Map it in `buildConfig` and use it inside calculator logic.
4. Keep it in the same `plotter-cutting-pricing` category to retain admin UX + history.
