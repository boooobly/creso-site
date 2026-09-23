import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
const base='http://127.0.0.1:3000';
async function test(name,fn){
 const page=await browser.newPage({viewport:{width:375,height:812},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('credomir_cookie_notice_accepted','true'));
 // Audit submissions are intercepted. Never create orders or send notifications.
 await page.route('**/api/**',route=>['GET','HEAD'].includes(route.request().method())||route.request().url().includes('/api/quotes/')?route.continue():route.abort('blockedbyclient'));
 try{await fn(page);assert.deepEqual(errors,[]);results.push({name,ok:true});}catch(e){results.push({name,ok:false,error:String(e),errors});}
 await page.close();console.log(results.at(-1));
}
await test('Wide-format calculator transfers dimensions and material to a successful mocked request',async page=>{
 let submitted;
 await page.route('**/api/wide-format-order',async route=>{submitted=route.request().postData();await route.fulfill({json:{ok:true}});});
 await page.goto(base+'/wide-format-printing',{waitUntil:'networkidle'});
 await page.getByLabel('Ширина (м)',{exact:true}).fill('2');await page.getByLabel('Высота (м)',{exact:true}).fill('1.5');
 await page.getByRole('button',{name:'Заказать печать',exact:true}).click();
 assert.equal(await page.getByLabel('Ширина (мм)',{exact:true}).inputValue(),'2000');
 assert.equal(await page.getByLabel('Высота (мм)',{exact:true}).inputValue(),'1500');
 await page.getByLabel('Имя *',{exact:true}).fill('Тест аудита');await page.getByLabel('Телефон *',{exact:true}).fill('79990000000');
 await page.getByRole('checkbox',{name:/Я согласен/}).check();await page.getByRole('button',{name:'Отправить заявку',exact:true}).click();
 await page.getByText('Заявка отправлена. Менеджер свяжется с вами в ближайшее время.',{exact:true}).waitFor();assert(submitted.includes('2000'));assert(submitted.includes('1500'));
});
await test('Print calculator updates the total for lamination',async page=>{
 await page.goto(base+'/print',{waitUntil:'networkidle'});
 const total=page.getByText('Окончательная стоимость',{exact:true}).locator('..');const before=await total.innerText();
 await page.getByRole('checkbox',{name:'Ламинация (+15%)'}).check();
 assert.notEqual(await total.innerText(),before);
 await page.getByRole('button',{name:'Двусторонняя',exact:true}).click();
 assert(await page.getByRole('complementary').getByText('Печать: Двусторонняя',{exact:true}).isVisible());
});
await test('Mug designer adds text and returns an exported preview to the form',async page=>{
 await page.goto(base+'/services/mugs',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Открыть конструктор макета',exact:true}).click();
 const dialog=page.getByRole('dialog');await dialog.waitFor();
 await page.getByRole('button',{name:'Добавить текст',exact:true}).click();
 await page.locator('canvas').first().waitFor();
 await page.getByRole('button',{name:'Применить макет',exact:true}).click();
 await page.getByText('Макет из конструктора',{exact:true}).waitFor();
 await page.getByAltText('Превью макета кружки').evaluate(img=>img.decode());
 await page.screenshot({path:'../audit-results/after/mug-designer-result.png'});
});
await test('Mug order can be submitted without an optional attachment (mocked API)',async page=>{
 let calls=0;await page.route('**/api/requests/mugs',async route=>{calls++;await route.fulfill({json:{ok:true}});});
 await page.goto(base+'/services/mugs',{waitUntil:'networkidle'});
 await page.getByLabel('Имя *',{exact:true}).fill('Тест аудита');await page.getByLabel('Телефон *',{exact:true}).fill('79990000000');
 await page.getByRole('checkbox',{name:/Я согласен/}).check();await page.getByRole('button',{name:'Отправить заявку',exact:true}).click();
 await page.getByText('Спасибо! Мы свяжемся с вами в ближайшее время.',{exact:true}).waitFor();assert.equal(calls,1);
});
await test('Outdoor gallery loads a full-size photo and closes with its visible button',async page=>{
 await page.goto(base+'/outdoor-advertising',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:/Открыть/}).filter({has:page.locator('img')}).first().click();
 const dialog=page.getByRole('dialog');await dialog.waitFor();await dialog.locator('img').evaluate(img=>img.decode());
 await page.getByRole('button',{name:'Закрыть просмотр',exact:true}).click();await dialog.waitFor({state:'hidden'});
});
await test('Baget dimensions and optional materials remain editable on mobile',async page=>{
 await page.goto(base+'/baget',{waitUntil:'networkidle'});
 await page.getByLabel('Видимая ширина от, мм',{exact:true}).fill('400');
 await page.getByRole('button',{name:/Дополнительные опции/}).click();
 const checkbox=page.getByRole('checkbox',{name:'Паспарту',exact:true});await checkbox.check();assert(await checkbox.isChecked());
 await page.getByRole('button',{name:'Изменить багет',exact:true}).click();
 await page.getByRole('dialog',{name:'Мобильный выбор багета'}).waitFor();
 await page.getByRole('button',{name:'Фильтры',exact:false}).click();
 await page.getByRole('dialog').getByLabel('Поиск по артикулу',{exact:true}).fill('1611');
 await page.screenshot({path:'../audit-results/after/baget-selection.png'});
});
await fs.writeFile('../audit-results/after/extended-scenarios.json',JSON.stringify(results,null,2));await browser.close();
if(results.some(r=>!r.ok))process.exitCode=1;
