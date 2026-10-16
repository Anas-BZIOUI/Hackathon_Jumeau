import {roomName} from './core.js';

export function nearbyLandmarks(rooms,position,lang='fr'){
 if(!position||![position.x,position.y].every(Number.isFinite))return [];
 return rooms.filter(r=>r.level===position.floor&&r.type!=='circulation'&&r.centroid?.length===2)
  .map(room=>({room,name:roomName(room,lang),distance:Math.hypot(room.centroid[0]-position.x,room.centroid[1]-position.y)}))
  .sort((a,b)=>a.distance-b.distance||a.room.id.localeCompare(b.room.id)).slice(0,3);
}
