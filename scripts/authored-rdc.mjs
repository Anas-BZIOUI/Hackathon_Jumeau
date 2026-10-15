import fs from 'node:fs';
import {inPolygon} from '../src/game/rdc-world.js';
export const SCALE=40;
const EPS=1e-6;
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function projection(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));return [a[0]+dx*t,a[1]+dy*t];}
const area=ring=>ring.reduce((sum,p,i)=>{const q=ring[(i+1)%ring.length];return sum+p[0]*q[1]-p[1]*q[0];},0)/2;
export function buildAuthoredMap(source,labels){
 const layer=source.levels.RDC;
 const walls=layer.walls.map(w=>({...w,a:[...w.a],b:[...w.b]}));
 const repairs=[];
 // Close only tiny drafting gaps; original endpoints are never moved.
 for(const wall of layer.walls)for(const point of [wall.a,wall.b]){
  const candidates=layer.walls.filter(w=>w.id!==wall.id).map(w=>({wall:w,point:projection(point,w.a,w.b)})).map(c=>({...c,distance:distance(point,c.point)})).sort((a,b)=>a.distance-b.distance);
  if(candidates[0]?.distance>EPS&&candidates[0].distance<=.4){
   const c=candidates[0];if(repairs.some(r=>distance(r.a,point)<EPS&&distance(r.b,c.point)<EPS))continue;
   const repair={id:'junction-'+repairs.length,a:point,b:c.point,height:wall.height,thickness:wall.thickness,inferred:true};repairs.push(repair);
  }
 }
 const topology=[...walls,...repairs],splits=topology.map(w=>[w.a,w.b]);
 for(let i=0;i<topology.length;i++)for(let j=i+1;j<topology.length;j++){
  const a=topology[i],b=topology[j],u=[a.b[0]-a.a[0],a.b[1]-a.a[1]],v=[b.b[0]-b.a[0],b.b[1]-b.a[1]],cross=u[0]*v[1]-u[1]*v[0];
  if(Math.abs(cross)<EPS){for(const p of [a.a,a.b])if(distance(p,projection(p,b.a,b.b))<EPS)splits[j].push(p);for(const p of [b.a,b.b])if(distance(p,projection(p,a.a,a.b))<EPS)splits[i].push(p);continue;}
  const d=[b.a[0]-a.a[0],b.a[1]-a.a[1]],t=(d[0]*v[1]-d[1]*v[0])/cross,s=(d[0]*u[1]-d[1]*u[0])/cross;
  if(t>=-EPS&&t<=1+EPS&&s>=-EPS&&s<=1+EPS){const p=[a.a[0]+t*u[0],a.a[1]+t*u[1]];splits[i].push(p);splits[j].push(p);}
 }
 const key=p=>p.map(x=>x.toFixed(6)).join(','),nodes=new Map();
 const add=p=>{const k=key(p);if(!nodes.has(k))nodes.set(k,{p,neighbors:new Set()});return k;};
 splits.forEach((points,i)=>{const a=topology[i].a;points.sort((p,q)=>distance(a,p)-distance(a,q));for(let j=1;j<points.length;j++){if(distance(points[j-1],points[j])<EPS)continue;const u=add(points[j-1]),v=add(points[j]);nodes.get(u).neighbors.add(v);nodes.get(v).neighbors.add(u);}});
 const ordered=new Map([...nodes].map(([k,n])=>[k,[...n.neighbors].sort((a,b)=>{const p=nodes.get(a).p,q=nodes.get(b).p;return Math.atan2(p[1]-n.p[1],p[0]-n.p[0])-Math.atan2(q[1]-n.p[1],q[0]-n.p[0]);})]));
 const traversed=new Set(),faces=[];
 for(const [u,n] of nodes)for(const v of n.neighbors){
  if(traversed.has(u+'>'+v))continue;
  let a=u,b=v;const ring=[];
  for(let step=0;step<nodes.size*4;step++){
   const edge=a+'>'+b;if(traversed.has(edge))break;traversed.add(edge);ring.push(nodes.get(a).p);
   const neighbors=ordered.get(b),index=neighbors.indexOf(a),c=neighbors[(index-1+neighbors.length)%neighbors.length];a=b;b=c;if(a===u&&b===v)break;
  }
  if(ring.length>=3&&area(ring)>.3)faces.push(ring);
 }
 const findFace=p=>faces.findIndex(r=>inPolygon(...p,r));
 const transform=p=>[p[0]*SCALE,(35-p[1])*SCALE];
 function safe(ring,p){const valid=q=>[[-.16,-.14],[.16,-.14],[.16,.14],[-.16,.14]].every(([x,y])=>inPolygon(q[0]+x,q[1]+y,ring));
  if(valid(p))return p;
  for(let radius=.2;radius<30;radius+=.2)for(let n=0;n<32;n++){const q=[p[0]+radius*Math.cos(n*Math.PI/16),p[1]+radius*Math.sin(n*Math.PI/16)];if(valid(q))return q;}
  throw Error('No interior spawn');
 }
 const rooms=faces.map((ring,i)=>{
  const matching=labels.filter(r=>r.level==='RDC'&&inPolygon(...r.centroid,ring));
  const best=matching.sort((a,b)=>(b.area_plan_m2||0)-(a.area_plan_m2||0))[0];
  const center=ring.reduce((p,q)=>[p[0]+q[0]/ring.length,p[1]+q[1]/ring.length],[0,0]);
  const sas=inPolygon(29,5.5,ring);
  return {id:'drawn-rdc-'+i,name:sas?'Sas d’entrée':best?.name_fr||'Circulation / espace '+(i+1),roomIds:matching.map(r=>r.id),outline:ring.map(transform),sourcePolygon:ring,cells:[],spawn:transform(safe(ring,center)),doors:[],source:'data-src/ensiie-walls-doors.json',area:area(ring)};
 });
 const doorAudit=[];
 for(const door of layer.doors){
  const wall=walls.find(w=>w.id===door.wallId);if(!wall)throw Error('Unknown wall '+door.wallId);
  const center=[wall.a[0]+(wall.b[0]-wall.a[0])*door.t,wall.a[1]+(wall.b[1]-wall.a[1])*door.t],length=distance(wall.a,wall.b),normal=[-(wall.b[1]-wall.a[1])/length,(wall.b[0]-wall.a[0])/length];
  let sides=[];
  for(const sign of [-1,1]){
   let match=null;
   for(const offset of [.18,.3,.5,.75,1]){const p=[center[0]+normal[0]*sign*offset,center[1]+normal[1]*sign*offset],face=findFace(p);if(face>=0){match={face,point:safe(faces[face],p),sign};break;}}
   sides.push(match);
  }
  const linked=sides[0]&&sides[1]&&sides[0].face!==sides[1].face;
  doorAudit.push({id:door.id,wallId:door.wallId,center,width:door.width,faces:sides.map(s=>s?.face??null),status:linked?'linked':sides.some(Boolean)?'exterior-or-unresolved':'unresolved'});
  for(let i=0;i<2;i++)if(sides[i]&&(i===0||sides[i].face!==sides[0]?.face)){
   const side=sides[i],other=sides[1-i];
   rooms[side.face].doors.push({id:door.id,wallId:door.wallId,wallAt:transform(center),at:transform(side.point),normal:[-normal[0]*side.sign,normal[1]*side.sign],tangent:[(wall.b[0]-wall.a[0])/length,-(wall.b[1]-wall.a[1])/length],width:door.width*SCALE,leaves:1,target:linked?rooms[other.face].id:null,inactive:!linked,sourceRoomId:door.roomId});
  }
 }
 // Fill only missing indoor connections across an existing shared wall.
 // These two additions are explicit in the audit, never confused with authored doors.
 const inferredDoors=[];
 for(let ri=0;ri<rooms.length;ri++){
  if(rooms[ri].doors.some(d=>d.target))continue;
  const candidates=[];
  for(let e=0;e<faces[ri].length;e++){
   const a=faces[ri][e],b=faces[ri][(e+1)%faces[ri].length],length=distance(a,b);if(length<.8)continue;
   const center=[(a[0]+b[0])/2,(a[1]+b[1])/2],normal=[-(b[1]-a[1])/length,(b[0]-a[0])/length];
   for(const sign of [-1,1]){
    const p=[center[0]+normal[0]*sign*.35,center[1]+normal[1]*sign*.35],target=findFace(p);
    if(target<0||target===ri||!rooms[target].doors.some(d=>d.target))continue;
    const wall=topology.map(w=>({w,d:distance(center,projection(center,w.a,w.b))})).sort((a,b)=>a.d-b.d)[0];
    if(wall.d>.1)continue;
    candidates.push({center,normal,target,sign,wall:wall.w,score:rooms[target].area});
   }
  }
  candidates.sort((a,b)=>b.score-a.score);
  const choice=candidates[0];if(!choice)continue;
  const id='inferred-missing-door-'+ri;
  for(const [index,sign] of [[ri,-choice.sign],[choice.target,choice.sign]]){
   const position=safe(faces[index],[choice.center[0]+choice.normal[0]*sign*.4,choice.center[1]+choice.normal[1]*sign*.4]);
   rooms[index].doors.push({id,wallId:choice.wall.id,wallAt:transform(choice.center),at:transform(position),normal:[-choice.normal[0]*sign,choice.normal[1]*sign],width:.9*SCALE,leaves:1,target:rooms[index===ri?choice.target:ri].id,inferred:true});
  }
  inferredDoors.push({id,rooms:[rooms[ri].id,rooms[choice.target].id],center:choice.center,reason:'Missing authored door; inferred on shared wall toward adjacent accessible space. Verify on site.'});
 }
 // Split at actual intersections before assigning wall portions to each room.
 for(const room of rooms){
  room.walls=[];
  for(let wi=0;wi<topology.length;wi++){
   const w=topology[wi],points=splits[wi].slice().sort((p,q)=>distance(w.a,p)-distance(w.a,q));
   for(let j=1;j<points.length;j++){
    const a=points[j-1],b=points[j];if(distance(a,b)<EPS)continue;
    const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    if(inPolygon(...mid,room.sourcePolygon)||room.sourcePolygon.some((p,i)=>distance(mid,projection(mid,p,room.sourcePolygon[(i+1)%room.sourcePolygon.length]))<.08))room.walls.push({id:w.id,a:transform(a),b:transform(b),thickness:w.thickness*SCALE,inferred:!!w.inferred});
   }
  }
 }
 let start=findFace([29,5.5]);if(start<0)start=rooms.findIndex(r=>r.name.includes('Circulation'));if(start<0)start=0;
 const seen=new Set([rooms[start].id]),queue=[rooms[start]];for(const r of queue)for(const d of r.doors)if(d.target&&!seen.has(d.target)){seen.add(d.target);queue.push(rooms.find(r=>r.id===d.target));}
 const audit={inferredDoors,sourceWalls:walls.length,sourceDoors:layer.doors.length,rooms:rooms.length,junctionRepairs:repairs,linkedDoors:doorAudit.filter(d=>d.status==='linked').length,exteriorDoors:doorAudit.filter(d=>d.faces.includes(null)),unresolvedDoors:doorAudit.filter(d=>d.status==='unresolved'),reachableRooms:seen.size,unreachableRooms:rooms.filter(r=>!seen.has(r.id)).map(r=>({id:r.id,name:r.name}))};
 return {version:2,source:'authored-walls',scale:SCALE,tile:16,spawn:{roomId:rooms[start].id,position:transform(safe(faces[start],[29,5.5]))},rooms,audit,sourceDoors:doorAudit};
}
if(process.argv[1]?.endsWith('authored-rdc.mjs')){
 const source=JSON.parse(fs.readFileSync('data-src/ensiie-walls-doors.json')),labels=JSON.parse(fs.readFileSync('public/data/rooms.json'));
 const map=buildAuthoredMap(source,labels);fs.writeFileSync('public/game/maps/rdc-dungeon.json',JSON.stringify(map,null,2)+'\n');
 console.log(JSON.stringify({...map.audit,junctionRepairs:map.audit.junctionRepairs.length,unresolvedDoors:map.audit.unresolvedDoors.length,exteriorDoors:map.audit.exteriorDoors.length},null,2));
}
