import {inPolygon} from './rdc-world.js';
export function wallDistance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p.x-a[0])*dx+(p.y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a[0]-dx*t,p.y-a[1]-dy*t);}
export function cutWall(wall,doors,collision=false){
 const {a,b}=wall,dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(length<.001)return [];
 const intervals=doors.filter(d=>d.wallId===wall.id&&(!collision||!d.inactive)).map(d=>{
  const t=((d.wallAt[0]-a[0])*dx+(d.wallAt[1]-a[1])*dy)/length;
  return [Math.max(0,t-d.width/2),Math.min(length,t+d.width/2)];
 }).filter(([lo,hi])=>hi>lo).sort((a,b)=>a[0]-b[0]);
 let cursor=0;const parts=[];
 const add=(lo,hi)=>{if(hi-lo>.01)parts.push({...wall,a:[a[0]+dx*lo/length,a[1]+dy*lo/length],b:[a[0]+dx*hi/length,a[1]+dy*hi/length]});};
 for(const [lo,hi]of intervals){add(cursor,lo);cursor=Math.max(cursor,hi);}add(cursor,length);return parts;
}
export function compileRoom(room){
 const walls=room.walls||[];
 return {...room,visibleWalls:walls.flatMap(w=>cutWall(w,room.doors)),collisionWalls:walls.flatMap(w=>cutWall(w,room.doors,true))};
}
export function fixtureDistance(fixture,p){const [x,y,w,h]=fixture.bounds;return Math.hypot(p.x-Math.max(x,Math.min(x+w,p.x)),p.y-Math.max(y,Math.min(y+h,p.y)));}
export function canOccupy(room,p){
 return !(room.fixtures||[]).some(f=>(f.kind==='stairs'||f.solid)&&f.bounds&&fixtureDistance(f,p)<6)&&[[-5,-4],[5,-4],[5,4],[-5,4]].every(([x,y])=>inPolygon(p.x+x,p.y+y,room.outline))&&room.collisionWalls.every(w=>wallDistance(p,w.a,w.b)>5+w.thickness/2);
}
export function moveInRoom(room,player,dx,dy){
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/3)),p={...player};
 for(let i=0;i<steps;i++){if(canOccupy(room,{x:p.x+dx/steps,y:p.y}))p.x+=dx/steps;if(canOccupy(room,{x:p.x,y:p.y+dy/steps}))p.y+=dy/steps;}return p;
}
export function portalAt(room,p,dx,dy,locked){
 return room.doors.filter(d=>!d.inactive&&d.target&&d.id!==locked&&Math.hypot(p.x-d.at[0],p.y-d.at[1])<18&&dx*d.normal[0]+dy*d.normal[1]>0).sort((a,b)=>Math.hypot(p.x-a.at[0],p.y-a.at[1])-Math.hypot(p.x-b.at[0],p.y-b.at[1]))[0];
}
