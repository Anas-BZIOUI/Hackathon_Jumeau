import test from 'node:test';
import assert from 'node:assert/strict';
import {floorLeg} from '../src/visitNavigation.js';
const links=[{id:'stairs',type:'stairs',points:['RDC','R+1','R+2'].map(level=>({level}))},{id:'lift',type:'lift',points:['RDC','R+1','R+2'].map(level=>({level}))}];
test('immersive guidance chooses calibrated links and only adjacent stair landings',()=>{
 const leg=floorLeg([links[0]],'RDC','R+2');assert.equal(leg.link.id,'stairs');assert.equal(leg.to,'R+1');
 assert.equal(floorLeg([links[0]],'R+2','RDC').to,'R+1');
 assert.equal(floorLeg(links,'RDC','R+2',true).link.id,'lift');
 assert.equal(floorLeg([links[0]],'RDC','R+2',true),null);
 assert.equal(floorLeg(links,'RDC','RDC'),null);
});
