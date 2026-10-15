// Fixture positions reference plan_RDC: stair flights at either side of the central hall.
export const ELEVATOR_DOOR='door-87b3e595-2d76-41c6-81dc-ee05621b63d7';
export function applyFixtures(map){
 const main=map.rooms.find(r=>r.doors.some(d=>d.id===ELEVATOR_DOOR)&&r.area>100);
 if(!main)throw Error('Cannot locate main hall / elevator');
 const entrance=main.doors.find(d=>d.id===ELEVATOR_DOOR),cabin=map.rooms.find(r=>r.id===entrance.target);
 main.name='Grand espace · RDC';cabin.name='Ascenseur · RDC';cabin.kind='elevator';
 for(const room of map.rooms){
  room.fixtures=[];
  for(const d of room.doors){
   if(d.id===ELEVATOR_DOOR){d.kind='elevator';d.style='elevator';continue;}
   const other=map.rooms.find(r=>r.id===d.target),names=room.name+' '+(other?.name||'');
   const hash=[...d.id].reduce((n,c)=>n+c.charCodeAt(0),0);
   d.style=/Foyer/.test(names)?'sliding':/SSI|ménage|vélo|logistique|Régie/.test(names)?'solid':['window','solid','sliding'][hash%3];
  }
 }
 main.fixtures=[
  {id:'stairs-left',kind:'stairs',label:'Escalier gauche',bounds:[21.65*40,(35-19.2)*40,5.2*40,1.35*40],direction:-1,destination:'R+1',available:false},
  {id:'stairs-right',kind:'stairs',label:'Escalier droit',bounds:[35.5*40,(35-19.2)*40,5.2*40,1.35*40],direction:1,destination:'R+1',available:false}
 ];
 cabin.fixtures=[{id:'elevator-controls',kind:'elevator-panel',bounds:[Math.min(...cabin.outline.map(p=>p[0]))+5,Math.min(...cabin.outline.map(p=>p[1]))+4,18,14],destination:'R+1',available:false}];
 map.audit.fixtures={stairs:main.fixtures.map(s=>({id:s.id,bounds:s.bounds,source:'plan_RDC stair flights; game collision footprint'})),elevator:{doorId:ELEVATOR_DOOR,roomId:cabin.id}};
 return map;
}
