import assert from 'node:assert/strict';
import {clearPot,overlapsPot} from '../src/carry.ts';
import {diningTables} from '../src/navigation.ts';
const solids=[
 {min:{x:-2.1,y:.63,z:4.55},max:{x:2.1,y:.77,z:8.25}},
 {min:{x:9.15,y:0,z:-3.4},max:{x:11.85,y:1.92,z:2.1}},
 {min:{x:-12,y:0,z:-5.6},max:{x:-11.78,y:8,z:24.2}},
 {min:{x:11.78,y:0,z:-5.6},max:{x:12,y:8,z:24.2}},
 ...diningTables.flatMap(({x,z})=>[
  {min:{x:x-1.4,y:1.37,z:z-1.125},max:{x:x+1.4,y:1.53,z:z+1.125}},
  {min:{x:x-1.45,y:.625,z:z+2.01},max:{x:x+1.45,y:1.975,z:z+2.19}},
 ])];
for(let x=-11.6;x<=11.6;x+=.4)for(let z=-3;z<=23;z+=.4)for(const y of [1,1.8,2.6]){
 const clear=clearPot({x,y,z},solids);assert.ok(solids.every(s=>!overlapsPot(clear,s)),`Clipping at ${x},${y},${z}`);
}
const above=clearPot({x:10.2,y:1.8,z:0},solids);assert.ok(above.y>2.19,'Raise above a service counter');
const away=clearPot({x:11.6,y:3,z:3},solids);assert.ok(away.x<11.06,'Pull the complete pot away from walls');
assert.deepEqual(clearPot({x:0,y:3,z:12},solids),{x:0,y:3,z:12});
console.log('PASS: pot bounds clear tables, benches, counters and walls across 11,000+ approach samples; open-space placement stays unchanged.');

for(const solid of solids){const p={x:(solid.min.x+solid.max.x)/2,y:2.6,z:(solid.min.z+solid.max.z)/2};const safe=clearPot(p,[solid],false);assert.equal(safe.y,p.y,'Standoff mode must never lift the pot');assert.ok(!overlapsPot(safe,solid));}
