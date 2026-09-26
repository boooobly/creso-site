# Browser audit

These optional tools are isolated from the application dependencies. Install Chrome and Node 22+, then run `npm ci` in this directory. Start a local **production build** on `http://127.0.0.1:3000` first. Set `PUBLIC_BASE_URL=http://localhost:3000`, `ENABLE_DATABASE=false`, a temporary `ADMIN_TOKEN` and `MAIL_TO=audit@example.invalid` for the local server. Never use production credentials for these checks.

Run in this directory, in order:

```sh
npm run pages
npm run theme
npm run scenarios
npm run seo
npm run lighthouse
node portfolio-check.mjs
```

`pages` covers 21 routes at 390/768/1440/1920 pixels with reduced motion and axe at 390/1440. `theme` covers the same routes and widths in dark mode, with axe at 390/1440. `portfolio-check.mjs` exercises the populated portfolio grid, pagination, category filtering, dialog, and gallery; it requires a database-enabled local server with curated data. Scenario submissions use mocked responses; they do not verify delivery to a database, email or Telegram. SEO checks reuse the page crawl. Results and screenshots go to the ignored `scripts/audit-results/after` directory. Lighthouse runs separately to avoid competing browser workloads. Set `CHROME_PATH` only if automatic Chrome discovery fails.

Use the reports alongside manual screenshot and keyboard review. Axe does not establish full WCAG compliance; Lighthouse is a lab measurement, not field Core Web Vitals or INP.
