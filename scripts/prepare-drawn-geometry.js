import fs from 'node:fs';
import {projectToWall,validateGeometry} from '../src/drawnGeometry.js';

// Keep the user's export untouched; produce a reproducible project default.
const source=JSON.parse(fs.readFileSync('ensiie-walls-doors.json','utf8'));
const floors=JSON.parse(fs.readFileSync('public/data/floors.json','utf8'));
const rooms=JSON.parse(fs.readFileSync('public/data/rooms.json','utf8'));
let geometry=validateGeometry(source,floors,rooms);
const report={};
for(const level of ['RDC','R+1']){
 let joins=0;
 const groups=new Map();
 for(const wall of geometry.levels[level].walls)for(const end of ['a','b']){
  const key=wall[end].join(',');if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push({id:wall.id,end});
 }
 // Existing shared corners act as anchors. Never pull a whole junction apart.
 for(const refs of [...groups.values()].sort((a,b)=>a.length-b.length)){
  const layer=geometry.levels[level],find=id=>layer.walls.find(w=>w.id===id);
  const p=find(refs[0].id)[refs[0].end];
  const attached=layer.walls.flatMap(w=>['a','b'].filter(end=>Math.hypot(w[end][0]-p[0],w[end][1]-p[1])<.001));
  if(attached.length>refs.length)continue; // A previous join has already anchored this junction.
  const candidates=[];
  for(const wall of layer.walls){
   if(refs.some(r=>r.id===wall.id))continue;
   for(const end of ['a','b']){
    const q=wall[end],distance=Math.hypot(p[0]-q[0],p[1]-q[1]);
    if(distance>.001&&distance<=.36)candidates.push({point:q,distance});
   }
   if(refs.length===1){const q=projectToWall(p,wall);
    if(q.t>0&&q.t<1&&q.distance>.001&&q.distance<=.30)candidates.push(q);
   }
  }
  candidates.sort((a,b)=>a.distance-b.distance);
  for(const candidate of candidates){
   const next=structuredClone(geometry),changed=next.levels[level];
   for(const ref of refs)changed.walls.find(w=>w.id===ref.id)[ref.end]=[...candidate.point];
   // Preserve each doorway's physical location when its supporting wall changes.
   for(const door of changed.doors){if(!refs.some(r=>r.id===door.wallId))continue;
    const old=layer.walls.find(w=>w.id===door.wallId),wall=changed.walls.find(w=>w.id===door.wallId);
    const center=old.a.map((v,i)=>v+(old.b[i]-v)*door.t);
    door.t=projectToWall(center,wall).t;
   }
   try{geometry=validateGeometry(next,floors,rooms);joins++;break;}catch{/* Retain the original if a join would invalidate a door or collapse a wall. */}
  }
 }
 report[level]={walls:geometry.levels[level].walls.length,doors:geometry.levels[level].doors.length,joins};
}
geometry.project_revision='authored-2026-10-15-v1';
fs.writeFileSync('data-src/drawn-geometry.json',JSON.stringify(geometry,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
