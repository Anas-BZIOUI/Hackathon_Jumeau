import * as THREE from 'three';
import {worldPoint} from './core.js';
import {mergeGeometry} from './drawnGeometry.js';
import {cutOpenings} from './openings.js';
import {collisionMap} from './walking.js';
import {stairPath,stairProgress} from './stairs.js';
const LEVELS=['RDC','R+1','R+2'];

// One collision model for map routes and the immersive character.
export function physicalNavigation({floors,links,walls,doors,geometry}){
 const merged=mergeGeometry(walls,doors,geometry),maps={},segments={};
 const toWorld=(lv,p)=>{const [x,y]=worldPoint(floors,lv,...p,true);return new THREE.Vector3(x,LEVELS.indexOf(lv)*3.2+.3,-y);};
 const toLocal=(lv,p)=>{const meta=floors.levels[lv],a=-(meta.rotation_deg||0)*Math.PI/180,x=p.x-meta.offset[0],y=-p.z-meta.offset[1];return [Math.cos(a)*x-Math.sin(a)*y,Math.sin(a)*x+Math.cos(a)*y];};
 const stairs=[];
 for(const link of links.filter(l=>l.type==='stairs')){
  const points=link.points.slice().sort((a,b)=>LEVELS.indexOf(a.level)-LEVELS.indexOf(b.level));
  for(let i=1;i<points.length;i++)stairs.push({linkId:link.id,lower:points[i-1].level,upper:points[i].level,path:stairPath(toWorld(points[i-1].level,[points[i-1].x,points[i-1].y]),toWorld(points[i].level,[points[i].x,points[i].y]))});
 }
 for(const lv of LEVELS){
  const openings=(merged.doors[lv]||[]).map(d=>({a:d.hinge,b:d.end,width:.45}));
  for(const r of stairs.filter(r=>r.lower===lv||r.upper===lv))openings.push({a:toLocal(lv,r.path[0]),b:toLocal(lv,r.path[1]),width:1.85});
  segments[lv]=cutOpenings(merged.walls[lv]||[],openings);
  maps[lv]=collisionMap(segments[lv],floors.levels[lv].size,.25,(x,y)=>stairs.some(r=>{if(r.upper!==lv)return false;const t=stairProgress(r.path,toWorld(lv,[x,y]),1.12);return t!==null&&t>.02&&t<.98;}));
 }
 return {...merged,maps,segments,stairs,toWorld,toLocal};
}
