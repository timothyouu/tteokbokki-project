import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {walkPosition,atSeat,restaurantZone} from './navigation';
import {createMixing,makeFoodBody,advanceMixing,insidePot,surfaceHeight} from './mixing';
import {potPose} from './potPose';
import {buildRestaurant} from './restaurant';
import {cookingPrompt} from './thermal';
import {ingredients, sauces, type Selection, type Stage} from './data';

export function createWorld(host: HTMLDivElement, onPick: (id: string) => void, onHover: (text:string) => void, onStationChange: (station:number) => void, onZoneChange:(zone:string)=>void) {
 const entranceView=new URLSearchParams(window.location.search).get('view')==='restaurant';
 const scene = new THREE.Scene(); scene.background = new THREE.Color('#15110e'); scene.fog = new THREE.Fog('#15110e',30,65);
 const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false}); renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=.95; renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.setClearColor('#15110e'); host.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','3D tteokbokki buffet. Select ingredients using the trays or the ingredient buttons.');
 const camera = new THREE.PerspectiveCamera(62,1,.08,100);


 const ambient = new THREE.HemisphereLight(0xe5ab6b,0x171b22,.16); scene.add(ambient);
 const light = new THREE.DirectionalLight(0xffc17a,.16); light.position.set(-5,12,7); light.castShadow=true; light.shadow.mapSize.set(2048,2048); Object.assign(light.shadow.camera,{left:-13,right:13,top:12,bottom:-12}); light.shadow.bias=-.001; scene.add(light);
 const roomEnvironment = new RoomEnvironment();
 const pmrem = new THREE.PMREMGenerator(renderer);const environment = pmrem.fromScene(roomEnvironment,.04);scene.environment=environment.texture;scene.environmentIntensity=.18;roomEnvironment.dispose();pmrem.dispose();
 const grainCanvas=document.createElement('canvas');grainCanvas.width=256;grainCanvas.height=256;const grainCtx=grainCanvas.getContext('2d')!;const grainPixels=grainCtx.createImageData(256,256);let noiseSeed=173;
 for(let i=0;i<grainPixels.data.length;i+=4){noiseSeed=(noiseSeed*1664525+1013904223)>>>0;const v=120+(noiseSeed%25);grainPixels.data[i]=v;grainPixels.data[i+1]=v;grainPixels.data[i+2]=v;grainPixels.data[i+3]=255;}grainCtx.putImageData(grainPixels,0,0);const grain=new THREE.CanvasTexture(grainCanvas);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(5,5);
 const material = (color: THREE.ColorRepresentation,metalness=0,roughness=.65) => new THREE.MeshStandardMaterial({color,metalness,roughness:metalness>.4?.26:roughness,bumpMap:grain,bumpScale:metalness>.4?.004:.012});
 const mesh = (geometry: THREE.BufferGeometry,color: THREE.ColorRepresentation,x=0,y=0,z=0,parent:THREE.Object3D=scene,metal=0) => {const m=new THREE.Mesh(geometry,material(color,metal));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const box = (w:number,h:number,d:number,color:THREE.ColorRepresentation,x:number,y:number,z:number,p:THREE.Object3D=scene,metal=0) => mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(w,h,d)*.16),color,x,y,z,p,metal);
 const cylinder = (rt:number,rb:number,h:number,color:THREE.ColorRepresentation,x:number,y:number,z:number,p:THREE.Object3D=scene,metal=0) => mesh(new THREE.CylinderGeometry(rt,rb,h,36),color,x,y,z,p,metal);
 const floor=box(65,.15,65,'#302720',0,-.13,0); floor.receiveShadow=true;
 for(let n=-15;n<16;n++) {box(.018,.008,45,'#201c18',n*1.5,-.045,0);box(45,.008,.018,'#201c18',0,-.045,n*1.5);}
 box(24,9,.25,'#453329',0,4.3,-5.6);box(24,1.8,.28,'#26352b',0,.85,-5.4);
 for(let i=-10;i<=10;i++) box(.025,1.75,.05,'#566744',i,.85,-5.21);
 const signCanvas=document.createElement('canvas');signCanvas.width=1024;signCanvas.height=256;const ctx=signCanvas.getContext('2d')!;ctx.fillStyle='#241b16';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#eeb776';ctx.textAlign='center';ctx.font='bold 78px Georgia';ctx.fillText('tteok table',512,110);ctx.fillStyle='#a38c70';ctx.font='22px sans-serif';ctx.fillText('GOOD FOOD. YOUR WAY.',512,170);const texture=new THREE.CanvasTexture(signCanvas);texture.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Mesh(new THREE.PlaneGeometry(7,1.75),new THREE.MeshBasicMaterial({map:texture}));sign.position.set(0,7.05,-5.43);scene.add(sign);
 const counter=new THREE.Group();scene.add(counter);box(14.1,1.7,4,'#334332',0,.85,0,counter);box(14.5,.2,4.25,'#9c8871',0,1.78,0,counter);box(14.15,.1,.1,'#c4b69a',0,1.4,2.02,counter);
 for(let i=-6;i<=6;i+=.6) box(.025,1.35,.035,'#5f704b',i,.78,2.015,counter);
 box(14.4,.14,.22,'#9f6845',0,2.12,-1.95);for(const x of [-6.7,6.7])box(.075,1.7,.075,'#afa896',x,2.6,-1.8);
 const glass=new THREE.Mesh(new THREE.BoxGeometry(13.6,1.3,.04),new THREE.MeshPhysicalMaterial({color:'#d5e9de',transparent:true,opacity:.12,roughness:.1,side:THREE.DoubleSide}));glass.position.set(0,2.65,-1.8);scene.add(glass);
 // Warm pendant pools and windows anchor the camera inside a room.
 for(const x of [-5,0,5]){cylinder(.025,.025,2.1,'#34322b',x,6.7,-.3);const shade=cylinder(.28,.65,.5,'#535748',x,5.5,-.3);shade.castShadow=false;const bulb=mesh(new THREE.SphereGeometry(.18,16,12),'#ffe1a6',x,5.23,-.3);(bulb.material as THREE.MeshStandardMaterial).emissive.set('#ffcc7a');(bulb.material as THREE.MeshStandardMaterial).emissiveIntensity=3;const lamp=new THREE.PointLight('#ffb85c',45,8,2);lamp.position.set(x,4.9,-.3);scene.add(lamp);const pool=new THREE.SpotLight('#ffc078',65,14,.70,.85,2);pool.position.set(x,5.15,-.3);pool.target.position.set(x,1.8,.3);scene.add(pool,pool.target);}
 const restaurant=buildRestaurant(scene);
 for(const x of [-8,-3,3,8]){box(.32,.7,.2,'#30221a',x,3.5,-5.1);const glow=box(.16,.5,.04,'#ffc279',x,3.5,-4.98);(glow.material as THREE.MeshStandardMaterial).emissive.set('#ffa648');(glow.material as THREE.MeshStandardMaterial).emissiveIntensity=2;const sconce=new THREE.PointLight('#ffa950',12,4.5,2);sconce.position.set(x,3.5,-4.8);scene.add(sconce);}
 const tableLight=new THREE.SpotLight('#ffc487',85,15,.68,.85,2);tableLight.position.set(-1.3,6,7.2);tableLight.target.position.set(0,1.6,6.4);tableLight.castShadow=true;tableLight.shadow.mapSize.set(1024,1024);tableLight.shadow.bias=-.001;scene.add(tableLight,tableLight.target);
 const tableFill=new THREE.PointLight('#ffbc75',10,6,2);tableFill.position.set(0,3.7,8);scene.add(tableFill);
 function food(id:string,parent:THREE.Object3D,x:number,y:number,z:number,scale=1,seed=0){
  const item=ingredients.find(i=>i.id===id)!;const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);g.rotation.y=seed*1.73;g.scale.multiplyScalar(.94+Math.sin(seed*17.2)*.08);
  if(item.shape==='rice') {const m=mesh(new THREE.CapsuleGeometry(.105,.36,4,9),item.color,0,.1,0,g);m.rotation.z=Math.PI/2;m.rotation.y=seed*.7;if(id==='sausage')for(let j=-1;j<=1;j++)box(.02,.009,.16,'#8c3f2d',j*.1,.205,0,g);}
  if(item.shape==='egg'){const m=mesh(new THREE.SphereGeometry(.2,20,14),item.color,0,.09,0,g);m.scale.set(.85,.6,1.25);const yolk=cylinder(.105,.11,.018,'#e9ae38',0,.2,0,g);yolk.scale.z=1.15;}
  if(item.shape==='fold'){const geo=new THREE.PlaneGeometry(.48,.42,12,12);const positions=geo.attributes.position;for(let n=0;n<positions.count;n++){const px=positions.getX(n),py=positions.getY(n);positions.setXYZ(n,px,.1+Math.sin(py*19)*.075,py);}geo.computeVertexNormals();const folded=mesh(geo,item.color,0,.05,0,g);(folded.material as THREE.MeshStandardMaterial).side=THREE.DoubleSide;}
  if(item.shape==='leaf'||item.shape==='cabbage'){for(let j=0;j<3;j++){const geo=new THREE.PlaneGeometry(.23,.46,8,12);const pos=geo.attributes.position;for(let n=0;n<pos.count;n++){const px=pos.getX(n),py=pos.getY(n);pos.setXYZ(n,px*(.65+Math.cos(py*5)*.35),.07+Math.pow(py+.2,2)*.6+Math.sin(px*40+py*24)*.013,py);}geo.computeVertexNormals();const leaf=mesh(geo,item.color,(j-1)*.09,0,0,g);leaf.rotation.y=(j-1)*.5;(leaf.material as THREE.MeshStandardMaterial).side=THREE.DoubleSide;const vein=mesh(new THREE.CapsuleGeometry(.012,.33,3,6),'#b8c68a',(j-1)*.09,.09,0,g);vein.rotation.x=Math.PI/2;}if(item.shape==='leaf'){const stem=mesh(new THREE.CapsuleGeometry(.04,.22,3,8),'#d3d6af',0,.09,.23,g);stem.rotation.x=Math.PI/2;}}
  if(item.shape==='cheese'){for(let j=0;j<5;j++){const m=box(.045,.04,.34,item.color,(j-2)*.06,.07+j*.015,0,g);m.rotation.y=j;}}
  if(item.shape==='mushroom'){for(let j=0;j<6;j++){const m=cylinder(.018,.024,.44,item.color,(j-2.5)*.055,.14,0,g);m.rotation.x=1.15;mesh(new THREE.SphereGeometry(.065,9,7),item.color,(j-2.5)*.055,.23,-.21,g);}}
  if(item.shape==='noodle'){for(let j=0;j<5;j++){const points=Array.from({length:22},(_,n)=>new THREE.Vector3((n-10)*.026,.08+j*.012,Math.sin(n*1.2+j)*.045+(j-2)*.065));mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),28,.025,5,false),item.color,0,0,0,g);}}
  if(item.shape==='stuffed'){const tube=cylinder(.12,.12,.42,item.color,0,.13,0,g);tube.rotation.z=Math.PI/2;const center=cylinder(.065,.065,.008,'#d4a84f',.216,.13,0,g);center.rotation.z=Math.PI/2;}
  if(item.shape==='slice'){const m=mesh(new THREE.SphereGeometry(.22,18,12),item.color,0,.06,0,g);m.scale.set(.68,.22,1.25);}
  if(item.shape==='glass'){for(let j=0;j<7;j++){const pts=Array.from({length:22},(_,n)=>new THREE.Vector3((n-10)*.024,.06+Math.sin(n*.4+j)*.028,(j-3)*.033+Math.sin(n*.5+j)*.07));const noodle=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.012,5,false),item.color,0,0,0,g);(noodle.material as THREE.MeshStandardMaterial).roughness=.18;}}
  if(item.shape==='ball'){const m=mesh(new THREE.SphereGeometry(.18,18,12),item.color,0,.13,0,g);m.scale.y=.9;}
  if(item.shape==='shrimp'){const m=mesh(new THREE.TorusGeometry(.14,.064,9,20,Math.PI*1.5),item.color,0,.1,0,g);m.rotation.x=Math.PI/2;for(let j=0;j<5;j++){const a=j*.65;const stripe=mesh(new THREE.SphereGeometry(.02,8,6),'#c16e51',Math.cos(a)*.14,.155,Math.sin(a)*.14,g);stripe.scale.set(1,.4,2.8);}const tail=box(.13,.025,.07,'#ca7152',-.14,.08,-.08,g);tail.rotation.y=-.6;}
  if(item.shape==='dumpling'){const m=mesh(new THREE.SphereGeometry(.23,20,14),item.color,0,.11,0,g);m.scale.set(1,.6,.55);for(let j=0;j<8;j++){const a=(j/7)*Math.PI;const pleat=mesh(new THREE.CapsuleGeometry(.014,.075,3,6),'#b78a4f',Math.cos(a)*.21,.13+Math.sin(a)*.1,0,g);pleat.rotation.z=a-Math.PI/2;}}
  if(item.shape==='shiitake'){cylinder(.045,.06,.17,'#ccb894',0,.06,0,g);const cap=mesh(new THREE.SphereGeometry(.21,18,12),item.color,0,.15,0,g);cap.scale.y=.42;for(const angle of [-.6,.6]){const score=box(.27,.007,.017,'#d7bd92',0,.24,0,g);score.rotation.y=angle;}}
  if(item.shape==='onion'||item.shape==='rings'){for(let j=0;j<4;j++){const r=item.shape==='rings'?.055:.13+j*.022;const ring=mesh(new THREE.TorusGeometry(r,item.shape==='rings'?.02:.013,7,18,item.shape==='rings'?Math.PI*2:Math.PI*1.3),item.color,(j-1.5)*.075,.05+j*.014,0,g);ring.rotation.x=Math.PI/2;ring.rotation.z=j*.6;}}
  g.traverse(o=>{if(o instanceof THREE.Mesh){const m=o.material as THREE.MeshStandardMaterial;m.roughness=id==='sausage'?.32:id==='tteok'?.27:.48;m.color.multiplyScalar(.94+Math.sin(seed*3.13)*.06);}});
  return g;
 }
 const labelTextures:THREE.Texture[]=[];
 function placard(text:string,parent:THREE.Object3D,x:number,y:number,z:number,w=1.7,h=.25):void{
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=80;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#201a14';ctx.fillRect(0,0,512,80);ctx.strokeStyle='#89704f';ctx.strokeRect(4,4,504,72);ctx.fillStyle='#ead7b5';ctx.textAlign='center';ctx.font='500 29px sans-serif';ctx.fillText(text,256,51);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;labelTextures.push(texture);const label=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));label.position.set(x,y,z);label.rotation.x=-.75;parent.add(label);
 }
 const clickables:THREE.Object3D[]=[];const trays:THREE.Group[]=[];
 ingredients.forEach((item,i)=>{const g=new THREE.Group();const slot=i%6;g.position.set((item.category-1)*4.55+(slot%2===0?-1.08:1.08),0,(Math.floor(slot/2)-1)*1.24);counter.add(g);trays.push(g);g.userData.id=item.id;
 box(2.04,.12,1.13,'#6d7169',0,1.91,0,g,.8);box(1.94,.035,1.04,'#90948a',0,1.98,0,g,.75);for(const z of [-.56,.56])box(2.09,.1,.035,'#c9c7b8',0,2,z,g,.85);for(const x of [-1.02,1.02])box(.035,.1,1.15,'#c9c7b8',x,2,0,g,.85);
 for(let n=0;n<12;n++){const jitter=Math.sin(n*9+i*13)*.07;food(item.id,g,(n%4-1.5)*.44+jitter,2.025+Math.sin(n*3)*.012,(Math.floor(n/4)-1)*.27+jitter,.78,n+i*21);}
 placard(item.name,g,0,2.085,.55,1.67,.22);clickables.push(g);
 });
 const potGroup=new THREE.Group();scene.add(potGroup);potGroup.position.set(0,0,6.4);const support=new THREE.Group();scene.add(support);support.position.set(0,0,6.4);
 box(4.2,.13,3.7,'#97714d',0,.7,0,support);for(const x of [-1.7,1.7])for(const z of [-1.4,1.4])box(.12,.7,.12,'#77664d',x,.3,z,support);
 box(2.65,.28,2.1,'#c34931',0,.92,0,support);box(.6,.18,1.85,'#e6d9bd',1.4,.96,0,support);const knob=cylinder(.19,.19,.13,'#343b32',1.4,1.09,.55,support);knob.rotation.x=.3;
 cylinder(.98,.98,.11,'#343a34',-.12,1.12,0,support);const flame=cylinder(.82,.82,.12,'#f9b740',-.12,1.21,0,support);flame.visible=false;
 const potShell=mesh(new THREE.CylinderGeometry(1.13,.9,.6,64,1,true),'#343e38',-.12,1.51,0,potGroup,.7);(potShell.material as THREE.MeshStandardMaterial).side=THREE.DoubleSide;const rim=mesh(new THREE.TorusGeometry(1.11,.035,12,64),'#b9bdb6',-.12,1.82,0,potGroup,.8);rim.rotation.x=Math.PI/2;
 const soup=mesh(new THREE.CircleGeometry(1.015,64),sauces[0].color,-.12,1.71,0,potGroup);soup.geometry.rotateX(-Math.PI/2);(soup.material as THREE.MeshStandardMaterial).roughness=.18;(soup.material as THREE.MeshStandardMaterial).metalness=.1;for(const x of [-1.42,1.18])box(.45,.14,.27,'#333a31',x,1.6,0,potGroup);
  const napkin=box(.68,.02,.9,'#d5c4a4',-1.54,.795,.82,support);napkin.rotation.y=.12;
 const drinkingCup=new THREE.Group();scene.add(drinkingCup);
 const cup=mesh(new THREE.CylinderGeometry(.17,.14,.4,32,1,true),'#e0d0ad',0,0,0,drinkingCup);(cup.material as THREE.MeshStandardMaterial).side=THREE.DoubleSide;
 const drinkLiquid=cylinder(.152,.152,.012,'#98652d',0,.12,0,drinkingCup);
 let cupOwned=false,cupSips=0,potParked=false,sipStarted=-100;
 function sip():void{sipStarted=performance.now()/1000;}
 function nearPot():boolean{return Math.hypot(camera.position.x,camera.position.z-6.4)<6;}
 const restingSticks=new THREE.Group();support.add(restingSticks);
 const chopstickTarget=box(.48,.10,1.1,'#715035',-1.66,.85,.75,restingSticks);chopstickTarget.visible=false;
 for(const x of [-1.73,-1.59]){const resting=cylinder(.016,.022,.9,'#715035',x,.83,.75,restingSticks);resting.rotation.x=Math.PI/2;}
 placard('TABLE 04',support,1.2,.99,1.55,.72,.18);
 box(1.3,.14,1.1,'#3d5139',0,.7,9.35);box(1.3,1.3,.15,'#3d5139',0,1.24,9.87);for(const x of [-.5,.5])for(const z of [8.95,9.75])box(.07,.65,.07,'#30271b',x,.34,z);
 const potFood=new THREE.Group();potGroup.add(potFood);
 const mixing=createMixing();const foodMeshes=new Map<string,THREE.Group>();
 const previousVelocity=new THREE.Vector3();
 const ladle=new THREE.Group();potGroup.add(ladle);const handle=cylinder(.022,.027,1.5,'#a3a197',0,.7,0,ladle,.8);handle.position.x=.15;handle.rotation.z=-.21;const spoon=mesh(new THREE.SphereGeometry(.12,16,10),'#c3b9a4',0,0,0,ladle,.85);spoon.scale.set(1,.22,1.3);ladle.visible=false;
 const oil=new THREE.Group();potGroup.add(oil);for(let i=0;i<34;i++){const a=i*2.399,r=Math.sqrt(i/35)*.95;const drop=mesh(new THREE.SphereGeometry(.017+(i%5)*.006,8,6),i%3?'#8c2810':'#d5772e',-.12+Math.cos(a)*r,1.735,Math.sin(a)*r,oil);drop.scale.y=.13;drop.castShadow=false;(drop.material as THREE.MeshStandardMaterial).roughness=.2;}
 const transfers:{object:THREE.Group;from:THREE.Vector3;start:number}[]=[];let autoStirUntil=-10;let stirAngle=0;
 function freeObject(object:THREE.Object3D):void{object.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(o.material as THREE.Material).dispose();}});object.removeFromParent();}
 function scoop(id:string):void{const index=ingredients.findIndex(i=>i.id===id);if(index<0)return;const from=trays[index].localToWorld(new THREE.Vector3(0,2.3,0));const object=food(id,scene,from.x,from.y,from.z,.9,index);const tongs=new THREE.Group();object.add(tongs);for(const x of [-.15,.15]){const tong=box(.035,.03,.65,'#bcbcb2',x,.2,-.22,tongs,.8);tong.rotation.y=x*.9;}transfers.push({object,from,start:performance.now()});}
 function stir():void{autoStirUntil=performance.now()/1000+1.2;stirAngle=Math.atan2(mixing.spoon.z,mixing.spoon.x);}

 const bubbles:THREE.Mesh[]=[];for(let i=0;i<22;i++){const a=i*2.4,r=Math.sqrt(i/23)*.85;const bubble=mesh(new THREE.SphereGeometry(.035+(i%3)*.012,10,7),'#d97437',-.12+Math.cos(a)*r,1.76,Math.sin(a)*r,potGroup);bubble.visible=false;bubbles.push(bubble);}
 const steam=new THREE.Group();potGroup.add(steam);const puffs:THREE.Mesh[]=[];for(let i=0;i<12;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.11,8,8),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.25,depthWrite:false}));steam.add(m);puffs.push(m);}
 const sticks=new THREE.Group();potGroup.add(sticks);sticks.position.set(.6,2.1,.3);sticks.rotation.z=-.6;for(const x of [-.09,.09]){const m=cylinder(.018,.028,1.6,'#845735',x,.8,0,sticks);m.rotation.z=x*.8;}sticks.visible=false;
 let lastZone='';let temperature=22,boilIntensity=0,burnerHeat=2;let slideX=entranceView?-3:-4.55,walkZ=entranceView?22:3.7,tableSlideX=0;let seatPending=false;const movement=new Set<string>();let isReady=false;let stage:Stage='pick',aisle=0,cooking=false,disposed=false,frame=0,lastSelection='',biteStart=-100,drag=false,startX=0,startY=0,orbit=0,pitch=0;let lastTime=performance.now()/1000;const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;const priorCamera=new THREE.Vector3();let carry=1;const target=new THREE.Vector3();let currentLook=new THREE.Vector3(0,1,0);
 function update(s:Selection,next:Stage,station:number,sauce:number,isCooking:boolean,ready:boolean,potTemperature:number,boil:number,heat:number,parked:boolean,hasCup:boolean,sips:number,drink:string){potParked=parked;cupOwned=hasCup;cupSips=sips;(drinkLiquid.material as THREE.MeshStandardMaterial).color.set(drink==='Cold water'?'#769aa0':'#98652d');if(aisle!==station){slideX=walkPosition({x:slideX,z:walkZ},(station-1)*4.55-slideX,0).x;orbit=0;pitch=0;onHover('');}if(stage!==next){movement.clear();seatPending=next==='pick';if(next==='pick'){slideX=0;walkZ=10.6;orbit=0;pitch=0;}}if(stage!==next||cooking!==isCooking||isReady!==ready||Math.floor(temperature/5)!==Math.floor(potTemperature/5)){onHover('');lastHint='';}temperature=potTemperature;boilIntensity=boil;burnerHeat=heat;stage=next;isReady=ready;aisle=station;cooking=isCooking;(soup.material as THREE.MeshStandardMaterial).color.set(sauces[sauce].color);const key=JSON.stringify(s);if(key!==lastSelection){lastSelection=key;const wanted=new Set<string>();let n=0;
 for(const item of ingredients)for(let k=0;k<s[item.id]*2;k++){
  const key=item.id+':'+k;wanted.add(key);
  if(!foodMeshes.has(key)){
   const light=['leaf','cabbage','rings','fold','glass','noodle','cheese'].includes(item.shape);
   const body=makeFoodBody(key,n,light);mixing.bodies.push(body);
   const portion=food(item.id,potFood,-.12+body.x,1.71+body.floatHeight,body.z,.65,n);
   portion.userData.ingredient=item.id;foodMeshes.set(key,portion);
  }n++;
 }
 for(const [key,object] of foodMeshes)if(!wanted.has(key)){freeObject(object);foodMeshes.delete(key);}
 mixing.bodies=mixing.bodies.filter(body=>wanted.has(body.key));
 }sticks.visible=stage==='eat';restingSticks.visible=stage!=='eat';flame.visible=cooking;steam.visible=temperature>55;bubbles.forEach((b,i)=>b.visible=boilIntensity>.025&&i<Math.ceil(boilIntensity*bubbles.length));}
 let heldFood:THREE.Group|null=null; function bite(id?:string){biteStart=performance.now();if(heldFood){heldFood.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(o.material as THREE.Material).dispose();}});sticks.remove(heldFood);}const selected=JSON.parse(lastSelection) as Selection;const item=ingredients.find(i=>i.id===id&&selected[i.id]>0)||ingredients.find(i=>selected[i.id]>0);if(item)heldFood=food(item.id,sticks,0,0,0,.8,0);}
 const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();let stirDrag=false,lastHint='';
 function pointInBroth():THREE.Vector3|null{
  const localRay=raycaster.ray.clone().applyMatrix4(potGroup.matrixWorld.clone().invert());
  const point=localRay.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-1.71),new THREE.Vector3());
  return point&&Math.hypot(point.x+.12,point.z)<1.015?point:null;
 }
 function cast(e?:PointerEvent):void{const r=renderer.domElement.getBoundingClientRect();if(e)pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);else pointer.set(0,0);raycaster.setFromCamera(pointer,camera);}
 function ancestor(object:THREE.Object3D,key:string):string{let node:THREE.Object3D|null=object;while(node){if(node.userData[key])return node.userData[key] as string;node=node.parent;}return '';}
 function targetAction():{id:string;label:string}{
  if(stage==='cook'&&raycaster.intersectObject(chopstickTarget).length)return{id:isReady?'ready':'',label:isReady?'Chopsticks · click to pick up and eat':'Chopsticks · wait until your food is cooked'};
  if(cupOwned&&cupSips&&raycaster.intersectObject(drinkingCup,true).length)return{id:'sip',label:'Your cup · click to sip'};
  if(stage==='cook'&&raycaster.intersectObject(knob,true).length)return{id:'burner',label:isReady?'Burner off':'Burner dial · click to '+(cooking?'turn off':'light')};
  const potHit=raycaster.intersectObject(potGroup,true)[0];
  if(potHit){if(stage==='pick'){if(potParked&&potHit.distance<6)return{id:'pickup-pot',label:'Your pot · click to carry it to the buffet, or walk to the chair to sit'};if(!potParked)return{id:'',label:'Carry your pot to Table 04 · walk around the table to your chair'};return{id:'',label:''};}if(stage==='cook')return{id:!isReady&&cooking?'stir':'',label:cookingPrompt(cooking,temperature,isReady)};const id=ancestor(potHit.object,'ingredient');return{id:id?'bite:'+id:'bite',label:id?(ingredients.find(i=>i.id===id)?.name+' · click to taste'):'Click to take a bite'};}
  if(stage==='pick'){const roomHit=raycaster.intersectObjects(restaurant.targets,true)[0];if(roomHit&&roomHit.distance<6)return{id:ancestor(roomHit.object,'action'),label:ancestor(roomHit.object,'label')};const hit=raycaster.intersectObjects(clickables,true)[0];if(hit&&hit.distance<8){const id=ancestor(hit.object,'id');return{id,label:ingredients.find(i=>i.id===id)?.name+' · click to scoop'};}}
  return{id:'',label:''};
 }
 function setMovement(key:string,pressed:boolean):void{if(pressed)movement.add(key);else movement.delete(key);}
 function stopMovement():void{movement.clear();}
 function canSit():boolean{return stage==='pick'&&atSeat({x:camera.position.x,z:camera.position.z});}
 function interact():void{cast();const hit=targetAction();if(hit.id)onPick(hit.id);}
 let dragButton=-1,activePointer:number|null=null,lastClientX=0,lastClientY=0;
 function endDrag():void{
  const pointerId=activePointer;activePointer=null;drag=false;stirDrag=false;dragButton=-1;
  if(pointerId!==null&&renderer.domElement.hasPointerCapture(pointerId))renderer.domElement.releasePointerCapture(pointerId);
  renderer.domElement.style.cursor='grab';
 }
 const down=(e:PointerEvent)=>{
  if(e.button!==0&&e.button!==2)return;
  if(activePointer!==null)return;
  startX=lastClientX=e.clientX;startY=lastClientY=e.clientY;drag=true;dragButton=e.button;activePointer=e.pointerId;
  renderer.domElement.setPointerCapture(e.pointerId);
  if(dragButton===2){e.preventDefault();stirDrag=false;lastHint='';onHover('Slide left or right · release to stop');renderer.domElement.style.cursor='ew-resize';return;}
  cast(e);stirDrag=stage==='cook'&&cooking&&!isReady&&targetAction().id==='stir'&&pointInBroth()!==null;
  if(stirDrag){const point=pointInBroth()!;mixing.target=insidePot({x:point.x+.12,z:point.z});autoStirUntil=-10;}
 };
 const move=(e:PointerEvent)=>{
  if(activePointer!==null&&e.pointerId!==activePointer)return;
  const dx=e.clientX-lastClientX,dy=e.clientY-lastClientY;lastClientX=e.clientX;lastClientY=e.clientY;
  if(drag&&dragButton===2){
   if(!(e.buttons&2)){endDrag();onHover('');return;}
   e.preventDefault();const distance=dx*9.1/Math.max(renderer.domElement.clientWidth*.65,1);
   if(stage==='pick'){
    slideX=walkPosition({x:slideX,z:walkZ},distance,0).x;
    const nearest=THREE.MathUtils.clamp(Math.round(slideX/4.55)+1,0,2);
    // Report the nearest station without snapping continuous motion to its center.
    if(nearest!==aisle){aisle=nearest;onStationChange(nearest);}
   }else tableSlideX=THREE.MathUtils.clamp(tableSlideX+distance,-1.2,1.2);
   renderer.domElement.style.cursor='ew-resize';return;
  }
  cast(e);const hit=targetAction();if(hit.label!==lastHint){lastHint=hit.label;onHover(hit.label);}renderer.domElement.style.cursor=hit.id?'pointer':'grab';
  if(drag){if(stirDrag){const point=pointInBroth();if(point)mixing.target=insidePot({x:point.x+.12,z:point.z});}else{orbit-=dx*.003;pitch=Math.max(-.3,Math.min(.3,pitch+dy*.002));}}
 };
 const up=(e:PointerEvent)=>{
  if(!drag||e.pointerId!==activePointer||e.button!==dragButton)return;
  const secondary=dragButton===2;const wasStirring=stirDrag;const moved=Math.hypot(e.clientX-startX,e.clientY-startY)>8;endDrag();
  if(secondary){e.preventDefault();onHover('');return;}
  if(moved||wasStirring)return;const r=renderer.domElement.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;cast(e);const hit=targetAction();if(hit.id)onPick(hit.id);
 };
 const cancel=()=>{movement.clear();endDrag();lastHint='';onHover('');};
 const contextMenu=(e:MouseEvent)=>e.preventDefault();
 const leave=()=>{if(!drag){onHover('');lastHint='';}};
 renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerleave',leave);renderer.domElement.addEventListener('contextmenu',contextMenu);renderer.domElement.addEventListener('pointercancel',cancel);renderer.domElement.addEventListener('lostpointercapture',cancel);window.addEventListener('pointerup',up);window.addEventListener('blur',cancel);
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(host);resize();camera.position.set(slideX,4.25,walkZ);currentLook.set(slideX,1.65,walkZ-6);
 const animate=()=>{if(disposed)return;frame=requestAnimationFrame(animate);const time=performance.now()/1000;const dt=Math.min(.25,time-lastTime);lastTime=time;const damping=1-Math.exp(-5*dt);const mobile=camera.aspect<.85;
 priorCamera.copy(camera.position);
 if(stage==='pick'){
  const forward=Number(movement.has('w'))-Number(movement.has('s'));
  const sideways=Number(movement.has('d'))-Number(movement.has('a'));
  const normalize=Math.max(1,Math.hypot(forward,sideways));
  const dx=(Math.sin(orbit)*forward+Math.cos(orbit)*sideways)*dt*3/normalize;
  const dz=(-Math.cos(orbit)*forward+Math.sin(orbit)*sideways)*dt*3/normalize;
  const next=walkPosition({x:slideX,z:walkZ},dx,dz);slideX=next.x;walkZ=next.z;
  const zone=restaurantZone(next);if(zone!==lastZone){lastZone=zone;onZoneChange(zone);}
  const nearest=THREE.MathUtils.clamp(Math.round(slideX/4.55)+1,0,2);
  if(nearest!==aisle){aisle=nearest;onStationChange(nearest);}
  if(seatPending&&!atSeat({x:camera.position.x,z:camera.position.z}))seatPending=false;
  if(!seatPending&&canSit()&&(potParked||(lastSelection&&Object.values(JSON.parse(lastSelection) as Selection).some(n=>n>0)))){seatPending=true;movement.clear();onPick('table');}
 }

 if(stage==='pick'){target.set(slideX,4.25,walkZ);currentLook.lerp(new THREE.Vector3(slideX+Math.sin(orbit)*6,1.65+pitch*6,walkZ-Math.cos(orbit)*6),damping);}else{target.set(tableSlideX,3.85,10.25);currentLook.lerp(new THREE.Vector3(tableSlideX+(mobile?-.12:.05),1.75+pitch*3,6.3),damping);}
 camera.position.lerp(target,damping);
 if(stage==='pick'){const safeCamera=walkPosition({x:priorCamera.x,z:priorCamera.z},camera.position.x-priorCamera.x,camera.position.z-priorCamera.z);camera.position.x=safeCamera.x;camera.position.z=safeCamera.z;}
 camera.lookAt(currentLook);camera.updateMatrixWorld();
 const velocity=(camera.position.x-priorCamera.x)/Math.max(dt,.001);const walkingSpeed=camera.position.distanceTo(priorCamera)/Math.max(dt,.001);carry=THREE.MathUtils.lerp(carry,stage==='pick'&&!potParked?1:0,damping);
 drinkingCup.visible=cupOwned;drinkLiquid.visible=cupSips>0;drinkLiquid.position.y=-.13+cupSips*.085;
 const sipPhase=Math.min(1,Math.max(0,(time-sipStarted)/.65));
 if(stage==='pick'){
  drinkingCup.scale.setScalar(.19);drinkingCup.position.copy(camera.localToWorld(new THREE.Vector3(mobile?.09:.22,-.16+Math.sin(sipPhase*Math.PI)*.13,-.55)));drinkingCup.quaternion.copy(camera.quaternion);drinkingCup.rotateX(Math.sin(sipPhase*Math.PI)*.6);
 }else{drinkingCup.scale.setScalar(1);drinkingCup.position.set(-1.6,.99,5.65);drinkingCup.rotation.set(0,0,0);}
 const cupTilt=new THREE.Quaternion();drinkingCup.getWorldQuaternion(cupTilt);drinkLiquid.quaternion.copy(cupTilt.invert());
 const liquidTilt=drinkLiquid.quaternion.angleTo(new THREE.Quaternion());
 drinkLiquid.position.y=Math.min(-.13+cupSips*.085,.185-.152*Math.sin(liquidTilt));
 drinkLiquid.scale.set(.92,1,.92);
 support.visible=true;
 // Fit the complete pot, including handles, inside the view and the player's clearance.
 const pose=potPose(camera.aspect,camera.fov);
 const carriedAnchor=camera.localToWorld(new THREE.Vector3(pose.x,pose.y,pose.z));
 const carriedOrigin=carriedAnchor.clone();carriedOrigin.y-=1.51*pose.scale;
 const settled=new THREE.Vector3(0,0,6.4);
 // Raise the pot before translating over the table, then lower it onto the burner.
 const placing=carry>0&&carry<1;
 const travel=Math.min(1,carry*2);
 potGroup.position.copy(settled.lerp(carriedOrigin,travel));
 if(placing)potGroup.position.y+=Math.sin(Math.PI*carry)*.55;
 potGroup.scale.setScalar(1-carry*(1-pose.scale));
 potGroup.rotation.z=reducedMotion?0:THREE.MathUtils.lerp(potGroup.rotation.z,THREE.MathUtils.clamp(-velocity*.006,-.035,.035)*carry,damping);
 potGroup.rotation.x=reducedMotion?0:Math.sin(time*7)*Math.min(walkingSpeed*.001,.01)*carry;

 const frameVelocity=camera.position.clone().sub(priorCamera).divideScalar(Math.max(dt,.001));
 const acceleration=frameVelocity.clone().sub(previousVelocity).divideScalar(Math.max(dt,.001));previousVelocity.copy(frameVelocity);
 mixing.engaged=stage==='cook'&&cooking&&!isReady&&(stirDrag||time<autoStirUntil);
 if(mixing.engaged&&!stirDrag){stirAngle+=dt*2.5;mixing.target={x:Math.cos(stirAngle)*.6,z:Math.sin(stirAngle)*.6};}
 advanceMixing(mixing,dt,boilIntensity,{x:THREE.MathUtils.clamp(acceleration.x,-5,5)*carry,z:THREE.MathUtils.clamp(acceleration.z,-5,5)*carry});
 const surface=soup.geometry.attributes.position;
 for(let i=0;i<surface.count;i++){const x=surface.getX(i),z=surface.getZ(i);surface.setY(i,surfaceHeight(mixing,x,z,boilIntensity));}
 surface.needsUpdate=true;soup.geometry.computeVertexNormals();
 bubbles.forEach((b,i)=>{const phase=(time*(.25+boilIntensity*1.9+i%3*.12)+i*.19)%1;b.scale.setScalar(Math.sin(phase*Math.PI)*(.35+boilIntensity*.9));b.position.y=1.71+surfaceHeight(mixing,b.position.x+.12,b.position.z,boilIntensity)+phase*.035*boilIntensity;});
 for(const body of mixing.bodies){const object=foodMeshes.get(body.key)!;
  object.position.set(-.12+body.x,1.71+body.floatHeight+surfaceHeight(mixing,body.x,body.z,boilIntensity),body.z);
  object.rotation.y=body.angle;object.rotation.z=mixing.slope.x*.4;
 }
 oil.children.forEach(drop=>{const x=drop.position.x+.12,z=drop.position.z;
  const turn=mixing.current*dt*.7;drop.position.x=-.12+x*Math.cos(turn)-z*Math.sin(turn);drop.position.z=x*Math.sin(turn)+z*Math.cos(turn);
  drop.position.y=1.715+surfaceHeight(mixing,drop.position.x+.12,drop.position.z,boilIntensity);
 });
 puffs.forEach((p,i)=>{const steamAmount=THREE.MathUtils.clamp((temperature-55)/45,0,1)*(.25+boilIntensity*.75);const t=(time*(.15+steamAmount*.7)+i/12)%1;p.position.set(-.12+Math.sin(i*8+t)*.65,1.9+t*(.6+steamAmount*1.6),Math.cos(i*3)*.5);p.scale.setScalar(.2+t*(.6+steamAmount*1.8));(p.material as THREE.MeshBasicMaterial).opacity=(1-t)*.26*steamAmount;});flame.scale.set(.7+burnerHeat*.1,.35+burnerHeat*.3, .7+burnerHeat*.1);flame.scale.y*=1+Math.sin(time*16)*.07;(flame.material as THREE.MeshStandardMaterial).emissive.set('#338dff');(flame.material as THREE.MeshStandardMaterial).emissiveIntensity=.4+burnerHeat*.3;
 const biteT=Math.max(0,Math.min(1,(performance.now()-biteStart)/700));sticks.position.y=2.1+Math.sin(biteT*Math.PI)*1.1;sticks.rotation.z=-.6+Math.sin(biteT*Math.PI)*.35;if(heldFood)heldFood.visible=biteT<.8;
 ladle.visible=stage==='cook'&&cooking&&!isReady;
 ladle.position.set(-.12+mixing.spoon.x,1.72,mixing.spoon.z);ladle.rotation.z=-.18;
 for(let i=transfers.length-1;i>=0;i--){const transfer=transfers[i];const t=Math.min(1,(performance.now()-transfer.start)/750);const to=potGroup.localToWorld(new THREE.Vector3(-.12,2,0));transfer.object.position.copy(transfer.from).lerp(to,t);transfer.object.position.y+=Math.sin(t*Math.PI)*1.2;transfer.object.rotation.y+=dt*2;if(t===1){freeObject(transfer.object);transfers.splice(i,1);}}
 if(location.hostname==='localhost'){renderer.domElement.dataset.playerX=camera.position.x.toFixed(2);renderer.domElement.dataset.playerZ=camera.position.z.toFixed(2);renderer.domElement.dataset.potParked=String(potParked);renderer.domElement.dataset.mixingCurrent=mixing.current.toFixed(4);renderer.domElement.dataset.foodSpeed=Math.max(0,...mixing.bodies.map(b=>Math.hypot(b.vx,b.vz))).toFixed(4);renderer.domElement.dataset.spoonX=mixing.spoon.x.toFixed(3);renderer.domElement.dataset.spoonZ=mixing.spoon.z.toFixed(3);}
 renderer.render(scene,camera);};animate();
 return {update,bite,scoop,stir,sip,nearPot,interact,setMovement,stopMovement,canSit,dispose(){endDrag();disposed=true;cancelAnimationFrame(frame);observer.disconnect();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('blur',cancel);renderer.domElement.removeEventListener('contextmenu',contextMenu);renderer.domElement.removeEventListener('pointercancel',cancel);renderer.domElement.removeEventListener('lostpointercapture',cancel);renderer.domElement.removeEventListener('pointerleave',leave);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});restaurant.dispose();labelTextures.forEach(t=>t.dispose());texture.dispose();grain.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();}};
}












