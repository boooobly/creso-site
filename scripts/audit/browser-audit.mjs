import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const phase = process.argv[2] || 'before';
const out = new URL(`../audit-results/${phase}/`, import.meta.url);
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const routes = ['/', '/services', '/baget', '/wide-format-printing', '/milling', '/plotter-cutting', '/heat-transfer', '/services/mugs', '/services/stands', '/outdoor-advertising', '/advertising-signs', '/banner-printing', '/lightboxes', '/volume-letters', '/print', '/business-cards', '/production', '/portfolio', '/reviews', '/contacts', '/privacy'];
const results = [];
for (const width of [375, 430, 768, 1440, 1920]) {
  const context = await browser.newContext({ viewport: { width, height: 950 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  for (const route of routes) {
    if (process.env.AUDIT_ROUTES && !process.env.AUDIT_ROUTES.split(',').includes(route)) continue;
    const errors = [], failed = [];
    const onError = e => errors.push(e.message);
    const onConsole = e => { if (e.type() === 'error') errors.push(e.text()); };
    const onResponse = r => { if (r.status() >= 400) failed.push({ url: r.url(), status: r.status() }); };
    page.on('pageerror', onError); page.on('console', onConsole); page.on('response', onResponse);
    try {
      const response = await page.goto('http://127.0.0.1:3000' + route, { waitUntil: 'networkidle', timeout: 60000 });
      // Exercise scroll-triggered content before checking the entire page.
      await page.evaluate(async () => { for(let y=0;y<document.body.scrollHeight;y+=700) { window.scrollTo(0,y); await new Promise(r=>setTimeout(r,50)); } window.scrollTo(0,0); });
      await page.waitForTimeout(300);
      const dom = await page.evaluate(() => ({
        title: document.title, h1: [...document.querySelectorAll('h1')].map(e=>e.textContent),
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        description: document.querySelector('meta[name="description"]')?.content,
        overflow: document.documentElement.scrollWidth > innerWidth,
        clippedHeadings: [...document.querySelectorAll('h1,h2')].filter(e=>e.getClientRects().length && (e.getBoundingClientRect().right > innerWidth+1 || e.scrollWidth > e.clientWidth+1)).map(e=>e.textContent),
        hiddenContentHeadings: [...document.querySelectorAll('h1,h2,h3')].filter(h=>h.getClientRects().length && (()=>{for(let el=h;el;el=el.parentElement)if(getComputedStyle(el).opacity==='0')return true;return false;})()).map(h=>h.textContent),
        brokenImages: [...document.images].filter(i => i.complete && !i.naturalWidth).map(i=>i.src),
        links: [...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),
        jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map(e=>JSON.parse(e.textContent)),
      }));
      let violations = [];
      if(width === 375 || width === 1440) violations = (await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>({ id:v.id, impact:v.impact, nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,8) }));
      await page.screenshot({ path: new URL(`${route.replaceAll('/','_') || 'home'}-${width}.png`,out).pathname.replace(/^\/(\w:)/,'$1'), fullPage: true });
      results.push({ route, width, status:response.status(), ...dom, errors, failed, violations });
      console.log(JSON.stringify({ route,width,status:response.status(),overflow:dom.overflow,broken:dom.brokenImages.length,errors:errors.length,axe:violations.map(v=>v.id) }));
    } catch(e) {results.push({route,width,error:String(e)});console.log(route,width,String(e));}
    page.off('pageerror',onError); page.off('console',onConsole); page.off('response',onResponse);
    await fs.writeFile(new URL('results.json',out),JSON.stringify(results,null,2));
  }
  await context.close();
}
await browser.close();

if(results.some(r=>r.error||r.status!==200||r.overflow||r.brokenImages?.length||r.errors?.length||r.failed?.length||r.violations?.length||r.clippedHeadings?.length||r.hiddenContentHeadings?.length))process.exitCode=1;
