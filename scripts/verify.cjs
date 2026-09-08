const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.APP_URL||'http://localhost:5173');
  const button=name=>page.getByRole('button',{name,exact:true});
  await button('Your pot 0').waitFor();
  assert.equal(await page.locator('canvas').count(),1);
  assert.equal(await page.getByRole('dialog').count(),0);
  assert.equal(await page.getByRole('button',{name:/Take a seat/}).count(),0);
  await button('Your pot 0').click();
  for(let i=0;i<4;i++)await button('Add Rice cakes').click();
  assert.equal(await button('Add Rice cakes').isEnabled(),false);
  await button('Remove Rice cakes').click();
  for(const name of ['Cheese rice cakes','Sliced rice cakes','Ramyun','Glass noodles','Fish cakes'])await button(`Add ${name}`).click();
  await button('Savory').click();
  for(const name of ['Sausage','Shrimp','Fish balls','Fried mandu','Boiled eggs','Mozzarella'])await button(`Add ${name}`).click();
  await button('Vegetables').click();
  for(const name of ['Enoki mushrooms','Shiitake mushrooms','Bok choy','Cabbage','Scallions','Onion'])await button(`Add ${name}`).click();
  assert.match(await page.locator('.drawer-note').innerText(),/20 \/ 24/);
  for(let i=0;i<3;i++)await button('Add Cabbage').click();
  await button('Add Onion').click();
  assert.match(await page.locator('.drawer-note').innerText(),/24 \/ 24/);
  assert.equal(await button('Add Shiitake mushrooms').isEnabled(),false);
  await button('Jjajang').click();await page.getByRole('slider',{name:'Spice level'}).fill('3');
  await button('Close pot menu').click();for(const [key,duration] of [['s',2200],['d',1850]]){await page.keyboard.down(key);await page.waitForTimeout(duration);await page.keyboard.up(key);}await button('Light burner').waitFor();
  await button('Light burner').click();await page.waitForTimeout(450);await button('Turn off burner').click();
  const paused=await page.locator('progress').getAttribute('value');await page.waitForTimeout(450);assert.ok(Number(await page.locator('progress').getAttribute('value'))>=Number(paused));
  await page.getByRole('slider',{name:'Burner heat'}).fill('3');await button('Light burner').click();
  await button('Stir').click();
  await button('Pick up chopsticks ↗').waitFor({timeout:90000});await button('Pick up chopsticks ↗').click();
  for(let i=0;i<24;i++){await button('Take a bite 🥢').click();await page.waitForTimeout(680);}
  await button('Make another pot ↗').click();assert.equal(await page.getByRole('button',{name:/Take a seat/}).count(),0);
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await button('Your pot 0').click();await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
  await button('How to play').click();await button('Close help').click();
  assert.deepEqual(errors,[]);
  if(process.env.SCREENSHOT_PATH)await page.screenshot({path:process.env.SCREENSHOT_PATH});
  console.log('PASS: closed-by-default UI, all 18 ingredients, per-item and total caps, sauce/spice, paused burner, stirring, cooking, 24 bites, reset, mobile width, dialogs, no page errors.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});


