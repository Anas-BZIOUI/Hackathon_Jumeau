import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createGeometryRouter} from '../src/geometryRouter.js';
import {calibratedScene} from '../src/calibration.js';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const scene=calibratedScene(read('public/data/floors.json'),read('public/data/links.json'),read('ensiie-control-points.json'));
const router=createGeometryRouter({...scene,rooms:read('public/data/rooms.json'),walls:read('public/data/walls.json'),doors:read('public/data/doors.json'),geometry:read('data-src/drawn-geometry.json')});
function check(route){assert.ok(route);assert.equal(route.source,'drawn-geometry');for(const leg of route.legs.filter(l=>l.kind==='walk'))for(let i=1;i<leg.points.length;i++)assert.ok(router.scene.maps[leg.level].lineClear(leg.points[i-1],leg.points[i]),`wall crossing on ${leg.level}`);}
test('a direct unobstructed route retains its start, end and measured distance',()=>{
 const levels=Object.fromEntries(['RDC','R+1','R+2'].map(l=>[l,{size:[10,10],offset:[0,0],rotation_deg:0}]));
 const r=createGeometryRouter({floors:{levels},links:[],walls:{},doors:{},rooms:[{id:'a',level:'RDC',centroid:[2,2]},{id:'b',level:'RDC',centroid:[8,2]}]});
 const route=r.route('a','b');assert.equal(route.metres,6);assert.equal(route.nodes.length,2);assert.deepEqual(route.legs[0].points,[[2,2],[8,2]]);
});
test('rooms outside the old pilot have wall-safe routes on both authored floors',()=>{
 for(const pair of [['RDC-011','RDC-Amphi002'],['RDC-003','RDC-028'],['R+1-121','R+1-139'],['R+1-131','R+1-148']])check(router.route(...pair));
});
test('RDC to R+1 uses the calibrated physical stair landings in both directions',()=>{
 for(const pair of [['RDC-011','R+1-131'],['R+1-131','RDC-011']]){const route=router.route(...pair);check(route);const step=route.steps.find(s=>s.kind==='stairs');assert.ok(step);assert.equal(step.linkId,'stairs-main');const record=router.scene.stairs.find(r=>r.linkId===step.linkId&&r.lower==='RDC');const leg=route.legs.find(l=>l.kind==='stairs');const index=leg.from==='RDC'?0:1;assert.deepEqual(leg.fromPoint,router.scene.toLocal(leg.from,record.path[index]));}
});
test('step-free never includes stairs; blocked rooms produce no fabricated route',()=>{
 const route=router.route('RDC-011','R+1-131',{stepFree:true});if(route){check(route);assert.ok(route.steps.every(s=>s.kind!=='stairs'));}
 assert.equal(router.route('RDC-011','RDC-017'),null);
});
test('guidance can start at the actual character position instead of a room centroid',()=>{
 const p=router.anchor(read('public/data/rooms.json').find(r=>r.id==='RDC-011'));
 check(router.route(null,'R+1-131',{startPosition:{floor:'RDC',x:p[0],y:p[1]}}));
});
