import * as THREE from 'three';
import {diningTables} from './navigation';
import {sauces} from './data';

// Complete room around the central buffet. Geometry uses the same coordinates as navigation.
export function buildRestaurant(scene:THREE.Scene):{targets:THREE.Object3D[];dispose:()=>void} {
 const targets:THREE.Object3D[]=[];
 const textures:THREE.Texture[]=[];
 const materials=new Map<string,THREE.MeshStandardMaterial>();
 function material(color:string,metal=0):THREE.MeshStandardMaterial {
  const key=color+metal;
  if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,metalness:metal,roughness:metal?.3:.78}));
  return materials.get(key)!;
 }
 function box(w:number,h:number,d:number,color:string,x:number,y:number,z:number,parent:THREE.Object3D=scene,metal=0):THREE.Mesh {
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color,metal));
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 function cylinder(r:number,h:number,color:string,x:number,y:number,z:number,parent:THREE.Object3D=scene,metal=0):THREE.Mesh {
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.96,h,20),material(color,metal));
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 function sign(text:string,x:number,y:number,z:number,width:number,rotation=0):void {
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=192;
  const ctx=canvas.getContext('2d')!;ctx.fillStyle='#211b16';ctx.fillRect(0,0,1024,192);
  ctx.strokeStyle='#95714a';ctx.strokeRect(8,8,1008,176);ctx.fillStyle='#f1c993';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='42px Georgia';ctx.fillText(text,512,96,980);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width*192/1024),new THREE.MeshBasicMaterial({map:texture}));
  mesh.position.set(x,y,z);mesh.rotation.y=rotation;scene.add(mesh);
 }
 function luminous(w:number,h:number,d:number,x:number,y:number,z:number,color='#ffc788'):void {
  const mesh=box(w,h,d,color,x,y,z);mesh.material=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.8});
 }
 function pendant(x:number,z:number):void {
  cylinder(.018,2.7,'#24211e',x,6.6,z);
  const shade=new THREE.Mesh(new THREE.CylinderGeometry(.22,.58,.45,24,1,true),material('#63513b',.3));shade.position.set(x,5.05,z);scene.add(shade);
  luminous(.32,.035,.32,x,4.85,z);
 }
 // Four walls, skirting, timber ceiling and a framed entrance: no open void behind the player.
 box(24,.2,30,'#191512',0,8,9.2);
 box(.22,8,30,'#3c3029',-12,4,9.2);box(.22,8,30,'#3c3029',12,4,9.2);
 box(24,8,.25,'#3c3029',0,4,24.2);
 for(const x of [-11.83,11.83]){
  box(.1,1.65,30,'#26382e',x,.82,9.2);
  box(.16,.09,30,'#866341',x,1.68,9.2);
  for(let z=-4;z<24;z+=.8)box(.12,1.6,.035,'#485240',x,.8,z);
 }
 for(const z of [-4,2,8,14,20,24])box(24,.32,.25,'#30271f',0,7.76,z);
 for(const x of [-8,-4,0,4,8])box(.13,.1,30,'#332a21',x,7.82,9.2);
 box(24,.16,.16,'#836140',0,1.68,24.02);
 // Tall street windows on both sides, with mullions and distant night-time buildings.
 for(const side of [-1,1])for(const z of [6.8,13.2,19.6]){
  const x=side*11.78;
  box(.13,4.3,4.8,'#72624b',x,4.2,z);
  box(.14,4.05,4.55,'#111d2a',x-side*.08,4.2,z);
  for(let j=0;j<5;j++){
   box(.03,1.1+(j%3)*.65,.52,'#182630',x-side*.17,3.3,z-1.8+j*.85);
   for(let row=0;row<3;row++)luminous(.02,.055,.10,x-side*.20,3+row*.38,z-1.7+j*.85,j%2?'#bc8c55':'#677a8a');
  }
  for(const offset of [-2.2,0,2.2])box(.19,4.1,.065,'#584b3a',x-side*.23,4.2,z+offset);
  box(.2,.08,4.6,'#584b3a',x-side*.23,4.2,z);
  box(.5,.15,5,'#876746',x-side*.12,2.15,z);
 }
 // Entry doors and an illuminated transom; street reflections remain beyond the glass.
 box(4.4,5.8,.12,'#725b40',0,2.9,24.02);
 for(const x of [-1.03,1.03]){
  box(1.97,5.35,.13,'#16222a',x,2.75,23.91);
  box(.06,5.4,.13,'#ab8759',x+(x<0?.94:-.94),2.75,23.78);
  box(.045,.9,.16,'#c7ab79',x+(x<0?.72:-.72),2.3,23.7,scene,.7);
  for(let i=0;i<3;i++)box(.018,2.6,.015,'#36404a',x-.6+i*.45,3.7,23.82);
 }
 sign('tteok table · come hungry',0,6.45,23.76,5.8,Math.PI);
 sign('WELCOME · buffet ahead',0,3.95,23.72,3.5,Math.PI);
 box(4.4,.025,2,'#48382b',0,.005,22.7);
 for(let i=-8;i<=8;i++)box(.035,.008,1.8,'#766046',i*.24,.025,22.7);
 // Host desk, reservation book, coat rail, and a small waiting bench.
 box(2.2,1.65,1.5,'#304235',5.1,.825,22.5);box(2.35,.12,1.65,'#96714d',5.1,1.71,22.5);
 box(.85,.05,.55,'#b19c7a',5,1.8,22.35);box(.02,.03,.42,'#241d18',5,1.84,22.35);
 cylinder(.13,.12,'#b38b51',5.8,1.83,22.2,scene,.65);
 sign('WELCOME / TABLE 04',5.1,2.15,21.69,2.1);
 box(3.4,.2,1.05,'#796345',-5.6,.8,22.75);box(3.4,1,.14,'#324837',-5.6,1.3,23.15);
 for(const x of [-7,-4.2])box(.1,.8,.8,'#272921',x,.4,22.75);
 cylinder(.04,3.4,'#795d3e',-9.4,1.7,23);for(const dx of [-.6,.6])box(.8,.06,.05,'#795d3e',-9.4+dx*.5,2.8,23);
 // Upholstered booths and fully set dining tables, with a central communal table.
 diningTables.forEach(({x,z},index)=>{
  box(2.8,.16,2.25,'#98714c',x,1.45,z);
  for(const dx of [-1.05,1.05])for(const dz of [-.8,.8])box(.085,1.4,.085,'#292b24',x+dx,.7,z+dz);
  for(const side of [-1,1]){
   box(2.9,.22,.9,'#47553b',x,.78,z+side*1.7);
   box(2.9,1.35,.18,'#354830',x,1.3,z+side*2.1);
   box(2.65,.55,.7,'#252a21',x,.35,z+side*1.7);
   for(const dx of [-.7,.7]){
    cylinder(.28,.025,'#c6b89b',x+dx,1.555,z+side*.63);
    cylinder(.13,.31,'#616d59',x+dx+.35,1.70,z+side*.63);
    for(const offset of [0,.065]){const stick=cylinder(.012,.65,'#704e32',x+dx-.39+offset,1.57,z+side*.63);stick.rotation.x=Math.PI/2;}
   }
  }
  cylinder(.18,.25,'#a16f45',x,1.66,z);cylinder(.04,.28,'#bea77c',x,1.9,z);luminous(.07,.1,.07,x,2.04,z);
  sign('TABLE '+String(index<3?index+1:index+2).padStart(2,'0'),x,1.78,z+1.14,1.05);
  pendant(x,z);
 });
 // Broad warm pools use a few lights shared by nearby tables to limit GPU cost.
 for(const x of [-8,8,0])for(const z of [8,19]){
  const lamp=new THREE.PointLight('#ffc17c',x===0?55:80,13,2);lamp.position.set(x,5,z);scene.add(lamp);
 }
 // Open kitchen behind the buffet: tiled backsplash, service pass, hood, stockpots, shelving.
 box(13,2.9,.04,'#777768',0,2.6,-5.22);
 for(let x=-6;x<=6;x+=.65)box(.012,2.8,.025,'#434a42',x,2.6,-5.18);
 for(let y=1.3;y<4;y+=.4)box(13,.012,.025,'#434a42',0,y,-5.17);
 box(11.5,1.55,.7,'#626963',0,.78,-4.99,scene,.6);box(11.7,.1,.95,'#b1afa1',0,1.6,-4.85,scene,.8);
 box(8,.55,1.15,'#6f756e',0,4.5,-4.7,scene,.6);box(8,.07,1.2,'#292d29',0,4.2,-4.65);
 for(let x=-3.6;x<4;x+=.24)box(.07,.25,.015,'#313c36',x,4.47,-4.11);
 for(const x of [-3.1,0,3.1]){cylinder(.39,.6,'#94988d',x,1.95,-4.72,scene,.8);cylinder(.42,.04,'#b2b4a6',x,2.26,-4.72,scene,.8);cylinder(.07,.09,'#292f29',x,2.32,-4.72);}
 for(const x of [-8.5,8.5]){
  box(2.5,3.8,.7,'#252e29',x,2,-5.1);
  for(const y of [.5,1.4,2.3,3.2]){box(2.5,.07,.8,'#969586',x,y,-4.99,scene,.6);for(let i=-1;i<=1;i++)cylinder(.23,.3,'#b6aa8b',x+i*.65,y+.2,-4.85);}
 }
 sign('KITCHEN · made for sharing',0,5.8,-5.38,7);
 const kitchenLight=new THREE.PointLight('#ffe0ab',35,10,2);kitchenLight.position.set(0,3.5,-3.5);scene.add(kitchenLight);
 // Sauce bar and drinks are reachable scene objects, not decorative menu panels.
 for(const x of [-10.5,10.5]){box(2.55,1.8,5.3,'#314334',x,.9,-.65);box(2.7,.12,5.5,'#a08a68',x,1.86,-.65);pendant(x,-.65);}
 sauces.forEach((sauce,index)=>{
  const z=-2.6+index*1.3;const group=new THREE.Group();group.position.set(10.55,0,z);scene.add(group);
  group.userData.action='sauce:'+index;group.userData.label=sauce.name+' · click to ladle into your pot';
  // Open stainless insert, rolled rim and sauce below the lip.
  box(1.25,.035,1.16,'#50584f',0,1.945,0,group,.7);
  const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.43,.35,.3,40,1,true),material('#a8ada4',.8));
  (bowl.material as THREE.MeshStandardMaterial).side=THREE.DoubleSide;bowl.position.set(0,2.08,0);group.add(bowl);
  cylinder(.395,.025,sauce.color,0,2.155,0,group);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.43,.027,8,40),material('#d0d2c5',.85));rim.rotation.x=Math.PI/2;rim.position.set(0,2.235,0);group.add(rim);
  // The cup rests in the sauce; the handle leans across the rear rim into a ceramic rest.
  const ladle=new THREE.Group();group.add(ladle);ladle.position.set(.07,2.16,0);
  const scoop=new THREE.Mesh(new THREE.SphereGeometry(.115,20,12,0,Math.PI*2,Math.PI/2,Math.PI/2),material('#c1c7be',.85));
  (scoop.material as THREE.MeshStandardMaterial).side=THREE.DoubleSide;scoop.position.y=.05;ladle.add(scoop);
  const scoopRim=new THREE.Mesh(new THREE.TorusGeometry(.115,.009,8,24),material('#d6d9d0',.85));scoopRim.rotation.x=Math.PI/2;scoopRim.position.y=.05;ladle.add(scoopRim);
  const from=new THREE.Vector3(.07,.055,0),to=new THREE.Vector3(.69,.18,.08);
  const shaft=cylinder(.018,from.distanceTo(to),'#c2c7bf',0,0,0,ladle,.85);
  shaft.position.copy(from).lerp(to,.5);shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),to.clone().sub(from).normalize());
  const grip=box(.22,.06,.075,'#493a2a',.67,.19,.08,ladle);grip.rotation.z=.26;
  box(.24,.06,.23,'#d6c8a7',.65,2.29,.08,group);
  // A supported, tilted card faces the guest from the counter edge, alongside its own bowl.
  box(.25,.18,.75,'#453b2b',-.85,2.01,0,group);
  const card=document.createElement('canvas');card.width=640;card.height=300;
  const ctx=card.getContext('2d')!;ctx.fillStyle='#eee0c4';ctx.fillRect(0,0,640,300);
  ctx.fillStyle=sauce.color;ctx.fillRect(0,0,18,300);ctx.fillStyle='#33271d';ctx.textAlign='center';ctx.font='bold 40px Georgia';
  const names=[['Classic','gochujang'],['Rosé'],['Soy garlic'],['Jjajang']][index];
  names.forEach((name,line)=>ctx.fillText(name,325,85+line*50));
  ctx.font='25px sans-serif';ctx.fillStyle='#726047';ctx.fillText(['SWEET & SPICY','CREAMY & MILD','SAVORY & GARLICKY','RICH BLACK BEAN'][index],325,245);
  const texture=new THREE.CanvasTexture(card);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
  const label=new THREE.Mesh(new THREE.PlaneGeometry(1.05,.49),new THREE.MeshBasicMaterial({map:texture}));
  label.position.set(-.94,2.22,0);label.rotation.set(0,-Math.PI/2,0);label.rotateX(-.45);group.add(label);
  targets.push(group);
 });
 sign('SAUCE BAR',11.72,4.2,-.65,3.6,-Math.PI/2);
 function drinkCard(title:string,note:string,x:number,y:number,z:number,parent:THREE.Object3D):void {
  box(.23,.19,1.04,'#453b2b',x-.08,y-.20,z,parent);
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=300;const ctx=canvas.getContext('2d')!;
  ctx.fillStyle='#eee0c4';ctx.fillRect(0,0,640,300);ctx.fillStyle=title==='Cold water'?'#779ea4':'#996333';ctx.fillRect(0,0,18,300);
  ctx.fillStyle='#33271d';ctx.textAlign='center';ctx.font='bold 43px Georgia';ctx.fillText(title,325,117);ctx.fillStyle='#726047';ctx.font='24px sans-serif';ctx.fillText(note,325,228);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
  const card=new THREE.Mesh(new THREE.PlaneGeometry(1.3,.61),new THREE.MeshBasicMaterial({map:texture}));card.position.set(x,y,z);card.rotation.y=Math.PI/2;card.rotateX(-.45);parent.add(card);
 }
 for(const [index,name] of ['Barley tea','Cold water'].entries()){
  const z=-2.2+index*1.75;const group=new THREE.Group();scene.add(group);group.userData.action='drink:'+name;group.userData.label=name+' · click tap to fill your cup';
  // Matching stainless urns with readable guest-facing cards, working taps and drained drip trays.
  box(1.18,.09,1.35,'#424b43',-10.55,1.965,z,group,.6);
  cylinder(.40,.92,'#aab0a6',-10.7,2.49,z,group,.8);cylinder(.43,.06,'#ced0c4',-10.7,2.98,z,group,.8);cylinder(.08,.09,'#40372a',-10.7,3.055,z,group);
  for(const side of [-1,1])box(.12,.27,.07,'#4e493b',-10.7,2.76,z+side*.43,group);
  const tap=cylinder(.047,.35,'#c4c9bf',-10.21,2.31,z,group,.85);tap.rotation.z=Math.PI/2;
  cylinder(.05,.15,'#b5bcb3',-10.03,2.25,z,group,.85);box(.14,.055,.14,'#403c31',-10.11,2.49,z,group);
  box(.5,.045,.58,'#c7c8b9',-10.04,2.02,z,group,.75);
  for(let i=-2;i<=2;i++)box(.42,.008,.017,'#424a42',-10.04,2.047,z+i*.09,group);
  drinkCard(name,index?'CHILLED · REFILL YOUR CUP':'ROASTED BARLEY · CAFFEINE FREE',-9.43,2.28,z,group);
  targets.push(group);
 }
 const cupRack=new THREE.Group();scene.add(cupRack);cupRack.userData.action='cup';cupRack.userData.label='Clean cups · click to take one';
 box(1.25,.08,1.02,'#66513a',-10.55,1.98,1.35,cupRack);
 for(const x of [-10.83,-10.32])for(let i=0;i<3;i++){
  const ceramic=new THREE.Mesh(new THREE.CylinderGeometry(.16,.13,.25,24,1,true),material('#e0d0ad'));ceramic.material.side=THREE.DoubleSide;ceramic.position.set(x,2.12+i*.13,1.35);cupRack.add(ceramic);
 }
 drinkCard('Clean cups','1. TAKE A CUP   2. CHOOSE A TAP',-9.43,2.28,1.35,cupRack);targets.push(cupRack);
 sign('TEA & WATER',-11.72,4.2,-.65,3.6,Math.PI/2);
 for(const x of [-10.5,10.5]){const lamp=new THREE.PointLight('#ffca87',35,8,2);lamp.position.set(x,4,-.7);scene.add(lamp);}
 // Plants, aisle runners and small directional signs finish the spaces between destinations.
 for(const [x,z] of [[-11,3.1],[11,3.1],[-10.7,23],[10.7,23]]){
  cylinder(.42,.7,'#76523b',x,.35,z);
  for(let i=0;i<8;i++){
   const a=i*2.4;const stem=cylinder(.02,1.3,'#586044',x+Math.cos(a)*.18,1.15,z+Math.sin(a)*.18);stem.rotation.z=Math.cos(a)*.18;
   const leaf=new THREE.Mesh(new THREE.SphereGeometry(.3,9,7),material(i%2?'#465c3c':'#677144'));leaf.scale.set(.6,1.8,.25);leaf.position.set(x+Math.cos(a)*.35,1.55+(i%3)*.17,z+Math.sin(a)*.35);leaf.rotation.set(.2,a,.4);scene.add(leaf);
  }
 }
 sign('BUFFET  ↑     ·     TEA  ←     ·     SAUCES  →',0,6.5,2.2,8);
 sign('DINING ROOM  ·  TABLE 04',0,6.5,12.5,6,Math.PI);
 return {targets,dispose:()=>{textures.forEach(texture=>texture.dispose());materials.forEach(material=>material.dispose());}};
}
