import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import fs from 'node:fs/promises';
const phase=process.argv[2]||'before';
const output=new URL(`../audit-results/${phase}/`,import.meta.url);
await fs.mkdir(output,{recursive:true});
const chrome=await launch({chromePath:process.env.CHROME_PATH,chromeFlags:['--headless','--no-sandbox']});
try {
 for(const route of ['/','/wide-format-printing','/contacts']) {
  const result=await lighthouse('http://127.0.0.1:3000'+route,{port:chrome.port,output:['json','html'],onlyCategories:['performance','accessibility','best-practices','seo']});
  const name=route.replaceAll('/','_');
  await fs.writeFile(new URL(`lighthouse${name}.json`,output),result.report[0]);
  await fs.writeFile(new URL(`lighthouse${name}.html`,output),result.report[1]);
  console.log(route,JSON.stringify(Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,v.score]))),JSON.stringify(Object.fromEntries(['largest-contentful-paint','cumulative-layout-shift','total-blocking-time'].map(k=>[k,result.lhr.audits[k].numericValue]))));
 }
}finally {await chrome.kill();}
