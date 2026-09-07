import assert from 'node:assert/strict';
import {walkPosition,atSeat,restaurantZone,diningTables} from '../src/navigation.ts';
assert.ok(walkPosition({x:0,z:3.7},0,-50).z>2.125);
assert.ok(walkPosition({x:-5,z:6},20,0).x<-2.1);
assert.ok(walkPosition({x:0,z:10},0,-20).z>8.25);
assert.ok(atSeat(walkPosition({x:-5,z:10.25},5,0)));
assert.equal(atSeat({x:0,z:3.7}),false);
assert.equal(restaurantZone(walkPosition({x:-3,z:3.7},0,19)),'Entrance & host');
assert.equal(restaurantZone(walkPosition({x:-8,z:3.7},0,-5)),'Tea & drinks');
assert.equal(restaurantZone(walkPosition({x:8,z:3.7},0,-5)),'Sauce bar');
assert.ok(walkPosition({x:8,z:-1},30,0).x<9.15);
assert.ok(walkPosition({x:-8,z:-1},-30,0).x>-9.15);
assert.ok(walkPosition({x:-3,z:23},0,50).z<=23.1);
assert.ok(walkPosition({x:11,z:10},50,0).x<=11.1);
for(const {x,z} of diningTables)assert.ok(walkPosition({x:x-2.4,z},5,0).x<x-1.4);
// The main aisle is now open end-to-end beyond the cooking chair.
assert.ok(walkPosition({x:0,z:11.5},0,10).z>21);
// Real empty space beside a booth no longer behaves like an invisible chair.
assert.ok(walkPosition({x:-6.45,z:4},0,5).z>8.9);
// Diagonal movement glances along the table instead of stopping both axes.
const slide=walkPosition({x:-2.7,z:5},2,2);assert.ok(slide.z>6.9&&slide.x<-2.1);
assert.ok(walkPosition({x:0,z:3.7},0,-20).z>=2.9);
assert.ok(walkPosition({x:0,z:11},0,-20).z>=9.04);
assert.ok(walkPosition({x:8,z:0},20,0).x<=8.36);
console.log('PASS: physical furniture bounds, rounded sliding, clear central/booth aisles, service routes and seating.');
