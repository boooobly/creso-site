import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
for (const width of [390, 1440]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('credomir_cookie_notice_accepted', 'true'));
  try {
    await page.goto('http://127.0.0.1:3000/portfolio', { waitUntil: 'networkidle' });
    const cards = page.getByRole('button', { name: /^Открыть проект / });
    assert.equal(await cards.count(), 12, 'initial page should render 12 project cards');
    await page.getByRole('button', { name: /^Показать ещё/ }).click();
    assert.equal(await cards.count(), 24, 'load-more should add 12 cards');
    await page.getByRole('button', { name: 'Оформление транспорта', exact: true }).click();
    const filteredCount = await cards.count();
    assert(filteredCount > 0 && filteredCount <= 12, 'category should reset pagination and show relevant cards');
    await page.getByRole('button', { name: 'Все', exact: true }).click();
    await cards.first().click();
    const dialog = page.getByRole('dialog', { name: /Просмотр проекта/ });
    await dialog.waitFor();
    assert(await dialog.locator('img').count() > 0, 'modal should contain a project image');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: 'Открыть проект Оформление магазина «Еврообувь»' }).click();
    const gallery = page.getByRole('dialog', { name: /Оформление магазина/ });
    await gallery.waitFor();
    const choices = gallery.getByRole('button', { name: /^Показать изображение/ });
    const galleryImages = await choices.count();
    assert(galleryImages >= 2, 'multi-image case should show alternate views');
    await choices.nth(1).click();
    assert.equal(await choices.nth(1).getAttribute('aria-pressed'), 'true');
    await page.keyboard.press('ArrowRight');
    assert.equal(await choices.nth(2).getAttribute('aria-pressed'), 'true');
    await page.keyboard.press('Escape');
    await gallery.waitFor({ state: 'hidden' });
    assert.deepEqual(errors, [], 'no runtime browser errors');
    results.push({ width, cardsAfterLoadMore: 24, filteredCount, galleryImages, errors });
  } catch (error) {
    results.push({ width, error: String(error), errors });
  }
  await context.close();
}
await browser.close();
await fs.writeFile('../audit-results/after/portfolio-check.json', JSON.stringify(results, null, 2));
console.log(results);
if (results.some((result) => result.error)) process.exitCode = 1;
