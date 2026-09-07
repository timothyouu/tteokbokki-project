import assert from 'node:assert/strict';
import {createMixing,makeFoodBody,advanceMixing,surfaceHeight} from '../src/mixing.ts';
function setup(count=12){const state=createMixing();state.bodies=Array.from({length:count},(_,i)=>makeFoodBody('piece:'+i,i,i%2===0));return state;}
function simulate(state,seconds,fps=60,drive=false,boil=0){for(let i=0;i<seconds*fps;i++){
 if(drive){state.engaged=true;const a=i/fps*2.5;state.target={x:.6*Math.cos(a),z:.6*Math.sin(a)};}
 advanceMixing(state,1/fps,boil);
}return state;}
const mixed=simulate(setup(),4,60,true);assert.ok(Math.abs(mixed.current)>.1,'Circular stirring transfers momentum');
const speed=Math.max(...mixed.bodies.map(b=>Math.hypot(b.vx,b.vz)));
mixed.engaged=false;advanceMixing(mixed,1/60,0);assert.ok(Math.max(...mixed.bodies.map(b=>Math.hypot(b.vx,b.vz)))>speed*.5,'Release must not freeze food');
simulate(mixed,15);assert.ok(Math.abs(mixed.current)<1e-6);assert.ok(mixed.bodies.every(b=>Math.hypot(b.vx,b.vz)<.001),'Broth and food settle without energy input');
for(const fps of [20,60,144]){const full=simulate(setup(48),8,fps,true,1);for(const b of full.bodies){assert.ok(Number.isFinite(b.x+b.z+b.vx+b.vz));assert.ok(Math.hypot(b.x,b.z)+b.radius<=1.015+1e-8,'Food stays within wall');}for(let i=0;i<full.bodies.length;i++)for(let j=i+1;j<full.bodies.length;j++){const a=full.bodies[i],b=full.bodies[j];assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>a.radius+b.radius-.025,'Contacts prevent persistent deep overlap');}}
const a=setup(),b=setup();a.engaged=b.engaged=true;a.target=b.target={x:0,z:.6};simulate(a,3,30);simulate(b,3,120);assert.ok(Math.abs(a.current-b.current)<1e-8);assert.ok(Math.abs(a.bodies[0].x-b.bodies[0].x)<1e-8,'Fixed-step motion is frame-rate independent');
const clockwise=setup(),counter=setup();for(let i=0;i<240;i++){for(const [s,sign] of [[clockwise,1],[counter,-1]]){s.engaged=true;s.target={x:.6*Math.cos(i/60*2.5),z:sign*.6*Math.sin(i/60*2.5)};advanceMixing(s,1/60,0);}}assert.ok(clockwise.current>0&&counter.current<0,'Drag direction determines swirl direction');
const slosh=setup(0);for(let i=0;i<60;i++)advanceMixing(slosh,1/60,0,{x:4,z:0});assert.ok(slosh.slope.x<0);simulate(slosh,8);assert.ok(Math.abs(surfaceHeight(slosh,.8,0,0))<.0001,'Liquid returns to level');
console.log('PASS: stirring direction, momentum and settling, full-pot contacts and containment at 20/60/144 fps, fixed-step consistency, liquid response and leveling.');
