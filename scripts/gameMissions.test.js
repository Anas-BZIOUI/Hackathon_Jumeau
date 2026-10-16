import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {GUIDES,MISSIONS,missionProgress,validGuideReads,freshGameProgress,validGameProgress} from '../src/discoveryMissions.js';
import {placeVirtualGuides,nearbyVirtualGuide} from '../src/game/virtualGuides.js';
import {compileRoom,canOccupy} from '../src/game/authored-world.js';

test('four missions require both a discovery and a conversation; duplicate actions do not duplicate rewards',()=>{
 assert.equal(MISSIONS.length,4);assert.equal(GUIDES.length,3);
 const ids=MISSIONS.map(m=>m.roomId),read=GUIDES.map(g=>g.id);
 assert(missionProgress(ids,[]).every(m=>!m.complete));assert(missionProgress([],read).every(m=>!m.complete));
 assert.equal(missionProgress([...ids,...ids],[...read,...read]).filter(m=>m.complete).length,4);
 assert(missionProgress([],[]).every(m=>!m.visited&&!m.talked));
});
test('each virtual guide has bilingual choices and unknown saved guide IDs are rejected',()=>{
 for(const g of GUIDES){assert(g.fr&&g.en&&g.intro_fr&&g.intro_en);assert(g.choices.length>=2);for(const c of g.choices)assert(c.fr&&c.en&&c.answer_fr&&c.answer_en);}
 assert(validGuideReads(['orientation']));assert(!validGuideReads(['unknown']));assert(!validGuideReads(null));
});
test('three virtual guides occupy clear points in actual game rooms; entry conversation is reachable',()=>{
 const layout=JSON.parse(fs.readFileSync('public/game/maps/rdc-dungeon.json','utf8'));layout.rooms=layout.rooms.map(compileRoom);
 const guides=placeVirtualGuides(layout);assert.equal(guides.length,3);
 for(const g of guides)assert(canOccupy(layout.rooms.find(r=>r.id===g.zone),g));
 const room=layout.rooms.find(r=>r.id===layout.spawn.roomId),player={x:layout.spawn.position[0],y:layout.spawn.position[1]};
 assert.equal(nearbyVirtualGuide(guides,room,player)?.id,'orientation');
 assert.equal(nearbyVirtualGuide(guides,{...room,id:'different'},player),null);
});
test('progress survives serialization; a fresh game does not mutate the saved state or shared discoveries',()=>{
 const saved={...freshGameProgress(),steps:25,visited:['entry'],opened:['door'],rooms:[{id:'entry',name:'Entry',roomIds:['RDC-011']}],position:[20,30]};
 assert(validGameProgress(JSON.parse(JSON.stringify(saved))));assert(!validGameProgress({...saved,position:[null,30]}));
 const fresh=freshGameProgress();fresh.visited.push('spawn');assert.deepEqual(saved.visited,['entry']);assert.equal(freshGameProgress().visited.length,0);
});
