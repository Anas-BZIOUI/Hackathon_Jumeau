import {cleanDoorContours,straightGameWalls} from './clean-door-contours.mjs';
import {applySouthwest} from './rdc-southwest.mjs';
import fs from 'node:fs';
import {inPolygon} from '../src/game/rdc-world.js';
const source=JSON.parse(fs.readFileSync('public/game/maps/rdc-layout.json'));
const tile=16;
const rooms=source.rooms.map(r=>{
 const [minX,minY,maxX,maxY]=r.bounds;
 const scale=Math.max(40,Math.min(96,320/Math.max(maxX-minX,maxY-minY)));
 const cleaned=cleanDoorContours(r.polygon,source.doorSymbols||[]);
 cleaned.polygon=straightGameWalls(cleaned.polygon,source.doorSymbols||[]);
 const convert=([x,y])=>[32+(x-minX)*scale,32+(maxY-y)*scale];
 const cells=[];
 for(let y=32;y<32+(maxY-minY)*scale;y+=tile)for(let x=32;x<32+(maxX-minX)*scale;x+=tile)
  if(inPolygon(minX+(x-24)/scale,maxY-(y-24)/scale,r.polygon))cells.push([x/tile,y/tile]);
 if(r.id==='rdc-38'){cells.length=0;for(let y=2;y<22;y++)for(let x=2;x<22;x++)cells.push([x,y]);}
 // Drop isolated raster fragments caused by sub-tile details in the architectural contours.
 const remaining=new Set(cells.map(c=>c.join(',')));let largest=[];
 while(remaining.size){const seed=remaining.values().next().value;remaining.delete(seed);const component=[seed.split(',').map(Number)];for(const [x,y] of component)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const c=[x+dx,y+dy],key=c.join(',');if(remaining.delete(key))component.push(c);}if(component.length>largest.length)largest=component;}
 cells.splice(0,cells.length,...largest);
 const nearest=p=>cells.map(([x,y])=>[x*tile+8,y*tile+8]).sort((a,b)=>Math.hypot(a[0]-p[0],a[1]-p[1])-Math.hypot(b[0]-p[0],b[1]-p[1]))[0];
 return {id:r.id,name:r.name,number:r.number,cells,outline:r.id==='rdc-38'?null:cleaned.polygon.slice(0,-1).map(convert),doorContourCorrections:cleaned.removed,spawn:r.id==='rdc-38'?[192,280]:nearest(convert(r.anchor)),scale,origin:[minX,maxY]};
});
const doors=source.doors.filter(d=>!d.rooms.includes('rdc-38'));
// The vestibule is explicitly authored: two lateral entrances, not six inferred openings.
for(const id of ['door-20','door-17'])doors.push(source.doors.find(d=>d.id===id));
const lookup=new Map(rooms.map(r=>[r.id,r]));
for(const r of rooms){
 const set=new Set(r.cells.map(c=>c.join(',')));
 r.doors=doors.filter(d=>d.rooms.includes(r.id)).map(d=>{
  const side=d.rooms.indexOf(r.id);const [x,y]=d.entries[side];
  const p=[32+(x-r.origin[0])*r.scale,32+(r.origin[1]-y)*r.scale];
  const boundary=r.cells.filter(([a,b])=>[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>!set.has([a+dx,b+dy].join(','))));
  const c=boundary.sort((a,b)=>Math.hypot(a[0]*tile+8-p[0],a[1]*tile+8-p[1])-Math.hypot(b[0]*tile+8-p[0],b[1]*tile+8-p[1]))[0];
  let at=[c[0]*tile+8,c[1]*tile+8];
  let normal=[[1,0],[-1,0],[0,1],[0,-1]].find(([dx,dy])=>!set.has([c[0]+dx,c[1]+dy].join(',')));
  if(r.id==='rdc-38'){const left=d.id==='door-20';at=[left?40:344,120];normal=[left?-1:1,0];}
  const symbols=(source.doorSymbols||[]).filter(s=>Math.hypot(s.hinge[0]-d.position[0],s.hinge[1]-d.position[1])<1.8);
  const double=symbols.some(a=>symbols.some(b=>a!==b&&Math.min(a.width,b.width)/Math.max(a.width,b.width)<.8&&Math.abs(Math.hypot(a.hinge[0]-b.hinge[0],a.hinge[1]-b.hinge[1])-a.width-b.width)<.25));
  return {id:d.id,target:d.rooms[1-side],at,normal,leaves:double?2:1};
 });
 delete r.scale;delete r.origin;
}
applySouthwest(rooms);
// Seat every portal on a straight continuous wall with a valid interior arrival.
for(const room of rooms){
 if(!room.outline||room.wallSource)continue;
 const fits=p=>[[-5,-4],[5,-4],[5,4],[-5,4]].every(([dx,dy])=>inPolygon(p[0]+dx,p[1]+dy,room.outline));
 for(const door of room.doors){
  const candidates=[];
  for(let i=0;i<room.outline.length;i++){
   const a=room.outline[i],b=room.outline[(i+1)%room.outline.length],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(length<18)continue;
   const t=Math.max(9/length,Math.min(1-9/length,((door.at[0]-a[0])*dx+(door.at[1]-a[1])*dy)/(length*length)));
   const point=[a[0]+dx*t,a[1]+dy*t];
   for(const sign of [-1,1]){const normal=[sign*dy/length,-sign*dx/length],at=[point[0]-normal[0]*10,point[1]-normal[1]*10];if(fits(at))candidates.push({point,normal,at,distance:Math.hypot(door.at[0]-at[0],door.at[1]-at[1])});}
  }
  candidates.sort((a,b)=>a.distance-b.distance);if(!candidates.length)throw new Error('No valid door on '+room.id);
  const best=candidates[0];door.at=best.at;door.wallAt=best.point;door.normal=best.normal;
 }
 if(!fits(room.spawn)){
  const candidates=room.cells.map(([x,y])=>[x*16+8,y*16+8]).filter(fits);if(!candidates.length)throw new Error('No spawn '+room.id);room.spawn=candidates[0];
 }
}
for(const room of rooms)for(const d of room.doors){
 if(d.leaves===2&&room.doors.some(other=>other!==d&&other.target===d.target&&Math.hypot(other.at[0]-d.at[0],other.at[1]-d.at[1])<64))d.leaves=1;
}
fs.writeFileSync('public/game/maps/rdc-dungeon.json',JSON.stringify({tile,spawn:{roomId:'rdc-38',position:[192,280]},rooms},null,2)+'\n');
console.log(`Generated ${rooms.length} authored game environments, ${doors.length} links; vestibule has two doors.`);
