import {compileRoom,canOccupy} from '../src/game/authored-world.js';
export function decorateCampus(map){
 const hall=map.rooms.find(r=>r.id==='drawn-rdc-2'),foyer=map.rooms.find(r=>r.id==='drawn-rdc-8'),library=map.rooms.find(r=>r.id==='drawn-rdc-9'),office=map.rooms.find(r=>r.id==='drawn-rdc-33');
 library.name='030 · Bibliothèque';
 // Keep source geometry intact. A proposed footprint must leave arrivals and the spawn clear.
 function add(room,id,asset,draw,extra={}){
  const [x,y,w,h]=draw,bounds=extra.bounds||[x+3,y+h-12,Math.max(8,w-6),12];
  const f={id,kind:'decoration',asset,draw,bounds,solid:!extra.seated,...extra};
  const compiled=compileRoom(extra.seated||id.endsWith('-arm')?{...room,fixtures:room.fixtures.filter(f=>f.art!==(extra.seated?'couch':extra.art))}:room);
  if(![[bounds[0],bounds[1]],[bounds[0]+bounds[2],bounds[1]+bounds[3]]].every(([x,y])=>canOccupy(compiled,{x,y})))return;
  if([room.spawn,...room.doors.map(d=>d.at)].some(([px,py])=>px>bounds[0]-12&&px<bounds[0]+bounds[2]+12&&py>bounds[1]-12&&py<bounds[1]+bounds[3]+12))return;
  room.fixtures.push(f);return f;
 }
 function npc(room,id,label,x,y,asset='alex',knows=false,seated=false){return add(room,id,asset,[x-16,y-56,32,64],{kind:'npc',label,frame:0,knows,seated,...(seated?{depth:1042}:{}),bounds:[x-8,y-4,16,12]});}
 hall.fixtures=hall.fixtures.filter(f=>f.id!=='green-board');
 add(hall,'class-board-1','chalkboard',[1380,684,64,64],{zone:'green'});
 add(hall,'class-board-2','chalkboard',[1448,684,64,64],{zone:'green'});
 add(hall,'class-table','desk',[1390,790,100,44]);
 add(hall,'vending-drinks',null,[1390,496,42,76],{art:'vending',label:'Boissons'});
 add(hall,'vending-snacks',null,[1440,496,42,76],{art:'vending',label:'En-cas'});
 // Positions follow the supplied plan: bar north, buffet southwest, lounge southeast.
 add(foyer,'foyer-bar-long',null,[1680,805,410,30],{art:'bar',bounds:[1680,805,410,30]});
 add(foyer,'foyer-bar-arm',null,[2060,780,30,25],{art:'bar',bounds:[2060,780,30,25]});
 add(foyer,'buffet',null,[1600,1020,100,34],{art:'buffet'});
 for(const [i,x]of [1690,1815,1950].entries()){
  add(foyer,'round-table-'+i,'round-table',[x,900,45,40]);
  add(foyer,'table-chair-'+i,'chair',[x+10,944,26,26]);
  add(foyer,'table-chair-side-'+i,'chair',[x-28,906,24,24]);
 }
 add(foyer,'couch-long',null,[1830,1010,220,30],{art:'couch'});
 add(foyer,'couch-arm',null,[2020,970,30,40],{art:'couch'});
 add(foyer,'game-table-1',null,[2100,855,55,40],{art:'games'});
 add(foyer,'game-table-2',null,[2100,970,55,40],{art:'games'});
 npc(foyer,'bartender','Karim, le barman',1930,785,'bob',true);
 npc(foyer,'student-lina','Lina',1750,975,'amelia',true);
 npc(foyer,'student-alex','Alex',1610,930,'alex');
 npc(foyer,'student-adam','Adam',1860,1020,'seated',false,true);
 npc(foyer,'student-bob','Mehdi',1940,1020,'seated-bob',true,true);
 npc(foyer,'student-sarah','Sarah',2050,925,'amelia',true);
 npc(foyer,'student-jules','Jules',1770,865,'adam');
 add(library,'shelf-1','bookshelf',[2045,606,48,58]);
 add(library,'shelf-2','bookshelf',[2100,612,38,52]);
 add(library,'library-table','desk',[2080,680,44,32]);
 library.fixtures.push({id:'library-open-book',kind:'decoration',asset:'book',draw:[2088,680,16,16],solid:false,bounds:null,depth:713});
 add(library,'library-chair','chair',[2090,714,24,24]);
 add(library,'library-bin','bin',[2150,635,18,24]);
 add(library,'library-chair-2','chair',[2165,660,18,24]);
 npc(library,'oussama','Oussama',2160,710,'bob');
 office.name='012 · Bureau de la vie étudiante';
 add(office,'office-desk','desk',[1070,382,44,34]);
 office.fixtures.push({id:'office-computer',kind:'decoration',asset:'computer',draw:[1079,370,24,24],bounds:null,solid:false,depth:417});
 add(office,'office-closet','closet',[1140,325,30,56]);
 add(office,'office-chair','chair',[1088,444,26,26]);
 add(office,'office-plant','plant',[1140,460,28,44]);
 office.fixtures.push({id:'office-painting',kind:'decoration',art:'painting',draw:[1070,280,42,28],solid:false,bounds:null});
 npc(office,'office-nadia','Nadia',1150,450,'amelia');
 for(const room of map.rooms){
  room.floor=room===hall||/Circulation|entrée|Ascenseur/.test(room.name)?'gray':/ménage|Vestiaires|SSI|vélo/.test(room.name)?'white':'wood';
  if(room.kind==='elevator'||room===library)continue;
  const xs=room.outline.map(p=>p[0]),ys=room.outline.map(p=>p[1]);
  outer:for(let y=Math.min(...ys)+45;y<Math.max(...ys)-20;y+=32)for(let x=Math.min(...xs)+20;x<Math.max(...xs)-20;x+=32){
   if(add(room,room.id+'-bin','bin',[x,y,18,24]))break outer;
  }
  if(room===foyer||room===library)for(const [i,[x,y]]of [[1570,840],[2160,1030],[2170,650]].entries())add(room,room.id+'-plant-'+i,'plant',[x,y,28,44]);
 }
 map.audit.campus={foyer:foyer.id,library:library.id,office:office.id,quests:['paper-oussama','party-attendance'],language:'fr'};
 return map;
}
