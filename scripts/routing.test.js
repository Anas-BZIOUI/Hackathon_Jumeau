import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {resolveRoute} from '../src/routing.js';
import {indoorFloorSegments} from '../src/navigation.js';
const graph=JSON.parse(fs.readFileSync('public/data/graph.json','utf8'));
test('incoming pilot routes are retained and render in the new 2D view',()=>{
 const route=resolveRoute(graph,'R+1-131','R+1-139');
 assert.ok(route?.startDoor);assert.ok(indoorFloorSegments(route,'R+1',60).length);assert.ok(Array.isArray(route.steps));
});
test('rooms outside the pilot retain multi-floor routing and the step-free option',()=>{
 const route=resolveRoute(graph,'RDC-Amphi002','R+2-C53');assert.ok(route);assert.ok(route.steps.length);
 const stepFree=resolveRoute(graph,'RDC-Amphi002','R+2-C53',{stepFree:true});assert.ok(stepFree);assert.ok(stepFree.steps.every(s=>s.kind!=='stairs'));assert.equal(stepFree.stepFree,true);
 assert.ok(indoorFloorSegments(stepFree,'R+2',125).length);
});
