import {chromium} from 'playwright';import fs from 'node:fs/promises';
const data=JSON.parse(await fs.readFile('../audit-results/after/results.json','utf8')).filter(r=>r.width===390);
const browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext();const page=await context.newPage();
const base='http://127.0.0.1:3000';const failures=[];const incoming=new Map(data.map(r=>[r.route,[]]));const urls=new Set();
for(const row of data){for(const href of row.links){if(!href?.startsWith('/') && !href?.startsWith('#'))continue;const url=new URL(href,base+row.route);urls.add(url.href);if(url.pathname!==row.route&&incoming.has(url.pathname))incoming.get(url.pathname).push(row.route);}}
for(const url of urls){const u=new URL(url);try{const res=await page.request.get(url);if(res.status()>=400)failures.push({url,status:res.status()});if(u.hash){const html=await res.text();const id=decodeURIComponent(u.hash.slice(1));if(!html.includes(`id="${id}"`))failures.push({url,missingFragment:id});}}catch(e){failures.push({url,error:String(e)});}}
const special={};for(const route of ['/robots.txt','/sitemap.xml','/blog','/admin/login','/audit-nonexistent-page','/contacts/','/contacts?utm_source=audit']){const res=await page.request.get(base+route,{maxRedirects:0});special[route]={status:res.status(),location:res.headers().location,robots:res.headers()['x-robots-tag']};}
const result={checkedUrls:urls.size,failures,orphans:[...incoming].filter(([route,refs])=>route!=='/'&&!refs.length).map(([route])=>route),duplicates:{titles:data.filter((r,i)=>data.findIndex(v=>v.title===r.title)!==i).map(r=>r.route),descriptions:data.filter((r,i)=>data.findIndex(v=>v.description===r.description)!==i).map(r=>r.route)},special};
await fs.writeFile('../audit-results/after/seo-links.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));await browser.close();

if(failures.length||result.orphans.length||result.duplicates.titles.length||result.duplicates.descriptions.length)process.exitCode=1;
