export interface Point3 {x:number;y:number;z:number}
export interface Solid {min:Point3;max:Point3}
export const potHalfSize={x:.72,y:.27,z:.72};
// Conservative bounds include the handles, rim, food and walking sway.
export function overlapsPot(p:Point3,b:Solid):boolean {
 return p.x+potHalfSize.x>b.min.x&&p.x-potHalfSize.x<b.max.x&&p.y+potHalfSize.y>b.min.y&&p.y-potHalfSize.y<b.max.y&&p.z+potHalfSize.z>b.min.z&&p.z-potHalfSize.z<b.max.z;
}
export function clearPot(desired:Point3,solids:readonly Solid[],allowLift=true):Point3 {
 const p={...desired};
 for(let pass=0;pass<16;pass++){
  let moved=false;
  for(const b of solids){
   if(!overlapsPot(p,b))continue;
   // Lift above tables/counters; at walls move the pot back into the room.
   if(allowLift&&b.max.y<=3.3){p.y=b.max.y+potHalfSize.y+.035;moved=true;continue;}
   const choices=[{axis:'x' as const,value:b.min.x-potHalfSize.x-.035},{axis:'x' as const,value:b.max.x+potHalfSize.x+.035},{axis:'z' as const,value:b.min.z-potHalfSize.z-.035},{axis:'z' as const,value:b.max.z+potHalfSize.z+.035}];
   choices.sort((a,b)=>Math.abs(a.value-p[a.axis])-Math.abs(b.value-p[b.axis]));
   p[choices[0].axis]=choices[0].value;moved=true;
  }
  if(!moved)break;
 }
 return p;
}
