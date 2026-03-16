# Site pricing admin migration audit

## Overview
This audit maps all pricing logic that still lives outside the admin-managed DB layer.

### Current target state
- **Already done for baguette**: Google Sheets is used only for baguette catalog/base frame data, while non-catalog baguette pricing is admin-managed (`PricingEntry` + history).
- **Still pending for the rest of services**: pricing logic for wide format, print, heat-transfer, mugs, plotter and milling is mostly code-configured (constants in TS modules and UI strings), not managed via admin DB.

### Existing admin building blocks
- Generic key/value pricing storage exists: `PricingEntry` (`category`, `subcategory`, `key`, `value`, `type`, `unit`).
- Generic price list storage exists: `PriceCategory` + `PriceItem` (flat rows).
- Baguette-specific enhancement exists: strict per-key parsing, completeness checks, fallback diagnostics and history UI.

These blocks are a good base, but the non-baguette calculators currently do not read from them.

---

## Pricing sources by service

## 1) Baguette (reference baseline: mostly migrated)
### Current source of truth
- Catalog/base frame price (`price_per_meter`) remains Google Sheets (+ JSON fallback for resilience).
- Non-catalog extras/thresholds/rules are loaded from `PricingEntry` (`baguette-extra-pricing`) with fallback/default diagnostics.

### Main files
- `src/lib/baget/sheetsCatalog.ts`
- `src/lib/baget/baguetteExtrasPricing.ts`
- `src/lib/calculations/bagetQuote.ts`
- `src/lib/admin/baguette-extras-pricing-service.ts`
- `src/app/admin/(panel)/pricing/page.tsx`

### Notes for global migration
- Baguette provides the pattern to reuse for other services: required keys, parser guardrails, fallback visibility, completeness checks, history.

---

## 2) Wide format printing
### Current source of truth
**Not admin-managed.** Pricing is code-configured in `WIDE_FORMAT_PRICING_CONFIG`.

### Pricing values currently outside admin
- Material `pricesRUBPerM2` matrix.
- `minimumPrintPriceRUB` minimum order floor.
- Extra-service rates:
  - `edgeGluingPerimeterPrice` (per meter),
  - `imageWeldingPerimeterPrice` (per meter),
  - `grommetPrice` + `grommetStepM`,
  - `plotterCutPerimeterPrice` + `plotterCutMinimumFee`,
  - `positioningMarksCutPercent` (+%).
- Formula thresholds/constraints:
  - `bannerJoinSeamWidthThreshold`,
  - `maxWidth`, `maxWidthByMaterial`.

### Main files
- Config + material catalog: `src/lib/pricing-config/wideFormat.ts`.
- Calculation formula: `src/lib/calculations/wideFormatPricing.ts`.
- Quote API: `src/app/api/quotes/wide-format/route.ts`.
- Order API path using same formula: `src/app/api/wide-format-order/route.ts`.
- User UI with rate text: `src/components/WideFormatPricingCalculator.tsx`.
- Marketing text with discount claim: `src/app/(public)/wide-format-printing/page.tsx`.

### Complexity
**Medium-high.**
- Has matrix + formula + thresholds + UI labels tied to material taxonomy.
- A good candidate for first non-baguette migration because business impact is high and model shape is clear.

---

## 3) Print (offset business-card style calculator)
### Current source of truth
**Not admin-managed.** Pricing is code-configured in `PRINT_PRICING_CONFIG`; business card calculator also has separate code-config.

### Pricing values currently outside admin
- `minimumQuantity`.
- `basePer100` by product type.
- Coefficients: density, side, lamination, size.
- Business-card tiering logic:
  - allowed quantities,
  - quantity -> unit-price step function,
  - `LAMINATION_MULTIPLIER`.

### Main files
- Print config: `src/lib/pricing-config/print.ts`.
- Print formula: `src/lib/calculations/printPricing.ts`.
- Business-card config/formula: `src/lib/pricing-config/business-cards.ts`.
- UI/summary/forms:
  - `src/components/PrintPricingCalculator.tsx`,
  - `src/components/OrderBusinessCardsForm.tsx`,
  - `src/app/(public)/print/page.tsx`.
- API currently trusts client-provided `unitPrice`/`totalPrice` instead of recomputing server-side:
  - `src/app/api/requests/business-cards/route.ts`.

### Complexity
**Medium.**
- Formula is simpler than wide format.
- Main risk is duplicate pricing logic (generic print + business-card specific) and server trusting client totals.

---

## 4) Heat transfer (calculator path)
### Current source of truth
**Not admin-managed.** Core rates and discount policy are code-configured.

### Pricing values currently outside admin
- `discountThreshold`, `discountRate`.
- Mug price matrix by mug type + print type.
- T-shirt unit prices (`ownClothes`, `companyClothes`).
- Film rates:
  - `unitPricePerMeter`,
  - `transferPrice`,
  - `urgentMultiplier`,
  - `minimumOrderTotal`.

### Main files
- Config: `src/lib/pricing-config/heatTransfer.ts`.
- Formula: `src/lib/calculations/heatTransferPricing.ts`.
- Quote API: `src/app/api/quotes/heat-transfer/route.ts`.
- UI calculator consuming API: `src/components/HeatTransferCalculator.tsx`.

### Additional risk
- `src/app/api/heat-transfer/route.ts` accepts client-sent `pricing` payload and forwards it in notifications; this endpoint does not recompute pricing server-side.

### Complexity
**Medium.**
- Structured but straightforward; data fits the baguette-like key/value+JSON approach.

---

## 5) Heat transfer landing / T-shirt service page (separate from calculator)
### Current source of truth
**Not admin-managed.** Pricing chips/cards are hardcoded marketing text.

### Pricing values currently outside admin
- Fixed display values: `A4 - 250 ₽/сторона`, `Футболки - от 500 ₽`, etc.
- Pricing FAQ statements and hero fallback text include fixed prices.

### Main files
- `src/components/heat-transfer/TshirtsLanding.tsx`
- `src/app/(public)/heat-transfer/page.tsx`
- `src/components/OrderTshirtsForm.tsx` (transfer option label has fixed `250 ₽/сторона`)

### Complexity
**Low-medium** for data source migration, but **high consistency risk** if left detached from calculator pricing.

---

## 6) Mugs (designer + landing)
### Current source of truth
**Not admin-managed.** Core mug calculator pricing lives in component constants.

### Pricing values currently outside admin
- `MUG_UNIT_PRICE = 450`.
- Volume discount policy:
  - step quantity `12`,
  - step rate `2.5%`,
  - max discount `20%`.
- Hardcoded price displays in service page (`450 ₽`) and discount text.

### Main files
- Designer with formula/constants: `src/components/mug-designer/MugDesigner2D.tsx`.
- Marketing/service text: `src/app/(public)/services/mugs/page.tsx`.
- Auxiliary info label: `src/components/mug-designer/MugDesignInfoToggle.tsx`.

### Complexity
**Medium.**
- Formula is simple but embedded in UI component; requires extraction to server/shared module.

---

## 7) Plotter cutting
### Current source of truth
**Split / inconsistent.**
- Calculator formula module exists in code config, but public plotter page uses hardcoded rows and manual lead flow.

### Pricing values currently outside admin
- Config formula constants:
  - base per meter,
  - weeding per meter,
  - mounting film per m²,
  - transfer fixed fee,
  - urgent multiplier,
  - minimum order total.
- Public page hardcoded marketing pricing rows (`от 30 ₽ / м.п.`, `+15 ₽ / м.п.`, etc.).

### Main files
- Code config: `src/lib/pricing-config/plotterCutting.ts`.
- Formula: `src/lib/calculations/plotterCuttingPricing.ts`.
- Public page hardcoded rows: `src/app/(public)/plotter-cutting/page.tsx`.
- Engine exposes plotter calculator but no dedicated quote API or active UI integration path: `src/lib/engine/index.ts`.

### Complexity
**Medium-high** due to current split and potential dead/unused paths.

---

## 8) Milling
### Current source of truth
**Not admin-managed.** Price table and additional-service surcharges are static TS data.

### Pricing values currently outside admin
- Material/thickness price matrix (`MILLING_MATERIAL_GROUPS`).
- Additional services and surcharges (`MILLING_ADDITIONAL_SERVICE_GROUPS`), including urgency percentages/minimums and fixed fees.
- Page-level hardcoded pricing statements (minimum order and “from” price chips).

### Main files
- Config tables: `src/lib/pricing-config/milling.ts`.
- Public page + static chips: `src/app/(public)/milling/page.tsx`.
- Order form validates materials/thickness against static options: `src/components/OrderMillingForm.tsx`, `src/app/api/requests/milling/route.ts`.

### Complexity
**Medium.**
- Data is table-driven (good for admin migration) and mostly not formula-heavy.

---

## 9) Generic admin pricing model usage gap
### Observation
- Generic admin pricing entities (`PriceCategory`, `PriceItem`) are managed in `/admin/pricing`.
- But main calculators do not consume these tables for runtime pricing.
- Seed includes legacy/placeholder pricing records not connected to active calculator flows.

### Main files
- Models: `prisma/schema.prisma`.
- Services: `src/lib/admin/price-catalog-service.ts`, `src/lib/admin/pricing-service.ts`.
- Validation: `src/lib/admin/validation.ts`.
- Seed placeholders: `prisma/seed.js`.

### Complexity
**Architectural**: migration must pick one runtime model (service-key config + structured JSON for formula services), rather than only flat list items.

---

## File-by-file findings (concise index)

- `src/lib/pricing-config/wideFormat.ts`: full wide-format matrix, extras, minimums, thresholds are code constants.
- `src/lib/calculations/wideFormatPricing.ts`: formula depends directly on those constants.
- `src/components/WideFormatPricingCalculator.tsx`: UI strings duplicate price semantics (`+50 ₽/м`, `от 250 ₽`, +30%).
- `src/app/api/wide-format-order/route.ts`: uses formula + embeds hardcoded fallback wording for estimated cut minimum text.

- `src/lib/pricing-config/plotterCutting.ts`: full plotter rate constants.
- `src/lib/calculations/plotterCuttingPricing.ts`: formula exists but not clearly wired to public plotter page.
- `src/app/(public)/plotter-cutting/page.tsx`: independent hardcoded price rows and manual lead flow.

- `src/lib/pricing-config/heatTransfer.ts`: heat-transfer/mug/tshirt/film rates + discount policy.
- `src/lib/calculations/heatTransferPricing.ts`: formula engine tied to that config.
- `src/components/HeatTransferCalculator.tsx`: quote UI uses API + sends computed totals in lead payload.
- `src/app/api/heat-transfer/route.ts`: accepts client pricing payload without server recomputation.

- `src/components/heat-transfer/TshirtsLanding.tsx`, `src/app/(public)/heat-transfer/page.tsx`, `src/components/OrderTshirtsForm.tsx`: hardcoded user-facing price text.

- `src/lib/pricing-config/business-cards.ts`: quantity tiers and lamination multiplier in code.
- `src/components/PrintPricingCalculator.tsx`: business-card pricing table and totals from code.
- `src/components/OrderBusinessCardsForm.tsx`: submits `unitPrice`/`totalPrice` derived client-side.
- `src/app/api/requests/business-cards/route.ts`: validates but does not recompute total server-side.

- `src/lib/pricing-config/print.ts`, `src/lib/calculations/printPricing.ts`, `src/app/api/quotes/print/route.ts`: generic print coefficients entirely code-configured.

- `src/components/mug-designer/MugDesigner2D.tsx` + `src/app/(public)/services/mugs/page.tsx`: mug base price and discount staircase are hardcoded in UI + marketing.

- `src/lib/pricing-config/milling.ts` + `src/app/(public)/milling/page.tsx`: milling matrix and surcharge tables static in code.

---

## Current source of truth map

- **Admin-managed today**
  - Baguette non-catalog extras/config (`PricingEntry`, category `baguette-extra-pricing`).

- **Intentionally non-admin (for now)**
  - Baguette catalog/base frame price in Google Sheets.

- **Still code-managed (migration backlog)**
  - Wide format, plotter, print, business cards, heat transfer, mugs, milling.
  - Multiple public pages also carry hardcoded marketing price text that can drift from calculators.

---

## Migration complexity and risk assessment

### Isolated / easier first
1. **Heat transfer config tables** (single config object + one calculator API).
2. **Print/business cards coefficients and tiers** (compact formulas).
3. **Mugs base + discount staircase** (small formula extraction from component).

### Medium complexity
4. **Milling matrix + additional service tables** (table-driven but broad content footprint).

### Higher complexity
5. **Wide format** (material matrix + multiple extras + threshold logic + order integration + UI duplicates).
6. **Plotter** (split state between formula module and static page; requires product decision first).

### Cross-cutting risks
- Duplicate sources of truth (formula constants + UI/marketing strings).
- Server endpoints that trust client-sent totals (`/api/heat-transfer`, `/api/requests/business-cards`).
- Material/option enums hardcoded in multiple layers (types, zod schemas, UI option arrays).
- Existing `PriceCategory/PriceItem` model is too flat for formula-heavy services unless combined with structured `PricingEntry` configs.

---

## Recommended migration order (practical)

## Phase 0 (stabilization, tiny PR)
- Freeze and document pricing boundaries + decide canonical runtime model:
  - Use **`PricingEntry` service-key configs** for formula services,
  - Keep `PriceCategory/PriceItem` for simple public static price lists.
- Add one internal inventory helper that lists unresolved hardcoded pricing strings per service page (non-blocking tooling).

## Phase 1 (high value, manageable risk)
- **Wide format runtime config migration**
  - Move `WIDE_FORMAT_PRICING_CONFIG` numeric values to admin keys.
  - Keep material IDs/options stable, but source rates and extras from DB.
  - Add completeness check + fallback warnings (same pattern as baguette).
- PR boundary: backend loader + calculator + admin section + no redesign.

## Phase 2
- **Heat transfer runtime migration**
  - Move heat-transfer config object to admin keys.
  - Recompute totals server-side in `/api/heat-transfer` before notifications.
- PR boundary: config + calculator + endpoint hardening + admin section.

## Phase 3
- **Print + business cards migration**
  - Consolidate `print.ts` + `business-cards.ts` into one service config namespace.
  - Recompute business-card totals server-side in request API.
- PR boundary: shared config keys + calculator adjustments + request endpoint hardening.

## Phase 4
- **Mugs pricing migration**
  - Extract mug formula constants from `MugDesigner2D` into shared server/client config loaded from admin.
  - Replace hardcoded mug page prices with admin-fed display values.

## Phase 5
- **Milling pricing table migration**
  - Move material/thickness matrix + additional surcharge rows to structured admin entries.
  - Replace hardcoded chips (“минимальный заказ”, “от ...”) with admin content/keys.

## Phase 6
- **Plotter strategy and migration**
  - First choose target UX:
    - either full calculator using existing formula module,
    - or request-only flow with managed reference tariffs.
  - Then migrate selected pricing source to admin keys and remove duplicate static rows.

## Phase 7 (consistency cleanup)
- Sweep all public pages for hardcoded price text; tie them to the same admin keys used by calculators.
- Add small “pricing consistency” regression tests for key formulas and min/threshold behavior.

---

## Admin model readiness and likely gaps

## What already works well
- `PricingEntry` supports structured JSON and scalar values.
- History table already exists and works for baguette edits.
- Admin page already has a pattern for grouped service-specific editing blocks.

## Gaps for remaining services
1. **Service scoping conventions**
   - Need explicit category naming convention per service (`wide-format`, `heat-transfer`, `print`, etc.) and required key registries.
2. **Per-service completeness checks**
   - Baguette has this; other services need same helper pattern.
3. **Server-side source-of-truth enforcement**
   - Some request APIs still trust client totals; should always recompute from server config.
4. **Formula-oriented admin UX**
   - Flat `PriceItem` rows are insufficient alone for matrices/coefficients.
   - Continue using `PricingEntry` + typed parser maps for formula services.
5. **Content-price sync**
   - Marketing pages with price text should consume admin values or explicitly mark as “по запросу”.

---

## Suggested PR boundaries (implementation plan)

1. **PR-1: Wide format config loader + admin section**
   - Add required keys + parser + completeness helper + diagnostics.
   - Wire `calculateWideFormatPricing` to loader.

2. **PR-2: Wide format UI and text sync**
   - Replace hardcoded wide-format surcharge labels/threshold displays with loaded values.

3. **PR-3: Heat transfer config migration + endpoint recompute**
   - Move config to admin keys; recompute in `/api/heat-transfer`.

4. **PR-4: Print/business cards config migration + endpoint recompute**
   - Migrate both modules; validate and recompute totals server-side in business-card request route.

5. **PR-5: Mugs pricing extraction from component**
   - Move mug formula constants to admin config and use in designer + mugs page.

6. **PR-6: Milling table migration**
   - Move matrix + additional services to admin-managed structured entries.

7. **PR-7: Plotter unification**
   - Choose calculator/request strategy; remove duplicate pricing rows and wire to one admin source.

8. **PR-8: Final consistency pass**
   - Replace residual hardcoded price claims in public pages and add lightweight regression tests.

---

## Service checklist

## Wide format
- [ ] Add admin keys for all `WIDE_FORMAT_PRICING_CONFIG` numeric values.
- [ ] Add required-keys completeness checker + fallback diagnostics.
- [ ] Move wide-format UI surcharge/minimum labels to admin-fed values.
- [ ] Remove duplicated constants from UI strings.

## Plotter cutting
- [ ] Decide final UX path (calculator vs request-only).
- [ ] Migrate chosen pricing source to admin.
- [ ] Eliminate duplicate static pricing rows once admin-backed.

## Heat transfer
- [ ] Move `HEAT_TRANSFER_PRICING_CONFIG` to admin keys.
- [ ] Add server-side recompute in `/api/heat-transfer`.
- [ ] Align landing page hardcoded prices with admin values.

## Print
- [ ] Move `PRINT_PRICING_CONFIG` to admin keys.
- [ ] Add required-key checks and formula tests against admin-loaded config.

## Business cards
- [ ] Move quantity tiers + lamination multiplier to admin.
- [ ] Recompute `unitPrice`/`totalPrice` server-side in business-card request API.
- [ ] Remove client-trusted price fields from critical decision paths.

## Mugs
- [ ] Move mug base price/discount staircase to admin keys.
- [ ] Reuse same pricing source in designer and mugs landing page.
- [ ] Remove hardcoded “450 ₽” and discount text literals.

## Milling
- [ ] Move material/thickness table to admin-managed structured entries.
- [ ] Move additional service surcharges to admin.
- [ ] Replace page-level hardcoded “минимальный заказ”/“от ...” strings with admin values.

## Cross-cutting
- [ ] Define service key naming convention and required key registries.
- [ ] Add a small internal check that reports missing required keys by service.
- [ ] Ensure every pricing-affecting API recalculates totals server-side from admin config.
