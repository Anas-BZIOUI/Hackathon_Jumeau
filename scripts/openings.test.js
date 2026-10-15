import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cutOpenings,roomAt} from '../src/openings.js';
import {collisionMap} from '../src/walking.js';
test('a door opening cuts both collision and visual wall strokes without removing nearby walls',()=>{
 const source=[[[0,5],[10,5]],[[0,8],[10,8]]];
 const cut=cutOpenings(source,[{a:[4,5],b:[6,5],width:.4}]);
 const map=collisionMap(cut,[10,10]);
 assert(map.lineClear([5,4],[5,6]));assert(!map.lineClear([2,4],[2,6]));assert(!map.lineClear([5,7],[5,9]));
 assert.equal(source[0][0][0],0);
});
test('generated doors refer only to real outlined rooms and include C53 doors',()=>{
 const rooms=JSON.parse(fs.readFileSync('public/data/rooms.json')),doors=JSON.parse(fs.readFileSync('public/data/doors.json'));
 for(const [level,list] of Object.entries(doors))for(const door of list){
  const room=rooms.find(r=>r.id===door.roomId);assert(room);assert.equal(room.level,level);assert.equal(room.geometry_source,'architect-svg');assert(door.width>=.65&&door.width<=1.6);
 }
 assert(doors['R+2'].some(d=>d.roomId==='R+2-C53'));
 assert.equal(roomAt([120,112],rooms.filter(r=>r.level==='R+2'))?.id,'R+2-C53');
});
