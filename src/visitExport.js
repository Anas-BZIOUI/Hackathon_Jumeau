import {roomName} from './core.js';

// Plain text keeps exports usable offline and avoids interpreting room data as HTML.
export function visitReport({rooms,ids,title,lang='fr'}){
 const fr=lang==='fr';
 return [title,'EnsiiExplore',fr?'Informations issues du projet ; vérifier les accès et usages sur place.':'Project records; verify access and uses on site.','',...ids.map((id,i)=>{
  const room=rooms.find(r=>r.id===id);
  return room?`${i+1}. ${roomName(room,lang)} — ${room.level} (${room.id})\n${room['description_'+lang]||room.description_fr||room.description_en||''}\n${room.demo_data?(fr?'DÉMO : données fictives':'DEMO: fictional data'):(room.verified_on_site?(fr?'Fiche marquée vérifiée':'Record marked verified'):(fr?'À vérifier sur place':'Needs on-site verification'))}`:null;
 }).filter(Boolean)].join('\n\n');
}

export function downloadVisit(options){
 const blob=new Blob([visitReport(options)],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='ensiiexplore-visite.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
