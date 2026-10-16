import {segmentDistance} from './walking.js';

const metres=value=>value>0&&value<1?'< 1':Math.round(value);
const distance=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
export function routeInstructions(route){
 const result=[];let along=0;
 for(const [legIndex,leg] of (route?.legs||[]).entries()){
  if(leg.kind!=='walk'){
   result.push({kind:leg.kind,level:leg.from,legIndex,along,point:leg.fromPoint,metres:0,text_fr:`Prendre ${leg.kind==='stairs'?'l’escalier':'l’ascenseur'} vers ${leg.to}`,text_en:`Take the ${leg.kind==='stairs'?'stairs':'lift'} to ${leg.to}`});continue;
  }
  const points=leg.points;let run=0;
  for(let i=1;i<points.length;i++){
   run+=distance(points[i-1],points[i]);along+=distance(points[i-1],points[i]);
   if(i===points.length-1){result.push({kind:'straight',level:leg.level,legIndex,along,point:points[i],metres:run,text_fr:`Continuer sur ${metres(run)} m`,text_en:`Continue for ${metres(run)} m`});continue;}
   const a=points[i-1],b=points[i],c=points[i+1],ux=b[0]-a[0],uy=b[1]-a[1],vx=c[0]-b[0],vy=c[1]-b[1];
   const angle=Math.atan2(ux*vy-uy*vx,ux*vx+uy*vy);
   if(Math.abs(angle)<Math.PI/6)continue;
   const kind=Math.abs(angle)>Math.PI*.85?'uturn':angle>0?'left':'right';
   const fr={left:'Tourner à gauche',right:'Tourner à droite',uturn:'Faire demi-tour'},en={left:'Turn left',right:'Turn right',uturn:'Turn around'};
   result.push({kind,level:leg.level,legIndex,along,point:b,metres:run,text_fr:`Dans ${metres(run)} m, ${fr[kind].toLowerCase()}`,text_en:`In ${metres(run)} m, ${en[kind].toLowerCase()}`});run=0;
  }
 }
 const lastWalk=route?.legs?.filter(l=>l.kind==='walk').at(-1),node=route?.nodes?.at(-1);
 result.push({kind:'arrival',along,level:lastWalk?.level||node?.level,point:lastWalk?.points.at(-1)||(node?[node.x,node.y]:null),metres:0,text_fr:route?.arrivalAtDoor?'Arrivée à la porte ; entrée dans la salle non confirmée':'Arrivée au point de destination dans la salle',text_en:route?.arrivalAtDoor?'Arrive at the door; entry into the room is unconfirmed':'Arrive at the destination point inside the room'});
 return result;
}

export function guidanceState(route,position){
 const steps=routeInstructions(route),progress=routeProgress(route,position);
 let index=0;
 if(progress){
  if(progress.offRoute)return {steps,progress,index:-1,next:null,distanceToNext:null};
  const arrival=steps.at(-1);
  if(arrival?.point&&arrival.level===position.floor&&distance(arrival.point,[position.x,position.y])<=.6)index=steps.length-1;
  else{
   const leg=route.legs[progress.legIndex],transition=route.legs[progress.legIndex+1],end=leg?.points?.at(-1);
   const nearTransition=transition&&transition.kind!=='walk'&&transition.from===position.floor&&end&&distance(end,[position.x,position.y])<=.6;
   index=nearTransition?steps.findIndex(s=>s.legIndex===progress.legIndex+1):steps.findIndex(s=>s.level===position.floor&&s.kind!=='arrival'&&s.along>=progress.along-.15);
   if(index<0)index=steps.findIndex(s=>s.kind==='arrival'&&s.level===position.floor);
   if(index<0)index=steps.findIndex(s=>s.legIndex===progress.legIndex);
  }
 }
 const next=index>=0?steps[index]:null;
 return {steps,progress,index,next,distanceToNext:progress&&next?Math.max(0,Math.round(next.along-progress.along)):null};
}

export function routeProgress(route,position){
 if(!route?.legs?.length||!position)return null;
 let best=null,walked=0,total=0;
 for(const [legIndex,leg] of route.legs.entries()){
  if(leg.kind!=='walk')continue;
  if(leg.points.length===1&&leg.level===position.floor){
   const d=distance(leg.points[0],[position.x,position.y]);
   if(!best||d<best.distance)best={distance:d,along:walked,legIndex};
  }
  for(let i=1;i<leg.points.length;i++){
   const a=leg.points[i-1],b=leg.points[i],len=distance(a,b);
   if(leg.level===position.floor){
    const d=segmentDistance(position.x,position.y,a,b),t=len?Math.max(0,Math.min(1,((position.x-a[0])*(b[0]-a[0])+(position.y-a[1])*(b[1]-a[1]))/(len*len))):0;
    if(!best||d<best.distance)best={distance:d,along:walked+t*len,legIndex};
   }
   walked+=len;total+=len;
  }
 }
 if(!best)return {offRoute:true,remaining:Math.round(total),legIndex:null};
 return {...best,offRoute:best.distance>2,remaining:Math.max(0,Math.round(total-best.along))};
}

export function rerouteOrigin(route,position,{enabled=true,status='ready'}={}){
 if(!enabled||status!=='ready'||!position||position.stairLink||![position.x,position.y].every(Number.isFinite))return null;
 return routeProgress(route,position)?.offRoute?{...position}:null;
}
