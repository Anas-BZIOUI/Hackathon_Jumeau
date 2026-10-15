import test from 'node:test';
import assert from 'node:assert/strict';
import {routeInstructions,routeProgress} from '../src/guidance.js';
const route={legs:[{kind:'walk',level:'RDC',points:[[0,0],[5,0],[5,5]]},{kind:'stairs',from:'RDC',to:'R+1',fromPoint:[5,5]},{kind:'walk',level:'R+1',points:[[5,5],[10,5]]}],nodes:[{level:'R+1',x:10,y:5}],arrivalAtDoor:true};
test('instructions use plan coordinates and preserve the floor transition and door arrival',()=>{const steps=routeInstructions(route);assert.equal(steps[0].kind,'left');assert(steps.some(s=>s.kind==='stairs'&&s.text_en.includes('R+1')));assert.match(steps.at(-1).text_en,/door/);});
test('remaining distance projects onto the current floor and detects departures',()=>{assert.equal(routeProgress(route,{floor:'RDC',x:2,y:0}).remaining,13);assert.equal(routeProgress(route,{floor:'R+1',x:9,y:5}).remaining,1);assert.equal(routeProgress(route,{floor:'RDC',x:15,y:15}).offRoute,true);assert.equal(routeProgress(route,{floor:'R+2',x:0,y:0}).offRoute,true);});
