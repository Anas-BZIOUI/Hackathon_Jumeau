import {roomName} from './core.js';
import {STRINGS,TYPE_LABEL} from './i18n.js';
const PREFERRED={teaching:['RDC-Amphi002','R+1-101','R+1-121'],research:['R+1-127','R+1-131','R+1-130'],student_life:['RDC-028','RDC-013','RDC-015'],companies:['R+2-216','R+2-C3','R+2-C45']};

// Explain recorded classifications without inventing activities or verified services.
export function buildActivityTours(rooms){
 return Object.entries(PREFERRED).map(([activity,preferred])=>{
  const candidates=rooms.filter(r=>r.activities?.includes(activity)&&r.type!=='circulation');
  const rank=r=>preferred.includes(r.id)?preferred.indexOf(r.id):100+(r.verified_on_site?0:10);
  candidates.sort((a,b)=>rank(a)-rank(b)||a.id.localeCompare(b.id));
  const steps=candidates.slice(0,3).map(room=>({roomId:room.id,activity,
   text_fr:`${roomName(room,'fr')} · ${room.level}. Fonction indiquée : ${TYPE_LABEL.fr[room.type]||room.type}. Ce lieu est associé à « ${STRINGS.fr[activity]} » dans les données du projet.`,
   text_en:`${roomName(room,'en')} · ${room.level}. Recorded function: ${TYPE_LABEL.en[room.type]||room.type}. This place is associated with “${STRINGS.en[activity]}” in the project data.`
  }));
  return {id:`activity-${activity}`,activity,title_fr:`Découvrir : ${STRINGS.fr[activity]}`,title_en:`Discover: ${STRINGS.en[activity]}`,objective_fr:`Comprendre le lien entre les lieux et ${STRINGS.fr[activity].toLocaleLowerCase('fr')}.`,objective_en:`Understand how places connect to ${STRINGS.en[activity].toLowerCase()}.`,steps};
 }).filter(t=>t.steps.length);
}
