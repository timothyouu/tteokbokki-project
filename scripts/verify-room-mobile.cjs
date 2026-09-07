const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:5173/?view=restaurant');await page.getByRole('heading',{name:'Entrance & host',exact:true}).waitFor();
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
for(const name of ['Walk forward','Walk backward','Walk left','Walk right','Change sauce']){const box=await page.getByRole('button',{name,exact:true}).boundingBox();assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=390&&box.y+box.height<=844,name);}
await page.getByRole('button',{name:'How to play',exact:true}).click();await page.getByRole('heading',{name:'A little evening ritual.',exact:true}).waitFor();await page.getByRole('button',{name:'Close help',exact:true}).click();assert.deepEqual(errors,[]);console.log('PASS: mobile entrance renders, no horizontal overflow, walking and sauce controls fit, help opens and closes, no page errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
