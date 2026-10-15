export function roomIssues(room,diagnostic){
 const issues=[];
 if(!room.name_fr||!room.name_en)issues.push('translation');
 if(!room.description_fr||!room.description_en)issues.push('description');
 if(!room.verified_on_site)issues.push('verification');
 if(room.accessible==null)issues.push('accessibility');
 if(room.capacity==null&&room.type==='classroom')issues.push('capacity');
 if(diagnostic?.reachable===false)issues.push('disconnected');
 return issues;
}
export function csv(rows){return '\uFEFF'+rows.map(row=>row.map(value=>'"'+String(value??'').replaceAll('"','""')+'"').join(',')).join('\r\n');}
export function download(name,content,type='text/plain'){
 const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
