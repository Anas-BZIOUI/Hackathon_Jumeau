import test from 'node:test';
import assert from 'node:assert/strict';
import {applyRoomDetails,validateRoomDetails} from '../src/roomDetails.js';
import {roomLabel,searchRooms} from '../src/core.js';
const rooms=[{id:'RDC-1',number:'1',name_fr:'1 · Bureau',name_en:'1 · Office',type:'office',activities:[],level:'RDC',centroid:[1,2],polygon:[[0,0],[2,0],[2,3]],capacity_estimated:8}];
test('validated metadata round trips, is searchable, and preserves source geometry',()=>{
 const original=JSON.stringify(rooms),input={version:1,rooms:{'RDC-1':{name_fr:'1 · Atelier robotique',equipment:['Capteurs'],type:'lab',activities:['teaching','research'],capacity:12,centroid:[99,99],verified_on_site:true,information_source:'Observation de l’équipe',resources:[{label:'Ressource',href:'https://example.com/info'}]}}};
 const checked=validateRoomDetails(JSON.parse(JSON.stringify(input)),rooms),merged=applyRoomDetails(rooms,checked);
 assert.equal(JSON.stringify(rooms),original);assert.deepEqual(merged[0].centroid,[1,2]);assert.equal(merged[0].capacity_estimated,null);assert.equal(merged[0].capacity,12);assert.equal(roomLabel(merged[0],'fr'),'Atelier robotique');assert.equal(searchRooms('robotique',merged,{},'fr')[0].id,'RDC-1');assert.equal(merged[0].verified_on_site,true);
 assert.deepEqual(applyRoomDetails(rooms,{version:1,rooms:{}}),rooms);
});
test('imports reject unknown rooms, invalid fields and unsafe resource URLs',()=>{
 for(const patch of [{capacity:-1},{capacity:1.5},{accessible:'yes'},{activities:['invented']},{type:'stairs'},{verified_on_site:true},{resources:[{label:'x',href:'javascript:alert(1)'}]},{resources:[{label:'x',href:'https://name:secret@example.com'}]}])assert.throws(()=>validateRoomDetails({version:1,rooms:{'RDC-1':patch}},rooms));
 assert.throws(()=>validateRoomDetails({version:1,rooms:{invented:{}}},rooms));
});
