// Frame-rate independent smoothing, including turns across the -PI / PI boundary.
export const dampFactor=(rate,dt)=>1-Math.exp(-rate*dt);
export function dampAngle(current,target,rate,dt){
 const difference=Math.atan2(Math.sin(target-current),Math.cos(target-current));
 return current+difference*dampFactor(rate,dt);
}
// Query the existing spatial grid instead of raycasting every mesh in the building.
export function cameraFraction(map,start,end){
 const distance=Math.hypot(end[0]-start[0],end[1]-start[1]);
 const steps=Math.max(1,Math.ceil(distance/.1));
 for(let i=1;i<=steps;i++)if(!map.clear(start[0]+(end[0]-start[0])*i/steps,start[1]+(end[1]-start[1])*i/steps))return Math.max(0,(i-1)/steps);
 return 1;
}
