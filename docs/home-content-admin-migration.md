# Home content admin migration (Phase 1, focused PR)

## Scope used for this PR

This migration follows `docs/content-admin-migration-audit.md` and only covers the Home page (`/`) sections that the audit marked as high-value and frequent-edit:

- Hero grouped content + CTA labels.
- Hero trust badges (`repeatable short label list`).
- Trust/benefit section heading + feature cards (`repeatable feature cards`).
- Portfolio preview CTA link label.
- Process section heading/subheading + steps (`repeatable steps`).
- FAQ heading/subheading/link + FAQ items (`repeatable FAQ list`).
- Final lead/CTA helper text and bullet points (`repeatable short list`).

Out of scope intentionally:

- Other pages.
- Service routing/image technical mappings.
- Pricing logic and calculators.
- Full admin panel redesign.

## Home mapping (before → after)

| Home section | Previous source | Admin-managed fields now |
|---|---|---|
| Hero | Hardcoded + partial `/admin/content` fields | `hero.eyebrow`, `hero.title`, `hero.description`, `hero.primaryButtonText`, `hero.secondaryButtonText`, `hero.trustBadges` |
| Why trust us | Hardcoded in `HomePageContent` | `trust_section.eyebrow`, `trust_section.title`, `trust_section.featureCards` |
| Portfolio preview | Partial `/admin/content` | Added `portfolio_preview.linkLabel` |
| Process | Hardcoded in `HomePageContent` | `process.eyebrow`, `process.title`, `process.description`, `process.steps` |
| FAQ | Numbered scalar fields only | `faq.eyebrow`, `faq.title`, `faq.description`, `faq.linkLabel`, `faq.items` |
| Lead CTA helper | Hardcoded in `HomePageContent` | `lead.eyebrow`, `lead.description`, `lead.points` |

## Content patterns introduced

To keep the architecture small and repeatable, this PR introduces one additional field type in the existing `PageContent` definitions:

- `list` field with constrained `listSchema`.

`listSchema` supports:

- `itemName` (UI label for each row),
- `minItems` / `maxItems`,
- `fields[]` (label + key + required flag).

Implemented list patterns in Home:

- Badges / bullets: `[{ label }]`
- Feature cards: `[{ title, description }]`
- Process steps: `[{ title, description }]`
- FAQ: `[{ question, answer }]`

Storage remains in `PageContent.value` (`Json`) without adding new DB tables.

## Admin usability improvements for office staff

In `/admin/content`:

- Home sections now have human-readable section names and helpers.
- List fields render as row-based editors with clear item labels (e.g., “Шаг 1”, “Вопрос 2”).
- Empty rows are ignored on save.
- Required list sub-fields are validated with human-readable errors.
- Minimum item count is validated for important blocks.

## Validation and safety behavior

- Scalar fields save with fallback to defaults if empty to avoid blank/broken marketing UI.
- List rows with partial required data are rejected with explicit field-level guidance.
- Public rendering uses typed parsing helpers with fallback defaults when JSON is missing/invalid.
- FAQ keeps backward compatibility with legacy `question1/answer1` storage while preferring new `faq.items`.

## How office staff edits Home content

1. Open `/admin/content`.
2. Select page **“Главная”**.
3. Update section blocks:
   - **Первый экран**,
   - **Почему нам доверяют**,
   - **Раздел «Процесс»**,
   - **FAQ**,
   - **Финальный CTA-блок с формой**,
   - **Блок портфолио** (including link text).
4. Click **“Сохранить”**.
5. Refresh the Home page (`/`) to confirm updates.

## Reusing this pattern for the next page

For future migrations (Contacts/Production/etc.):

1. Add page section fields in `PAGE_CONTENT_DEFINITIONS` using scalar + `listField(...)`.
2. Reuse list schemas (`label`, `title/description`, `question/answer`) for recurring marketing sections.
3. Read values in the public page through:
   - `getPageContentValue(...)` for scalars,
   - `getPageContentList(...)` for repeatables,
   - optional backward-compatible helpers when replacing older scalar patterns.
4. Keep developer-owned technical copy out of admin definitions.
