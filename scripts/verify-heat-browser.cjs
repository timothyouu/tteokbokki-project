const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1200,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173');
 const button=name=>page.getByRole('button',{name,exact:true});
 await button('Your pot 0').click();await button('Add Rice cakes').click();await button('Close pot menu').click();for(const [key,duration] of [['s',2200],['d',1850]]){await page.keyboard.down(key);await page.waitForTimeout(duration);await page.keyboard.up(key);}await button('Light burner').waitFor();
 assert.doesNotMatch(await page.locator('.interaction-hint').innerText(),/stir/i);assert.doesNotMatch(await page.locator('.toast').innerText(),/stir/i);
 assert.equal(await button('Stir').isEnabled(),false);
 await button('Light burner').click();await button('Stir').click();
 assert.equal(Number(await page.locator('progress').getAttribute('value')),0);
 await page.getByRole('slider',{name:'Burner heat'}).fill('3');
 await page.getByText('Rolling boil · 100°C',{exact:true}).waitFor({timeout:25000});
 await page.getByRole('slider',{name:'Burner heat'}).fill('1');
 await page.waitForFunction(()=>document.querySelector('.interaction-hint small')?.textContent?.startsWith('Gentle simmer'),{},{timeout:10000});
 await button('Turn off burner').click();
 assert.equal(await button('Stir').isEnabled(),false);
 assert.doesNotMatch(await page.locator('.interaction-hint').innerText(),/stir/i);
 await page.waitForTimeout(1000);
 const status=await page.locator('.interaction-hint small').innerText();const temperature=Number(status.match(/(\d+)°C/)[1]);assert.ok(temperature>80&&temperature<100);
 assert.deepEqual(errors,[]);
 console.log('PASS: no premature stirring prompts; cold stirring cannot cook food; high heat reaches rolling boil; lowering heat softens boil; shutoff disables stirring and cools gradually; no page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

