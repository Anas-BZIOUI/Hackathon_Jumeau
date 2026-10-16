import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraComfort,characterHeading,roomLabelDetail} from '../src/viewComfort.js';
import {verifiedLandmarks} from '../src/landmarks.js';
import {rerouteOrigin} from '../src/guidance.js';

test('camera retracts immediately, clears walls, and recovers smoothly without flickering',()=>{
 let state=cameraComfort({distance:4,firstPerson:false},.7,4,1/60);
 assert.equal(state.distance,.7);assert.equal(state.firstPerson,true);
 state=cameraComfort(state,1,4,1);assert.equal(state.firstPerson,true);
 state=cameraComfort(state,4,4,1/60);assert(state.distance<4&&state.distance>1);
 for(let i=0;i<120;i++)state=cameraComfort(state,4,4,1/60);
 assert.equal(state.firstPerson,false);assert(state.distance<=4);
 const advance=fps=>{let s={distance:1.5,firstPerson:false};for(let i=0;i<fps;i++)s=cameraComfort(s,4,4,1/fps);return s.distance;};
 assert(Math.abs(advance(30)-advance(144))<1e-10);
 assert.equal(cameraComfort(state,2,4,1/60,true).distance,2);
});
test('strafe facing affects the character without changing camera or automatic path headings',()=>{
 assert.equal(characterHeading(.7,2,true,false),.7);
 assert.equal(characterHeading(.7,2,false,false),2);
 assert.equal(characterHeading(.7,2,true,true),2);
});
test('room plaques reduce detail at distance and retain destination priority',()=>{
 assert.equal(roomLabelDetail(3),'full');assert.equal(roomLabelDetail(3,false,false),'compact');assert.equal(roomLabelDetail(10),'compact');
 assert.equal(roomLabelDetail(20),'hidden');assert.equal(roomLabelDetail(20,true),'compact');
 assert.equal(roomLabelDetail(10,true),'full');assert.equal(roomLabelDetail(Infinity),'hidden');
});
test('landmark recovery excludes fictional and unverified records and sorts nearby verified places first',()=>{
 const rooms=[{id:'far',level:'R+1',verified_on_site:true},{id:'near',level:'RDC',centroid:[1,0],verified_on_site:true},{id:'demo',level:'RDC',centroid:[0,0],verified_on_site:true,demo_data:true},{id:'unknown',level:'RDC',centroid:[0,0]}];
 assert.deepEqual(verifiedLandmarks(rooms,{floor:'RDC',x:0,y:0}).map(x=>x.room.id),['near','far']);
 assert.deepEqual(verifiedLandmarks(rooms,null,'fr','near').map(x=>x.room.id),['far']);
 assert.deepEqual(verifiedLandmarks([],null),[]);
});
test('recalculation uses the latest off-route point and suppresses disabled, busy and stair states',()=>{
 const route={legs:[{kind:'walk',level:'RDC',points:[[0,0],[10,0]]}]},p={floor:'RDC',x:4,y:4};
 assert.deepEqual(rerouteOrigin(route,p),p);assert.notEqual(rerouteOrigin(route,p),p);
 assert.equal(rerouteOrigin(route,{...p,y:0}),null);
 assert.equal(rerouteOrigin(route,p,{enabled:false}),null);
 assert.equal(rerouteOrigin(route,p,{status:'routing'}),null);
 assert.equal(rerouteOrigin(route,{...p,stairLink:'A'}),null);
 assert.equal(rerouteOrigin(route,{...p,x:NaN}),null);
});
