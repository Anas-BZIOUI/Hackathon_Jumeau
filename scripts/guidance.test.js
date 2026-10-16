import test from 'node:test';
import assert from 'node:assert/strict';
import {routeInstructions,routeProgress,guidanceState} from '../src/guidance.js';
const route={legs:[{kind:'walk',level:'RDC',points:[[0,0],[5,0],[5,5]]},{kind:'stairs',from:'RDC',to:'R+1',fromPoint:[5,5]},{kind:'walk',level:'R+1',points:[[5,5],[10,5]]}],nodes:[{level:'R+1',x:10,y:5}],arrivalAtDoor:true};
test('instructions use plan coordinates and preserve the floor transition and door arrival',()=>{const steps=routeInstructions(route);assert.equal(steps[0].kind,'left');assert(steps.some(s=>s.kind==='stairs'&&s.text_en.includes('R+1')));assert.match(steps.at(-1).text_en,/door/);});
test('remaining distance projects onto the current floor and detects departures',()=>{assert.equal(routeProgress(route,{floor:'RDC',x:2,y:0}).remaining,13);assert.equal(routeProgress(route,{floor:'R+1',x:9,y:5}).remaining,1);assert.equal(routeProgress(route,{floor:'RDC',x:15,y:15}).offRoute,true);assert.equal(routeProgress(route,{floor:'R+2',x:0,y:0}).offRoute,true);});

test('live directions reach the doorway instead of restarting the first instruction',()=>{
 const g=guidanceState(route,{floor:'R+1',x:10,y:5});
 assert.equal(g.next.kind,'arrival');assert.equal(g.progress.remaining,0);assert.match(g.next.text_en,/door/);
});
test('next action uses the current floor and distance rather than the original segment length',()=>{
 const g=guidanceState(route,{floor:'RDC',x:4,y:0});
 assert.equal(g.next.kind,'left');assert.equal(g.distanceToNext,1);
 const upper=guidanceState(route,{floor:'R+1',x:7,y:5});assert.equal(upper.next.level,'R+1');assert.equal(upper.distanceToNext,3);
});
test('off-route positions do not highlight an unrelated first instruction',()=>{
 const g=guidanceState(route,{floor:'R+2',x:0,y:0});assert.equal(g.next,null);assert.equal(g.index,-1);
});
test('routes without graph nodes retain a valid final floor and arrival point',()=>{
 const g=guidanceState({legs:route.legs,arrivalAtDoor:true},{floor:'R+1',x:10,y:5});
 assert.equal(g.next.kind,'arrival');assert.equal(g.next.level,'R+1');
 assert.equal(guidanceState(route,null).next.kind,'left');
});

test('approaching the landing announces the transition rather than another straight segment',()=>{
 const g=guidanceState(route,{floor:'RDC',x:5,y:4.8});assert.equal(g.next.kind,'stairs');assert.match(g.next.text_en,/R\+1/);
 assert.equal(guidanceState(route,{floor:'RDC',x:4.9,y:0}).next.kind,'left');
});

test('a zero-distance route still recognizes arrival at its one-point destination',()=>{
 const r={legs:[{kind:'walk',level:'RDC',points:[[2,3]]}],arrivalAtDoor:true};
 const g=guidanceState(r,{floor:'RDC',x:2,y:3});assert.equal(g.next.kind,'arrival');assert.equal(g.progress.offRoute,false);assert.equal(g.progress.remaining,0);
});
