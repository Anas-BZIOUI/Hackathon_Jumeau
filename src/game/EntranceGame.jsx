import { useEffect, useRef, useState } from 'react';
import { DIRECTIONS, inPolygon } from './rdc-world.js';
const loadImage=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(src));img.src=src;});
export default function EntranceGame({lang,onProgress}) {
 const canvas=useRef(null),progress=useRef(onProgress);progress.current=onProgress;
 const [status,setStatus]=useState('loading'),[current,setCurrent]=useState('Sas d’entrée');
 const fr=lang==='fr';
 useEffect(()=>{
  const el=canvas.current,ctx=el.getContext('2d'),controller=new AbortController(),keys=new Set(),visited=new Set(),opened=new Set();
  let disposed=false,raf,layout,room,player,idle,run,floor,front,side,cells,clock=0,last=0,distance=0,direction='up',report='',arrivalDoor=null,flash=0;
  const center=c=>[c[0]*16+8,c[1]*16+8];
  function enter(id,position,doorId=null){
   room=layout.rooms.find(r=>r.id===id);cells=new Set(room.cells.map(c=>c.join(',')));player={x:position[0],y:position[1]};arrivalDoor=doorId;keys.clear();visited.add(id);setCurrent(room.name);flash=.18;
  }
  async function setup(){
   const response=await fetch('/game/maps/rdc-dungeon.json',{signal:controller.signal});if(!response.ok)throw new Error('map');layout=await response.json();
   [idle,run,floor,front,side]=await Promise.all(['idle_32x32_2.png','run_horizontal_32x32_2.png','Wood Tile Pattern 1.png','Wooden Door 32x32 (Front).png','Wooden Door 32x32 (Side).png'].map(n=>loadImage('/game/tilesets/'+encodeURIComponent(n))));
   if(disposed)return;enter(layout.spawn.roomId,layout.spawn.position);setStatus('ready');raf=requestAnimationFrame(tick);
  }
  const fits=(x,y)=>[[-5,-4],[5,-4],[5,4],[-5,4]].every(([dx,dy])=>room.outline?inPolygon(x+dx,y+dy,room.outline):cells.has([Math.floor((x+dx)/16),Math.floor((y+dy)/16)].join(',')));
  function tick(now){
   if(disposed)return;const dt=last?Math.min((now-last)/1000,.04):0;last=now;clock+=dt;flash=Math.max(0,flash-dt);
   let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('q')||keys.has('a')||keys.has('arrowleft'));
   let dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('z')||keys.has('w')||keys.has('arrowup'));
   const len=Math.hypot(dx,dy);if(len){direction=Math.abs(dx)>=Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');dx=dx/len*130*dt;dy=dy/len*130*dt;}
   const old={...player};if(fits(player.x+dx,player.y))player.x+=dx;if(fits(player.x,player.y+dy))player.y+=dy;
   const travelled=Math.hypot(player.x-old.x,player.y-old.y);distance+=travelled;
   if(arrivalDoor){const door=room.doors.find(d=>d.id===arrivalDoor);if(!door||Math.hypot(player.x-door.at[0],player.y-door.at[1])>42)arrivalDoor=null;}
   if(len){
    const portal=room.doors.find(d=>d.id!==arrivalDoor && Math.hypot(player.x-d.at[0],player.y-d.at[1])<15 && dx*d.normal[0]+dy*d.normal[1]>0);
    if(portal){const target=layout.rooms.find(r=>r.id===portal.target),back=target.doors.find(d=>d.id===portal.id);opened.add(portal.id);enter(target.id,back.at,portal.id);}
   }
   const signature=[room.id,Math.floor(distance/24),visited.size].join(':');
   if(signature!==report){report=signature;progress.current({steps:Math.floor(distance/24),zone:room.id,roomName:room.name,visited:[...visited],opened:[...opened],total:layout.rooms.length,rooms:layout.rooms.map(r=>({id:r.id,name:r.name}))});}
   draw(travelled>.01);raf=requestAnimationFrame(tick);
  }
  function draw(moving){
   ctx.imageSmoothingEnabled=false;ctx.fillStyle='#101923';ctx.fillRect(0,0,768,576);ctx.save();
   const points=room.outline||room.cells.map(([x,y])=>[x*16,y*16]);
   const xs=points.map(c=>c[0]),ys=points.map(c=>c[1]),minX=Math.min(...xs),minY=Math.min(...ys),maxX=Math.max(...xs)+(room.outline?0:16),maxY=Math.max(...ys)+(room.outline?0:16);
   const width=maxX-minX,height=maxY-minY;
   const cameraX=width<640?384-(minX+maxX)/2:Math.max(640-maxX,Math.min(128-minX,384-player.x));
   const cameraY=height<430?300-(minY+maxY)/2:Math.max(480-maxY,Math.min(80-minY,320-player.y));
   ctx.translate(Math.round(cameraX),Math.round(cameraY));
   if(room.outline){
    ctx.beginPath();room.outline.forEach(([x,y],i)=>{if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);});ctx.closePath();
    ctx.fillStyle=ctx.createPattern(floor,'repeat');ctx.fill();
    // Draw each straight wall as one continuous segment, cutting only actual portal openings.
    for(let i=0;i<room.outline.length;i++){
     const a=room.outline[i],b=room.outline[(i+1)%room.outline.length],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(!length)continue;
     const cuts=room.doors.filter(d=>d.wallAt&&Math.abs(dx*(d.wallAt[1]-a[1])-dy*(d.wallAt[0]-a[0]))/length<.1).map(d=>{const t=((d.wallAt[0]-a[0])*dx+(d.wallAt[1]-a[1])*dy)/length;return [Math.max(0,t-(d.leaves===2?32:22)),Math.min(length,t+(d.leaves===2?32:22))];}).filter(([lo,hi])=>lo<hi).sort((x,y)=>x[0]-y[0]);
     let cursor=0;
     const line=(start,end)=>{if(end<=start)return;ctx.beginPath();ctx.moveTo(a[0]+dx*start/length,a[1]+dy*start/length);ctx.lineTo(a[0]+dx*end/length,a[1]+dy*end/length);ctx.stroke();};
     ctx.strokeStyle=Math.abs(dy)>Math.abs(dx)?'#6f7b80':'#c3b7a0';ctx.lineWidth=6;
     for(const [start,end] of cuts){line(cursor,start);cursor=Math.max(cursor,end);}line(cursor,length);
    }
   }else{
   for(const [x,y] of room.cells){ctx.drawImage(floor,x*16,y*16,16,16);}
   // Build game walls from exposed tile edges; neighbouring rooms are never rendered.
   for(const [x,y] of room.cells)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(!cells.has([x+dx,y+dy].join(','))){
    const edgeX=x*16+8+dx*8,edgeY=y*16+8+dy*8;
    const doorway=room.doors.some(d=>{
     const wallX=d.at[0]+d.normal[0]*8,wallY=d.at[1]+d.normal[1]*8;
     return d.normal[0]===dx && d.normal[1]===dy && Math.abs(edgeX-wallX)<(dx?2:24) && Math.abs(edgeY-wallY)<(dy?2:24);
    });
    const street=room.id==='rdc-38' && dy===1 && edgeY===352 && edgeX>=160 && edgeX<224;
    if(doorway||street)continue;
    ctx.strokeStyle=dy===-1?'#c3b7a0':'#6f7b80';ctx.lineWidth=dy===-1?12:6;
    ctx.beginPath();if(dx){const a=(x+(dx>0?1:0))*16;ctx.moveTo(a,y*16);ctx.lineTo(a,y*16+16);}else{const b=(y+(dy>0?1:0))*16;ctx.moveTo(x*16,b);ctx.lineTo(x*16+16,b);}ctx.stroke();
   }
   }
   for(const door of room.doors){
    // Seat the frame on the exposed wall edge, rather than on a floor marker.
    const x=door.wallAt?.[0]??door.at[0]+door.normal[0]*8,y=door.wallAt?.[1]??door.at[1]+door.normal[1]*8;
    ctx.save();ctx.translate(x,y);
    if(door.normal[0]){
     if(door.normal[0]>0)ctx.scale(-1,1);
     if(door.leaves===2){ctx.drawImage(side,-8,-32,16,32);ctx.drawImage(side,-8,0,16,32);}else ctx.drawImage(side,-8,-24,16,48);
    }else{
     if(door.leaves===2){ctx.drawImage(front,-32,-24,32,32);ctx.drawImage(front,0,-24,32,32);}else ctx.drawImage(front,-24,-24,48,32);
    }
    ctx.restore();
   }
   if(room.id==='rdc-38'){
    // Inactive double street door, flush with the bottom wall.
    ctx.drawImage(front,160,328,32,32);ctx.drawImage(front,192,328,32,32);
   }
   ctx.fillStyle='#0004';ctx.beginPath();ctx.ellipse(player.x,player.y,9,4,0,0,Math.PI*2);ctx.fill();
   const frame=moving?DIRECTIONS[direction]*6+Math.floor(clock*10)%6:DIRECTIONS[direction];
   ctx.drawImage(moving?run:idle,frame*32,0,32,64,Math.round(player.x)-20,Math.round(player.y)-75,40,80);
   ctx.restore();if(flash>0){ctx.fillStyle=`rgba(16,25,35,${flash*3})`;ctx.fillRect(0,0,768,576);}
  }
  const movement=['arrowup','arrowdown','arrowleft','arrowright','z','q','s','d','w','a'];
  function down(e){const k=e.key.toLowerCase();if(movement.includes(k)){e.preventDefault();keys.add(k);}}
  function up(e){keys.delete(e.key.toLowerCase());}const clear=()=>keys.clear();
  el.addEventListener('keydown',down);el.addEventListener('keyup',up);el.addEventListener('blur',clear);window.addEventListener('blur',clear);
  setup().catch(error=>{if(!disposed&&error.name!=='AbortError')setStatus('error');});
  return()=>{disposed=true;controller.abort();cancelAnimationFrame(raf);el.removeEventListener('keydown',down);el.removeEventListener('keyup',up);el.removeEventListener('blur',clear);window.removeEventListener('blur',clear);};
 },[]);
 return <div className="entrance-stage"><div className="entrance-heading"><span className="entrance-kicker">ENSIIE / RDC</span><h2>{current}</h2><p>{fr?'Marchez vers une porte pour rejoindre la pièce voisine.':'Walk into a door to enter the next room.'}</p></div>
  <div className="entrance-canvas-wrap"><canvas ref={canvas} width="768" height="576" tabIndex={0} onPointerDown={()=>canvas.current.focus()} aria-label={fr?'ZQSD ou flèches pour marcher. Traverser une porte change de pièce.':'WASD or arrows to walk. Walk into a door to change rooms.'}/>
   {status!=='ready'&&<div className="entrance-overlay">{status==='error'?(fr?'Chargement impossible. Rechargez la page.':'Could not load the game. Reload the page.'):(fr?'Chargement…':'Loading…')}</div>}
  </div><p className="entrance-controls">{fr?'Cliquez dans le jeu · ZQSD / flèches : marcher · Portes : passage automatique':'Click the game · WASD / arrows: walk · Doors: automatic passage'}</p>
 </div>;
}
