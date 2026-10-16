import test from 'node:test';
import assert from 'node:assert/strict';
import {buildActivityTours} from '../src/activityTours.js';

const room=(id,activity,extra={})=>({id,level:'R+1',type:'classroom',name_fr:'Salle exemple',name_en:'Example room',activities:[activity],...extra});

test('activity tours contain only actual associated rooms and exclude circulation',()=>{
 const rooms=[room('a','teaching'),room('b','research'),room('c','student_life'),room('d','companies'),room('hall','teaching',{type:'circulation'})];
 const tours=buildActivityTours(rooms);
 assert.equal(tours.length,4);
 for(const tour of tours){
  assert(tour.title_fr&&tour.title_en&&tour.objective_fr&&tour.objective_en);
  for(const step of tour.steps){
   assert(rooms.find(r=>r.id===step.roomId).activities.includes(tour.activity));
   assert.notEqual(step.roomId,'hall');
   assert.match(step.text_en,/recorded|Recorded/);
  }
 }
});

test('tours are deterministic, bounded, and follow current room metadata',()=>{
 const rooms=['d','c','b','a'].map(id=>room(id,'research'));
 const original=JSON.stringify(rooms);
 const tours=buildActivityTours(rooms);
 assert.deepEqual(tours,buildActivityTours([...rooms].reverse()));
 assert.equal(tours[0].steps.length,3);
 assert.equal(JSON.stringify(rooms),original);
 assert.deepEqual(buildActivityTours([]),[]);
 assert.deepEqual(buildActivityTours(rooms.map(r=>({...r,activities:[]}))),[]);
});

test('preferred stops never introduce missing rooms and verified fallbacks rank first',()=>{
 const tours=buildActivityTours([room('z','teaching',{verified_on_site:true}),room('a','teaching'),room('R+1-101','teaching')]);
 assert.deepEqual(tours[0].steps.map(s=>s.roomId),['R+1-101','z','a']);
});
