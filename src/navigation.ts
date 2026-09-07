export interface Position {x:number;z:number}
export const diningTables = [
 {x:-8.8,z:6.8}, {x:8.8,z:6.8},
 {x:-8.8,z:13.2}, {x:8.8,z:13.2},
 {x:-8.8,z:19.6}, {x:8.8,z:19.6},
 {x:4.4,z:17},
];
// Leave room for the carried pot while preserving rounded sliding along furniture.
const bodyRadius=.8;
const obstacles = [
 {left:-7.25,right:7.25,back:-2.125,front:2.125},
 {left:-2.1,right:2.1,back:4.55,front:8.25},
 {left:-11.85,right:-9.15,back:-3.4,front:2.1},
 {left:9.15,right:11.85,back:-3.4,front:2.1},
 {left:-7.3,right:-3.9,back:22.225,front:23.22},
 {left:-5.85,right:5.85,back:-5.4,front:-4.37},
 {left:3.925,right:6.275,back:21.675,front:23.325},
 ...[[-11,3.1],[11,3.1],[-10.7,23],[10.7,23]].map(([x,z])=>({left:x-.45,right:x+.45,back:z-.45,front:z+.45})),
 ...diningTables.flatMap(({x,z})=>[
  {left:x-1.4,right:x+1.4,back:z-1.125,front:z+1.125},
  {left:x-1.45,right:x+1.45,back:z-2.19,front:z-1.25},
  {left:x-1.45,right:x+1.45,back:z+1.25,front:z+2.19},
 ]),
];
export function walkPosition(position:Position,dx:number,dz:number,radius=bodyRadius):Position {
 const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dz))/.08));
 let result={...position};
 for(let i=0;i<steps;i++){
  result={x:Math.max(-11.1,Math.min(11.1,result.x+dx/steps)),z:Math.max(-4.5,Math.min(23.1,result.z+dz/steps))};
  for(let pass=0;pass<3;pass++)for(const b of obstacles){
   const cx=Math.max(b.left,Math.min(b.right,result.x)),cz=Math.max(b.back,Math.min(b.front,result.z));
   const vx=result.x-cx,vz=result.z-cz,distance=Math.hypot(vx,vz);
   if(distance>0&&distance<radius){result.x=cx+vx/distance*radius;result.z=cz+vz/distance*radius;}
   else if(distance===0){
    const edges=[{x:b.left-radius,z:result.z},{x:b.right+radius,z:result.z},{x:result.x,z:b.back-radius},{x:result.x,z:b.front+radius}];
    edges.sort((a,b)=>Math.hypot(a.x-result.x,a.z-result.z)-Math.hypot(b.x-result.x,b.z-result.z));result=edges[0];
   }
  }
 }
 return result;
}
export const atSeat=(position:Position):boolean=>Math.hypot(position.x,position.z-10.25)<1.05;
export function restaurantZone(position:Position):string {
 if(position.z>20.7)return 'Entrance & host';
 if(position.z<3&&position.x<-7.7)return 'Tea & drinks';
 if(position.z<3&&position.x>7.7)return 'Sauce bar';
 if(position.z<-2.6)return 'Open kitchen';
 if(position.z<4.3)return 'The buffet';
 if(Math.abs(position.x)>6.5)return 'Window booths';
 if(position.z>12)return 'Dining room';
 return 'Table 04';
}
