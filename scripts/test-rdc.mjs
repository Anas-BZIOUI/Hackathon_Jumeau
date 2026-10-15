import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fitsRoom,roomDoors,walk,closestDoor} from '../src/game/rdc-world.js';
const layout=JSON.parse(fs.readFileSync(new URL('../public/game/maps/rdc-layout.json',import.meta.url)));
const seen=new Set([layout.spawn.roomId]),queue=[layout.spawn.roomId];
for(const id of queue)for(const d of roomDoors(layout,id))if(!seen.has(d.target)){seen.add(d.target);queue.push(d.target);}
assert.equal(seen.size,layout.rooms.length,'Every room must be connected');
assert(fitsRoom({x:layout.spawn.position[0],y:layout.spawn.position[1]},layout.rooms.find(r=>r.id===layout.spawn.roomId)));
for(const d of layout.doors)for(let i=0;i<2;i++)assert(fitsRoom({x:d.entries[i][0],y:d.entries[i][1]},layout.rooms.find(r=>r.id===d.rooms[i])),d.id+' arrival');
for(const room of layout.rooms){
 const doors=roomDoors(layout,room.id);assert(doors.length>0);
 const [sx,sy]=room.anchor;
 const step=.15, cells=[[0,0]],visited=new Set(['0,0']),reached=new Set();
 for(let n=0;n<cells.length;n++){
  const [ix,iy]=cells[n],x=sx+ix*step,y=sy+iy*step;
  for(const d of doors)if(Math.hypot(d.entry[0]-x,d.entry[1]-y)<1)reached.add(d.id);
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const nx=ix+dx,ny=iy+dy,key=nx+','+ny;
   if(visited.has(key))continue;visited.add(key);
   if(fitsRoom({x:sx+nx*step,y:sy+ny*step},room))cells.push([nx,ny]);
  }
 }
 for(const d of doors)assert(reached.has(d.id),room.id+' unreachable door '+d.id);
 const stopped=walk({x:sx,y:sy},100,100,room);assert(fitsRoom(stopped,room));
 for(const d of doors)assert(closestDoor(doors,{x:d.entry[0],y:d.entry[1]}));
}
console.log(`PASS: ${layout.rooms.length} connected rooms, ${layout.doors.length*2} valid door endpoints; all doors reachable within their rooms; spawn and wall collisions.`);
