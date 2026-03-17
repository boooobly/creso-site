# Content admin migration audit (admin panel → office-friendly CMS)

## Scope and constraints for this audit

- This document focuses on **content editing coverage** for marketing/page copy, not pricing refactors.
- It uses the current repo architecture as-is and proposes a phased migration path (no big-bang conversion).
- Goal: make the first implementation PR obvious, low-risk, and useful for office staff.

---

## 1) Current content admin architecture

### Data layer currently used for content

1. **`PageContent` model (generic per-page/per-section/per-field storage)**
   - Stored as `(pageKey, sectionKey, fieldKey, value)` with unique constraint and sort order.
   - Values are `Json`, but current UI flow persists them as strings.
   - File: `prisma/schema.prisma` (`model PageContent`).

2. **Admin definitions are config-driven**
   - `PAGE_CONTENT_DEFINITIONS` describes editable pages, sections, and fields.
   - Current field types are only `'text' | 'textarea'`.
   - File: `src/lib/admin/page-content-config.ts`.

3. **Admin screen (`/admin/content`) is generated from config**
   - Page picker + section forms are rendered from `PAGE_CONTENT_DEFINITIONS`.
   - Values are loaded from DB map and fallback to defaults from config.
   - File: `src/app/admin/(panel)/content/page.tsx`.

4. **Write path is server action + upsert transaction**
   - Server action validates selected page definition and upserts all listed fields.
   - Public route is revalidated after save.
   - Files:
     - `src/app/admin/(panel)/content/actions.ts`
     - `src/lib/admin/page-content-service.ts`

5. **Read path on public pages**
   - `getPageContentMap(pageKey)` → map of `section.field` to string.
   - `getPageContentValue(...)` applies per-page fallback values in code.
   - `getFaqItemsFromContentMap(...)` is a special helper for numbered FAQ entries.
   - File: `src/lib/page-content.ts`.

6. **Admin API coverage exists but is not the main editing UX**
   - CRUD endpoints for `PageContent` are present under `/api/admin/page-content`.
   - Files:
     - `src/app/api/admin/page-content/route.ts`
     - `src/app/api/admin/page-content/[id]/route.ts`

### Adjacent admin-managed systems relevant to content

1. **Site settings (`/admin/settings`)**
   - Office-editable company/contact/footer/SEO defaults.
   - Config-driven fields in `SITE_SETTINGS_SECTIONS`.
   - Files:
     - `src/app/admin/(panel)/settings/page.tsx`
     - `src/lib/admin/site-settings-config.ts`
     - `src/lib/site-settings.ts`

2. **Site images (`/admin/site-images`)**
   - Slot-based editable hero images for selected sections only.
   - Current slots: `home.hero.main`, `outdoor.hero.main`, `production.hero.main`.
   - Files:
     - `src/components/admin/media/SiteImagesManager.tsx`
     - `src/lib/site-image-slots.ts`
     - `src/lib/site-images.ts`

---

## 2) What is already editable today (admin coverage)

## Through `/admin/content` (`PageContent`)

| Page key | Public route | Editable sections/fields (current) |
|---|---|---|
| `home` | `/` | Hero: title, description, 2 button labels. Portfolio preview: title, description. FAQ: 4 question/answer pairs (numbered fields). |
| `baget` | `/baget` | Hero: title, description. |
| `wide_format` | `/wide-format-printing` | Hero: title, description. CTA: title, description, button label. |
| `heat_transfer` | `/heat-transfer` | Hero: title, description, 2 button labels. |
| `outdoor` | `/outdoor-advertising` | Hero: title, description, 2 button labels. CTA: title, description, button label. |
| `production` | `/production` | Hero: title, description, 2 button labels. CTA: title, description. |
| `contacts` | `/contacts` | Hero: title. CTA: title, description, button label. |
| `portfolio` | `/portfolio` | Hero: title, description. |

Source of truth: `src/lib/admin/page-content-config.ts`, consumed by `src/app/admin/(panel)/content/page.tsx` and public page readers in `src/app/(public)/*/page.tsx`.

## Through `/admin/settings`

- Contact cards and company metadata on Contacts/Footer are partially office-editable through site settings:
  - phone, WhatsApp, Telegram, email, address, working hours;
  - short company info/footer text;
  - default SEO title/description/site name/og image.
- This is not per-page CMS content, but it already covers high-value operational text.

## Through `/admin/site-images`

- Editable hero images + alt text for:
  - Home hero,
  - Outdoor advertising hero,
  - Production hero.
- No generalized per-section media-content block model yet.

---

## 3) Remaining hardcoded public content (high-value audit)

Below are major office-relevant marketing blocks still hardcoded in public pages/components.

## Home (`/`)

Main template: `src/components/home/HomePageContent.tsx`.

Still hardcoded:
- Hero eyebrow label (brand line).
- Trust badges list.
- "Почему нам доверяют" section heading + 4 highlight cards.
- "Услуги" section heading/subheading.
- "Портфолио" link label.
- "Процесс" heading/subheading + process step cards.
- FAQ section heading/subheading/link label.
- Lead section helper text + bullet points.

Partially dynamic today:
- Hero title/description/button labels.
- Portfolio block title/description.
- Home FAQ items (up to 4) via numbered fields.

## Baguette (`/baget`)

Main file: `src/app/(public)/baget/page.tsx`.

Still hardcoded:
- Most page behavior is a configurator flow; text outside hero is mostly component-internal.
- "Catalog source" technical label is hardcoded and developer-oriented (should stay developer-owned unless business requests).

## Wide format printing (`/wide-format-printing`)

Main file: `src/app/(public)/wide-format-printing/page.tsx`.

Still hardcoded:
- Trust marker chip list.
- "Почему выбирают нас" heading + 4 feature cards.
- Section-level helper text around calculator/order form.

Already dynamic:
- Hero title/description.
- CTA title/description/button.

## Plotter cutting (`/plotter-cutting`)

Main file: `src/app/(public)/plotter-cutting/page.tsx`.

Still hardcoded (almost entire content composition):
- Hero badges.
- Default pricing rows/factors explanatory content.
- Example cards.
- Requirements/help text and many section headings/descriptions.

Notes:
- Pricing values can be fetched/overridden from `/api/pricing/plotter-cutting`, but narrative copy is not CMS-managed.

## Heat transfer (`/heat-transfer`)

Main file: `src/components/heat-transfer/TshirtsLanding.tsx`.

Still hardcoded:
- KPI chips.
- Pricing cards.
- Technology cards.
- Gallery cards (titles/descriptions).
- Process steps.
- Advantages list.
- FAQ list and section subtitles.

Already dynamic:
- Hero title/description/button labels via page content.

## Print (`/print`)

Main file: `src/app/(public)/print/page.tsx`.

Still hardcoded:
- Page H1 and intro paragraph.
- Feature chips.

## Outdoor advertising (`/outdoor-advertising`)

Main file: `src/app/(public)/outdoor-advertising/page.tsx`.

Still hardcoded:
- Services grid cards (types of outdoor products).
- Strength cards (why us).
- Full-cycle items.
- Hero trust badges.
- Steps list.
- Cities coverage block text.
- Portfolio section heading/subheading labels + embedded project labels.
- Lead form intro heading/description.

Already dynamic:
- Hero title/description/2 buttons.
- CTA title/description/button.
- Hero image slot + alt text.

## Production (`/production`)

Main file: `src/app/(public)/production/page.tsx`.

Still hardcoded:
- Capability badges.
- Equipment cards.
- Product cards.
- Gallery captions.
- Work steps.
- Trust points.
- Multiple section headings/subtitles.
- CTA body text + button label currently static (heading is dynamic).

Already dynamic:
- Hero title/description/primary button text.
- CTA title/description.
- Hero image slot + alt text.

## Contacts (`/contacts`)

Main file: `src/app/(public)/contacts/page.tsx`.

Still hardcoded:
- "Работаем официально" title + trust chips list.
- "Как мы работаем" process steps.
- Several informational headings and helper texts around form/map.

Already dynamic:
- Hero title.
- Bottom CTA title/description/button.
- Contact details (phone/email/address/etc.) via site settings.

## Portfolio (`/portfolio`)

Main file: `src/app/(public)/portfolio/page.tsx`.

Still hardcoded:
- Mostly relies on portfolio DB items, but page-level extras are minimal.
- If future marketing copy is needed (filters intro, proof points), there is no model yet.

Already dynamic:
- Hero title/description.

## Milling (`/milling`)

Main file: `src/app/(public)/milling/page.tsx`.

Still hardcoded:
- Hero KPI text/chips.
- Process steps.
- Gallery item labels.
- Work conditions and "why choose us" lists.
- Section headings and explanatory copy.

Notes:
- Pricing data blocks already use config groups; content framing remains hardcoded.

## Mugs (`/services/mugs`)

Main file: `src/app/(public)/services/mugs/page.tsx`.

Still hardcoded:
- Entire sales copy composition (hero, benefits, prices intro, CTA blocks, FAQ).
- No page-content integration currently.

## Stands (`/services/stands`)

Main file: `src/app/(public)/services/stands/page.tsx`.

Still hardcoded:
- Entire page copy and card catalogs (hero chips, indoor/outdoor cards, materials, audiences, advantages, CTA blocks).
- No page-content integration currently.

---

## 4) Content pattern classification (what type each area should be)

Legend: ✅ = recommended to move to admin, 🟨 = optional later, 🔒 = keep developer-owned.

## Home

- Hero (title/description/buttons): **grouped fields** ✅ (already done).
- Trust badges: **repeatable short label list** ✅.
- "Почему нам доверяют" cards: **repeatable feature cards (title + description + iconKey)** ✅.
- Process section heading/subheading: **grouped fields** ✅.
- Process steps: **repeatable process steps** ✅.
- FAQ: **repeatable FAQ list** ✅ (prefer true list over numbered fixed fields).
- Lead bullets: **repeatable short list** ✅.
- Service-to-route mapping/image maps: **developer-owned integration logic** 🔒.

## Service pages (wide-format, plotter, heat-transfer, milling, print, outdoor, stands, mugs)

- Hero block: **grouped fields** ✅.
- KPI/trust chips: **repeatable short label list** ✅.
- "Why us" and similar cards: **repeatable feature cards** ✅.
- How-it-works/process: **repeatable process steps** ✅.
- FAQ blocks: **repeatable FAQ list** ✅.
- CTA strip: **grouped fields** ✅.
- Long explainers (if with formatting): **rich text** 🟨.
- Gallery card copy (title/description) tied to static images: **media-associated content blocks** 🟨.
- Calculator/business-rule labels tied to algorithm internals: mostly **developer-owned** 🔒 unless business asks for localization/editorial control.

## Contacts

- Contact values: already in **site settings grouped fields** ✅.
- Trust/legal chips: **repeatable short list** ✅.
- Process steps: **repeatable process steps** ✅.
- Form/map helper text: **grouped fields** ✅.

## Portfolio

- Hero intro: grouped fields ✅ (already).
- Any future explanatory marketing band: grouped/repeatable cards 🟨.
- Portfolio items themselves: already DB-managed in admin portfolio module ✅.

---

## 5) Evaluation of current model (what works / what breaks)

## What works well

1. **Fast to add scalar fields**
   - For hero/CTA/small text groups, `PAGE_CONTENT_DEFINITIONS` + `getPageContentValue` is straightforward.
2. **Safe fallback behavior**
   - If DB content is missing, page defaults in code still render.
3. **Simple office workflow already exists**
   - `/admin/content` is usable without API knowledge.
4. **Good separation for contacts and media**
   - Site settings and image slots already solve adjacent non-pricing needs.

## Current weak points

1. **Field model is too scalar for modern marketing sections**
   - No first-class repeatable blocks (cards/steps/FAQ arrays). Current FAQ uses fixed `question1..4` convention.
2. **Only `text/textarea` UI controls**
   - No list editor, no grouped card editor, no rich text editor, no icon/media picker.
3. **Config-heavy + developer-dependent scaling**
   - Every new field requires touching TypeScript config and page wiring, then redeploy.
4. **No section-level schema abstraction**
   - Reusable patterns (CTA, process steps, features, FAQ) are copied manually across pages.
5. **No explicit editorial boundaries**
   - Hard to distinguish office-editable copy from intentionally static technical labels in one place.

---

## 6) Recommended minimal admin-model improvements (not overbuilt CMS)

## Improvement A — Add typed `list` blocks with constrained item schemas

Introduce minimal new field types in `PageContent` config/renderer:
- `string` (existing behavior)
- `text` (existing behavior)
- `list.faq` (`[{ question, answer }]`)
- `list.features` (`[{ title, description, iconKey? }]`)
- `list.steps` (`[{ title, description }]`)
- `list.badges` (`[{ label }]`)

Keep storage in the same `PageContent` table as JSON values.

## Improvement B — Add reusable section templates in admin config

Extend `page-content-config` with templates like:
- `heroTemplate(...)`
- `ctaTemplate(...)`
- `faqTemplate(...)`
- `processTemplate(...)`
- `featuresTemplate(...)`

This reduces repetitive per-page config and keeps PRs reviewable.

## Improvement C — Introduce a small parser layer for typed values

Current reader returns `Map<string,string>`. Add helpers:
- `getPageContentList<T>(...)`
- strict fallback to default arrays when parse fails.

This avoids string-splitting hacks and keeps page code clean.

## Improvement D — Add explicit "owned by" annotation in config

For each section/field, add metadata:
- `owner: 'office' | 'developer'`
- optional `notes`.

Purpose: prevent accidental migration of technical/developer-owned copy.

## Improvement E — Expand site image slots only when paired with copy needs

Do not generalize media CMS globally yet.
For high-impact sections in phase 2+, add targeted slots when text migration needs matching image updates.

---

## 7) Recommended phased migration order (business-first)

Priority criteria used:
- office usefulness,
- expected edit frequency,
- implementation risk,
- ease of review.

## Phase 1 (first real PR, lowest chaos, highest value)

**Target pages:** `Home`, `Contacts`, `Production`.

Why first:
- Frequent office edits (promos, trust bullets, process steps, lead messaging).
- Already partly integrated with page content.
- Minimal routing/business-rule risk.

Scope:
- Add repeatable block support for:
  - Home: trust badges, trust cards, process steps, lead bullets.
  - Contacts: trust chips + process steps + form helper copy.
  - Production: capability badges + work steps + trust points + CTA button/body copy.

## Phase 2

**Target pages:** `Outdoor`, `Wide Format`, `Heat Transfer`.

Why second:
- High marketing churn and campaign usage.
- Medium complexity due card-heavy sections.

Scope:
- Move non-pricing sales copy arrays (features/steps/badges/FAQ) into new typed list blocks.
- Keep calculators/pricing logic untouched.

## Phase 3

**Target pages:** `Milling`, `Print`, `Plotter Cutting`.

Why third:
- Heavier forms/calculators + mixed technical text.
- Need clearer boundary between editable marketing copy and technical operational copy.

Scope:
- Migrate page headers, CTA, why-us/process, FAQ-like explainers.
- Keep technical field labels tied to calculator logic developer-owned initially.

## Phase 4

**Target pages:** `Stands`, `Mugs`, optional `Services list intro`.

Why fourth:
- Currently fully hardcoded and larger in volume.
- Better to apply proven templates after phases 1–3.

Scope:
- Full marketing copy migration to structured blocks.
- Optional targeted image-slot expansion for hero/gallery pairings.

---

## 8) Suggested PR breakdown

## PR 1 — Platform extension (small, foundational)

- Add typed list support to `PageContent` reader/writer and admin renderer.
- Implement reusable field templates and list editor UI.
- Add unit-level parsing safeguards/fallbacks (if test setup is present).

## PR 2 — Home + Contacts migration

- Migrate selected hardcoded arrays to admin-managed list blocks.
- Keep old default arrays in code as fallbacks.

## PR 3 — Production migration

- Migrate selected cards/steps/badges + CTA body/button label.

## PR 4 — Outdoor + Wide format migration

- Migrate high-value copy cards and process/FAQ-like sections.

## PR 5 — Heat transfer migration

- Migrate static cards, steps, FAQ arrays in `TshirtsLanding`.

## PR 6 — Milling + Print + Plotter migration

- Migrate non-technical copy sections first.

## PR 7 — Stands + Mugs migration

- Convert page-wide marketing copy to structured blocks.

---

## 9) Practical implementation checklist (by page/section)

## Home

- [ ] Move trust badges array to `list.badges`.
- [ ] Move trust highlight cards to `list.features`.
- [ ] Move process steps to `list.steps`.
- [ ] Move lead bullet list to `list.badges`/`list.points`.
- [ ] Keep service routing/image maps developer-owned.

## Baguette

- [ ] Keep hero fields as-is (already admin-managed).
- [ ] Confirm whether any additional marketing copy in configurator should be office-editable.
- [ ] Keep technical catalog source/debug text developer-owned.

## Wide Format

- [ ] Move trust marker chips to `list.badges`.
- [ ] Move "Почему выбирают нас" cards to `list.features`.
- [ ] Keep calculator/business-rule labels developer-owned in this phase.

## Plotter Cutting

- [ ] Add hero badges as `list.badges`.
- [ ] Add examples cards as `list.features`/media cards.
- [ ] Add process/how-it-works block to `list.steps`.
- [ ] Keep API-driven pricing rows as-is initially.

## Heat Transfer

- [ ] Move KPI chips to `list.badges`.
- [ ] Move pricing cards to repeatable cards.
- [ ] Move technology cards to repeatable cards.
- [ ] Move process steps to `list.steps`.
- [ ] Move FAQ to `list.faq`.

## Print

- [ ] Move H1 + intro paragraph to grouped fields.
- [ ] Move feature chips to `list.badges`.

## Outdoor Advertising

- [ ] Move hero trust badges to `list.badges`.
- [ ] Move services cards to repeatable cards.
- [ ] Move strengths cards to `list.features`.
- [ ] Move full-cycle items and steps to `list.steps`.
- [ ] Move city coverage copy to grouped fields / short list.

## Production

- [ ] Move capability badges to `list.badges`.
- [ ] Move equipment and products cards to repeatable cards.
- [ ] Move work steps/trust points to `list.steps` + `list.features`.
- [ ] Move CTA body and button label to grouped fields.

## Contacts

- [ ] Keep contact values in site settings.
- [ ] Move trust/legal chips to repeatable list.
- [ ] Move process steps to `list.steps`.
- [ ] Move form/map explanatory text to grouped fields.

## Portfolio

- [ ] Keep hero fields as-is.
- [ ] Decide whether to add optional marketing/support sections (if business needs recurring edits).

## Additional pages

- [ ] **Services list (`/services`)**: migrate page intro heading/subheading into page content.
- [ ] **Milling (`/milling`)**: migrate hero/process/why-us copy blocks.
- [ ] **Mugs (`/services/mugs`)**: migrate full page copy composition in late phase.
- [ ] **Stands (`/services/stands`)**: migrate full page copy composition in late phase.

---

## 10) What should be the first real migration PR?

Recommended first migration PR after platform extension:

1. Implement minimal typed list support (`list.badges`, `list.features`, `list.steps`, `list.faq`).
2. Migrate **Home + Contacts only** using new lists.

Why this makes sense:
- Delivers immediate office value on two high-traffic pages.
- Exercises all core patterns (badges/cards/steps/faq) with manageable scope.
- Keeps pricing and complex calculators untouched.
- Gives a repeatable template for all later service-page migrations.
