import {useEffect,useRef,useState} from 'react';

import {createWorld} from './world';
import {ingredients,stations,emptySelection,totalPortions,sauces,type IngredientId,type Stage} from './data';
import {advanceHeat,coldPot,cookingPrompt,heatDescription} from './thermal';
import './style.css';
export default function App(){
 const [selection,setSelection]=useState(emptySelection);
 const [stage,setStage]=useState<Stage>('pick');
 const [station,setStation]=useState(0);
 const [zone,setZone]=useState('The buffet');
 const [drink,setDrink]=useState('');
 const [hasCup,setHasCup]=useState(false);
 const [sips,setSips]=useState(0);
 const [parked,setParked]=useState(false);
 const resumeStage=useRef<Stage>('cook');
 const lastSip=useRef(0);
 const [sauce,setSauce]=useState(0);
 const [spice,setSpice]=useState(2);
 const [heat,setHeat]=useState(2);
 const [cooking,setCooking]=useState(false);
 const [thermal,setThermal]=useState(coldPot);
 const progress=thermal.progress;
 const thermalLoad=useRef(0);
 const [bites,setBites]=useState(0);
 const [drawer,setDrawer]=useState(false);
 const [help,setHelp]=useState(false);
 const [message,setMessage]=useState('');
 const [hover,setHover]=useState('');
 const [sceneError,setSceneError]=useState(false);
 const host=useRef<HTMLDivElement>(null);
 const world=useRef<ReturnType<typeof createWorld>|null>(null);
 const action=useRef<(id:string)=>void>(()=>{});
 const lastBite=useRef(0);
 const total=totalPortions(selection);
 const ready=progress>=100;
 function notify(text:string):void{setMessage(text);}
 function add(id:IngredientId):void{
  if(stage!=='pick')return;if(parked){notify('Your pot is on Table 04. Pick it up before adding ingredients.');return;}
  if(total>=24){notify('Your pot is full. Take it to the table.');return;}
  if(selection[id]>=4){notify('Four portions of this one is plenty. Try something else.');return;}
  setSelection(s=>({...s,[id]:s[id]+1}));world.current?.scoop(id);
  notify(`${ingredients.find(i=>i.id===id)!.name} · added`);
 }
 function startTable():void{if(!world.current?.canSit())return;if(parked){setStage(ready?'eat':resumeStage.current);setDrawer(false);notify('Welcome back. Your pot is right where you left it.');return;}if(!total){notify('Pick something from a tray first.');return;}thermalLoad.current=total;setParked(true);setStage('cook');setDrawer(false);notify('Click the burner dial to light it.');}
 function burner():void{if(stage!=='cook'||ready)return;setCooking(c=>!c);setHover('');setMessage('');}
 function stir():void{if(stage!=='cook'||ready)return;if(!cooking){notify('Light the burner first.');return;}world.current?.stir();}
 function takeBite(id?:IngredientId):void{
  if(stage!=='eat'||!total||performance.now()-lastBite.current<650)return;
  const selected=id&&selection[id]>0?id:ingredients.find(i=>selection[i.id]>0)!.id;
  lastBite.current=performance.now();world.current?.bite(selected);
  setSelection(s=>({...s,[selected]:Math.max(0,s[selected]-1)}));setBites(b=>b+1);
  notify(`${ingredients.find(i=>i.id===selected)!.name} · delicious`);
 }
 function standUp():void{resumeStage.current=stage;setCooking(false);setParked(true);setStage('pick');setHover('');notify('Pot left on Table 04 · burner off. You can get a drink.');}
 function sip():void{if(!hasCup||!sips||performance.now()-lastSip.current<700)return;lastSip.current=performance.now();setSips(n=>Math.max(0,n-1));world.current?.sip();notify(sips===1?'Cup empty · refill at the drink station':drink+' · a refreshing sip');}
 function reset():void{setParked(false);setSelection(emptySelection());setStage('pick');setStation(0);setThermal(coldPot());setCooking(false);setBites(0);setDrawer(false);notify('A fresh pot. Make it your own.');}
 action.current=(id)=>{
  if(id==='pickup-pot'&&stage==='pick'&&parked&&world.current?.nearPot()){setParked(false);setThermal(coldPot());notify('Pot picked up. Add ingredients at the buffet.');return;}
  if(id==='cup'&&stage==='pick'){setHasCup(true);notify(hasCup?'You already have a cup. Choose a dispenser.':'Cup picked up · choose tea or water');return;}
  if(id==='sip'){sip();return;}
  if(id.startsWith('sauce:')&&stage==='pick'){if(parked){notify('Bring your pot to the sauce bar first.');return;}const index=Number(id.slice(6));if(sauces[index]){setSauce(index);notify(sauces[index].name+' · poured into your pot');}return;}
  if(id.startsWith('drink:')&&stage==='pick'){if(!hasCup){notify('Pick up a clean cup from the rack first.');return;}setDrink(id.slice(6));setSips(3);notify(id.slice(6)+' · cup filled (3 sips)');return;}
  if(id==='table'){startTable();return;}
  if(id==='ready'){if(ready)setStage('eat');return;}
  if(id==='burner'){burner();return;}
  if(id==='stir'){stir();return;}
  if(id.startsWith('bite:')){takeBite(id.slice(5) as IngredientId);return;}
  if(id==='bite'){takeBite();return;}
  if(ingredients.some(i=>i.id===id))add(id as IngredientId);
 };
 useEffect(()=>{try{world.current=createWorld(host.current!,id=>action.current(id),setHover,setStation,setZone);}catch(error){console.error(error);setSceneError(true);setDrawer(true);}return()=>world.current?.dispose();},[]);
 useEffect(()=>{world.current?.update(selection,stage,station,sauce,cooking,ready,thermal.temperature,thermal.boil,heat,parked,hasCup,sips,drink);},[selection,stage,station,sauce,cooking,ready,thermal.temperature,thermal.boil,heat,parked,hasCup,sips,drink]);
 useEffect(()=>{if(stage==='pick'&&!parked)return;let previous=performance.now();const timer=setInterval(()=>{const now=performance.now();const seconds=(now-previous)/1000;previous=now;setThermal(state=>advanceHeat(state,cooking,heat,thermalLoad.current,seconds));},100);return()=>clearInterval(timer);},[stage,cooking,heat,parked]);
 useEffect(()=>{if(ready){setCooking(false);setHover('');notify(stage==='pick'?'Your pot is ready on Table 04. Return to your chair.':'Your pot is ready. The burner is now off. Pick up the chopsticks.');}},[ready]);
 useEffect(()=>{if(!message)return;const timer=setTimeout(()=>setMessage(''),2600);return()=>clearTimeout(timer);},[message]);
 useEffect(()=>{const onKeyUp=(e:KeyboardEvent)=>world.current?.setMovement(e.key.toLowerCase(),false);const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){setDrawer(false);setHelp(false);return;}if(help||drawer||(e.target instanceof HTMLElement&&['INPUT','TEXTAREA'].includes(e.target.tagName)))return;
  if(stage==='pick'&&['w','a','s','d'].includes(e.key.toLowerCase())){e.preventDefault();world.current?.setMovement(e.key.toLowerCase(),true);}
  if(e.key==='e'||e.key==='E'){e.preventDefault();world.current?.interact();}
 };window.addEventListener('keydown',onKey);window.addEventListener('keyup',onKeyUp);return()=>{world.current?.stopMovement();window.removeEventListener('keydown',onKey);window.removeEventListener('keyup',onKeyUp);};},[stage,drawer,help]);
 useEffect(()=>{if(!help&&!drawer)return;const previous=document.activeElement as HTMLElement|null;const dialog=document.querySelector<HTMLElement>('[role=dialog]');dialog?.querySelector<HTMLButtonElement>('button')?.focus();const onKeyUp=(e:KeyboardEvent)=>world.current?.setMovement(e.key.toLowerCase(),false);const onKey=(e:KeyboardEvent)=>{if(e.key!=='Tab'||!dialog)return;const controls=Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled),input,a[href]'));const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}};document.addEventListener('keydown',onKey);return()=>{document.removeEventListener('keydown',onKey);previous?.focus();};},[help,drawer]);
 const exploreHint=zone==='Tea & drinks'?'Click a dispenser to fill your cup':zone==='Sauce bar'?'Click a sauce bowl to pour it into your pot':zone==='The buffet'?'Click a tray to serve yourself':'Explore the restaurant · the ingredient buffet is beside the open kitchen';
 const hint=stage==='pick'?(parked?(zone==='Tea & drinks'?(!hasCup?'Pick up a clean cup · then choose tea or water':sips?'Your drink is ready · sip or return to your seat':'Choose a dispenser to fill your cup'):'Your pot is on Table 04 · walk back to your chair to sit'):total?'Carry your pot to Table 04 · walk behind the table to your chair':exploreHint):stage==='cook'?cookingPrompt(cooking,thermal.temperature,ready):total?'Click a piece of food to pick it up':'A pot well enjoyed.';
 return <div className="restaurant">
  <div ref={host} className="world" aria-label="Interactive restaurant"/>
  <header className="topbar"><a href="/" className="brand">♨ <span>tteok table.</span></a><div className="evening">SEOUL AFTER DARK <i/> TABLE 04</div><nav><button onClick={()=>{setHelp(false);setDrawer(d=>!d);}} aria-expanded={drawer}>Your pot <b>{total}</b></button><button className="help-button" aria-label="How to play" onClick={()=>{setDrawer(false);setHelp(true);}}>?</button></nav></header>
  <div className="location"><span>{stage==='pick'?'TTEOK TABLE · EXPLORE':'YOUR TABLE'}</span><h1>{stage==='pick'?(zone==='The buffet'?stations[station]:zone):stage==='cook'?(ready?'Ready to enjoy.':!cooking?'Your cooking table.':thermal.temperature<65?'Warming up.':'Let it simmer.'):total?'잘 먹겠습니다.':'That hit the spot.'}</h1></div>
  {sceneError&&<p className="graphics-error">3D graphics are unavailable in this browser. The Your pot menu has all ingredient controls.</p>}
  {stage==='pick'&&!drawer&&!help&&<div className="crosshair" aria-hidden="true"/>}
  <div className="interaction-hint" role="status">{hover||hint}<small>{stage==='pick'?'WASD to walk · left-drag to look around · right-drag to slide':`${heatDescription(thermal.temperature,thermal.boil)} · ${Math.round(thermal.temperature)}°C`}</small></div>
  <div className="bottom-bar">
   {stage==='pick'?(zone==='The buffet'?<div className="aisle-controls"><button aria-label="Previous buffet station" disabled={station===0} onClick={()=>setStation(s=>s-1)}>←</button><span>{station+1} <i>/ 3</i></span><button aria-label="Next buffet station" disabled={station===2} onClick={()=>setStation(s=>s+1)}>→</button></div>:<span className="movement-hint">EXPLORE THE RESTAURANT</span>):<button className="quiet-button" onClick={standUp}>Stand up</button>}
   {hasCup&&<button className="quiet-button" disabled={!sips} onClick={sip}>{sips?`${drink} · sip (${sips})`:'Empty cup · refill'}</button>}
   {stage==='pick'&&parked&&zone==='Table 04'&&<button className="quiet-button" onClick={()=>action.current('pickup-pot')}>Carry pot to buffet</button>}
   <span className="movement-hint">RIGHT-DRAG TO SLIDE <i>·</i> {stage==='pick'?'WASD TO WALK · E TO PICK':'CLICK TO INTERACT'}</span>
   <div className="context-actions">{stage==='pick'?<><button className="quiet-button sauce-choice" onClick={()=>setSauce(s=>(s+1)%sauces.length)} disabled={parked} aria-label="Change sauce"><i style={{background:sauces[sauce].color}}/>{sauces[sauce].name} ↻</button><div className="walk-pad" aria-label="Walking controls">{(['w','a','s','d'] as const).map((key)=><button key={key} aria-label={`Walk ${ {w:'forward',a:'left',s:'backward',d:'right'}[key]}`} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);world.current?.setMovement(key,true);}} onPointerUp={()=>world.current?.setMovement(key,false)} onPointerCancel={()=>world.current?.setMovement(key,false)} onLostPointerCapture={()=>world.current?.setMovement(key,false)} onKeyDown={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();world.current?.setMovement(key,true);}}} onKeyUp={()=>world.current?.setMovement(key,false)} onBlur={()=>world.current?.setMovement(key,false)}>{{w:'↑',a:'←',s:'↓',d:'→'}[key]}</button>)}</div></>:stage==='cook'?<>{!ready&&<><button className="quiet-button" onClick={burner}>{cooking?'Turn off burner':'Light burner'}</button><button className="quiet-button" onClick={stir} disabled={!cooking}>Stir</button><label className="heat-control">{['','Low','Medium','High'][heat]}<input aria-label="Burner heat" type="range" min="1" max="3" value={heat} onChange={e=>setHeat(+e.target.value)}/></label></>}<div className="cook-meter"><progress aria-label="Cooking progress" value={progress} max="100"/><span>{ready?'Ready':`${Math.floor(progress)}%`}</span></div>{ready&&<button className="action-button" onClick={()=>setStage('eat')}>Pick up chopsticks ↗</button>}</>:<>{total?<button className="action-button" onClick={()=>takeBite()}>Take a bite 🥢</button>:<button className="action-button" onClick={reset}>Make another pot ↗</button>}<span className="bite-counter">{bites} {bites===1?'bite':'bites'}</span></>}</div>
  </div>
  <div className={`toast ${message?'visible':''}`} role="status" aria-live="polite">{message}</div>
  {drawer&&<div className="drawer-backdrop" onClick={()=>setDrawer(false)}><section role="dialog" aria-modal="true" aria-labelledby="pot-title" className="recipe-drawer" onClick={e=>e.stopPropagation()}><button className="close" aria-label="Close pot menu" onClick={()=>setDrawer(false)}>×</button><p className="eyebrow">A SMALL RECIPE CARD</p><h2 id="pot-title">Your pot, your way.</h2><p className="drawer-note">{total} / 24 portions · Up to four of each ingredient.</p>{stage==='pick'&&!parked&&<><div className="tabs">{stations.map((s,i)=><button key={s} aria-pressed={station===i} onClick={()=>setStation(i)}>{['Rice & noodles','Savory','Vegetables'][i]}</button>)}</div><div className="ingredient-list">{ingredients.filter(i=>i.category===station).map(i=><div className="ingredient-row" key={i.id}><div><strong>{i.name}</strong><small>{i.note}</small></div><div className="quantity"><button aria-label={`Remove ${i.name}`} disabled={!selection[i.id]} onClick={()=>setSelection(s=>({...s,[i.id]:s[i.id]-1}))}>−</button><span>{selection[i.id]}</span><button aria-label={`Add ${i.name}`} disabled={total>=24||selection[i.id]>=4} onClick={()=>add(i.id)}>+</button></div></div>)}</div><label className="spice">Spice · {['Mellow','Gentle','Medium','Fiery','Extra hot'][spice]}<input type="range" aria-label="Spice level" min="0" max="4" value={spice} onChange={e=>setSpice(+e.target.value)}/></label><div className="sauce-list">{sauces.map((s,i)=><button aria-pressed={sauce===i} key={s.name} onClick={()=>setSauce(i)}><i style={{background:s.color}}/>{s.name}</button>)}</div></>}<p className="recipe-list">{total?ingredients.filter(i=>selection[i.id]).map(i=>`${i.name} ×${selection[i.id]}`).join(' · '):'Your first ingredient is waiting at the buffet.'}</p><button className="action-button" onClick={()=>setDrawer(false)}>Back to the restaurant ↗</button></section></div>}
  {help&&<div className="drawer-backdrop" onClick={()=>setHelp(false)}><section className="help-card" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e=>e.stopPropagation()}><button className="close" aria-label="Close help" onClick={()=>setHelp(false)}>×</button><p className="eyebrow">PULL UP A SEAT</p><h2 id="help-title">A little evening ritual.</h2><p>Click an ingredient tray to scoop a portion into your pot. Hold the right mouse button and drag left or right to slide along the buffet. Left-drag to look around; Hold W / A / S / D to walk. The small arrow controls also work by holding them. S steps back from the buffet; walk around the table to the chair marked Table 04. E picks whatever is under the center dot.</p><p>Carry at least one ingredient to your chair behind Table 04. When you reach it, you sit down and place the pot on the burner. The table is behind you at the buffet: step back along the side, then move toward its center. Stand up leaves the pot on the table and turns the burner off. Your cooking progress is saved. Walk back to the chair to sit again. To add ingredients, click the pot while standing nearby to carry it to the buffet. First click the burner dial to light it. Once it is on, drag through the broth to stir or use the Stir button. The pot warms gradually: higher heat gives a stronger boil, and a full pot takes longer to heat. Turning the burner off lets the hot broth cool gradually.</p><p>Explore the whole restaurant: the entrance and host desk are at the far end of the dining room. Walk around either end of the buffet to visit the tea dispensers, sauce bar, and open kitchen. Click a sauce bowl to pour it into your pot or take a clean cup from the drink rack, then click a dispenser to fill it. Each cup holds three sips. Refill it when empty. Window booths and the communal dining table fill both sides of the room.</p><p>When it’s ready, pick up your chopsticks and click a piece of food to eat it. Your pot opens a small recipe card with keyboard-friendly ingredient controls.</p><button className="action-button" onClick={()=>setHelp(false)}>Let's eat ↗</button></section></div>}
 </div>;
}




