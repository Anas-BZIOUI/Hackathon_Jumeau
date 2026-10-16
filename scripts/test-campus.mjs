import fs from 'node:fs';
import assert from 'node:assert/strict';
import {initialQuest,questAction,dialogueFor,dialogueStep,FOYER_IDS,attendees,partyComplete} from '../src/game/quest.js';
import {compileRoom,moveInRoom,fixtureDistance} from '../src/game/authored-world.js';
const map=JSON.parse(fs.readFileSync('public/game/maps/rdc-dungeon.json'));
const room=id=>map.rooms.find(r=>r.id===id);
for(const [id,required]of Object.entries({
 'drawn-rdc-2':['class-board-1','class-board-2','class-table','vending-drinks','vending-snacks','reception-amelia'],
 'drawn-rdc-8':['foyer-bar-long','foyer-bar-arm','buffet','round-table-0','round-table-1','round-table-2','couch-long','couch-arm','game-table-1','game-table-2','bartender','student-adam','student-bob'],
 'drawn-rdc-33':['office-desk','office-computer','office-closet','office-chair','office-plant','office-painting','office-nadia'],
 'drawn-rdc-9':['shelf-1','shelf-2','library-table','library-chair','oussama','library-bin']
}))for(const fixture of required)assert(room(id).fixtures.some(f=>f.id===fixture),'Missing fixture: '+fixture);
assert.equal(room('drawn-rdc-2').floor,'gray');
assert.equal(room('drawn-rdc-9').name,'030 · Bibliothèque');
assert(new Set(map.rooms.map(r=>r.floor)).size>=3);
for(const r of map.rooms.map(compileRoom)){
 const npcs=r.fixtures.filter(f=>f.kind==='npc');if(!npcs.length)continue;
 const queue=[{x:r.spawn[0],y:r.spawn[1]}],seen=new Set(['0,0']),reached=new Set();
 for(let i=0;i<queue.length;i++){
  const p=queue[i];for(const n of npcs)if(fixtureDistance(n,p)<60)reached.add(n.id);
  for(const [dx,dy]of [[8,0],[-8,0],[0,8],[0,-8]]){
   const key=[Math.round((p.x+dx-r.spawn[0])/8),Math.round((p.y+dy-r.spawn[1])/8)].join(',');if(seen.has(key))continue;seen.add(key);
   const next=moveInRoom(r,p,dx,dy);if(Math.abs(next.x-p.x-dx)<.001&&Math.abs(next.y-p.y-dy)<.001)queue.push(next);
  }
 }
 for(const n of npcs)assert(reached.has(n.id),'NPC unreachable for conversation: '+n.id);
}
const reception={id:'reception-amelia'},oussama={id:'oussama'},nadia={id:'office-nadia'};
const actions=(n,q)=>dialogueFor(n,q).choices.map(c=>c.action);
for(const n of FOYER_IDS.map(id=>({id})))assert(!actions(n,initialQuest()).some(a=>['ask-oussama','party-talk'].includes(a)));
assert.equal(new Set(FOYER_IDS.map(id=>dialogueFor({id},initialQuest()).text)).size,FOYER_IDS.length);
let q=initialQuest();assert.equal(questAction(q,'decline'),q);assert.equal(questAction(q,'party-decline'),q);
assert.equal(questAction(q,'deliver'),q);assert.equal(questAction(q,'party-deliver'),q);
q=questAction(q,'meet',{id:'student-lina'});assert.match(dialogueFor({id:'student-lina'},q).text,/revoir/);
q=questAction(q,'activate-card');assert(q.cardActive);
q=questAction(q,'party-accept');assert.equal(q.party.status,'active');assert.equal(q.paper,false);
q=questAction(q,'accept');assert(q.paper);assert.equal(q.status,'active');
assert(actions({id:FOYER_IDS[0]},q).includes('ask-oussama'));assert(actions({id:FOYER_IDS[0]},q).includes('party-talk'));
assert(!actions(nadia,q).includes('party-deliver'));
assert.equal(questAction(q,'party-deliver'),q);
for(const id of FOYER_IDS){
 const n={id},before=q;q=questAction(q,'party-answer',n);assert.equal(q.paper,true);
 assert.equal(questAction(q,'party-answer',n),q);
 assert.equal(Object.keys(q.party.answers).length,Object.keys(before.party.answers).length+1);
}
assert(partyComplete(q));assert.equal(Object.keys(q.party.answers).length,7);assert.equal(attendees(q).length,4);
assert.deepEqual(attendees(q),['Karim','Lina','Mehdi','Sarah']);
for(const first of ['deliver','party-deliver']){
 let next=questAction(q,first);
 assert.equal(next.respect,first==='deliver'?10:15);
 assert.equal(next.paper,first!=='deliver');assert.equal(next.party.status,first==='deliver'?'active':'completed');
 next=questAction(next,first==='deliver'?'party-deliver':'deliver');assert.equal(next.paper,false);assert.equal(next.status,'completed');assert.equal(next.party.status,'completed');assert.equal(next.respect,25);
 assert.equal(questAction(next,'deliver'),next);assert.equal(questAction(next,'party-deliver'),next);
 for(const id of FOYER_IDS)assert(!actions({id},next).some(a=>['ask-oussama','party-talk'].includes(a)));
 assert(actions(oussama,next).includes('small'));assert(!actions(oussama,next).includes('deliver'));
 assert(!actions(nadia,next).includes('party-deliver'));assert(!actions(nadia,next).includes('party-offer'));
 assert(dialogueStep(oussama,next,'small').choices.length);
}
for(const f of room('drawn-rdc-8').fixtures.filter(f=>f.seated))assert(f.depth>room('drawn-rdc-8').fixtures.find(f=>f.id==='couch-long').draw[1]+30);
for(const f of room('drawn-rdc-2').fixtures.filter(f=>f.art==='vending'))assert(f.draw[1]<550&&f.draw[0]>1300);
console.log('PASS: required scenery, office, accessible NPCs, remembered meetings, varied/gated dialogue, independent concurrent quests in either completion order, unique replies and rewards.');
