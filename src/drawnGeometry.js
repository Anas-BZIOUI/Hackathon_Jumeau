import {cutOpenings} from './openings.js';
export const GEOMETRY_KEY='ensiie-drawn-geometry-v1';
export const FLOOR_IDS=['RDC','R+1','R+2'];
export function emptyGeometry(){return {version:1,levels:Object.fromEntries(FLOOR_IDS.map(l=>[l,{walls:[],doors:[],regions:[]}]))};}
export function projectToWall(point,wall){
 const dx=wall.b[0]-wall.a[0],dy=wall.b[1]-wall.a[1],length=Math.hypot(dx,dy);
 const t=length?Math.max(0,Math.min(1,((point[0]-wall.a[0])*dx+(point[1]-wall.a[1])*dy)/(length*length))):0;
 const p=[wall.a[0]+t*dx,wall.a[1]+t*dy];return {t,point:p,distance:Math.hypot(point[0]-p[0],point[1]-p[1]),length};
}
export function validateGeometry(value,floors,rooms){
 if(value?.version!==1||!value.levels||typeof value.levels!=='object')throw Error('format');
 const ids=new Set();
 for(const [lv,layer]of Object.entries(value.levels)){
  const size=floors.levels[lv]?.size;if(!size||!layer||!['walls','doors','regions'].every(k=>Array.isArray(layer[k]))||layer.walls.length>5000||layer.doors.length>3000||layer.regions.length>100)throw Error('format');
  const point=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=0&&p[1]>=0&&p[0]<=size[0]&&p[1]<=size[1];
  const id=o=>{if(typeof o.id!=='string'||o.id.length>100||ids.has(o.id))throw Error('id');ids.add(o.id);};
  for(const w of layer.walls){id(w);if(!point(w.a)||!point(w.b)||Math.hypot(w.a[0]-w.b[0],w.a[1]-w.b[1])<.15||!Number.isFinite(w.height)||w.height<1||w.height>2.8||!Number.isFinite(w.thickness)||w.thickness<.05||w.thickness>.6)throw Error('wall');}
  for(const r of layer.regions){id(r);if(!point(r.min)||!point(r.max)||r.max[0]-r.min[0]<.15||r.max[1]-r.min[1]<.15)throw Error('region');}
  for(const d of layer.doors){id(d);const wall=layer.walls.find(w=>w.id===d.wallId),room=rooms.find(r=>r.id===d.roomId&&r.level===lv&&r.type!=='circulation');
   if(!wall||!room||![d.t,d.width].every(Number.isFinite)||d.width<.6||d.width>2.4||![-1,1].includes(d.swing)||!['start','end'].includes(d.hinge))throw Error('door');
   const length=projectToWall(wall.a,wall).length;
   if(wall.height<2.3)throw Error('door-height');
   if(d.t*length-d.width/2<.025||(1-d.t)*length-d.width/2<.025)throw Error('door-fit');
   if(layer.doors.some(other=>other.id!==d.id&&other.wallId===d.wallId&&Math.abs(other.t-d.t)*length<(other.width+d.width)/2+.025))throw Error('door-overlap');
  }
 }
 for(const lv of FLOOR_IDS)if(!value.levels[lv])throw Error('format');
 return JSON.parse(JSON.stringify(value));
}
export function mergeGeometry(walls,doors,geometry){
 if(!geometry)return {walls,doors};
 const outputWalls={...walls},outputDoors={...doors};
 for(const lv of FLOOR_IDS){const layer=geometry.levels[lv];if(!layer)continue;
  const replaced=p=>layer.regions.some(r=>p[0]>=r.min[0]&&p[0]<=r.max[0]&&p[1]>=r.min[1]&&p[1]<=r.max[1]);
  const zones=layer.regions.map(r=>({a:[r.min[0],(r.min[1]+r.max[1])/2],b:[r.max[0],(r.min[1]+r.max[1])/2],width:r.max[1]-r.min[1]}));
  outputWalls[lv]=[...cutOpenings(walls[lv]||[],zones),...layer.walls.map(w=>[w.a,w.b,{height:w.height,thickness:w.thickness,source:'user-drawn'}])];
  outputDoors[lv]=[...(doors[lv]||[]).filter(d=>!replaced(d.center)),...layer.doors.map(d=>{
   const w=layer.walls.find(w=>w.id===d.wallId),length=projectToWall(w.a,w).length,ux=(w.b[0]-w.a[0])/length,uy=(w.b[1]-w.a[1])/length;
   const center=[w.a[0]+(w.b[0]-w.a[0])*d.t,w.a[1]+(w.b[1]-w.a[1])*d.t],sign=d.hinge==='start'?1:-1;
   return {roomId:d.roomId,width:d.width,center,hinge:[center[0]-ux*d.width/2*sign,center[1]-uy*d.width/2*sign],end:[center[0]+ux*d.width/2*sign,center[1]+uy*d.width/2*sign],normal:[-uy*d.swing,ux*d.swing],source:'user-drawn'};
  })];
 }return {walls:outputWalls,doors:outputDoors};
}
