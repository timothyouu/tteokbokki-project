const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1200,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173');await page.getByRole('heading',{name:'Rice cakes & noodles'}).waitFor();
 await page.waitForTimeout(300);
 const heading=()=>page.locator('.location h1').innerText();
 async function slide(from,to){await page.mouse.move(from,320);await page.mouse.down({button:'right'});await page.mouse.move(to,320,{steps:12});await page.mouse.up({button:'right'});}
 await slide(180,650);assert.equal(await heading(),'Savory favorites');
 assert.equal(await page.getByRole('button',{name:'Your pot 0',exact:true}).count(),1);
 await slide(180,1100);assert.equal(await heading(),'Fresh vegetables');
 await slide(180,1100);assert.equal(await heading(),'Fresh vegetables');
 await page.mouse.move(180,320,{steps:10});assert.equal(await heading(),'Fresh vegetables');
 await slide(1000,160);assert.equal(await heading(),'Rice cakes & noodles');
 await slide(1000,160);assert.equal(await heading(),'Rice cakes & noodles');
 await page.mouse.move(600,450);await page.mouse.down({button:'right'});await page.mouse.up({button:'right'});
 assert.equal(await page.getByRole('button',{name:'Your pot 0',exact:true}).count(),1);
 await page.getByRole('button',{name:'Next buffet station',exact:true}).click();assert.equal(await heading(),'Savory favorites');
 await page.mouse.move(300,300);await page.mouse.down({button:'right'});await page.mouse.move(600,300,{steps:6});await page.mouse.up({button:'right'});
 assert.equal(await heading(),'Fresh vegetables');
 assert.deepEqual(errors,[]);
 console.log('PASS: continuous right-drag both directions, clamped ends, release stops movement, right-click does not pick food, station buttons still work, no page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
