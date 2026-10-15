export function segmentDistance(x,y,a,b) {
  const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;
  const t=length?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/length)):0;
  return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
export function collisionMap(segments,size,radius=.23,forbidden=()=>false) {
  const cells=new Map(), cellSize=2;
  for(const segment of segments) {
    const [a,b]=segment;
    const padding=radius+Math.max(0,(segment[2]?.thickness||.1)-.1)/2;
    for(let x=Math.floor((Math.min(a[0],b[0])-padding)/cellSize);x<=Math.floor((Math.max(a[0],b[0])+padding)/cellSize);x++)
      for(let y=Math.floor((Math.min(a[1],b[1])-padding)/cellSize);y<=Math.floor((Math.max(a[1],b[1])+padding)/cellSize);y++) {
        const key=`${x},${y}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(segment);
      }
  }
  const clear=(x,y)=>x>=radius&&y>=radius&&x<=size[0]-radius&&y<=size[1]-radius&&!forbidden(x,y)&&(cells.get(`${Math.floor(x/cellSize)},${Math.floor(y/cellSize)}`)||[]).every(([a,b,settings])=>segmentDistance(x,y,a,b)>radius+Math.max(0,(settings?.thickness||.1)-.1)/2);
  const lineClear=(a,b)=>{
    const count=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.12));
    for(let i=0;i<=count;i++)if(!clear(a[0]+(b[0]-a[0])*i/count,a[1]+(b[1]-a[1])*i/count))return false;
    return true;
  };
  return {clear,lineClear,size};
}
export function safePosition(map,p) {
  if(map.clear(...p))return p;
  for(let r=.25;r<=5;r+=.25)for(let i=0;i<32;i++) {
    const q=[p[0]+Math.cos(i*Math.PI/16)*r,p[1]+Math.sin(i*Math.PI/16)*r];if(map.clear(...q))return q;
  }
  return null;
}
const gridCaches=new WeakMap();
export function walkingPath(map,start,end) {
  if(!map.clear(...end))return null;
  if(map.lineClear(start,end))return [end];
  const step=.35, width=Math.ceil(map.size[0]/step)+1;
  const grid=p=>p.map(v=>Math.round(v/step)),world=p=>p.map(v=>v*step),key=p=>p[1]*width+p[0];
  let cache=gridCaches.get(map);if(!cache){cache={clear:new Map(),edges:new Map(),components:new Map(),nextComponent:1};gridCaches.set(map,cache);}
  const valid=p=>{const id=key(p);if(!cache.clear.has(id))cache.clear.set(id,map.clear(...world(p)));return cache.clear.get(id);};
  const edge=(a,b)=>{if(!valid(b))return false;const ka=key(a),kb=key(b),id=ka<kb?`${ka}:${kb}`:`${kb}:${ka}`;if(!cache.edges.has(id))cache.edges.set(id,map.lineClear(world(a),world(b)));return cache.edges.get(id);};
  function attach(p){const origin=grid(p),candidates=[];for(let x=-2;x<=2;x++)for(let y=-2;y<=2;y++){const q=[origin[0]+x,origin[1]+y];if(q[0]<0||q[1]<0||q[0]>=width||q[1]>Math.ceil(map.size[1]/step))continue;if(valid(q)&&map.lineClear(p,world(q)))candidates.push(q);}return candidates.sort((a,b)=>Math.hypot(...world(a).map((v,i)=>v-p[i]))-Math.hypot(...world(b).map((v,i)=>v-p[i])))[0];}
  const s=attach(start),g=attach(end);if(!s||!g)return null;
  const sk=key(s),gk=key(g);
  const sc=cache.components.get(sk),gc=cache.components.get(gk);
  if((sc&&sc!==gc)||(gc&&gc!==sc))return null;
  const distances=new Map([[sk,0]]), parents=new Map(),positions=new Map([[sk,s]]),heap=[];
  function push(value){heap.push(value);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<=value.f)break;heap[i]=heap[p];i=p;}heap[i]=value;}
  function pop(){const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c;}heap[i]=last;}return first;}
  if(!map.clear(...world(s))||!map.clear(...world(g))||!map.lineClear(start,world(s))||!map.lineClear(world(g),end))return null;
  push({id:sk,p:s,cost:0,f:0});
  let count=0;
  while(heap.length&&count++<200000){
    const current=pop();if(current.cost!==distances.get(current.id))continue;
    if(current.id===gk){const path=[end];let k=gk;while(k!==sk){path.push(world(positions.get(k)));k=parents.get(k);}path.push(world(s));const ordered=[start,...path.reverse()],smooth=[ordered[0]];let i=0;
      while(i<ordered.length-1){let next=i+1;for(let j=ordered.length-1;j>i+1;j--)if(map.lineClear(ordered[i],ordered[j])){next=j;break;}smooth.push(ordered[next]);i=next;}return smooth;}
    for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const p=[current.p[0]+dx,current.p[1]+dy],id=key(p);if(p[0]<0||p[1]<0||p[0]>=width||p[1]>Math.ceil(map.size[1]/step)||!edge(current.p,p))continue;
      const cost=current.cost+Math.hypot(dx,dy);if(cost>=(distances.get(id)??Infinity))continue;
      distances.set(id,cost);parents.set(id,current.id);positions.set(id,p);push({id,p,cost,f:cost+Math.hypot(g[0]-p[0],g[1]-p[1])});
    }
  }
  if(!heap.length){const component=cache.nextComponent++;for(const id of positions.keys())cache.components.set(id,component);}
  return null;
}
