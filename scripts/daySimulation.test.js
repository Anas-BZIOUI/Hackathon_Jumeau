import test from 'node:test';
import assert from 'node:assert/strict';
import {daySnapshot,simulationClock,DAY_PHASES} from '../src/simulation.js';
const route={legs:[{kind:'walk',level:'RDC',points:[[1,1],[5,1],[5,4]]}]};
test('fictional day covers phase boundaries, clamps time, and formats minutes without 60',()=>{
 assert.equal(daySnapshot([],8).phase,DAY_PHASES[0]);
 assert.equal(daySnapshot([],12).phase,DAY_PHASES[2]);
 assert.equal(daySnapshot([],18).phase,DAY_PHASES.at(-1));
 assert.equal(daySnapshot([],Infinity).hour,8);assert.equal(daySnapshot([],22).hour,18);
 assert.equal(simulationClock(12.999),'13:00');assert.equal(simulationClock(8),'08:00');
});
test('agents reverse along available paths, stay on the route, and remain deterministic',()=>{
 for(let time=8;time<=18;time+=.05){
  const snapshot=daySnapshot([route],time);
  assert.equal(snapshot.agents.length,4);
  for(const {position:p} of snapshot.agents){assert.equal(p.floor,'RDC');assert.ok(p.x>=1&&p.x<=5);assert.ok(p.y>=1&&p.y<=4);assert.ok(Math.abs(p.y-1)<1e-9||Math.abs(p.x-5)<1e-9);}
 }
 assert.deepEqual(daySnapshot([route],12),daySnapshot([route],12));
 assert.deepEqual(daySnapshot([null,{legs:[]}],10).agents,[]);
});
