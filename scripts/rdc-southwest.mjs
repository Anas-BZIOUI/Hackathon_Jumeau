// Hand-authored structure from the user's annotated southwest RDC reference.
// Coordinates are game cells; dimensions are adapted for play, not survey measurements.
export function applySouthwest(rooms) {
 const byId=new Map(rooms.map(r=>[r.id,r]));
 const rect=(x0,y0,x1,y1)=>{const c=[];for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)c.push([x,y]);return c;};
 const previous=(room,id)=>byId.get(room).doors.find(d=>d.id===id);
 const mainUpper=previous('rdc-30','door-2');
 const mainLower=previous('rdc-30','door-3');
 const northwest=previous('rdc-25','door-58');
 const sector=new Set(['rdc-27','rdc-28','rdc-33','rdc-34']);
 for(const room of rooms)room.doors=room.doors.filter(d=>!sector.has(room.id)&&!sector.has(d.target));
 function shape(id,cells,spawn,name){const room=byId.get(id);room.cells=[...new Map(cells.map(c=>[c.join(','),c])).values()];room.spawn=spawn;room.structureSource='User annotated southwest RDC plan';if(name)room.name=name;}
 // Continuous, rectilinear wall traces. Door swing arcs are openings, not wall recesses.
 // Keep the lecture-hall east wall straight; the former two corner notches were invented.
 shape('rdc-27',rect(2,2,35,31),[280,280]);
 shape('rdc-28',rect(2,2,9,25),[88,200]);
 shape('rdc-33',[...rect(2,2,11,6),...rect(6,6,14,11)],[136,104],'Passage haut · Cabanes / régie');
 shape('rdc-34',[...rect(2,2,12,9),...rect(12,3,15,5)],[136,88],'Passage bas · Cabanes');
 // Original DXF local metres, traced from the straight wall runs of the reference.
 // Uniform scale only: no independent resizing of width/height.
 const traces={
  'rdc-27':[[7.134,3.429],[21.258,3.429],[21.258,16.115],[7.134,16.115]],
  'rdc-28':[[21.597,7.407],[23.451,7.407],[23.451,13.467],[21.597,13.467]],
  'rdc-33':[[21.597,13.467],[23.52,13.467],[23.52,14.806],[23.451,14.806],[23.451,15.809],[22.532,15.809],[22.532,16.24],[21.597,16.24]],
  'rdc-34':[[21.597,3.429],[23.413,3.429],[23.413,4.63],[23.451,4.63],[23.451,5.875],[23.52,5.875],[23.52,7.211],[21.597,7.211]]
 };
 for(const [id,ring] of Object.entries(traces)){
  const minX=Math.min(...ring.map(p=>p[0])),maxY=Math.max(...ring.map(p=>p[1]));
  const scale=id==='rdc-27'?40:64;
  const r=byId.get(id);r.outline=ring.map(([x,y])=>[32+(x-minX)*scale,32+(maxY-y)*scale]);
  r.wallSource={file:'PLAN ENSIIE RDC présentation.dxf',localMetres:ring,scale,method:'Straight wall trace from DXF/reference; door swing contours excluded; DWG not independently verified'};
  r.spawn=[(Math.min(...r.outline.map(p=>p[0]))+Math.max(...r.outline.map(p=>p[0])))/2,(Math.min(...r.outline.map(p=>p[1]))+Math.max(...r.outline.map(p=>p[1])))/2];
 }
 function link(id,a,at,normal,b,backAt,backNormal){byId.get(a).doors.push({id,target:b,at,normal});byId.get(b).doors.push({id,target:a,at:backAt,normal:backNormal});}
 link('sw-amphi-northwest','rdc-27',[40,40],[0,-1],'rdc-25',northwest.at,northwest.normal);
 link('sw-amphi-upper','rdc-27',[552,104],[1,0],'rdc-33',[40,72],[-1,0]);
 link('sw-upper-main','rdc-33',[216,136],[1,0],'rdc-30',mainUpper.at,mainUpper.normal);
 link('sw-control-north','rdc-28',[88,40],[0,-1],'rdc-33',[136,168],[0,1]);
 link('sw-lower-main','rdc-34',[232,56],[1,0],'rdc-30',mainLower.at,mainLower.normal);
 link('sw-amphi-lower','rdc-27',[520,456],[1,0],'rdc-34',[40,104],[-1,0]);
 const locations={
  'rdc-27':{'sw-amphi-northwest':[40,32,0,-1],'sw-amphi-upper':[596.96,72,1,0],'sw-amphi-lower':[596.96,499,1,0]},
  'rdc-28':{'sw-control-north':[91,32,0,-1]},
  'rdc-33':{'sw-amphi-upper':[32,92,-1,0],'sw-control-north':[91,209.472,0,1],'sw-upper-main':[155.072,140,1,0]},
  'rdc-34':{'sw-amphi-lower':[32,214,-1,0],'sw-lower-main':[155.072,95,1,0]}
 };
 for(const [id,entries] of Object.entries(locations))for(const door of byId.get(id).doors){
  const [x,y,nx,ny]=entries[door.id];door.wallAt=[x,y];door.normal=[nx,ny];door.at=[x-nx*9,y-ny*9];
 }

}
