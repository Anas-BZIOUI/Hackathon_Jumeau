import {physicalNavigation} from './physicalNavigation.js';
import {walkingPath} from './walking.js';
import {roomAt} from './openings.js';

const length=points=>points.slice(1).reduce((n,p,i)=>n+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0);
export function createGeometryRouter(input){
 const scene=physicalNavigation(input),rooms=new Map(input.rooms.map(r=>[r.id,r])),anchors=new Map(),cache=new Map();
 function anchor(room){
  if(anchors.has(room.id))return anchors.get(room.id);
  const map=scene.maps[room.level],p=room.centroid;let result=null;
  if(map.clear(...p))result=p;
  else for(let radius=.2;radius<=2&&!result;radius+=.2)for(let i=0;i<24;i++){
   const q=[p[0]+radius*Math.cos(i*Math.PI/12),p[1]+radius*Math.sin(i*Math.PI/12)];
   if(map.clear(...q)&&(!room.polygon||roomAt(q,[room]))){result=q;break;}
  }
  if(!result)result=(scene.doors[room.level]||[]).filter(d=>d.roomId===room.id).map(d=>d.center).find(p=>map.clear(...p))||null;
  anchors.set(room.id,result);return result;
 }
 const landings=[];
 for(const record of scene.stairs){
  for(const [level,index] of [[record.lower,0],[record.upper,1]])landings.push({id:`${record.linkId}:${record.lower}:${level}`,level,point:scene.toLocal(level,record.path[index]),linkId:record.linkId,record,kind:'stairs'});
 }
 // Lift data is retained for step-free requests; all walking approaches still pass collision checks.
 for(const link of input.links.filter(l=>l.type==='lift'&&l.accessible!==false))for(const p of link.points)landings.push({id:`${link.id}:${p.level}`,level:p.level,point:[p.x,p.y],linkId:link.id,kind:'lift'});
 function floorPath(level,a,b){
  const key=`${level}:${a.join(',')}:${b.join(',')}`,reverse=`${level}:${b.join(',')}:${a.join(',')}`;
  if(cache.has(key))return cache.get(key);
  if(cache.has(reverse)){const p=cache.get(reverse);return p?[...p].reverse():null;}
  let path=walkingPath(scene.maps[level],a,b);if(path&&Math.hypot(path[0][0]-a[0],path[0][1]-a[1])>.001)path=[a,...path];if(cache.size>500)cache.clear();cache.set(key,path);return path;
 }
 function route(fromId,toId,{stepFree=false,startPosition=null,allowLift=false}={}){
  const from=rooms.get(fromId),to=rooms.get(toId);if(!to||(!from&&!startPosition))return null;
  const start=startPosition?{id:'current-position',level:startPosition.floor,point:[startPosition.x,startPosition.y]}:{id:from.id,level:from.level,point:anchor(from)};
  const end={id:to.id,level:to.level,point:anchor(to)};if(!start.point||!end.point||!scene.maps[start.level]?.clear(...start.point))return null;
  const access=(room,role)=> (scene.doors[room.level]||[]).filter(d=>d.roomId===room.id&&scene.maps[room.level].clear(...d.center)).map((d,i)=>({id:`${role}-${i}`,level:room.level,point:d.center,role}));
  const starts=startPosition?[start]:[start,...access(from,'start')],ends=[end,...access(to,'end')],endSet=new Set(ends);
  const order=['RDC','R+1','R+2'],lo=Math.min(order.indexOf(start.level),order.indexOf(end.level)),hi=Math.max(order.indexOf(start.level),order.indexOf(end.level));
  const vertices=[...starts,...ends,...landings.filter(l=>start.level!==end.level&&(stepFree?l.kind==='lift':allowLift||l.kind==='stairs')&&order.indexOf(l.level)>=lo&&order.indexOf(l.level)<=hi)],distance=new Map(starts.map(v=>[v,0])),prev=new Map(),done=new Set();
  let reached=null;
  while(true){let current=null,best=Infinity;for(const [v,d]of distance)if(!done.has(v)&&d<best){current=v;best=d;}if(!current)break;if(endSet.has(current)){reached=current;break;}done.add(current);
   for(const target of vertices){if(target===current||done.has(target))continue;let leg=null,cost=0;
    if(target.level===current.level){const path=floorPath(current.level,current.point,target.point);if(path){cost=length(path);leg={kind:'walk',level:current.level,points:path};}}
    else if(current.linkId&&current.linkId===target.linkId&&current.kind===target.kind&&(current.kind==='lift'||current.record===target.record)){
     cost=current.kind==='stairs'?8:15;leg={kind:current.kind,linkId:current.linkId,from:current.level,to:target.level,fromPoint:current.point,toPoint:target.point};
    }
    if(leg&&best+cost<(distance.get(target)??Infinity)){distance.set(target,best+cost);prev.set(target,{current,leg});}
   }
  }
  if(!reached){if(!stepFree&&!allowLift&&start.level!==end.level)return route(fromId,toId,{stepFree,startPosition,allowLift:true});return null;}
  const legs=[];let v=reached;while(!starts.includes(v)){const entry=prev.get(v);if(!entry)return null;legs.unshift(entry.leg);v=entry.current;}
  const nodes=[],steps=[];let metres=0,seconds=0;
  for(const leg of legs){if(leg.kind==='walk'){metres+=length(leg.points);seconds+=length(leg.points)/1.2;for(const p of leg.points)nodes.push({id:`route-${nodes.length}`,level:leg.level,x:p[0],y:p[1],type:'walk'});}
   else {const a={level:leg.from,x:leg.fromPoint[0],y:leg.fromPoint[1]},b={level:leg.to,x:leg.toPoint[0],y:leg.toPoint[1]};nodes.push({...a,id:`${leg.linkId}@${leg.from}`,type:leg.kind},{...b,id:`${leg.linkId}@${leg.to}`,type:leg.kind});seconds+=leg.kind==='stairs'?8:15;
    steps.push({kind:leg.kind,linkId:leg.linkId,from:a,to:b,text_fr:`${leg.kind==='stairs'?'Escalier':'Ascenseur'} ${input.links.find(l=>l.id===leg.linkId)?.label||''} : ${leg.from} → ${leg.to}`,text_en:`${leg.kind==='stairs'?'Stairs':'Lift'}: ${leg.from} → ${leg.to}`});
   }
  }
  if(nodes.length){nodes[0].id=fromId||'current-position';nodes.at(-1).id=toId;}
  return {ids:nodes.map(n=>n.id),nodes,legs,steps,metres:Math.round(metres),seconds:Math.round(seconds),minutes:Math.max(1,Math.ceil(seconds/60)),stepFree,source:'drawn-geometry',arrivalAtDoor:reached!==end,provisional:true};
 }
 return {route,scene,anchor,landings};
}
