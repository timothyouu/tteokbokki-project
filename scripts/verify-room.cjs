const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1200,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:5173');
 await page.getByRole('heading',{name:'Rice cakes & noodles'}).waitFor();
 async function hold(key,ms){await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);}
 // The left central aisle passes the player's table and all dining booths.
 await hold('s',7200);await page.getByRole('heading',{name:'Entrance & host',exact:true}).waitFor({timeout:4000});
 await page.screenshot({path:__dirname+'/restaurant-dining.png'});
 await hold('w',7600);await page.getByRole('heading',{name:'Rice cakes & noodles'}).waitFor();
 // Travel around the west end of the buffet to the drinks counter.
 await hold('a',1100);await hold('w',1550);
 await page.getByRole('heading',{name:'Tea & drinks',exact:true}).waitFor({timeout:4000});
 // Look left toward the dispenser. Pick via raycasting, never internal game state.
 await page.mouse.move(300,350);await page.mouse.down();await page.mouse.move(823,350,{steps:20});await page.mouse.up();
 await page.waitForTimeout(600);await page.screenshot({path:__dirname+'/restaurant-drinks.png'});
 let filled=false;
 for(let y=400;y<=790&&!filled;y+=65)for(let x=50;x<=1100&&!filled;x+=100){
  await page.mouse.move(x,y);const hint=await page.locator('.interaction-hint').innerText();
  if(/^(Barley tea|Cold water) · click to fill/.test(hint)){await page.mouse.click(x,y);filled=true;}
 }
 assert.ok(filled,'A nearby drink dispenser must be clickable');
 await page.getByRole('button',{name:/· sip$/}).waitFor();
 // Fresh page for the mirrored sauce route, then check the selected sauce changes.
 await page.reload();await page.getByRole('heading',{name:'Rice cakes & noodles'}).waitFor();
 await hold('d',4150);await hold('w',1550);
 await page.getByRole('heading',{name:'Sauce bar',exact:true}).waitFor({timeout:4000});
 await page.mouse.move(850,350);await page.mouse.down();await page.mouse.move(327,350,{steps:20});await page.mouse.up();await page.waitForTimeout(600);
 await page.screenshot({path:__dirname+'/restaurant-sauces.png'});
 let poured=false;
 for(let y=700;y<=800&&!poured;y+=35)for(let x=850;x<=1000&&!poured;x+=55){
  await page.mouse.move(x,y);const hint=await page.locator('.interaction-hint').innerText();
  if(hint.includes('ladle into your pot')){await page.mouse.click(x,y);poured=true;}
 }
 assert.ok(poured,'A nearby sauce bowl must be clickable');
 assert.match(await page.locator('.toast').innerText(),/poured into your pot/);
 assert.deepEqual(errors,[]);
 console.log('PASS: walk entire dining aisle to entrance, return to buffet, reach drinks and sauce bar, raycast dispensers and bowls, no browser errors.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
