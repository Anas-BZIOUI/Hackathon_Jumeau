function inside(p,ring){let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
function circle(a,b,c){const d=2*(a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]));if(Math.abs(d)<.001)return null;const u=a[0]**2+a[1]**2,v=b[0]**2+b[1]**2,w=c[0]**2+c[1]**2;const p=[(u*(b[1]-c[1])+v*(c[1]-a[1])+w*(a[1]-b[1]))/d,(u*(c[0]-b[0])+v*(a[0]-c[0])+w*(b[0]-a[0]))/d];return {center:p,radius:Math.hypot(a[0]-p[0],a[1]-p[1])};}
export function extractDoors(svg,height,rooms,symbols=null){
 const group=svg.match(/<g id="murs"[^>]*>([\s\S]*?)<\/g>/)?.[1]||'',arcs=[];
 for(const path of group.matchAll(/<path[^>]*\sd="([^"]+)"/g)){
  let points=[];const finish=()=>{if(points.length<4||points.length>60)return;
   for(let start=0;start<=points.length-4;start++)for(let end=start+4;end<=Math.min(points.length,start+14);end++){
    const part=points.slice(start,end),c=circle(part[0],part[Math.floor(part.length/2)],part.at(-1));if(!c||c.radius<.68||c.radius>1.5)continue;
    const residual=Math.max(...part.map(p=>Math.abs(Math.hypot(p[0]-c.center[0],p[1]-c.center[1])-c.radius)));
    const sweep=part.slice(1).reduce((s,p,i)=>s+Math.hypot(p[0]-part[i][0],p[1]-part[i][1]),0)/c.radius;
    if(residual<.025&&sweep>1.45&&sweep<1.7&&!arcs.some(a=>Math.hypot(a.center[0]-c.center[0],a.center[1]-c.center[1])<.12))arcs.push({...c,ends:[part[0],part.at(-1)]});
   }};
  for(const token of path[1].matchAll(/([ML])\s*(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/g)){if(token[1]==='M'){finish();points=[];}points.push([+token[2],height-Number(token[3])]);}finish();
 }
 const doors=[];
 for(const arc of [...arcs,...(symbols||[])]){
  let best=null;
  for(const end of arc.ends){const dx=(end[0]-arc.center[0])/arc.radius,dy=(end[1]-arc.center[1])/arc.radius,mid=[(end[0]+arc.center[0])/2,(end[1]+arc.center[1])/2];
   for(const room of rooms.filter(r=>r.geometry_source==='architect-svg'&&r.type!=='circulation')){
    if(Math.hypot(room.centroid[0]-mid[0],room.centroid[1]-mid[1])>25)continue;
    const left=[mid[0]-dy*.65,mid[1]+dx*.65],right=[mid[0]+dy*.65,mid[1]-dx*.65];
    const li=inside(left,room.polygon),ri=inside(right,room.polygon);if(li===ri)continue;
    const distance=Math.hypot(room.centroid[0]-mid[0],room.centroid[1]-mid[1]);
    if(!best||distance<best.score)best={score:distance,roomId:room.id,hinge:arc.center,end,width:arc.radius,center:mid,normal:li?[-dy,dx]:[dy,-dx],source:'architect-door-swing'};
   }
  }
  if(best&&!doors.some(d=>Math.hypot(d.center[0]-best.center[0],d.center[1]-best.center[1])<.35)){delete best.score;doors.push(best);}
 }
 return doors;
}
