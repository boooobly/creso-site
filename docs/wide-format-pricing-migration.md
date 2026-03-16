# Wide Format pricing migration (phase 1, non-baguette)

## What is now admin-managed
Wide Format calculator pricing is now sourced from `PricingEntry` (category: `wide-format-pricing`) via `getWideFormatPricingConfig()`.

- Runtime quote API (`/api/quotes/wide-format`) uses DB-backed config.
- Order API recalculation (`/api/wide-format-order`) uses DB-backed config.
- Wide Format page calculator UI receives current public pricing values from server-side config.
- Admin panel includes dedicated "Широкоформатная печать — параметры калькулятора" section with history.

## Pricing input audit and key map
| Pricing input | File path (old source) | Current source of truth | Unit/type | Quote impact | Admin key/group |
|---|---|---|---|---|---|
| Global max roll width fallback | `src/lib/pricing-config/wideFormat.ts` | `PricingEntry` | number, м | Used when material-specific width missing | `global.max_width` / `Общие правила` |
| Banner join seam threshold | `src/lib/pricing-config/wideFormat.ts` | `PricingEntry` | number, м | Enables auto seam welding for banners above threshold | `global.banner_join_seam_width_threshold` / `Общие правила` |
| Edge gluing perimeter rate | `src/lib/pricing-config/wideFormat.ts` | `PricingEntry` | number, ₽/м | Adds perimeter-based surcharge | `global.edge_gluing_perimeter_price` / `Общие правила` |
| Image welding seam rate | `src/lib/pricing-config/wideFormat.ts` | `PricingEntry` | number, ₽/м | Adds auto seam welding surcharge | `global.image_welding_perimeter_price` / `Общие правила` |
| Grommet unit rate | `src/lib/pricing-config/wideFormat.ts` | `PricingEntry` | number, ₽/шт | Grommet extra cost | `global.grommet_price` / `Общие правила` |
| Grommet step | `src/lib/pricing-config/wideFormat.ts` | `PricingEntry` | number, м | Affects computed grommet quantity | `global.grommet_step_m` / `Общие правила` |
| Plotter cut perimeter rate | `src/lib/pricing-config/wideFormat.ts` | `PricingEntry` | number, ₽/м | Estimated registration-mark cut cost | `global.plotter_cut_perimeter_price` / `Общие правила` |
| Plotter cut minimum fee | `src/lib/pricing-config/wideFormat.ts` | `PricingEntry` | number, ₽ | Min fee floor for plotter cut estimate | `global.plotter_cut_minimum_fee` / `Общие правила` |
| Positioning marks coefficient | `src/lib/pricing-config/wideFormat.ts` | `PricingEntry` | number, доля | Non-banner percentage surcharge on base print | `global.positioning_marks_cut_percent` / `Общие правила` |
| Minimum print order | `src/lib/pricing-config/wideFormat.ts` | `PricingEntry` | number, ₽ | Floor for base print cost | `global.minimum_print_price_rub` / `Общие правила` |
| Material prices per m² (all 15 materials) | `src/lib/pricing-config/wideFormat.ts` | `PricingEntry` | number, ₽/м² | Base print cost by selected material | `price_per_m2.<material_id>` / `Цены материалов за м²` |
| Material max widths (all 15 materials) | `src/lib/pricing-config/wideFormat.ts` | `PricingEntry` | number, м | Width warning validation and accepted dimensions | `max_width_by_material.<material_id>` / `Максимальная ширина рулона` |

## Validation and safety
- Every key is validated with zod schema in `src/lib/wide-format/wideFormatPricing.ts`.
- Invalid/missing DB values are replaced with seeded fallback defaults and logged in server warnings.
- Admin panel surfaces fallback/missing/unknown key diagnostics.

## History logging
- Every admin update writes `PricingEntryHistory` with key identity, old/new value, note, timestamp.
- History is shown in the Wide Format admin section.

## Fallback behavior
- Required key set is defined by `data/wide-format-pricing-defaults.json`.
- Missing or invalid keys resolve to defaults from this file.
- Runtime logs fallback usage (`[wide-format-pricing] ...`) for maintenance visibility.

## How to extend next service migration
1. Create `<service>-pricing-defaults.json` with labels/units/order and required keys.
2. Add service pricing loader with:
   - key schemas,
   - ensure/backfill function,
   - runtime build + fallback diagnostics,
   - update + history writer.
3. Switch both quote API and order API to DB-backed config.
4. Add dedicated admin section with grouped inputs and history.
