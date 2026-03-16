# Baguette pricing final gap check

## Remaining pricing dependencies audit (post phase-1)

| Pricing source | File path | Affects baguette total | Already admin-managed | Required change |
|---|---|---|---|---|
| `getBagetPrintPricePerM2()` from wide-format pricing config | `src/lib/calculations/bagetQuote.ts` -> `src/lib/pricing-config/wideFormat.ts` | Yes, `printCost` line item (`requiresPrint`) | No | Move baguette print m² rates into baguette admin pricing keys |
| Wide-format mapping (`paper_trans_skylight`, `canvas_cotton_350`) for baget print | `src/lib/pricing-config/wideFormat.ts` | Yes (indirect via print price lookup) | No (for baguette) | Remove baguette-page dependency on wide-format module for print cost |
| Print minimum billable area hardcoded (`Math.max(area, 1)`) | `src/lib/calculations/bagetQuote.ts` | Yes, sets minimum charged print area | No | Add admin-managed baguette print minimum billable area key |
| Baguette extras/materials/thresholds in `baguette-extra-pricing` | `src/lib/baget/baguetteExtrasPricing.ts`, `data/baguette-extras-pricing-defaults.json` | Yes | Yes | Keep as-is |
| Baguette profile/base frame price (`price_per_meter`, availability, meta) from sheets | `src/lib/baget/sheetsCatalog.ts` and baget page/order flow | Yes | Intentionally not in admin DB | Keep in Google Sheets (expected boundary) |

## Closure criteria for this pass
- Baguette print rates and minimum area are stored in baguette admin pricing config (`PricingEntry`, category `baguette-extra-pricing`).
- `bagetQuote` no longer imports or uses wide-format print pricing helpers.
- Fallback usage is visible via server warnings and admin warning block.
