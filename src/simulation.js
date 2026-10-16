export function simulatedPosition(route,fraction){
 const segments=[];let length=0;
 for(const leg of route?.legs||[]){if(leg.kind!=='walk')continue;for(let i=1;i<leg.points.length;i++){const a=leg.points[i-1],b=leg.points[i],size=Math.hypot(b[0]-a[0],b[1]-a[1]);segments.push({a,b,size,level:leg.level});length+=size;}}
 if(!segments.length)return null;
 let left=Math.max(0,Math.min(1,fraction))*length;
 for(const segment of segments){if(left<=segment.size){const t=segment.size?left/segment.size:0;return {floor:segment.level,x:segment.a[0]+(segment.b[0]-segment.a[0])*t,y:segment.a[1]+(segment.b[1]-segment.a[1])*t};}left-=segment.size;}
 const last=segments.at(-1);return {floor:last.level,x:last.b[0],y:last.b[1]};
}
export const DAY_PHASES=[
 {start:8,end:9,fr:'Arrivées et orientation',en:'Arrivals and orientation'},
 {start:9,end:12,fr:'Cours et travail encadré',en:'Classes and supervised work'},
 {start:12,end:14,fr:'Pause et vie étudiante',en:'Break and student life'},
 {start:14,end:17,fr:'Projets et échanges',en:'Projects and discussions'},
 {start:17,end:18,fr:'Fin de journée',en:'End of day'}
];
export function daySnapshot(routes,time){
 const hour=Number.isFinite(time)?Math.max(8,Math.min(18,time)):8;
 const phase=DAY_PHASES.find(p=>hour>=p.start&&hour<p.end)||DAY_PHASES.at(-1);
 const agents=routes.flatMap((route,i)=>Array.from({length:4},(_,j)=>{
  const cycle=((hour-8)*.55+i*.19+j*.13)%2;
  return {id:`${i}-${j}`,group:i,position:simulatedPosition(route,cycle<=1?cycle:2-cycle)};
 })).filter(agent=>agent.position);
 return {hour,phase,agents};
}
export function simulationClock(hour){
 const minutes=Math.round(Math.max(8,Math.min(18,hour))*60);
 return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
}
