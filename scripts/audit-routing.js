import fs from 'node:fs';
import {createGeometryRouter} from '../src/geometryRouter.js';
import {calibratedScene} from '../src/calibration.js';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const rooms=read('public/data/rooms.json');
const scene=calibratedScene(read('public/data/floors.json'),read('public/data/links.json'),read('ensiie-control-points.json'));
const router=createGeometryRouter({...scene,rooms,walls:read('public/data/walls.json'),doors:read('public/data/doors.json'),geometry:read('data-src/drawn-geometry.json')});
const report={source:'Project geometry and calibrated stair landings; no inferred wall crossings',floors:{}};
for(const [level,origin]of [['RDC','RDC-011'],['R+1','R+1-131']]){
 const targets=rooms.filter(r=>r.level===level&&r.type!=='circulation'),reachable=[],unreachable=[];
 for(const room of targets)(room.id===origin||router.route(origin,room.id)?reachable:unreachable).push(room.id);
 report.floors[level]={origin,reachable:reachable.length,total:targets.length,unreachable};
 console.log(`${level}: ${reachable.length}/${targets.length} reachable from ${origin}`);
}
report.betweenFloors=!!router.route('RDC-011','R+1-131');
fs.writeFileSync('data-src/routing-audit.json',JSON.stringify(report,null,2)+'\n');
