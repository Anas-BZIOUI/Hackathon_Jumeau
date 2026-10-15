// Remove only the portion of each wall stroke that crosses an oriented opening.
export function cutOpenings(segments,openings){
 let result=segments;
 for(const gate of openings){
  const dx=gate.b[0]-gate.a[0],dy=gate.b[1]-gate.a[1],length=Math.hypot(dx,dy);if(length<.01)continue;
  const ux=dx/length,uy=dy/length,half=gate.width/2;
  const local=p=>[(p[0]-gate.a[0])*ux+(p[1]-gate.a[1])*uy,-(p[0]-gate.a[0])*uy+(p[1]-gate.a[1])*ux];
  result=result.flatMap(([a,b,...meta])=>{
   const p=local(a),q=local(b),delta=[q[0]-p[0],q[1]-p[1]];let lo=0,hi=1;
   for(const [axis,min,max]of[[0,-.08,length+.08],[1,-half,half]]){
    if(Math.abs(delta[axis])<1e-9){if(p[axis]<min||p[axis]>max)return [[a,b,...meta]];}
    else{let t0=(min-p[axis])/delta[axis],t1=(max-p[axis])/delta[axis];if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>=hi)return [[a,b,...meta]];}
   }
   const at=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],out=[];
   if(lo>0&&Math.hypot(...at(lo).map((v,i)=>v-a[i]))>.05)out.push([a,at(lo),...meta]);
   if(hi<1&&Math.hypot(...at(hi).map((v,i)=>v-b[i]))>.05)out.push([at(hi),b,...meta]);return out;
  });
 }return result;
}
export function roomAt(point,rooms){
 for(const room of rooms){if(room.geometry_source!=='architect-svg')continue;const ring=room.polygon;let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}
  if(inside)return room;
 }return null;
}
