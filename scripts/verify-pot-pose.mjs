import assert from 'node:assert/strict';
import * as THREE from 'three';
import {potPose} from '../src/potPose.ts';
for(const aspect of [390/844,760/900,1280/720,2.4])for(const pitch of [-.72,-.41,-.12]){
 const camera=new THREE.PerspectiveCamera(62,aspect,.08,100);camera.position.set(0,4.25,4);camera.rotation.x=pitch;camera.updateMatrixWorld();
 const pose=potPose(aspect,62);const center=camera.localToWorld(new THREE.Vector3(pose.x,pose.y,pose.z));
 // Bounds encompass handles, pot, rice cakes and the small walking sway.
 for(const x of [-1.75,1.75])for(const y of [-.38,.53])for(const z of [-1.18,1.18]){
  const point=center.clone().add(new THREE.Vector3(x,y,z).multiplyScalar(pose.scale));
  assert.ok(Math.hypot(point.x-camera.position.x,point.z-camera.position.z)<.8,'Entire pot must fit inside walking clearance');
  point.project(camera);assert.ok(Math.abs(point.x)<.96,'Handles must stay inside screen');assert.ok(point.y>-.72&&point.y<-.06,'Pot must stay below crosshair and clear of bottom controls');
 }
}
console.log('PASS: complete pot and handles fit desktop/mobile screens, leave room for controls and stay inside walking clearance at all tested look angles.');
