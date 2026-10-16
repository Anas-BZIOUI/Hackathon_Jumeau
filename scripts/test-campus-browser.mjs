import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {FOYER_IDS} from '../src/game/quest.js';
import {compileRoom,moveInRoom,fixtureDistance} from '../src/game/authored-world.js';
const map=JSON.parse(fs.readFileSync('public/game/maps/rdc-dungeon.json'));
map.spawn={roomId:'drawn-rdc-2',position:[1470,1150]};
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
 const draw=CanvasRenderingContext2D.prototype.drawImage;
 CanvasRenderingContext2D.prototype.drawImage=function(img,...args){
  if(img?.src&&/idle_32x32_2|run_horizontal_32x32_2/.test(img.src))window.__player={x:args[4]+20,y:args[5]+75};
  return draw.call(this,img,...args);
 };
});
await page.route('**/game/maps/rdc-dungeon.json',route=>route.fulfill({json:map}));
try{
 await page.goto('http://127.0.0.1:5173/#/adventure');
 await page.getByRole('button',{name:'Aventure',exact:true}).click();
 await page.waitForFunction(()=>window.__player);
 await page.clock.install();
 const tick=ms=>page.clock.runFor(ms);
 const key=async k=>{await page.keyboard.press(k);await tick(32);};
 const close=async()=>{await page.getByRole('button',{name:'Terminer la conversation'}).click();await tick(32);};
 await page.locator('canvas').click();
 fs.mkdirSync('docs/campus-previews',{recursive:true});
 let current='drawn-rdc-2';
 async function position(){return page.evaluate(()=>window.__player);}
 async function walk(goal,targetRoom,replans=0){
  const sourceRoom=map.rooms.find(r=>r.id===current);
  const room=compileRoom({...sourceRoom,fixtures:sourceRoom.fixtures.map(f=>{if(!f.solid||!f.bounds)return f;const [x,y,w,h]=f.bounds;const pad=2;return {...f,bounds:[x-pad,y-pad,w+pad*2,h+pad*2]};})}),start=await position(),queue=[{...start,parent:-1}],seen=new Set(['0,0']);let found=-1;
  for(let i=0;i<queue.length;i++){
   const p=queue[i];if(goal(p)){found=i;break;}
   for(const [dx,dy]of [[8,0],[-8,0],[0,8],[0,-8]]){
    const k=[Math.round((p.x+dx-start.x)/8),Math.round((p.y+dy-start.y)/8)].join(',');if(seen.has(k))continue;seen.add(k);
    const next=moveInRoom(room,p,dx,dy);if(room.doors.some(d=>!d.inactive&&d.target!==targetRoom&&Math.hypot(start.x-d.at[0],start.y-d.at[1])>30&&Math.hypot(next.x-d.at[0],next.y-d.at[1])<30))continue;if(Math.abs(next.x-p.x-dx)<.001&&Math.abs(next.y-p.y-dy)<.001)queue.push({...next,parent:i});
   }
  }
  assert(found>=0,'No walking route in '+current+' from '+JSON.stringify(start)+' visible '+await page.locator('.entrance-heading h2').innerText());const path=[];
  while(found>0){path.unshift(queue[found]);found=queue[found].parent;}
  // Merge straight stretches, then use actual canvas player coordinates for feedback.
  const turns=path.filter((p,i)=>i===path.length-1||i>0&&(p.x-path[i-1].x!==path[i+1]?.x-p.x||p.y-path[i-1].y!==path[i+1]?.y-p.y));
  for(const target of turns){
   for(let attempt=0;attempt<5;attempt++){
    if(targetRoom&&await page.locator('.entrance-heading h2').innerText()===map.rooms.find(r=>r.id===targetRoom).name){current=targetRoom;return;}
    const at=await position(),dx=target.x-at.x,dy=target.y-at.y;if(Math.hypot(dx,dy)<1.5)break;
    const horizontal=Math.abs(dx)>Math.abs(dy),k=horizontal?(dx>0?'d':'q'):(dy>0?'s':'z'),distance=horizontal?Math.abs(dx):Math.abs(dy);
    await page.keyboard.down(k);await tick(Math.max(16,Math.round(distance/130*1000)));await page.keyboard.up(k);await tick(16);
   }
   const actual=await position();if(Math.hypot(actual.x-target.x,actual.y-target.y)>4){assert(replans<4,'Walking stalled near '+JSON.stringify(actual));return walk(goal,targetRoom,replans+1);}
  }
 }
 async function cross(target){
  const r=map.rooms.find(r=>r.id===current),door=r.doors.find(d=>d.target===target);assert(door);
  await walk(p=>Math.hypot(p.x-door.at[0],p.y-door.at[1])<10,target);
  if(current!==target){const [x,y]=door.normal,k=Math.abs(x)>Math.abs(y)?(x>0?'d':'q'):(y>0?'s':'z');await page.keyboard.down(k);await tick(220);await page.keyboard.up(k);await tick(32);}
  assert.equal(await page.locator('.entrance-heading h2').innerText(),map.rooms.find(r=>r.id===target).name,'Portal '+target+' from '+JSON.stringify(await position()));current=target;
 }
 async function talk(id){const npc=map.rooms.find(r=>r.id===current).fixtures.find(f=>f.id===id);assert(npc);await walk(p=>fixtureDistance(npc,p)<22);await key('e');assert.equal(await page.locator('.campus-dialogue strong').innerText(),npc.label);}
 async function click(action){await page.locator(`.campus-dialogue button[data-action="${action}"]`).click();await tick(48);}
 await key('e');await click('paper-offer');await click('decline');await close();
 await key('p');assert.match(await page.locator('.campus-panel').innerText(),/Aucune quête acceptée/);await key('Escape');
 await key('e');assert.match(await page.locator('.campus-dialogue').innerText(),/Comment vas-tu/);await click('paper-offer');await click('accept');await close();
 await key('i');assert.equal(await page.locator('.inventory-slot img').count(),1);await key('Escape');
 await cross('drawn-rdc-33');await talk('office-nadia');
 await click('activate-card');await click('party-offer');await click('party-decline');await close();
 await key('p');assert.equal(await page.locator('.quest-tabs button').count(),1);await key('Escape');
 await key('e');assert.match(await page.locator('.campus-dialogue').innerText(),/Ravie de te revoir/);await click('party-offer');await click('party-accept');await close();
 await key('i');assert.equal(await page.locator('.inventory-slot img').count(),2);await page.getByRole('button',{name:'Liste de la soirée'}).click();assert.match(await page.locator('.inventory-description').innerText(),/0\/7/);await key('Escape');
 await key('p');assert.equal(await page.locator('.quest-tabs button').count(),2);await page.getByRole('button',{name:/La soirée étudiante/}).click();assert.match(await page.locator('.campus-panel').innerText(),/À interroger/);await key('Escape');
 await key('e');assert.equal(await page.locator('[data-action="party-deliver"]').count(),0);await click('party-progress');assert.match(await page.locator('.campus-dialogue').innerText(),/Il reste à interroger/);await close();
 await page.screenshot({path:'docs/campus-previews/bureau.png'});
 await cross('drawn-rdc-2');await page.screenshot({path:'docs/campus-previews/distributeurs.png'});await cross('drawn-rdc-8');
 await page.screenshot({path:'docs/campus-previews/foyer.png'});
 for(const id of FOYER_IDS){
  await talk(id);
  assert.equal(await page.locator('[data-action="ask-oussama"]').count(),1);
  if(id==='student-alex'||id==='student-lina'){
   await click('ask-oussama');assert.match(await page.locator('.campus-dialogue').innerText(),id==='student-alex'?/ne sais pas/:/bibliothèque/);await click('menu');
  }
  await click('party-talk');
  if(id==='student-sarah'||id==='student-adam'){await click('party-detail');}
  await click('party-answer');await close();
 }
 await talk('student-lina');assert.match(await page.locator('.campus-dialogue').innerText(),/revoir/);await click('party-talk');assert.match(await page.locator('.campus-dialogue').innerText(),/déjà noté/);assert.equal(await page.locator('[data-action="party-answer"]').count(),0);await close();
 await key('p');await page.getByRole('button',{name:/La soirée étudiante/}).click();assert.match(await page.locator('.campus-panel').innerText(),/7 \/ 7/);assert.match(await page.locator('.campus-panel').innerText(),/Karim, Lina, Mehdi, Sarah/);await key('Escape');
 const partyFirst=process.env.PARTY_FIRST==='1'||process.argv.includes('--party-first');
 async function deliverPaper(){
  await cross('drawn-rdc-9');await talk('oussama');await page.screenshot({path:'docs/campus-previews/bibliotheque.png'});await click('deliver');await close();
  await key('e');assert.equal(await page.locator('[data-action="deliver"]').count(),0);await click('small');assert.match(await page.locator('.campus-dialogue').innerText(),/emprunter un équipement/);await close();
  await key('i');assert.equal(await page.getByAltText('Papier d’Amélia',{exact:true}).count(),0);assert.equal(await page.locator('.inventory-slot img').count(),partyFirst?0:1);await key('Escape');await cross('drawn-rdc-8');
 }
 async function deliverParty(){
  await cross('drawn-rdc-2');await cross('drawn-rdc-33');await talk('office-nadia');await click('party-deliver');assert.match(await page.locator('.campus-dialogue').innerText(),/Karim, Lina, Mehdi, Sarah/);await close();
  await key('e');assert.equal(await page.locator('[data-action="party-deliver"]').count(),0);await click('small');await close();
  await key('i');assert.equal(await page.getByAltText('Liste de la soirée',{exact:true}).count(),0);assert.equal(await page.locator('.inventory-slot img').count(),partyFirst?1:0);await key('Escape');await cross('drawn-rdc-2');await cross('drawn-rdc-8');
 }
 if(partyFirst){await deliverParty();await deliverPaper();}else{await deliverPaper();await deliverParty();}
 assert.match(await page.locator('.entrance-kicker').innerText(),/Respect : 25/);
 await talk('student-adam');assert.equal(await page.locator('[data-action="ask-oussama"]').count(),0);assert.equal(await page.locator('[data-action="party-talk"]').count(),0);await click('chat');await page.screenshot({path:'docs/campus-previews/conversation.png'});await close();
 await key('p');assert.equal(await page.getByRole('button',{name:/Terminée/}).count(),2);await page.screenshot({path:'docs/campus-previews/quete-terminee.png'});await key('Escape');
 assert.deepEqual(errors,[]);
 console.log(`PASS: real browser, both quests in parallel, all seven party replies, memory, office and seated NPCs, inventory removal and normal dialogue after completion (${partyFirst?'party first':'paper first'}).`);
}finally{await browser.close();}
