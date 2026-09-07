export interface ThermalState {
 temperature: number;
 boil: number;
 progress: number;
}
export const coldPot = (): ThermalState => ({temperature:22,boil:0,progress:0});
const clamp = (value:number,min:number,max:number):number => Math.max(min,Math.min(max,value));
/** Accelerated lumped heat model: burner input, heat loss, pot load, and boiling energy. */
export function advanceHeat(state:ThermalState,burnerOn:boolean,heat:number,portions:number,seconds:number):ThermalState {
 let temperature=state.temperature,boil=state.boil,progress=state.progress;
 let remaining=clamp(seconds,0,1);
 const setting=clamp(heat,1,3);
 const mass=1+clamp(portions,0,24)/24;
 while(remaining>0){
  const dt=Math.min(remaining,.05);remaining-=dt;
  const power=burnerOn&&progress<100?[0,6,10,16][Math.round(setting)]:0;
  const loss=.065*(temperature-22);
  temperature=clamp(temperature+(power-loss)*dt/mass,22,100);
  const hotFraction=clamp((temperature-88)/12,0,1);
  // Extra energy drives vapor production at the boiling point, not hotter water.
  const targetBoil=power>0?hotFraction*[0,.16,.52,1][Math.round(setting)]:0;
  boil+=(targetBoil-boil)*(1-Math.exp(-dt/(power>0?1.8:3.2)));
  const cookingRate=clamp((temperature-78)/22,0,1)*3.4;
  progress=clamp(progress+cookingRate*dt,0,100);
 }
 return {temperature,boil,progress};
}
export function cookingPrompt(burnerOn:boolean,temperature:number,ready:boolean):string {
 if(ready)return 'Ready · click the chopsticks on the napkin to eat.';
 if(!burnerOn)return temperature>40?'Burner off · turn the dial on to keep cooking':'Click the burner dial to light it';
 if(temperature<65)return 'Warming up · give the broth a moment';
 if(temperature<90)return 'Heating through · gently stir the broth';
 return 'Simmering · stir gently to keep the food moving';
}
export function heatDescription(temperature:number,boil:number):string {
 if(boil>.72)return 'Rolling boil';
 if(boil>.3)return 'Steady simmer';
 if(boil>.06)return 'Gentle simmer';
 if(temperature>65)return 'Steaming';
 if(temperature>30)return 'Warming';
 return 'Cool broth';
}
