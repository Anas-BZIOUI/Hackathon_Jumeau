import test from 'node:test';
import assert from 'node:assert/strict';
import { collisionMap,walkingPath,safePosition,segmentDistance } from '../src/walking.js';
test('blocks walls and floor boundaries, preserving doorway gaps',()=>{
  const map=collisionMap([[[5,0],[5,4]],[[5,6],[5,10]]],[10,10]);
  assert(!map.clear(5,2));assert(!map.clear(-1,5));assert(map.clear(5,5));
  assert(!map.lineClear([3,2],[7,2]));assert(map.lineClear([3,5],[7,5]));
  assert.equal(segmentDistance(3,2,[5,0],[5,4]),2);
});
test('click-to-walk finds a doorway route without crossing walls',()=>{
  const map=collisionMap([[[5,0],[5,4]],[[5,6],[5,10]]],[10,10]);
  const route=walkingPath(map,[2,2],[8,2]);assert(route?.length>1);
  let previous=[2,2];for(const p of route){assert(map.lineClear(previous,p));previous=p;}
  assert.deepEqual(route.at(-1),[8,2]);
});
test('unreachable destinations are rejected and unsafe starts can be recovered',()=>{
  const map=collisionMap([[[5,0],[5,10]]],[10,10]);
  assert.equal(walkingPath(map,[2,2],[8,2]),null);
  assert.equal(walkingPath(map,[2,2],[5,2]),null);
  const safe=safePosition(map,[5,5]);assert(safe);assert(map.clear(...safe));
});
