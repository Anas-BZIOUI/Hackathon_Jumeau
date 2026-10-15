export const DIRECTIONS = { left: 2, up: 1, right: 0, down: 3 };
export function inPolygon(x,y,ring) {
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
    const [a,b]=ring[i], [c,d]=ring[j];
    if((b>y)!==(d>y) && x<(c-a)*(y-b)/(d-b)+a)inside=!inside;
  }
  return inside;
}
export function fitsRoom(position,room) {
  return [[-.12,-.12],[.12,-.12],[.12,.12],[-.12,.12]].every(([dx,dy])=>inPolygon(position.x+dx,position.y+dy,room.polygon));
}
export function walk(position,dx,dy,room) {
  const result={...position};
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/.06));
  for(let i=0;i<steps;i++) {
    if(fitsRoom({x:result.x+dx/steps,y:result.y},room))result.x+=dx/steps;
    if(fitsRoom({x:result.x,y:result.y+dy/steps},room))result.y+=dy/steps;
  }
  return result;
}
export function roomDoors(layout,roomId) {
  return layout.doors.filter(d=>d.rooms.includes(roomId)).map(d=>{
    const side=d.rooms.indexOf(roomId);
    return {...d,entry:d.entries[side],target:d.rooms[1-side],arrival:d.entries[1-side]};
  });
}
export function closestDoor(doors,player) {
  return doors.map(d=>({...d,distance:Math.hypot(d.entry[0]-player.x,d.entry[1]-player.y)})).filter(d=>d.distance<1.1).sort((a,b)=>a.distance-b.distance)[0] || null;
}
