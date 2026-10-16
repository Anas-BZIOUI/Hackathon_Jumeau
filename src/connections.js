const ORDER=['RDC','R+1','R+2'];
export function connectionAccess(links,id,position){
 const link=links.find(l=>l.id===id)||null;
 const points=(link?.points||[]).slice().sort((a,b)=>ORDER.indexOf(a.level)-ORDER.indexOf(b.level));
 const current=position&&points.find(p=>p.level===position.floor);
 const distance=current?Math.hypot(position.x-current.x,position.y-current.y):null;
 return {link,points,current,distance,near:distance!==null&&distance<=4};
}
export function connectionOfType(links,type,floor){
 return links.find(l=>l.type===type&&l.points.some(p=>p.level===floor))||links.find(l=>l.type===type)||null;
}

export function liftVisitState(journey,from,now){
 if(!journey?.lift)return null;
 return {linkId:journey.linkId,from,to:journey.to,progress:Math.max(0,Math.min(1,(now-journey.started)/2800)),path:journey.path.map(p=>[p.x,p.y,p.z])};
}
export function validLiftVisit(saved,links){
 if(!saved||!Number.isFinite(saved.progress)||saved.progress<0||saved.progress>=1||saved.from===saved.to)return null;
 const link=links.find(l=>l.id===saved.linkId&&l.type==='lift');
 if(!link||![saved.from,saved.to].every(level=>link.points.some(p=>p.level===level)))return null;
 if(!Array.isArray(saved.path)||saved.path.length<2||saved.path.length>6||!saved.path.every(p=>Array.isArray(p)&&p.length===3&&p.every(v=>Number.isFinite(v)&&Math.abs(v)<5000)))return null;
 return saved;
}
