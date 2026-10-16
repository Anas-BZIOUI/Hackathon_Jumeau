import {GUIDES} from '../discoveryMissions.js';
import {canOccupy} from './authored-world.js';

export function placeVirtualGuides(layout){
 return GUIDES.flatMap(guide=>{
  const room=guide.id==='orientation'?layout.rooms.find(r=>r.id===layout.spawn.roomId):layout.rooms.find(r=>r.roomIds?.includes(guide.roomId));
  if(!room)return [];
  const xs=room.outline.map(p=>p[0]),ys=room.outline.map(p=>p[1]),base=guide.id==='orientation'?layout.spawn.position:[(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2];
  const candidates=[[base[0]+25,base[1]],[base[0]-25,base[1]],base];
  for(let y=Math.min(...ys)+12;y<Math.max(...ys);y+=20)for(let x=Math.min(...xs)+12;x<Math.max(...xs);x+=20)candidates.push([x,y]);
  const p=candidates.find(([x,y])=>canOccupy(room,{x,y}));
  return p?[{id:guide.id,zone:room.id,x:p[0],y:p[1]}]:[];
 });
}

export function nearbyVirtualGuide(guides,room,player){
 return guides.filter(g=>g.zone===room.id&&Math.hypot(player.x-g.x,player.y-g.y)<56).sort((a,b)=>Math.hypot(player.x-a.x,player.y-a.y)-Math.hypot(player.x-b.x,player.y-b.y)).find(g=>{
  const count=Math.max(1,Math.ceil(Math.hypot(player.x-g.x,player.y-g.y)/4));
  for(let i=0;i<=count;i++)if(!canOccupy(room,{x:player.x+(g.x-player.x)*i/count,y:player.y+(g.y-player.y)*i/count}))return false;
  return true;
 })||null;
}
