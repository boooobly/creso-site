# Heat Transfer / Apparel pricing migration (admin-managed)

## Audit of pricing inputs

| Pricing input | File path (before) | Current source of truth (before) | Unit / type | Effect on totals | Admin key/group (after) |
|---|---|---|---|---|---|
| Discount threshold | `src/lib/pricing-config/heatTransfer.ts` | Hardcoded constant | integer, шт | Enables discount when quantity >= threshold | `heat-transfer-pricing.global.discount_threshold` |
| Discount rate | `src/lib/pricing-config/heatTransfer.ts` | Hardcoded constant | number, fraction | `discount = subtotal * rate` when threshold reached | `heat-transfer-pricing.global.discount_rate` |
| Mug: white 330 single | `src/lib/pricing-config/heatTransfer.ts` | Hardcoded constant | number, ₽/шт | Unit price for white mug single-side print | `heat-transfer-pricing.mug_prices.white330_single` |
| Mug: white 330 wrap | `src/lib/pricing-config/heatTransfer.ts` | Hardcoded constant | number, ₽/шт | Unit price for white mug wrap print | `heat-transfer-pricing.mug_prices.white330_wrap` |
| Mug: chameleon single | `src/lib/pricing-config/heatTransfer.ts` | Hardcoded constant | number, ₽/шт | Unit price for chameleon mug single-side print | `heat-transfer-pricing.mug_prices.chameleon_single` |
| Mug: chameleon wrap | `src/lib/pricing-config/heatTransfer.ts` | Hardcoded constant | number, ₽/шт | Unit price for chameleon mug wrap print | `heat-transfer-pricing.mug_prices.chameleon_wrap` |
| T-shirt with own clothes | `src/lib/pricing-config/heatTransfer.ts` | Hardcoded constant | number, ₽/шт | Unit price when client provides clothes | `heat-transfer-pricing.tshirt.own_clothes` |
| T-shirt with company clothes | `src/lib/pricing-config/heatTransfer.ts` | Hardcoded constant | number, ₽/шт | Unit price when company provides clothes | `heat-transfer-pricing.tshirt.company_clothes` |
| Film price per meter | `src/lib/pricing-config/heatTransfer.ts` | Hardcoded constant | number, ₽/м | Base = length * unit price | `heat-transfer-pricing.film.unit_price_per_meter` |
| Film transfer setup fee | `src/lib/pricing-config/heatTransfer.ts` | Hardcoded constant | number, ₽ | Added when transfer option enabled | `heat-transfer-pricing.film.transfer_price` |
| Film urgent multiplier | `src/lib/pricing-config/heatTransfer.ts` | Hardcoded constant | number, multiplier | Multiplies film subtotal for urgent option | `heat-transfer-pricing.film.urgent_multiplier` |
| Film minimum order total | `src/lib/pricing-config/heatTransfer.ts` | Hardcoded constant | number, ₽ | Floors total for film orders | `heat-transfer-pricing.film.minimum_order_total` |

## What is now admin-managed

Heat Transfer calculator pricing now resolves from `PricingEntry` rows in category `heat-transfer-pricing` via runtime loader `src/lib/heat-transfer/heatTransferPricing.ts`.

- Defaults are seeded/upserted from `data/heat-transfer-pricing-defaults.json`.
- Admin editing is available in `/admin/pricing` section “Термоперенос — параметры калькулятора”.
- Quote endpoint (`/api/quotes/heat-transfer`) and order endpoint (`/api/heat-transfer`) both use DB-backed pricing config.

## Validation and fallback behavior

- Every key has explicit numeric validation.
- Missing/invalid active DB values fallback to defaults from `data/heat-transfer-pricing-defaults.json`.
- Fallback usage visibility:
  - warning logs with `[heat-transfer-pricing] ...`,
  - admin status UI through `fallbackUsedKeys`, `missingKeys`, `unknownKeys`.

## History logging

Each admin change writes `PricingEntryHistory` with:

- pricing entry reference (`pricingEntryId`),
- `category/subcategory/key`,
- `oldValue`,
- `newValue`,
- optional `note`,
- automatic timestamp (`createdAt`).

## Extension notes

To add a new Heat Transfer pricing parameter later:

1. Add default row in `data/heat-transfer-pricing-defaults.json`.
2. Add validation rule to `HEAT_TRANSFER_KEY_SCHEMAS`.
3. Map key in `buildConfig` and consume it in formula paths.
4. Keep key under `heat-transfer-pricing` category for consistent admin editing + history.
