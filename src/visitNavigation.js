// Use the calibrated scene links for immersive floor-to-floor guidance.
export function floorLeg(links,from,to,stepFree=false){
 if(from===to)return null;
 const queue=[{level:from,first:null}],seen=new Set([from]);
 while(queue.length){const current=queue.shift();
  for(const link of links){if(stepFree&&link.type!=='lift')continue;if(!link.points.some(p=>p.level===current.level))continue;
   for(const p of link.points){if(seen.has(p.level))continue;
    if(link.type==='stairs'&&Math.abs(['RDC','R+1','R+2'].indexOf(p.level)-['RDC','R+1','R+2'].indexOf(current.level))!==1)continue;
    const first=current.first||{link,to:p.level};if(p.level===to)return first;
    seen.add(p.level);queue.push({level:p.level,first});
   }
  }
 }
 return null;
}
