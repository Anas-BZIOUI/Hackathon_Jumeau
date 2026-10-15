import fs from 'node:fs';
import assert from 'node:assert/strict';
import {compileRoom,canOccupy,moveInRoom,portalAt,wallDistance,fixtureDistance} from '../src/game/authored-world.js';
const source=JSON.parse(fs.readFileSync('data-src/ensiie-walls-doors.json')).levels.RDC;
const map=JSON.parse(fs.readFileSync('public/game/maps/rdc-dungeon.json'));
const rooms=map.rooms.map(compileRoom),byId=new Map(rooms.map(r=>[r.id,r]));
assert.equal(map.audit.sourceDoors,source.doors.length);
assert.equal(map.audit.reachableRooms,rooms.length);
for(const input of source.doors){
 const wall=source.walls.find(w=>w.id===input.wallId),center=[(wall.a[0]+(wall.b[0]-wall.a[0])*input.t)*40,(35-wall.a[1]-(wall.b[1]-wall.a[1])*input.t)*40];
 const copies=rooms.flatMap(r=>r.doors).filter(d=>d.id===input.id);assert(copies.length>0,'Missing authored door '+input.id);
 for(const d of copies){assert(Math.hypot(d.wallAt[0]-center[0],d.wallAt[1]-center[1])<1e-6,'Moved authored door');assert.equal(d.width,input.width*40);assert.equal(d.leaves,1);}
}
for(const room of rooms){
 const start={x:room.spawn[0],y:room.spawn[1]};assert(canOccupy(room,start),room.id+' spawn');
 for(const wall of room.walls.filter(w=>!w.inferred)){
  const original=source.walls.find(w=>w.id===wall.id);assert(original);
  const a=[original.a[0]*40,(35-original.a[1])*40],b=[original.b[0]*40,(35-original.b[1])*40];
  for(const p of [wall.a,wall.b])assert(wallDistance({x:p[0],y:p[1]},a,b)<1e-5,'Moved authored wall');
 }
 for(const door of room.doors.filter(d=>!d.inactive)){
  assert(canOccupy(room,{x:door.at[0],y:door.at[1]}),room.id+' invalid door arrival');
  assert(byId.get(door.target).doors.some(d=>d.id===door.id&&d.target===room.id),'Non-reciprocal portal');
  assert(!portalAt(room,{x:door.at[0],y:door.at[1]},door.normal[0],door.normal[1],door.id),'Arrival bounce');
  assert(portalAt(room,{x:door.at[0],y:door.at[1]},door.normal[0],door.normal[1],null),'Automatic crossing');
 }
 // Check physical routes, not only the room adjacency graph.
 const queue=[[0,0]],seen=new Set(['0,0']),reached=new Set();
 for(let i=0;i<queue.length;i++){
  const [x,y]=queue[i],p={x:start.x+x*8,y:start.y+y*8};
  for(const d of room.doors)if(Math.hypot(p.x-d.at[0],p.y-d.at[1])<17)reached.add(d.id);
  for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
   const k=[x+dx,y+dy].join(',');if(seen.has(k))continue;seen.add(k);
   const next=moveInRoom(room,p,dx*8,dy*8);
   if(Math.abs(next.x-(p.x+dx*8))<1e-6&&Math.abs(next.y-(p.y+dy*8))<1e-6)queue.push([x+dx,y+dy]);
  }
 }
 for(const d of room.doors.filter(d=>!d.inactive))assert(reached.has(d.id),room.id+' physically unreachable '+d.id);
}
console.log(`PASS: ${rooms.length} rooms physically navigable; authored walls, positions and widths preserved; reciprocal automatic doors, collision-safe arrivals and bounce protection.`);

const stairs=rooms.flatMap(r=>(r.fixtures||[]).filter(f=>f.kind==='stairs').map(f=>({room:r,fixture:f})));
assert.equal(stairs.length,2);
for(const {room,fixture:f}of stairs){const [x,y,w,h]=f.bounds;assert.equal(f.available,false);assert.equal(f.destination,'R+1');assert(!canOccupy(room,{x:x+w/2,y:y+h/2}),'Stairs must block access to unavailable floor');assert(fixtureDistance(f,{x:x+w/2,y:y-20})<34,'Stairs should be interactable from landing');}
const elevator=rooms.find(r=>r.kind==='elevator');assert(elevator);assert(elevator.doors.some(d=>d.kind==='elevator'&&d.target));
assert(elevator.fixtures.some(f=>f.kind==='elevator-panel'&&f.destination==='R+1'&&!f.available));
assert(new Set(rooms.flatMap(r=>r.doors.map(d=>d.style))).size>=4,'Door variety missing');
console.log('PASS: two blocked/interactable stairs, elevator cabin and reciprocal entrance, unavailable R+1 controls, varied door styles.');

const reception=rooms.find(r=>r.name==='Grand espace · RDC');
const decor=reception.fixtures.filter(f=>f.zone);
for(const zone of ['green','red','yellow'])assert(decor.some(f=>f.zone===zone));
assert.equal(decor.filter(f=>f.zone==='red').length,3);
assert(decor.filter(f=>f.zone==='red').every(f=>f.facing==='north'&&f.asset==='bench-back'));
assert.equal(decor.filter(f=>f.kind==='counter').length,2);
assert(decor.some(f=>f.kind==='npc'&&f.asset==='amelia'));
assert(canOccupy(reception,{x:1478,y:1125}),'Reception east opening must remain walkable');
for(const f of decor.filter(f=>f.solid)){const [x,y,w,h]=f.bounds;assert(!canOccupy(reception,{x:x+w/2,y:y+h/2}),'Furniture must block walking: '+f.id);}
console.log('PASS: three decoration zones, north-facing benches, L counter, receptionist, solid furniture and walkable counter opening.');
