import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {createGeometryRouter} from '../src/geometryRouter.js';
import {calibratedScene} from '../src/calibration.js';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),start=performance.now();
const scene=calibratedScene(read('public/data/floors.json'),read('public/data/links.json'),read('ensiie-control-points.json'));
const router=createGeometryRouter({...scene,rooms:read('public/data/rooms.json'),walls:read('public/data/walls.json'),doors:read('public/data/doors.json'),geometry:read('data-src/drawn-geometry.json')});
const initializationMs=performance.now()-start,queries=[];
for(const [from,to] of [['RDC-011','RDC-028'],['RDC-011','R+1-131'],['R+1-131','RDC-011'],['RDC-011','RDC-017']]){const began=performance.now(),route=router.route(from,to);queries.push({from,to,found:!!route,milliseconds:Math.round((performance.now()-began)*100)/100});}
const report={environment:'Local Node process; this is not a browser FPS or user-device benchmark',initializationMs:Math.round(initializationMs*100)/100,queries};
fs.writeFileSync('data-src/performance-audit.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
