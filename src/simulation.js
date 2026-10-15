export function simulatedPosition(route,fraction){
 const segments=[];let length=0;
 for(const leg of route?.legs||[]){if(leg.kind!=='walk')continue;for(let i=1;i<leg.points.length;i++){const a=leg.points[i-1],b=leg.points[i],size=Math.hypot(b[0]-a[0],b[1]-a[1]);segments.push({a,b,size,level:leg.level});length+=size;}}
 if(!segments.length)return null;
 let left=Math.max(0,Math.min(1,fraction))*length;
 for(const segment of segments){if(left<=segment.size){const t=segment.size?left/segment.size:0;return {floor:segment.level,x:segment.a[0]+(segment.b[0]-segment.a[0])*t,y:segment.a[1]+(segment.b[1]-segment.a[1])*t};}left-=segment.size;}
 const last=segments.at(-1);return {floor:last.level,x:last.b[0],y:last.b[1]};
}
