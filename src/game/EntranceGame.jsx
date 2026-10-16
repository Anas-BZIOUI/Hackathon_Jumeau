import QuestPanels from './QuestPanels.jsx';
import {initialQuest,questAction,dialogueFor,dialogueStep} from './quest.js';
import {useEffect,useRef,useState} from 'react';
import {DIRECTIONS,inPolygon} from './rdc-world.js';
import {compileRoom,canOccupy,moveInRoom,portalAt,fixtureDistance} from './authored-world.js';
const loadImage=src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(src));image.src=src;});
export default function EntranceGame({lang,onProgress}){
 const canvas=useRef(null),progress=useRef(onProgress);progress.current=onProgress;
 const [status,setStatus]=useState('loading'),[current,setCurrent]=useState('Sas d’entrée'),[hint,setHint]=useState(null);
 const [quest,setQuest]=useState(initialQuest),[panel,setPanel]=useState(null),[dialogue,setDialogue]=useState(null);
 const ui=useRef({quest:initialQuest(),panel:null,dialogue:null}),interact=useRef(()=>{});
 const setGamePanel=value=>{ui.current.panel=value;setPanel(value);};
 function closeDialogue(){ui.current.dialogue=null;setDialogue(null);canvas.current?.focus();}
 function choose(action){
  const current=ui.current.dialogue;if(!current)return;
  if(action==='close'){closeDialogue();return;}
  if(!current.choices?.some(c=>c.action===action))return;
  let next=questAction(ui.current.quest,action,current.npc);
  if(action==='ask-oussama'&&current.npc.knows)next=questAction(next,'clue');
  ui.current.quest=next;setQuest(next);
  const d={npc:current.npc,...dialogueStep(current.npc,next,action)};ui.current.dialogue=d;setDialogue(d);
 }

 useEffect(()=>{
  const el=canvas.current,ctx=el.getContext('2d'),abort=new AbortController(),keys=new Set(),visited=new Set(),opened=new Set();
  let disposed=false,raf,layout,room,player,images,decorImages,last=0,clock=0,distance=0,direction='up',arrival=null,flash=0,signature='',hintId='',view=null;
  function safeSpawn(target,p){
   if(canOccupy(target,{x:p[0],y:p[1]}))return p;
   for(let radius=2;radius<100;radius+=2)for(let n=0;n<32;n++){const q=[p[0]+Math.cos(n*Math.PI/16)*radius,p[1]+Math.sin(n*Math.PI/16)*radius];if(canOccupy(target,{x:q[0],y:q[1]}))return q;}
   throw Error('No safe arrival '+target.id);
  }
  function enter(id,p,door=null){view=null;room=layout.rooms.find(r=>r.id===id);const at=safeSpawn(room,p);player={x:at[0],y:at[1]};arrival=door;visited.add(id);keys.clear();flash=.16;setCurrent(room.name);}
  async function setup(){
   const response=await fetch('/game/maps/rdc-dungeon.json',{signal:abort.signal});if(!response.ok)throw Error('map');layout=await response.json();layout.rooms=layout.rooms.map(compileRoom);
   images=await Promise.all(['idle_32x32_2.png','run_horizontal_32x32_2.png','Wood Tile Pattern 1.png','Wooden Door 32x32 (Front).png','Wooden Door 32x32 (Side).png','elevator.png','Wooden Door (Front) 1.png','Wooden Door (Front) 2.png','Sliding Door R1.png','Sliding Door L1.png','Sliding Door 32x32 (Side).png'].map(name=>loadImage('/game/tilesets/'+encodeURIComponent(name))));
   const decorNames=['noticeboard','plant','computer','stationery','bench-back','desk','chair','bin','amelia','gray','white','wood','round-table','bookshelf','book','chalkboard','alex','bob','adam','seated','seated-bob','closet'];
   decorImages=Object.fromEntries(await Promise.all(decorNames.map(async name=>[name,await loadImage('/game/decor/'+name+'.png')])));
   if(disposed)return;enter(layout.spawn.roomId,layout.spawn.position);setStatus('ready');raf=requestAnimationFrame(tick);
  }
  interact.current=()=>{
   if(ui.current.dialogue||ui.current.panel||!room)return;
   const npc=room.fixtures.filter(f=>f.kind==='npc'&&fixtureDistance(f,player)<68).sort((a,b)=>fixtureDistance(a,player)-fixtureDistance(b,player))[0];
   if(!npc)return;keys.clear();const d={npc,...dialogueFor(npc,ui.current.quest)};ui.current.quest=questAction(ui.current.quest,'meet',npc);setQuest(ui.current.quest);ui.current.dialogue=d;setDialogue(d);
  };
  function tick(now){
   if(disposed)return;const dt=last?Math.min((now-last)/1000,.04):0;last=now;clock+=dt;flash=Math.max(0,flash-dt);
   let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('q')||keys.has('a')||keys.has('arrowleft'));
   let dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('z')||keys.has('w')||keys.has('arrowup'));
   if(ui.current.dialogue||ui.current.panel){dx=0;dy=0;}
   const length=Math.hypot(dx,dy);if(length){direction=Math.abs(dx)>=Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');dx=dx/length*130*dt;dy=dy/length*130*dt;}
   const next=moveInRoom(room,player,dx,dy),travelled=Math.hypot(next.x-player.x,next.y-player.y);distance+=travelled;player=next;
   if(arrival){const door=room.doors.find(d=>d.id===arrival);if(!door||Math.hypot(player.x-door.at[0],player.y-door.at[1])>28)arrival=null;}
   const portal=length?portalAt(room,player,dx,dy,arrival):null;
   if(portal){const target=layout.rooms.find(r=>r.id===portal.target),back=target.doors.find(d=>d.id===portal.id);opened.add(portal.id);enter(target.id,back.at,portal.id);}
   const near=room.doors.filter(d=>Math.hypot(player.x-d.at[0],player.y-d.at[1])<55).sort((a,b)=>Math.hypot(player.x-a.at[0],player.y-a.at[1])-Math.hypot(player.x-b.at[0],player.y-b.at[1]))[0];
   const fixture=(room.fixtures||[]).filter(f=>['stairs','elevator-panel','npc'].includes(f.kind)&&fixtureDistance(f,player)<(f.kind==='npc'?68:34)).sort((a,b)=>fixtureDistance(a,player)-fixtureDistance(b,player))[0];
   const nextHint=fixture?{id:fixture.id,kind:fixture.kind,name:fixture.label}:room.kind==='elevator'?{id:'elevator-info',kind:'elevator'}:near?{id:near.id,inactive:near.inactive,name:layout.rooms.find(r=>r.id===near.target)?.name}:null;
   if((nextHint?.id||'')!==hintId){hintId=nextHint?.id||'';setHint(nextHint);}
   const report=[room.id,Math.floor(distance/24),visited.size].join(':');if(report!==signature){signature=report;progress.current({steps:Math.floor(distance/24),zone:room.id,roomName:room.name,visited:[...visited],opened:[...opened],total:layout.rooms.length,rooms:layout.rooms.map(r=>({id:r.id,name:r.name}))});}
   draw(travelled>.01);raf=requestAnimationFrame(tick);
  }
  function draw(moving){
   const [idle,run,floor,front,side,elevator,windowDoor,solidDoor,slidingR,slidingL,slidingSide]=images;ctx.imageSmoothingEnabled=false;ctx.fillStyle='#101923';ctx.fillRect(0,0,768,576);
   const xs=room.outline.map(p=>p[0]),ys=room.outline.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
   const cameraX=maxX-minX<640?384-(minX+maxX)/2:Math.max(640-maxX,Math.min(128-minX,384-player.x));
   const cameraY=maxY-minY<430?300-(minY+maxY)/2:Math.max(480-maxY,Math.min(80-minY,320-player.y));
   const speaking=ui.current.dialogue,n=speaking?.npc.draw,targetZoom=speaking?1.18:1;
   const targetX=speaking?384-(player.x+n[0]+n[2]/2)/2*targetZoom:cameraX,targetY=speaking?275-(player.y+n[1]+n[3])/2*targetZoom:cameraY;
   view??={x:targetX,y:targetY,zoom:targetZoom};
   view.x+=(targetX-view.x)*.16;view.y+=(targetY-view.y)*.16;view.zoom+=(targetZoom-view.zoom)*.16;
   ctx.save();ctx.translate(Math.round(view.x),Math.round(view.y));ctx.scale(view.zoom,view.zoom);
   ctx.beginPath();room.outline.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=ctx.createPattern(decorImages[room.floor]||floor,'repeat');ctx.fill();
   if(room.kind==='elevator'){
    ctx.save();ctx.clip();
    // The upper-left frame in elevator.png is the cabin interior, not the whole sprite sheet.
    ctx.drawImage(elevator,16,0,160,140,minX,minY,maxX-minX,maxY-minY);ctx.restore();
   }
   for(const f of room.fixtures||[])if(f.kind==='stairs'){
    const [x,y,w,h]=f.bounds;
    ctx.fillStyle='#263a45';ctx.fillRect(x,y,w,h);
    ctx.strokeStyle='#a9b9bb';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
    for(let i=1;i<15;i++){const px=x+w*i/15;ctx.strokeStyle=i%2?'#81949b':'#c0c9c4';ctx.beginPath();ctx.moveTo(px,y+5);ctx.lineTo(px,y+h-5);ctx.stroke();}
    ctx.fillStyle='#d1b278';ctx.fillRect(x,y,w,4);ctx.fillRect(x,y+h-4,w,4);
    const cx=x+w/2,cy=y+h/2;ctx.strokeStyle='#edf2d6';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx-f.direction*14,cy-10);ctx.lineTo(cx+f.direction*2,cy);ctx.lineTo(cx-f.direction*14,cy+10);ctx.stroke();
    ctx.fillStyle='#e6eee6';ctx.font='10px monospace';ctx.fillText('R+1',x+w/2-10,y-7);
   }
   ctx.lineCap='butt';
   // Vertical facade above the floor line, with openings cut from the authored walls.
   for(const wall of room.visibleWalls){
    const [ax,ay]=wall.a,[bx,by]=wall.b;
    if(Math.abs(ax-bx)<Math.abs(ay-by)*3||!inPolygon((ax+bx)/2,(ay+by)/2+9,room.outline))continue;
    ctx.fillStyle='#9ca99e';ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(bx,by-54);ctx.lineTo(ax,ay-54);ctx.closePath();ctx.fill();
    for(const [offset,color,width]of [[-54,'#51596a',4],[-49,'#d4d6cb',4],[-3,'#666c75',5]]){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(ax,ay+offset);ctx.lineTo(bx,by+offset);ctx.stroke();}
   }
   for(const wall of room.visibleWalls){ctx.strokeStyle='#b6c0bc';ctx.lineWidth=Math.max(3,wall.thickness);ctx.beginPath();ctx.moveTo(...wall.a);ctx.lineTo(...wall.b);ctx.stroke();}
   for(const door of room.doors){
    const [x,y]=door.wallAt,width=door.width;ctx.save();ctx.translate(x,y);ctx.globalAlpha=door.inactive?.65:1;
    const vertical=Math.abs(door.normal[0])>Math.abs(door.normal[1]),doorY=door.normal[1]<-.5?-54:-22,doorHeight=door.normal[1]<-.5?60:28;
    if(door.style==='elevator'){
     // Lower frame: the closed elevator entrance, with its call button.
     ctx.drawImage(elevator,48,140,96,64,-width*.8,-54,width*1.6,60);
    }else if(vertical){
     if(door.normal[0]>0)ctx.scale(-1,1);
     ctx.drawImage(door.style==='sliding'?slidingSide:side,-6,-width/2,12,width);
    }else if(door.style==='sliding'){
     ctx.drawImage(slidingL,-width/2,doorY,width/2,doorHeight);ctx.drawImage(slidingR,0,doorY,width/2,doorHeight);
    }else ctx.drawImage(door.style==='solid'?solidDoor:windowDoor,-width/2,doorY,width,doorHeight);
    ctx.restore();
   }
   // Sort furniture and characters by their feet so walking behind objects hides the player correctly.
   const drawPlayer=()=>{
    ctx.fillStyle='#0004';ctx.beginPath();ctx.ellipse(player.x,player.y,9,4,0,0,Math.PI*2);ctx.fill();
    const frame=moving?DIRECTIONS[direction]*6+Math.floor(clock*10)%6:DIRECTIONS[direction];
    ctx.drawImage(moving?run:idle,frame*32,0,32,64,Math.round(player.x)-20,Math.round(player.y)-75,40,80);
   };
   const objects=(room.fixtures||[]).filter(f=>f.draw).map(f=>({depth:f.depth??f.draw[1]+f.draw[3],draw:()=>{
    const [x,y,w,h]=f.draw;
    if(f.art){
     ctx.fillStyle='#0005';ctx.fillRect(x+3,y+h-5,w,h>40?8:5);
     ctx.fillStyle=f.art==='couch'?'#53786c':f.art==='vending'?'#34576b':f.art==='games'?'#305b55':'#996a45';ctx.fillRect(x,y,w,h);
     ctx.strokeStyle='#c6ad82';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
     if(f.art==='painting'){ctx.fillStyle='#e2d7b7';ctx.fillRect(x+3,y+3,w-6,h-6);ctx.fillStyle='#789d9b';ctx.fillRect(x+6,y+6,w-12,h-12);ctx.fillStyle='#d8be71';ctx.beginPath();ctx.arc(x+w*.7,y+h*.35,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#345b58';ctx.beginPath();ctx.moveTo(x+6,y+h-6);ctx.lineTo(x+w*.45,y+9);ctx.lineTo(x+w-6,y+h-6);ctx.fill();}
     if(f.art==='couch'){ctx.fillStyle='#78998a';ctx.fillRect(x+4,y+5,w-8,h-12);for(let n=32;n<w;n+=32){ctx.fillStyle='#476558';ctx.fillRect(x+n,y+5,2,h-12);}}
     if(f.art==='bar'||f.art==='buffet'){ctx.fillStyle='#cfb58d';ctx.fillRect(x+2,y+2,w-4,7);for(let n=14;n<w-10;n+=25){ctx.fillStyle=f.art==='buffet'?'#e7dfc3':'#477d72';ctx.beginPath();ctx.ellipse(x+n,y+18,7,4,0,0,Math.PI*2);ctx.fill();if(f.art==='buffet'){ctx.fillStyle='#ca6d43';ctx.fillRect(x+n-3,y+15,6,4);}}}
     if(f.art==='vending'){ctx.fillStyle='#172c3b';ctx.fillRect(x+5,y+8,w-16,h-27);for(let a=0;a<3;a++)for(let b=0;b<3;b++){ctx.fillStyle=['#ce8758','#90b7a2','#dec674'][a];ctx.fillRect(x+8+a*7,y+13+b*12,5,8);}ctx.fillStyle='#c7dcd7';ctx.fillRect(x+w-8,y+20,4,12);ctx.fillStyle='#101923';ctx.fillRect(x+8,y+h-15,w-16,7);}
     if(f.art==='games'){ctx.strokeStyle='#d3d5bb';ctx.strokeRect(x+5,y+5,w-10,h-10);ctx.beginPath();ctx.moveTo(x+w/2,y+5);ctx.lineTo(x+w/2,y+h-5);ctx.stroke();ctx.fillStyle='#e8d1aa';ctx.beginPath();ctx.arc(x+w*.7,y+h*.6,3,0,Math.PI*2);ctx.fill();}
    }else if(f.kind==='counter'){
     // Use the supplied desk's wooden tabletop without repeating its legs across the L.
     ctx.drawImage(decorImages.desk,0,0,32,20,x,y,w,h);
     ctx.strokeStyle='#754522';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
    }else if(f.kind==='npc'){
     ctx.drawImage(decorImages[f.asset],f.frame*16,0,16,32,x,y,w,h);
    }else ctx.drawImage(decorImages[f.asset],x,y,w,h);
   }}));
   objects.push({depth:player.y,draw:drawPlayer});objects.sort((a,b)=>a.depth-b.depth);for(const object of objects)object.draw();
   ctx.restore();if(ui.current.dialogue){ctx.fillStyle='#000';ctx.fillRect(0,0,768,48);ctx.fillRect(0,528,768,48);}if(flash){ctx.fillStyle=`rgba(16,25,35,${flash*3})`;ctx.fillRect(0,0,768,576);}
  }
  const movement=['arrowup','arrowdown','arrowleft','arrowright','z','q','s','d','w','a'];
  function down(e){if(e.target instanceof HTMLElement&&e.target.closest('input,textarea,select,[contenteditable=true]'))return;const k=e.key.toLowerCase();
   if(['e','p','i','escape'].includes(k)){e.preventDefault();if(e.repeat)return;keys.clear();
    if(k==='escape'){closeDialogue();setGamePanel(null);}else if(k==='e')interact.current();else if(!ui.current.dialogue)setGamePanel(ui.current.panel===k?null:k);return;}
   if(movement.includes(k)){e.preventDefault();keys.add(k);}}
  function up(e){keys.delete(e.key.toLowerCase());}const clear=()=>keys.clear();
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);el.addEventListener('blur',clear);window.addEventListener('blur',clear);
  setup().catch(e=>{if(!disposed&&e.name!=='AbortError')setStatus('error');});
  return()=>{disposed=true;abort.abort();cancelAnimationFrame(raf);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);el.removeEventListener('blur',clear);window.removeEventListener('blur',clear);};
 },[]);
 return <div className="entrance-stage"><div className="entrance-heading"><span className="entrance-kicker">ENSIIE / RDC · Respect : {quest.respect}</span><h2>{current}</h2><p>Découvrez le campus et rencontrez les étudiants.</p></div>
 <div className="entrance-canvas-wrap"><canvas ref={canvas} width="768" height="576" tabIndex={0} onPointerDown={()=>canvas.current.focus()} aria-label="ZQSD ou flèches : marcher. E : parler. P : quêtes. I : inventaire."/>
 {status!=='ready'&&<div className="entrance-overlay">{status==='error'?'Chargement impossible. Rechargez la page.':'Chargement…'}</div>}
 {status==='ready'&&hint&&!dialogue&&!panel&&<div className="entrance-door-hint">{hint.kind==='npc'?`E · Parler à ${hint.name}`:hint.kind==='stairs'?'Escalier · R+1 indisponible':hint.kind==='elevator'||hint.kind==='elevator-panel'?'Ascenseur · RDC · R+1 indisponible':hint.inactive?'Sortie extérieure · inactive':hint.name}</div>}
 {dialogue&&<section className="campus-dialogue" role="dialog" aria-label={`Conversation avec ${dialogue.npc.label}`}><strong>{dialogue.npc.label}</strong><p>{dialogue.text}</p><div>{dialogue.choices?.filter(c=>c.action!=='close').map(c=><button key={c.action} data-action={c.action} onClick={()=>choose(c.action)}>{c.label}</button>)}<button onClick={closeDialogue}>Terminer la conversation</button></div></section>}
 {panel&&<section className="campus-panel" role="dialog" aria-label={panel==='p'?'Journal de quêtes':'Inventaire'}><button className="campus-close" onClick={()=>{setGamePanel(null);canvas.current?.focus();}}>Fermer · Échap</button><h3>{panel==='p'?'Journal de quêtes':'Inventaire'}</h3>
 <QuestPanels quest={quest} panel={panel}/>
 </section>}
 </div><div className="campus-toolbar"><button onClick={()=>interact.current()} disabled={!!dialogue||!!panel}>Parler · E</button><button onClick={()=>{if(!dialogue)setGamePanel(panel==='p'?null:'p');}}>Quêtes · P</button><button onClick={()=>{if(!dialogue)setGamePanel(panel==='i'?null:'i');}}>Inventaire · I</button></div><p className="entrance-controls">Cliquez dans le jeu · ZQSD / flèches : marcher · E : parler · P : quêtes · I : inventaire · Échap : fermer</p></div>;
}
