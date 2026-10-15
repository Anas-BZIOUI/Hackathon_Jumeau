import {useEffect,useRef,useState} from 'react';
import {DIRECTIONS} from './rdc-world.js';
import {compileRoom,canOccupy,moveInRoom,portalAt,fixtureDistance} from './authored-world.js';
const loadImage=src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(src));image.src=src;});
export default function EntranceGame({lang,onProgress}){
 const canvas=useRef(null),progress=useRef(onProgress);progress.current=onProgress;
 const [status,setStatus]=useState('loading'),[current,setCurrent]=useState('Sas d’entrée'),[hint,setHint]=useState(null);
 const fr=lang==='fr';
 useEffect(()=>{
  const el=canvas.current,ctx=el.getContext('2d'),abort=new AbortController(),keys=new Set(),visited=new Set(),opened=new Set();
  let disposed=false,raf,layout,room,player,images,decorImages,last=0,clock=0,distance=0,direction='up',arrival=null,flash=0,signature='',hintId='';
  function safeSpawn(target,p){
   if(canOccupy(target,{x:p[0],y:p[1]}))return p;
   for(let radius=2;radius<100;radius+=2)for(let n=0;n<32;n++){const q=[p[0]+Math.cos(n*Math.PI/16)*radius,p[1]+Math.sin(n*Math.PI/16)*radius];if(canOccupy(target,{x:q[0],y:q[1]}))return q;}
   throw Error('No safe arrival '+target.id);
  }
  function enter(id,p,door=null){room=layout.rooms.find(r=>r.id===id);const at=safeSpawn(room,p);player={x:at[0],y:at[1]};arrival=door;visited.add(id);keys.clear();flash=.16;setCurrent(room.name);}
  async function setup(){
   const response=await fetch('/game/maps/rdc-dungeon.json',{signal:abort.signal});if(!response.ok)throw Error('map');layout=await response.json();layout.rooms=layout.rooms.map(compileRoom);
   images=await Promise.all(['idle_32x32_2.png','run_horizontal_32x32_2.png','Wood Tile Pattern 1.png','Wooden Door 32x32 (Front).png','Wooden Door 32x32 (Side).png','elevator.png','Wooden Door (Front) 1.png','Wooden Door (Front) 2.png','Sliding Door R1.png','Sliding Door L1.png','Sliding Door 32x32 (Side).png'].map(name=>loadImage('/game/tilesets/'+encodeURIComponent(name))));
   const decorNames=['noticeboard','plant','computer','stationery','bench-back','desk','chair','bin','amelia'];
   decorImages=Object.fromEntries(await Promise.all(decorNames.map(async name=>[name,await loadImage('/game/decor/'+name+'.png')])));
   if(disposed)return;enter(layout.spawn.roomId,layout.spawn.position);setStatus('ready');raf=requestAnimationFrame(tick);
  }
  function tick(now){
   if(disposed)return;const dt=last?Math.min((now-last)/1000,.04):0;last=now;clock+=dt;flash=Math.max(0,flash-dt);
   let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('q')||keys.has('a')||keys.has('arrowleft'));
   let dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('z')||keys.has('w')||keys.has('arrowup'));
   const length=Math.hypot(dx,dy);if(length){direction=Math.abs(dx)>=Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');dx=dx/length*130*dt;dy=dy/length*130*dt;}
   const next=moveInRoom(room,player,dx,dy),travelled=Math.hypot(next.x-player.x,next.y-player.y);distance+=travelled;player=next;
   if(arrival){const door=room.doors.find(d=>d.id===arrival);if(!door||Math.hypot(player.x-door.at[0],player.y-door.at[1])>28)arrival=null;}
   const portal=length?portalAt(room,player,dx,dy,arrival):null;
   if(portal){const target=layout.rooms.find(r=>r.id===portal.target),back=target.doors.find(d=>d.id===portal.id);opened.add(portal.id);enter(target.id,back.at,portal.id);}
   const near=room.doors.filter(d=>Math.hypot(player.x-d.at[0],player.y-d.at[1])<55).sort((a,b)=>Math.hypot(player.x-a.at[0],player.y-a.at[1])-Math.hypot(player.x-b.at[0],player.y-b.at[1]))[0];
   const fixture=(room.fixtures||[]).find(f=>['stairs','elevator-panel','npc'].includes(f.kind)&&fixtureDistance(f,player)<34);
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
   ctx.save();ctx.translate(Math.round(cameraX),Math.round(cameraY));
   ctx.beginPath();room.outline.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=ctx.createPattern(floor,'repeat');ctx.fill();
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
   for(const wall of room.visibleWalls){ctx.strokeStyle='#b6c0bc';ctx.lineWidth=Math.max(3,wall.thickness);ctx.beginPath();ctx.moveTo(...wall.a);ctx.lineTo(...wall.b);ctx.stroke();}
   for(const door of room.doors){
    const [x,y]=door.wallAt,width=door.width;ctx.save();ctx.translate(x,y);ctx.globalAlpha=door.inactive?.65:1;
    const vertical=Math.abs(door.normal[0])>Math.abs(door.normal[1]);
    if(door.style==='elevator'){
     // Lower frame: the closed elevator entrance, with its call button.
     ctx.drawImage(elevator,48,140,96,64,-width*.8,-30,width*1.6,40);
    }else if(vertical){
     if(door.normal[0]>0)ctx.scale(-1,1);
     ctx.drawImage(door.style==='sliding'?slidingSide:side,-6,-width/2,12,width);
    }else if(door.style==='sliding'){
     ctx.drawImage(slidingL,-width/2,-22,width/2,28);ctx.drawImage(slidingR,0,-22,width/2,28);
    }else ctx.drawImage(door.style==='solid'?solidDoor:windowDoor,-width/2,-22,width,28);
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
    if(f.kind==='counter'){
     // Use the supplied desk's wooden tabletop without repeating its legs across the L.
     ctx.drawImage(decorImages.desk,0,0,32,20,x,y,w,h);
     ctx.strokeStyle='#754522';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
    }else if(f.kind==='npc'){
     ctx.drawImage(decorImages[f.asset],f.frame*16,0,16,32,x,y,w,h);
    }else ctx.drawImage(decorImages[f.asset],x,y,w,h);
   }}));
   objects.push({depth:player.y,draw:drawPlayer});objects.sort((a,b)=>a.depth-b.depth);for(const object of objects)object.draw();
   ctx.restore();if(flash){ctx.fillStyle=`rgba(16,25,35,${flash*3})`;ctx.fillRect(0,0,768,576);}
  }
  const movement=['arrowup','arrowdown','arrowleft','arrowright','z','q','s','d','w','a'];
  function down(e){const k=e.key.toLowerCase();if(movement.includes(k)){e.preventDefault();keys.add(k);}}
  function up(e){keys.delete(e.key.toLowerCase());}const clear=()=>keys.clear();
  el.addEventListener('keydown',down);el.addEventListener('keyup',up);el.addEventListener('blur',clear);window.addEventListener('blur',clear);
  setup().catch(e=>{if(!disposed&&e.name!=='AbortError')setStatus('error');});
  return()=>{disposed=true;abort.abort();cancelAnimationFrame(raf);el.removeEventListener('keydown',down);el.removeEventListener('keyup',up);el.removeEventListener('blur',clear);window.removeEventListener('blur',clear);};
 },[]);
 return <div className="entrance-stage"><div className="entrance-heading"><span className="entrance-kicker">ENSIIE / RDC</span><h2>{current}</h2><p>{fr?'Marchez vers une porte pour rejoindre la pièce voisine.':'Walk into a door to enter the next room.'}</p></div>
 <div className="entrance-canvas-wrap"><canvas ref={canvas} width="768" height="576" tabIndex={0} onPointerDown={()=>canvas.current.focus()} aria-label={fr?'ZQSD ou flèches pour marcher. Portes automatiques.':'WASD or arrows to walk. Automatic door transitions.'}/>
 {status!=='ready'&&<div className="entrance-overlay">{status==='error'?(fr?'Chargement impossible. Relancez npm run data puis rechargez.':'Could not load the map. Run npm run data and reload.'):(fr?'Chargement…':'Loading…')}</div>}
 {status==='ready'&&hint&&<div className="entrance-door-hint">{hint.kind==='stairs'?(fr?'Escalier · R+1 indisponible pour le moment':'Stairs · R+1 is not available yet'):hint.kind==='elevator'||hint.kind==='elevator-panel'?(fr?'Ascenseur · RDC · R+1 indisponible pour le moment':'Elevator · Ground floor · R+1 is not available yet'):hint.inactive?(fr?'Sortie extérieure · inactive':'Exterior exit · inactive'):hint.name}</div>}
 </div><p className="entrance-controls">{fr?'Cliquez dans le jeu · ZQSD / flèches : marcher · Portes : passage automatique':'Click the game · WASD / arrows: walk · Doors: automatic passage'}</p></div>;
}
