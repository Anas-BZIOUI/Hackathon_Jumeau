import fs from 'node:fs';
import {createGeometryRouter} from '../src/geometryRouter.js';
import {calibratedScene} from '../src/calibration.js';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const rooms=read('public/data/rooms.json');
const scene=calibratedScene(read('public/data/floors.json'),read('public/data/links.json'),read('ensiie-control-points.json'));
const router=createGeometryRouter({...scene,rooms,walls:read('public/data/walls.json'),doors:read('public/data/doors.json'),geometry:read('data-src/drawn-geometry.json')});
const report={source:'Project geometry and calibrated stair landings; no inferred wall crossings',scope:'Origin-to-room checks in both directions, not all room pairs or on-site validation',floors:{}};
for(const [level,origin]of [['RDC','RDC-011'],['R+1','R+1-131']]){
 const targets=rooms.filter(r=>r.level===level&&r.type!=='circulation'),reachable=[],unreachable=[],diagnostics=[];
 for(const room of targets){
  const outward=room.id===origin||!!router.route(origin,room.id);
  const returning=room.id===origin||!!router.route(room.id,origin);
  (outward&&returning?reachable:unreachable).push(room.id);
  if(outward&&returning)continue;
  const anchor=router.anchor(room),doors=(router.scene.doors[level]||[]).filter(d=>d.roomId===room.id);
  const clearDoors=doors.filter(d=>router.scene.maps[level].clear(...d.center));
  const observations=[];
  if(!anchor)observations.push('no-collision-safe-room-anchor');
  if(!doors.length)observations.push('no-associated-door');
  else if(!clearDoors.length)observations.push('all-associated-door-centres-blocked');
  if(anchor&&clearDoors.length)observations.push('disconnected-path-requires-geometry-review');
  if(outward!==returning)observations.push('directional-route-asymmetry');
  diagnostics.push({roomId:room.id,centroid:room.centroid,anchor,doorCount:doors.length,clearDoorCount:clearDoors.length,outward,returning,observations,requiresPlanReview:true});
 }
 report.floors[level]={origin,reachable:reachable.length,total:targets.length,unreachable,diagnostics};
 console.log(`${level}: ${reachable.length}/${targets.length} reachable from ${origin}`);
}
report.betweenFloors=!!router.route('RDC-011','R+1-131');
report.betweenFloorsReturn=!!router.route('R+1-131','RDC-011');
fs.writeFileSync('data-src/routing-audit.json',JSON.stringify(report,null,2)+'\n');
