import {decorateCampus} from './rdc-campus.mjs';
import {decorateReception} from './rdc-decor.mjs';
import {applyFixtures} from './rdc-fixtures.mjs';
// Your editor export is the single source of geometry for the 2D game.
import fs from 'node:fs';
import {buildAuthoredMap} from './authored-rdc.mjs';
const source=JSON.parse(fs.readFileSync('data-src/ensiie-walls-doors.json'));
const labels=JSON.parse(fs.readFileSync('public/data/rooms.json'));
const map=decorateCampus(decorateReception(applyFixtures(buildAuthoredMap(source,labels))));
fs.mkdirSync('public/game/maps',{recursive:true});
fs.writeFileSync('public/game/maps/rdc-dungeon.json',JSON.stringify(map,null,2)+'\n');
fs.writeFileSync('public/game/maps/rdc-map-audit.json',JSON.stringify(map.audit,null,2)+'\n');
console.log(`Authored RDC: ${map.rooms.length} spaces, ${map.audit.linkedDoors} linked drawn doors, ${map.audit.inferredDoors.length} inferred doors, ${map.audit.exteriorDoors.length} inactive exterior doors; ${map.audit.reachableRooms}/${map.rooms.length} spaces reachable.`);

// Review artifact only; the running game still shows one environment at a time.
const point=p=>`${p[0]},${35-p[1]}`;
const elements=map.rooms.map(r=>`<polygon points="${r.sourcePolygon.map(point).join(' ')}" fill="#dce8e3" stroke="none"/>`);
for(const w of source.levels.RDC.walls)elements.push(`<line x1="${w.a[0]}" y1="${35-w.a[1]}" x2="${w.b[0]}" y2="${35-w.b[1]}" stroke="#223c43" stroke-width="${w.thickness}"/>`);
for(const w of map.audit.junctionRepairs)elements.push(`<line x1="${w.a[0]}" y1="${35-w.a[1]}" x2="${w.b[0]}" y2="${35-w.b[1]}" stroke="#ac608c" stroke-width=".12"/>`);
for(const d of source.levels.RDC.doors){const w=source.levels.RDC.walls.find(w=>w.id===d.wallId),dx=w.b[0]-w.a[0],dy=w.b[1]-w.a[1],length=Math.hypot(dx,dy),x=w.a[0]+dx*d.t,y=w.a[1]+dy*d.t;elements.push(`<line x1="${x-dx/length*d.width/2}" y1="${35-y+dy/length*d.width/2}" x2="${x+dx/length*d.width/2}" y2="${35-y-dy/length*d.width/2}" stroke="#d4923c" stroke-width=".22"/>`);}
for(const d of map.audit.inferredDoors)elements.push(`<circle cx="${d.center[0]}" cy="${35-d.center[1]}" r=".28" fill="#239ac1"/>`);
fs.writeFileSync('public/game/maps/rdc-authored-preview.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 37" width="1440" height="888"><rect width="60" height="37" fill="#f5f7f5"/>${elements.join('')}<text x="2" y="36" font-family="sans-serif" font-size=".45">Drawn walls: dark | Drawn doors: orange | Junction repairs: pink | Two inferred doors: blue</text></svg>`);
