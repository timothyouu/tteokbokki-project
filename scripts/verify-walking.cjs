const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1200,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:5173');
 const button=name=>page.getByRole('button',{name,exact:true});
 await button('Your pot 0').click({timeout:8000});await button('Add Rice cakes').click();await button('Close pot menu').click();
 assert.equal(await page.getByRole('button',{name:/Take a seat/}).count(),0);
 async function hold(key,ms){await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);}
 await hold('s',2200);await hold('d',1850);
 await button('Light burner').waitFor({timeout:7000});
 assert.equal(await button('Your pot 1').count(),1);
 await button('Stand up').click();await page.waitForTimeout(1000);
 assert.equal(await button('Light burner').count(),0);
 assert.equal(await button('Walk forward').count(),1);
 await hold('a',1800);await hold('w',2600);
 assert.equal(await page.getByRole('heading',{name:'Rice cakes & noodles'}).count(),1);
 assert.equal(await button('Light burner').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS: walk around table to chair, automatic seating with pot, no travel button, standing up stays standing, walk back to buffet, no page errors.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});


