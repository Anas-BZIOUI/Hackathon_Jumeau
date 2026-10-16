import test from 'node:test';
import assert from 'node:assert/strict';
import {withDemoRooms,DEMO_ROOMS} from '../src/demoRooms.js';
import {nearbyLandmarks} from '../src/landmarks.js';
import {visitReport} from '../src/visitExport.js';
import {createAvatar} from '../src/avatar.js';

test('demo data is reversible, explicitly fictional, and cannot verify a room',()=>{
 const rooms=[{id:'RDC-011',capacity:1,verified_on_site:true,verification:{source:'real'}},{id:'other'}];
 const original=JSON.stringify(rooms),demo=withDemoRooms(rooms,true);
 assert.equal(demo[0].capacity,6);assert.equal(demo[0].demo_data,true);
 assert.equal(demo[0].verified_on_site,false);assert.equal(demo[0].verification,null);
 assert.equal(demo[1],rooms[1]);assert.equal(JSON.stringify(rooms),original);
 assert.equal(withDemoRooms(rooms,false),rooms);assert.equal(Object.keys(DEMO_ROOMS).length,6);
 assert(!('accessible' in demo[0]));
});
test('nearby suggestions stay on the current floor and exclude circulation',()=>{
 const rooms=[{id:'a',level:'RDC',centroid:[3,4]},{id:'b',level:'RDC',centroid:[1,0]},{id:'hall',type:'circulation',level:'RDC',centroid:[0,0]},{id:'c',level:'R+1',centroid:[0,0]}];
 assert.deepEqual(nearbyLandmarks(rooms,{floor:'RDC',x:0,y:0}).map(x=>x.room.id),['b','a']);
 assert.deepEqual(nearbyLandmarks(rooms,{floor:'RDC',x:NaN,y:0}),[]);
});
test('visit export preserves order, omits stale IDs and labels fiction in both languages',()=>{
 const rooms=withDemoRooms([{id:'RDC-011',level:'RDC',name_fr:'Impression',name_en:'Printing'}],true);
 for(const lang of ['fr','en']){const text=visitReport({rooms,ids:['missing','RDC-011'],title:'Visit',lang});assert.match(text,/DEMO|DÉMO/);assert(!text.includes('missing'));assert.match(text,/RDC-011/);}
});
test('avatar appearance rejects invalid colors and backpack can be restored',()=>{
 const avatar=createAvatar();avatar.setAppearance({skin:'#123456',hair:'invalid',backpack:false});
 assert(avatar.root.children[0].children.some(x=>x.visible===false));
 avatar.setAppearance({backpack:true});assert(avatar.root.children[0].children.every(x=>x.visible));
 avatar.update(1/60,.03,.4);assert(Number.isFinite(avatar.root.rotation.y));
 avatar.root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});
