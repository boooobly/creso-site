# Site pricing admin migration audit (non-baguette scope)

## Overview
This document audits **only pricing systems outside the Baguette flow** and maps what still is not admin-managed.

### Scope boundary
- Included: wide format, plotter cutting, heat transfer / apparel, print, business cards, mugs, milling, and cross-service quote paths.
- Excluded: baguette pricing/admin internals (already advanced and intentionally out of scope for this task).

### Current situation
Most non-baguette pricing is still defined in code/config modules (`src/lib/pricing-config/*`) and consumed by calculators/APIs/UI. The admin panel has foundational pricing entities, but non-baguette calculators do not use them as runtime source-of-truth yet.

---

## Service-by-service pricing audit

## 1) Wide format printing
### Where pricing lives now
- `src/lib/pricing-config/wideFormat.ts`
- `src/lib/calculations/wideFormatPricing.ts`
- `src/app/api/quotes/wide-format/route.ts`
- `src/app/api/wide-format-order/route.ts`
- `src/components/WideFormatPricingCalculator.tsx`
- `src/app/(public)/wide-format-printing/page.tsx`

### Non-admin-managed pricing values
- **Structured matrix/table**: `pricesRUBPerM2` by material.
- **Formula parameters / thresholds**: `maxWidth`, `maxWidthByMaterial`, `bannerJoinSeamWidthThreshold`.
- **Per-meter / per-piece / percentage extras**:
  - edge gluing (`edgeGluingPerimeterPrice`),
  - image welding (`imageWeldingPerimeterPrice`),
  - grommets (`grommetPrice`, `grommetStepM`),
  - plotter cut estimate (`plotterCutPerimeterPrice`, `plotterCutMinimumFee`),
  - positioning marks cut (`positioningMarksCutPercent`).
- **Minimum charge**: `minimumPrintPriceRUB`.

### Visibility
- **Calculator-facing**: main formula.
- **User-facing**: calculator labels and summary rows include hardcoded price hints and minimums.

### Source of truth today
- Primary: `WIDE_FORMAT_PRICING_CONFIG` in code.
- Secondary display copies: hardcoded UI text in calculator/page.

### Complexity / risk
- **Medium-high**: matrix + formula + duplicated UI strings.
- Risk of drift between formula values and displayed labels if migrated partially.

---

## 2) Plotter cutting
### Where pricing lives now
- `src/lib/pricing-config/plotterCutting.ts`
- `src/lib/calculations/plotterCuttingPricing.ts`
- `src/lib/engine/index.ts` (exposes quote function/catalog)
- `src/app/(public)/plotter-cutting/page.tsx`

### Non-admin-managed pricing values
- **Per-meter / per-m² / fixed fee / multiplier / minimum** in config:
  - base cut per meter,
  - weeding per meter,
  - mounting film per m²,
  - transfer fixed fee,
  - urgent multiplier,
  - minimum order total.
- **User-facing static rows** on page (`от 30 ₽/м.п.`, `+15 ₽/м.п.`, etc.) are hardcoded separately.

### Visibility
- **Both**: formula-facing module exists, but public page pricing is also static and manual-request oriented.

### Source of truth today
- Split:
  - formula constants in `PLOTTER_CUTTING_PRICING_CONFIG`,
  - independent hardcoded public pricing rows on plotter page.

### Complexity / risk
- **Medium-high** due to split/duplication.
- Need product decision first: true calculator flow vs managed reference tariffs for request-only flow.

---

## 3) Heat transfer calculator (mug/t-shirt/film)
### Where pricing lives now
- `src/lib/pricing-config/heatTransfer.ts`
- `src/lib/calculations/heatTransferPricing.ts`
- `src/app/api/quotes/heat-transfer/route.ts`
- `src/components/HeatTransferCalculator.tsx`

### Non-admin-managed pricing values
- **Structured matrix**: mug prices by mug type and print type.
- **Fixed unit prices**: t-shirt own/company clothes.
- **Discount policy**: threshold + rate.
- **Film pricing**: per meter, transfer fixed fee, urgent multiplier, minimum order total.

### Visibility
- **Calculator-facing** via quote API.
- **User-facing** through calculator totals and summary labels.

### Source of truth today
- Primary: `HEAT_TRANSFER_PRICING_CONFIG` in code.

### Complexity / risk
- **Medium**: config is well-structured and easy to map to admin keys.
- Additional integrity risk: notification route accepts client pricing payload (see “Cross-service API integrity risks”).

---

## 4) Heat transfer landing / apparel page static pricing content
### Where pricing lives now
- `src/components/heat-transfer/TshirtsLanding.tsx`
- `src/app/(public)/heat-transfer/page.tsx`
- `src/components/OrderTshirtsForm.tsx`

### Non-admin-managed pricing values
- **Hardcoded user-facing amounts** in chips/cards/fallback text/options:
  - `A4 - 250 ₽/сторона`,
  - `Футболки - от 500 ₽`,
  - related FAQ/hero phrasing.

### Visibility
- **User-facing** primarily marketing + form hints.

### Source of truth today
- Static literals in component/page code.
- Can diverge from calculator config if not synchronized.

### Complexity / risk
- **Low-medium** technical complexity.
- **High consistency risk** if not tied to runtime-config values.

---

## 5) Print calculator (generic print module)
### Where pricing lives now
- `src/lib/pricing-config/print.ts`
- `src/lib/calculations/printPricing.ts`
- `src/app/api/quotes/print/route.ts`

### Non-admin-managed pricing values
- **Minimum**: `minimumQuantity`.
- **Base rates**: `basePer100` by product type.
- **Coefficients**:
  - density,
  - single/double side,
  - lamination,
  - size.

### Visibility
- **Calculator-facing** via formula/API.

### Source of truth today
- `PRINT_PRICING_CONFIG` in code.

### Complexity / risk
- **Medium**: straightforward migration to typed keyset.

---

## 6) Business cards (public print page + request flow)
### Where pricing lives now
- `src/lib/pricing-config/business-cards.ts`
- `src/components/PrintPricingCalculator.tsx`
- `src/components/OrderBusinessCardsForm.tsx`
- `src/app/(public)/print/page.tsx`
- `src/app/api/requests/business-cards/route.ts`

### Non-admin-managed pricing values
- **Quantity tier model**:
  - allowed quantities,
  - stepwise per-piece pricing (`getUnitPrice`),
  - lamination multiplier.
- **User-facing table and totals** rendered from those code values.

### Visibility
- **Both**: visible on page and used in form summary.

### Source of truth today
- Code module `business-cards.ts`.
- API validates numeric totals from client payload but does not recompute canonical total server-side.

### Complexity / risk
- **Medium** technical migration.
- **High integrity risk** until server recomputation is added.

---

## 7) Mugs service + designer pricing
### Where pricing lives now
- `src/components/mug-designer/MugDesigner2D.tsx`
- `src/app/(public)/services/mugs/page.tsx`
- `src/components/mug-designer/MugDesignInfoToggle.tsx`

### Non-admin-managed pricing values
- **Component-embedded constants**:
  - base unit price (`MUG_UNIT_PRICE`),
  - discount step quantity,
  - discount step rate,
  - max discount.
- **Static user-facing text** on mugs page (`450 ₽`, discount statement).

### Visibility
- **Both** calculator-like designer totals + page content.

### Source of truth today
- Split between component constants and hardcoded page text.

### Complexity / risk
- **Medium**: requires extraction from client component to shared config loader + sync page copy.

---

## 8) Milling (price tables and surcharges)
### Where pricing lives now
- `src/lib/pricing-config/milling.ts`
- `src/app/(public)/milling/page.tsx`
- `src/components/OrderMillingForm.tsx`
- `src/app/api/requests/milling/route.ts`

### Non-admin-managed pricing values
- **Structured matrix/table**: materials + thickness price rows.
- **Surcharge/additional-services table**: urgency percentages/minimums, setup fees, logistics/storage, etc.
- **Static page hints**: minimum order and “from” values in hero/work-condition chips.

### Visibility
- **Both**: user-facing tables/chips; form/API use material/thickness option sets.

### Source of truth today
- Static TS tables and strings.

### Complexity / risk
- **Medium**: table-like data fits admin well; risk is partial migration leaving static chips stale.

---

## File-by-file findings (outside baguette)

- `src/lib/pricing-config/wideFormat.ts`: all wide-format numeric pricing + limits + material matrix.
- `src/lib/calculations/wideFormatPricing.ts`: wide-format formula depends fully on code config.
- `src/components/WideFormatPricingCalculator.tsx`: user-visible price labels include hardcoded numeric semantics.
- `src/app/api/wide-format-order/route.ts`: uses calculator output and contains fixed estimate wording tied to current constants.

- `src/lib/pricing-config/plotterCutting.ts`: all plotter rates/minimums/multipliers.
- `src/lib/calculations/plotterCuttingPricing.ts`: calculator formula exists but not unified with plotter page display source.
- `src/app/(public)/plotter-cutting/page.tsx`: separate hardcoded pricing rows and manual lead flow.

- `src/lib/pricing-config/heatTransfer.ts`: mug/t-shirt/film rates + discount policy.
- `src/lib/calculations/heatTransferPricing.ts`: heat-transfer formula layer.
- `src/components/HeatTransferCalculator.tsx`: live quote consumer + sends totals in lead payload.
- `src/components/heat-transfer/TshirtsLanding.tsx`: static pricing cards/chips/FAQ text.
- `src/components/OrderTshirtsForm.tsx`: transfer option label with hardcoded price mention.

- `src/lib/pricing-config/print.ts`: print coefficients/minimum/base values.
- `src/lib/calculations/printPricing.ts`: formula implementation.
- `src/lib/pricing-config/business-cards.ts`: business-card tier logic and multipliers.
- `src/components/PrintPricingCalculator.tsx`: pricing table + total output from code.
- `src/app/api/requests/business-cards/route.ts`: trusts client totals (validated, not recomputed).

- `src/components/mug-designer/MugDesigner2D.tsx`: mug price + discount staircase embedded in client component.
- `src/app/(public)/services/mugs/page.tsx`: static price and discount copy.

- `src/lib/pricing-config/milling.ts`: milling material/thickness table + additional service pricing/surcharges.
- `src/app/(public)/milling/page.tsx`: static minimum/from-price copy in chips.

---

## Current source of truth by non-baguette service

- **Wide format**: code (`WIDE_FORMAT_PRICING_CONFIG`) + duplicated UI display text.
- **Plotter cutting**: split between code config and hardcoded plotter-page rows.
- **Heat transfer calculator**: code config (`HEAT_TRANSFER_PRICING_CONFIG`).
- **Heat transfer landing copy**: hardcoded component/page strings.
- **Print calculator**: code config (`PRINT_PRICING_CONFIG`).
- **Business cards**: code config (`business-cards.ts`) + client-calculated totals sent to API.
- **Mugs**: client component constants + static page text.
- **Milling**: static config tables + page-level static pricing chips.

---

## Migration complexity assessment

## Low-medium complexity (good early wins)
- Heat transfer landing/static copy synchronization.
- Print coefficients + generic print quote config migration.
- Business-card tier config migration (if server recomputation is added in same PR).

## Medium complexity
- Heat-transfer runtime config migration (structured object).
- Mugs pricing extraction from UI component.
- Milling table migration (large but table-driven).

## Medium-high complexity
- Wide format migration (matrix + constraints + extras + duplicated UI labels).
- Plotter migration (currently split source and partially disconnected calculator flow).

## Admin model fit (for non-baguette)
- `PricingEntry` (JSON/scalar) is sufficient for formula-heavy services if each service defines:
  - required keys,
  - typed parsing,
  - completeness checks,
  - fallback diagnostics.
- `PriceCategory/PriceItem` remains useful for simple display tables but is insufficient alone for formula matrices and multipliers.

## Key migration risks
- Duplicate source-of-truth during partial rollout.
- UI hardcoded price text diverging from calculator results.
- API integrity gaps where server does not recompute totals from trusted config.
- Enum/schema duplication across types, zod payloads, and option lists.

---

## Recommended migration order

1. **Wide format runtime config migration** (highest business value, active calculator/order usage).
2. **Heat transfer runtime config migration + server recomputation in lead route**.
3. **Print + business cards migration together** (shared domain, remove client-trusted totals).
4. **Mugs pricing extraction to admin-backed config** (designer + page copy sync).
5. **Milling table/surcharge migration** (table-heavy but contained).
6. **Plotter unification/migration** after product decision on calculator vs request-only mode.
7. **Final cross-page copy sync pass** to remove residual hardcoded price literals.

---

## Suggested PR breakdown

## PR-1: Wide format config foundation
- Add admin keys for all wide-format formula numbers and matrix values.
- Add typed loader + completeness check + fallback diagnostics.
- Switch `calculateWideFormatPricing` to admin-loaded config.

## PR-2: Wide format UI text sync
- Replace hardcoded surcharge/minimum labels in UI with loaded values.
- Keep visual behavior unchanged.

## PR-3: Heat transfer runtime + API integrity
- Move heat-transfer rates/discounts to admin keys.
- In `/api/heat-transfer`, recompute totals server-side from trusted config before send.

## PR-4: Print + business cards
- Move print coefficients and business-card tier/multiplier to admin keys.
- Recompute business-card total/unit on server in request route.

## PR-5: Mugs pricing
- Extract mug pricing constants from `MugDesigner2D` to shared config loader.
- Replace static mugs page price/discount copy with admin-fed values.

## PR-6: Milling tables
- Move material-thickness matrix + additional services to admin-managed structured entries.
- Replace milling page static minimum/from-price chips with managed values.

## PR-7: Plotter finalization
- Decide UX mode; wire one source-of-truth.
- Remove duplicate hardcoded plotter pricing rows.

## PR-8: Global consistency cleanup
- Sweep remaining user-facing hardcoded price literals.
- Add lightweight regression tests for formula invariants (minimums, thresholds, multipliers).

---

## Final implementation checklist by service

## Wide format
- [ ] Migrate matrix + extras + minimum + thresholds to admin keys.
- [ ] Add required-keys completeness checker.
- [ ] Replace UI hardcoded surcharge/minimum text.

## Plotter cutting
- [ ] Pick target UX (calculator vs request-only).
- [ ] Consolidate to one admin-backed source.
- [ ] Remove duplicate static pricing rows.

## Heat transfer / apparel
- [ ] Migrate heat-transfer config object to admin keys.
- [ ] Recompute totals server-side in `/api/heat-transfer`.
- [ ] Sync landing/form hardcoded price text with managed values.

## Print
- [ ] Migrate `PRINT_PRICING_CONFIG` to admin keys.
- [ ] Keep formula behavior parity with tests.

## Business cards
- [ ] Migrate quantity tiers + lamination multiplier to admin keys.
- [ ] Recompute `unitPrice` and `totalPrice` server-side in request API.
- [ ] Stop trusting client totals as source-of-truth.

## Mugs
- [ ] Move base price and discount staircase to admin keys.
- [ ] Reuse same source for designer and page copy.
- [ ] Remove hardcoded `450 ₽` literals.

## Milling
- [ ] Migrate material/thickness price table to admin structured entries.
- [ ] Migrate additional-service surcharge table.
- [ ] Replace static minimum/from-price chips with managed values.

## Cross-service
- [ ] Standardize service key namespaces in `PricingEntry`.
- [ ] Add per-service required-key registries and completeness checks.
- [ ] Ensure every pricing-affecting API computes totals from server-side trusted config.
