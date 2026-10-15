// Decorations mapped to the user's green / red / yellow annotations, in game pixels.
export function decorateReception(map){
 const hall=map.rooms.find(r=>r.name==='Grand espace · RDC');if(!hall)throw Error('Reception hall not found');
 const sprite=(id,asset,draw,bounds,extra={})=>({id,kind:'decoration',asset,draw,bounds,solid:!!bounds,...extra});
 const green=[
  sprite('green-board','noticeboard',[1400,704,112,72],[1405,764,102,12],{zone:'green',facing:'south'}),
  sprite('green-plant-left','plant',[1352,726,36,56],[1362,770,16,12],{zone:'green'}),
  sprite('green-plant-right','plant',[1506,726,30,52],[1512,766,18,12],{zone:'green'}),
  sprite('green-bin','bin',[1474,788,20,24],[1477,800,14,12],{zone:'green'})
 ];
 const red=[0,1,2].map(i=>sprite('waiting-bench-'+i,'bench-back',[1096+i*44,1042,44,44],[1098+i*44,1067,40,19],{zone:'red',facing:'north'}));
 const yellow=[
  {id:'reception-counter-top',kind:'counter',draw:[1360,1112,96,26],bounds:[1360,1112,96,26],solid:true,zone:'yellow',facing:'south'},
  {id:'reception-counter-arm',kind:'counter',draw:[1360,1138,26,66],bounds:[1360,1138,26,66],solid:true,zone:'yellow',facing:'east'},
  sprite('reception-computer','computer',[1410,1098,26,26],null,{zone:'yellow',depth:1140,facing:'south'}),
  sprite('reception-stationery','stationery',[1378,1102,24,24],null,{zone:'yellow',depth:1141}),
  sprite('reception-chair','chair',[1408,1142,32,32],[1413,1165,22,12],{zone:'yellow',facing:'north'}),
  sprite('reception-bin','bin',[1462,1180,20,24],[1465,1191,14,12],{zone:'yellow'}),
  sprite('reception-amelia','amelia',[1410,1106,32,64],[1418,1154,16,16],{zone:'yellow',kind:'npc',frame:3,depth:1175,label:'Accueil',facing:'south'})
 ];
 hall.fixtures.push(...green,...red,...yellow);
 map.audit.decorations={source:'Tiled_Photos and persons/Amelia_idle_16x16.png',zones:{green:green.map(f=>f.id),red:red.map(f=>f.id),yellow:yellow.map(f=>f.id)},counterOpening:{side:'east',gapPixels:44},seatingDirection:'north, toward elevator'};
 return map;
}
