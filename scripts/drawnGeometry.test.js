import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyGeometry,validateGeometry,mergeGeometry,projectToWall} from '../src/drawnGeometry.js';
import {cutOpenings} from '../src/openings.js';
import {collisionMap} from '../src/walking.js';
const floors={levels:Object.fromEntries(['RDC','R+1','R+2'].map(l=>[l,{size:[10,10]}]))};
const rooms=[{id:'RDC-1',level:'RDC',type:'office'}];
function fixture(){const g=emptyGeometry();g.levels.RDC={regions:[{id:'area',min:[1,4],max:[9,6]}],walls:[{id:'wall',a:[2,5],b:[8,5],height:2.6,thickness:.2}],doors:[{id:'door',wallId:'wall',t:.5,width:1,swing:1,hinge:'start',roomId:'RDC-1'}]};return g;}
test('round trips authored drawings and rejects malformed or out-of-bounds imports',()=>{
 const g=fixture();assert.deepEqual(validateGeometry(JSON.parse(JSON.stringify(g)),floors,rooms),g);
 const bad=fixture();bad.levels.RDC.walls[0].a=[-1,5];assert.throws(()=>validateGeometry(bad,floors,rooms));
 assert.throws(()=>validateGeometry({...g,version:2},floors,rooms));
});
test('doors must fit a drawn wall and reference a real room on the same floor',()=>{
 for(const patch of [{roomId:'invented'},{t:0},{width:9},{wallId:'missing'},{swing:0}]){
  const g=fixture();Object.assign(g.levels.RDC.doors[0],patch);assert.throws(()=>validateGeometry(g,floors,rooms));
 }
 const g=fixture();g.levels.RDC.doors.push({...g.levels.RDC.doors[0],id:'overlap'});assert.throws(()=>validateGeometry(g,floors,rooms));
});
test('replacement masks remove generated geometry locally, preserve other floors, and retain originals',()=>{
 const walls={RDC:[[[0,5],[10,5]]],'R+1':[[[0,2],[10,2]]]},doors={RDC:[{center:[5,5],roomId:'old'}]};
 const original=JSON.stringify({walls,doors});const merged=mergeGeometry(walls,doors,fixture());
 assert.deepEqual(merged.walls['R+1'],walls['R+1']);assert.equal(merged.walls.RDC.length,3);
 assert.equal(merged.doors.RDC.length,1);assert.equal(merged.doors.RDC[0].source,'user-drawn');
 assert.equal(JSON.stringify({walls,doors}),original);
 assert.deepEqual(merged.walls.RDC[2][2],{height:2.6,thickness:.2,source:'user-drawn'});
});
test('authored doors create real passageways and preserve wall dimensions through clipping',()=>{
 const merged=mergeGeometry({}, {},fixture()),door=merged.doors.RDC[0];
 const segments=cutOpenings(merged.walls.RDC,[{a:door.hinge,b:door.end,width:.45}]);
 assert(segments.every(s=>s[2].height===2.6));const map=collisionMap(segments,[10,10]);
 assert(map.lineClear([5,4],[5,6]));assert(!map.lineClear([3,4],[3,6]));
});
test('a blank full-floor replacement removes old walls and doors, and restoring null recovers originals',()=>{
 const g=emptyGeometry();g.levels.RDC.regions=[{id:'all',min:[0,0],max:[10,10]}];const walls={RDC:[[[2,5],[8,5]]]},doors={RDC:[{center:[5,5]}]};
 const merged=mergeGeometry(walls,doors,g);assert.equal(merged.walls.RDC.length,0);assert.equal(merged.doors.RDC.length,0);
 assert.equal(mergeGeometry(walls,doors,null).walls,walls);
});
test('door snapping projects onto the segment and thick walls have matching collision clearance',()=>{
 assert.deepEqual(projectToWall([5,6],{a:[2,5],b:[8,5]}).point,[5,5]);
 const map=collisionMap([[[2,5],[8,5],{thickness:.6}]],[10,10]);assert(!map.clear(5,5.45));assert(map.clear(5,5.6));
});
