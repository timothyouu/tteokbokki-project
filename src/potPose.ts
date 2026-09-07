// A compact first-person carry pose stays entirely inside the player's 0.8-unit clearance.
export function potPose(aspect:number,fov:number):{x:number;y:number;z:number;scale:number} {
 const depth=.58;
 const halfHeight=depth*Math.tan(fov*Math.PI/360);
 return {x:aspect<.85?0:-.055,y:-.115,z:-depth,scale:Math.min(.07,halfHeight*aspect*.60/1.75)};
}
