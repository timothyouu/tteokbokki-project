export interface Point {x:number;z:number}
export interface FoodBody extends Point {
 key:string; radius:number; mass:number; floatHeight:number;
 vx:number; vz:number; angle:number; spin:number;
}
export interface MixingState {
 bodies:FoodBody[]; spoon:Point; target:Point; engaged:boolean;
 current:number; slope:Point; slopeVelocity:Point; elapsed:number; remainder:number;
}
const clamp=(v:number,lo:number,hi:number):number=>Math.max(lo,Math.min(hi,v));
export function insidePot(point:Point,radius=.78):Point {
 const length=Math.hypot(point.x,point.z);
 const scale=length>radius?radius/length:1;
 return {x:point.x*scale,z:point.z*scale};
}
export function createMixing():MixingState {
 return {bodies:[],spoon:{x:.6,z:0},target:{x:.6,z:0},engaged:false,current:0,
 slope:{x:0,z:0},slopeVelocity:{x:0,z:0},elapsed:0,remainder:0};
}
export function makeFoodBody(key:string,index:number,light:boolean):FoodBody {
 const angle=index*2.399963229728653;
 const radius=.15+.62*Math.sqrt((index%48)/47);
 return {key,x:Math.cos(angle)*radius,z:Math.sin(angle)*radius,radius:light?.10:.115,
 mass:light?.65:1.35,floatHeight:light?.045:-.015,vx:0,vz:0,angle,spin:0};
}
function contain(body:FoodBody):void {
 const distance=Math.hypot(body.x,body.z),limit=1.015-body.radius;
 if(distance<=limit)return;
 const nx=body.x/distance,nz=body.z/distance;
 body.x=nx*limit;body.z=nz*limit;
 const outward=body.vx*nx+body.vz*nz;
 if(outward>0){body.vx-=1.08*outward*nx;body.vz-=1.08*outward*nz;}
}
function contacts(bodies:FoodBody[]):void {
 for(let pass=0;pass<5;pass++){
  for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
   const a=bodies[i],b=bodies[j],dx=b.x-a.x,dz=b.z-a.z;
   const distance=Math.hypot(dx,dz),separation=a.radius+b.radius;
   if(distance>=separation)continue;
   const nx=distance>1e-8?dx/distance:1,nz=distance>1e-8?dz/distance:0;
   const inverseMass=1/a.mass+1/b.mass,correction=(separation-distance)/inverseMass;
   a.x-=nx*correction/a.mass;a.z-=nz*correction/a.mass;
   b.x+=nx*correction/b.mass;b.z+=nz*correction/b.mass;
   const closing=(b.vx-a.vx)*nx+(b.vz-a.vz)*nz;
   if(closing<0){const impulse=-1.05*closing/inverseMass;
    a.vx-=impulse*nx/a.mass;a.vz-=impulse*nz/a.mass;
    b.vx+=impulse*nx/b.mass;b.vz+=impulse*nz/b.mass;
   }
  }
  bodies.forEach(contain);
 }
}
/** Shallow broth approximation, not a volumetric fluid solver. Fixed steps keep drag stable. */
export function advanceMixing(state:MixingState,seconds:number,boil:number,acceleration:Point={x:0,z:0}):void {
 const h=1/120;
 state.remainder+=clamp(seconds,0,.25);
 while(state.remainder+1e-10>=h){
  state.remainder-=h;state.elapsed+=h;
  const old={...state.spoon};
  if(state.engaged){
   const goal=insidePot(state.target),dx=goal.x-old.x,dz=goal.z-old.z;
   const travel=Math.min(1,2.4*h/Math.max(Math.hypot(dx,dz),1e-8));
   state.spoon={x:old.x+dx*travel,z:old.z+dz*travel};
  }
  const vx=(state.spoon.x-old.x)/h,vz=(state.spoon.z-old.z)/h;
  const torque=state.spoon.x*vz-state.spoon.z*vx;
  state.current=clamp(state.current*Math.exp(-1.15*h)+torque*.85*h,-2.2,2.2);
  for(const axis of ['x','z'] as const){
   const goal=clamp(-acceleration[axis]*.012,-.045,.045);
   state.slopeVelocity[axis]+=(36*(goal-state.slope[axis])-7*state.slopeVelocity[axis])*h;
   state.slope[axis]+=state.slopeVelocity[axis]*h;
  }
  for(const body of state.bodies){
   const dx=body.x-state.spoon.x,dz=body.z-state.spoon.z;
   const influence=state.engaged?Math.exp(-(dx*dx+dz*dz)/.10):0;
   const flowX=-body.z*state.current+vx*influence*.8;
   const flowZ=body.x*state.current+vz*influence*.8;
   const drag=1-Math.exp(-3.5*h/body.mass);
   body.vx+=(flowX-body.vx)*drag;body.vz+=(flowZ-body.vz)*drag;
   body.vx+=(Math.sin(state.elapsed*3+body.angle)*boil*.16-acceleration.x*.12-9.8*state.slope.x)*h;
   body.vz+=(Math.cos(state.elapsed*2.7+body.angle)*boil*.16-acceleration.z*.12-9.8*state.slope.z)*h;
   if(state.engaged){
    const distance=Math.hypot(dx,dz),limit=body.radius+.12;
    if(distance<limit){const nx=distance>1e-8?dx/distance:1,nz=distance>1e-8?dz/distance:0;
     body.x=state.spoon.x+nx*limit;body.z=state.spoon.z+nz*limit;
     const closing=(body.vx-vx)*nx+(body.vz-vz)*nz;
     if(closing<0){body.vx-=closing*nx;body.vz-=closing*nz;}
    }
   }
   const speed=Math.hypot(body.vx,body.vz);if(speed>3){body.vx*=3/speed;body.vz*=3/speed;}
   body.x+=body.vx*h;body.z+=body.vz*h;
   body.spin+=(state.current*.6-body.spin)*(1-Math.exp(-2*h/body.mass));body.angle+=body.spin*h;
  }
  contacts(state.bodies);
 }
}
export function surfaceHeight(state:MixingState,x:number,z:number,boil:number):number {
 const swirl=Math.min(.018,state.current*state.current*.006)*(x*x+z*z-.5);
 return state.slope.x*x+state.slope.z*z+swirl+
  boil*.004*Math.sin(x*15+state.elapsed*7)*Math.cos(z*13-state.elapsed*5);
}
