import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
const routes=JSON.parse(await fs.readFile('../audit-results/after/results.json','utf8')).filter(r=>r.width===390).map(r=>r.route);
const selectedRoutes=process.env.AUDIT_ROUTES?routes.filter(route=>process.env.AUDIT_ROUTES.split(',').includes(route)):routes;
const reportPath=process.env.AUDIT_ROUTES?'../audit-results/after/theme-recheck.json':'../audit-results/after/theme-audit.json';
for(const width of [390,768,1440,1920]){
 const context=await browser.newContext({viewport:{width,height:950},colorScheme:'dark',reducedMotion:'no-preference'});
 const page=await context.newPage();
 await page.addInitScript(()=>{localStorage.setItem('theme','dark');localStorage.setItem('credomir_cookie_notice_accepted','true');});
 for(const route of selectedRoutes){
  const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
  await page.goto('http://127.0.0.1:3000'+route,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{document.documentElement.style.scrollBehavior='auto';for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,80));}window.scrollTo(0,0);});
  await page.waitForTimeout(800);
  const violations=(width===390||width===1440)?(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,5)})):[];
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}));
  const hidden=await page.locator('h1,h2').evaluateAll(headings=>headings.filter(h=>{for(let el=h;el;el=el.parentElement)if(getComputedStyle(el).opacity==='0')return true;return false;}).map(h=>h.textContent));
  const dark=await page.locator('html').getAttribute('class');
  results.push({route,width,dark,errors,hidden,violations,...layout});console.log(JSON.stringify({route,width,errors,hidden,overflow:layout.overflow,broken:layout.brokenImages.length,axe:violations.map(v=>v.id)}));
  await page.screenshot({path:`../audit-results/after/dark${route.replaceAll('/','_')}-${width}.png`,fullPage:true});
  page.off('pageerror',onError);
  await fs.writeFile(reportPath,JSON.stringify(results,null,2));
 }
 await context.close();
}
await browser.close();

if(results.some(r=>r.errors.length||r.hidden.length||r.violations.length||r.overflow||r.brokenImages.length))process.exitCode=1;
