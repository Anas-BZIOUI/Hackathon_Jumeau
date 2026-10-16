import {dampFactor} from './motion.js';

// Retract immediately to respect collision clearance; recover gradually with hysteresis.
export function cameraComfort(previous,available,preferred,dt,reduced=false){
 const limit=Math.max(0,Math.min(available,preferred));
 const old=Number.isFinite(previous?.distance)?previous.distance:limit;
 const distance=limit<old||reduced?limit:old+(limit-old)*dampFactor(5,Math.max(0,dt));
 const firstPerson=previous?.firstPerson?distance<1.2:distance<.85;
 return {distance,firstPerson};
}

// Facing the camera direction is an explicit strafe mode, separate from free exploration.
export function characterHeading(cameraYaw,movementHeading,strafe=false,automatic=false){
 return strafe&&!automatic?cameraYaw:movementHeading;
}

export function roomLabelDetail(distance,important=false,primary=true){
 if(!Number.isFinite(distance)||distance<0)return 'hidden';
 if(primary&&distance<=(important?14:7))return 'full';
 return distance<=(important?28:16)?'compact':'hidden';
}
