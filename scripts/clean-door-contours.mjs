// Remove a door-swing detour only between collinear wall runs near DXF door symbols.
// Real corners (non-collinear wall runs) are deliberately retained.
export function cleanDoorContours(polygon,symbols){
 let ring=polygon.slice(0,-1).map(p=>[...p]),removed=0;
 for(let pass=0;pass<80;pass++){
  let changed=false;
  for(let start=0;start<ring.length&&!changed;start++){
   const r=[...ring.slice(start),...ring.slice(0,start)],a=r[0],b=r[1];
   const vertical=Math.abs(a[0]-b[0])<.025,horizontal=Math.abs(a[1]-b[1])<.025;
   if((!vertical&&!horizontal)||Math.hypot(a[0]-b[0],a[1]-b[1])<.65)continue;
   const axis=vertical?1:0,fixed=1-axis,sign=Math.sign(b[axis]-a[axis]);
   for(let j=3;j<Math.min(r.length-1,65);j++){
    const c=r[j],d=r[j+1],span=(c[axis]-b[axis])*sign;
    if(span<.15||span>3.8||Math.abs(c[fixed]-b[fixed])>.06||Math.abs(d[fixed]-b[fixed])>.06||(d[axis]-c[axis])*sign<.65)continue;
    const detour=r.slice(2,j);
    if(!detour.length||detour.some(p=>Math.abs(p[fixed]-b[fixed])>1.6))continue;
    if(!detour.every(p=>symbols.some(s=>Math.hypot(p[0]-s.hinge[0],p[1]-s.hinge[1])<s.width+.35)))continue;
    ring=[a,...r.slice(j+1)];removed+=j;changed=true;break;
   }
  }
  if(!changed)break;
 }
 return {polygon:[...ring,ring[0]],removed};
}

// Game walls follow the sustained straight runs. Short curved sweep samples and
// door leaves never become wall segments; adjacent runs meet at their intersection.
export function straightGameWalls(polygon,symbols){
 const ring=polygon.slice(0,-1),walls=[];
 for(let i=0;i<ring.length;i++){
  const a=ring[i],b=ring[(i+1)%ring.length],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
  const axis=Math.abs(dx)<.03||Math.abs(dy)<.03;
  const midpoint=[(a[0]+b[0])/2,(a[1]+b[1])/2];
  const leaf=length<1.3&&symbols.some(s=>Math.hypot(midpoint[0]-s.hinge[0],midpoint[1]-s.hinge[1])<s.width+.12);
  if(length<.55||leaf||(!axis&&length<1.8))continue;
  const wall={a,b,dx,dy,length};
  const last=walls.at(-1);
  if(last&&Math.abs(last.dx*dy-last.dy*dx)/(last.length*length)<.02&&last.dx*dx+last.dy*dy>0&&Math.abs(last.dx*(a[1]-last.a[1])-last.dy*(a[0]-last.a[0]))/last.length<.2){last.b=b;last.dx=b[0]-last.a[0];last.dy=b[1]-last.a[1];last.length=Math.hypot(last.dx,last.dy);}
  else walls.push(wall);
 }
 if(walls.length<3)return polygon;
 const result=[];
 for(let i=0;i<walls.length;i++){
  const prev=walls[(i+walls.length-1)%walls.length],next=walls[i];
  const cross=prev.dx*next.dy-prev.dy*next.dx;
  if(Math.abs(cross)>1e-6){
   const t=((next.a[0]-prev.a[0])*next.dy-(next.a[1]-prev.a[1])*next.dx)/cross;
   const p=[prev.a[0]+t*prev.dx,prev.a[1]+t*prev.dy];
   if(Math.hypot(p[0]-prev.b[0],p[1]-prev.b[1])<5&&Math.hypot(p[0]-next.a[0],p[1]-next.a[1])<5){result.push(p);continue;}
  }
  // Parallel displaced runs represent a real structural step, not a curved door.
  result.push(prev.b);
  if(Math.hypot(prev.b[0]-next.a[0],prev.b[1]-next.a[1])>.03){
   if(Math.abs(prev.dx)>Math.abs(prev.dy))result.push([next.a[0],prev.b[1]]);
   else result.push([prev.b[0],next.a[1]]);
   result.push(next.a);
  }
 }
 const unique=result.filter((p,i)=>!i||Math.hypot(p[0]-result[i-1][0],p[1]-result[i-1][1])>.02);
 return [...unique,unique[0]];
}
