import test from 'node:test';
import assert from 'node:assert/strict';
import {connectionAccess,connectionOfType,liftVisitState,validLiftVisit} from '../src/connections.js';
import {rerouteOrigin} from '../src/guidance.js';
const links=[{id:'stairs',type:'stairs',points:[{level:'RDC',x:0,y:0},{level:'R+1',x:0,y:0}]},{id:'lift',type:'lift',points:[{level:'R+1',x:6,y:0},{level:'RDC',x:6,y:0}]}];
test('selected lift controls do not switch to a nearer staircase',()=>{
 const state=connectionAccess(links,'lift',{floor:'RDC',x:1,y:0});
 assert.equal(state.link.id,'lift');assert.equal(state.near,false);assert.equal(state.distance,5);
 assert.equal(connectionAccess(links,'lift',{floor:'RDC',x:6,y:0}).near,true);
 assert.deepEqual(state.points.map(p=>p.level),['RDC','R+1']);
});
test('missing floors and absent connections never enable a trip',()=>{
 assert.equal(connectionAccess(links,'lift',{floor:'R+2',x:6,y:0}).near,false);
 assert.equal(connectionAccess(links,'missing',{floor:'RDC',x:0,y:0}).link,null);
 assert.equal(connectionOfType(links,'lift','RDC').id,'lift');
 assert.equal(connectionOfType([],'lift','RDC'),null);
});
test('lift progress survives a view handoff and rejects corrupt or obsolete journeys',()=>{
 const saved=liftVisitState({lift:true,linkId:'lift',to:'R+1',started:100,path:[{x:6,y:0,z:0},{x:6,y:3.2,z:0}]},'RDC',1500);
 assert.equal(saved.progress,.5);assert.deepEqual(validLiftVisit(saved,links),saved);
 assert.equal(validLiftVisit({...saved,progress:1},links),null);
 assert.equal(validLiftVisit({...saved,path:[[NaN,0,0],[0,1,0]]},links),null);
 assert.equal(validLiftVisit(saved,[]),null);
 assert.equal(liftVisitState(null,'RDC',0),null);
});
test('guidance never recalculates from a position in a moving lift',()=>{
 const route={legs:[{kind:'walk',level:'RDC',points:[[0,0],[1,0]]}]};
 assert.equal(rerouteOrigin(route,{floor:'RDC',x:20,y:20,inLift:true}),null);
 assert.ok(rerouteOrigin(route,{floor:'RDC',x:20,y:20,inLift:false}));
});
