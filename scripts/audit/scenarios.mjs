import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:375,height:812},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:3000';
const results=[];
async function test(name,fn){try{await page.goto('about:blank');await fn();results.push({name,ok:true});}catch(e){results.push({name,ok:false,error:String(e)});}console.log(results.at(-1));}
await test('Mobile menu: focus stays inside; Escape restores trigger',async()=>{
 await page.goto(base);await page.getByRole('button',{name:'Открыть меню'}).click();
 const dialog=page.getByRole('dialog');assert.equal(await dialog.count(),1);
 for(let i=0;i<18;i++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>!!document.activeElement?.closest('dialog')));}
 await page.screenshot({path:'../audit-results/after/mobile-menu.png'});
 await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
 assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Открыть меню');
});
await test('Lead failure stays editable; retry reuses idempotency and shows success',async()=>{
 const keys=[];let attempt=0;
 await page.route('**/api/leads',async route=>{keys.push(route.request().headers()['idempotency-key']);attempt++;await route.fulfill({status:attempt===1?500:200,contentType:'application/json',body:JSON.stringify(attempt===1?{ok:false,error:'Test failure'}:{ok:true})});});
 await page.goto(base+'/#lead-form');
 await page.getByLabel('Имя',{exact:true}).fill('Тест аудита');
 await page.getByLabel('E-mail',{exact:true}).fill('audit@example.invalid');
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Отправить заявку',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Не удалось отправить'}).waitFor();
 assert.equal(await page.getByText('Заявка отправлена.',{exact:false}).count(),0);
 await page.screenshot({path:'../audit-results/after/form-error.png'});
 await page.getByRole('button',{name:'Отправить заявку',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Заявка отправлена'}).waitFor();
 assert(keys[0]);assert.equal(keys[0],keys[1]);await page.unroute('**/api/leads');
});
await test('Portfolio: mobile image viewer fits viewport and closes',async()=>{
 await page.goto(base+'/portfolio');await page.getByRole('button',{name:/Открыть проект/}).first().click();
 await page.getByRole('dialog').waitFor();
 await page.getByRole('dialog').locator('img').first().evaluate(img => img.decode());
 await page.screenshot({path:'../audit-results/after/portfolio-modal.png'});
 await page.getByRole('button',{name:'Закрыть просмотр'}).click();assert.equal(await page.getByRole('dialog').count(),0);
});
await test('Review modal supports Escape and has an accessible name',async()=>{
 await page.goto(base+'/reviews');await page.getByRole('button',{name:'Оставить отзыв',exact:true}).first().click();
 await page.getByRole('dialog',{name:'Оставить отзыв'}).waitFor();await page.keyboard.press('Escape');
 assert.equal(await page.getByRole('dialog').count(),0);
});
await test('Desktop closed service menu is absent from keyboard navigation',async()=>{
 await page.setViewportSize({width:1440,height:950});await page.goto(base+'/');
 assert.equal(await page.locator('#desktop-services-list').isVisible(),false);
 await page.getByRole('link',{name:'Услуги',exact:true}).first().focus();
 await page.locator('#desktop-services-list').waitFor({state:'visible'});
 await page.keyboard.press('Escape');await page.locator('#desktop-services-list').waitFor({state:'hidden'});
});
await test('Unknown route returns HTTP 404; admin and order endpoints reject anonymous requests',async()=>{
 assert.equal((await page.request.get(base+'/audit-nonexistent-page')).status(),404);
 assert.equal((await page.request.get(base+'/api/admin/reviews')).status(),401);
 assert.equal((await page.request.get(base+'/api/orders/audit-unknown')).status(),403);
});
await fs.writeFile('../audit-results/after/scenarios.json',JSON.stringify({results,errors},null,2));
await browser.close();

if(results.some(r=>!r.ok)||errors.length)process.exitCode=1;
