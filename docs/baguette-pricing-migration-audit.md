# Baguette extra pricing migration audit

This audit covers only non-baguette-extra values in `src/lib/calculations/bagetQuote.ts` that affect baguette calculator/order pricing.

| Current hardcoded input | Usage | Unit/type | Config class | Proposed DB key |
|---|---|---|---|---|
| `CROCODILE_PRICE = 20` | Hanging cost for crocodile hardware | ₽/шт | fixed scalar | `hanging.crocodile_price` |
| `effectiveWidth > 600 ? 2 : 1` | Quantity rule for crocodile hardware | mm threshold | structured config | `hanging.crocodile_double_threshold_width_mm` |
| `WIRE_PRICE_PER_METER_WIDTH = 30` | Wire hanging cost `(width / 1000) * rate` | ₽/м | per-meter rate | `hanging.wire_price_per_meter_width` |
| `WIRE_LOOP_PRICE = 15` | Added to wire hanging cost | ₽/шт | fixed scalar | `hanging.wire_loop_price` |
| `WIRE_LOOP_DEFAULT_QTY = 2` | Wire loops qty and labels | qty | quantity default | `hanging.wire_loop_default_qty` |
| `STAND_PRICE = 120` | Stand cost | ₽/шт | fixed scalar | `stand.stand_price` |
| `effectiveWidth <= 300 && effectiveHeight <= 300` | Stand availability | mm thresholds | structured config | `stand.stand_max_width_mm`, `stand.stand_max_height_mm` |
| `STRETCHER_PRICE_PER_METER.narrow = 200` | Stretcher cost per meter (narrow) | ₽/м | per-meter rate | `stretcher.stretcher_price_per_meter_narrow` |
| `STRETCHER_PRICE_PER_METER.wide = 300` | Stretcher cost per meter (wide) | ₽/м | per-meter rate | `stretcher.stretcher_price_per_meter_wide` |
| `width <= 500 && height <= 500` | Narrow stretcher allowed rule | mm thresholds | structured config | `stretcher.stretcher_narrow_max_width_mm`, `stretcher.stretcher_narrow_max_height_mm` |
| `MATERIAL_PRICING.glass` `{3705, 30}` | glazing material cost | ₽/м² + ₽/м cutting | structured config | `materials.glass` |
| `MATERIAL_PRICING.antiReflectiveGlass` `{6000, 30}` | glazing material cost | ₽/м² + ₽/м cutting | structured config | `materials.anti_reflective_glass` |
| `MATERIAL_PRICING.plexiglass` `{2575, 30}` | glazing material cost | ₽/м² + ₽/м cutting | structured config | `materials.plexiglass` |
| `MATERIAL_PRICING.pet1mm` `{1200, 30}` | glazing material cost | ₽/м² + ₽/м cutting | structured config | `materials.pet1mm` |
| `MATERIAL_PRICING.passepartout` `{2325, 30}` | passepartout cost | ₽/м² + ₽/м cutting | structured config | `materials.passepartout` |
| `MATERIAL_PRICING.cardboard` `{465, 30}` | back panel material cost | ₽/м² + ₽/м cutting | structured config | `materials.cardboard` |
| `MATERIAL_PRICING.pvc3` `{1855, 30}` | auto-added PVC 3 mm cost | ₽/м² + ₽/м cutting | structured config | `materials.pvc3` |
| `MATERIAL_PRICING.pvc4` `{2455, 35}` | auto-added PVC 4 mm cost | ₽/м² + ₽/м cutting | structured config | `materials.pvc4` |
| `MATERIAL_PRICING.orabond` `{1200, 0}` | auto-added Orabond cost | ₽/м² + ₽/м cutting | structured config | `materials.orabond` |
| `resolveAutoAdditions('rhinestone')` rules | auto-additions behavior | JSON rule object | structured config | `auto_additions.rhinestone` |
| `resolveAutoAdditions('embroidery')` rules | auto-additions behavior | JSON rule object | structured config | `auto_additions.embroidery` |
| `resolveAutoAdditions('beads')` rules | auto-additions behavior | JSON rule object | structured config | `auto_additions.beads` |
| `resolveAutoAdditions('photo')` rules | auto-additions behavior | JSON rule object | structured config | `auto_additions.photo` |
| `resolveAutoAdditions('stretchedCanvas')` rules | auto-additions behavior | JSON rule object | structured config | `auto_additions.stretched_canvas` |
| `resolveAutoAdditions(default)` rules | fallback behavior for other work types | JSON rule object | structured config | `auto_additions.default` |

## Not migrated by design
- Baguette profile catalog and base baguette frame pricing (`price_per_meter`, availability, images, SKU/article/title) remain sourced from Google Sheets.
- Wide-format print pricing lookup (`getBagetPrintPricePerM2`) remains unchanged and out of scope for this step.
