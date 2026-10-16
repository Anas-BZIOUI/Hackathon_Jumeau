export const GUIDES=[
 {id:'orientation',roomId:'RDC-035',fr:'Guide virtuel · Orientation',en:'Virtual guide · Orientation',intro_fr:'Je suis un guide fictif de l’application. Les numéros et étages du plan permettent de préparer une visite ; je ne mesure pas votre position réelle.',intro_en:'I am a fictional app guide. Plan numbers and floors help prepare a visit; I do not measure your real position.',choices:[
  {id:'wayfinding',fr:'Comment me repérer ?',en:'How can I find my way?',answer_fr:'Choisissez une salle sur le plan, puis un départ et une destination. Le personnage représente un déplacement virtuel distinct de votre départ déclaré.',answer_en:'Choose a room on the plan, then a start and destination. The character represents virtual movement separate from your declared start.'},
  {id:'services',fr:'Quels services chercher ?',en:'Which services can I look for?',answer_fr:'La reprographie RDC-011 et le local vélo RDC-035 sont indiqués dans les données du plan. Leurs usages actuels et conditions d’accès restent à vérifier.',answer_en:'Reprography RDC-011 and bike room RDC-035 appear in plan records. Their current uses and access conditions still need verification.'}]},
 {id:'learning',roomId:'RDC-Amphi002',fr:'Guide virtuel · Enseignement',en:'Virtual guide · Teaching',intro_fr:'Ce guide virtuel présente les lieux liés à l’enseignement dans le projet.',intro_en:'This virtual guide introduces places associated with teaching in the project.',choices:[
  {id:'activity',fr:'Que représente cet amphithéâtre ?',en:'What does this lecture hall represent?',answer_fr:'L’amphithéâtre Cabanes illustre les espaces d’enseignement. Les fiches distinguent les données du plan des informations à confirmer ; aucun cours en direct n’est affiché.',answer_en:'The Cabanes lecture hall illustrates teaching spaces. Room records distinguish plan data from information needing confirmation; no live class schedule is shown.'},
  {id:'visit',fr:'Comment préparer ma visite ?',en:'How can I prepare my visit?',answer_fr:'Consultez la fiche, vérifiez l’étage et lancez un itinéraire. Les distances du modèle et l’accessibilité ne sont pas des mesures terrain certifiées.',answer_en:'Read the room record, check its floor and request a route. Model distances and accessibility are not certified on-site measurements.'}]},
 {id:'life',roomId:'RDC-028',fr:'Guide virtuel · Vie étudiante',en:'Virtual guide · Student life',intro_fr:'Ce personnage fictif présente le lien entre foyer et vie étudiante dans les données du projet.',intro_en:'This fictional character introduces the link between the foyer and student life in project records.',choices:[
  {id:'activity',fr:'Pourquoi visiter le foyer ?',en:'Why visit the foyer?',answer_fr:'Le foyer est associé à la vie étudiante dans le projet. La découverte de ce lieu permet de comparer les activités représentées sur le plan.',answer_en:'The foyer is associated with student life in the project. Discovering it helps compare the activities represented on the plan.'},
  {id:'unknowns',fr:'Quelles informations manquent ?',en:'Which information is missing?',answer_fr:'Les horaires, équipements et services réels restent à confirmer. Les valeurs du mode Démo sont fictives et ne doivent pas guider un accès réel.',answer_en:'Actual hours, equipment and services still need confirmation. Demo mode values are fictional and must not guide real access.'}]}
];

export const MISSIONS=[
 {id:'lecture',roomId:'RDC-Amphi002',guideId:'learning',fr:'Comprendre un lieu d’enseignement',en:'Understand a teaching space'},
 {id:'foyer',roomId:'RDC-028',guideId:'life',fr:'Découvrir une activité étudiante',en:'Discover student life'},
 {id:'print',roomId:'RDC-011',guideId:'orientation',fr:'Repérer un service du plan',en:'Locate a service on the plan'},
 {id:'bike',roomId:'RDC-035',guideId:'orientation',fr:'Préparer mon orientation',en:'Prepare my wayfinding'}
];

export function missionProgress(discovered=[],read=[]){
 const visits=new Set(discovered),dialogues=new Set(read);
 return MISSIONS.map(m=>({...m,visited:visits.has(m.roomId),talked:dialogues.has(m.guideId),complete:visits.has(m.roomId)&&dialogues.has(m.guideId)}));
}

export function validGuideReads(value){return Array.isArray(value)&&value.every(id=>GUIDES.some(g=>g.id===id));}

export function freshGameProgress(){return {steps:0,visited:[],rooms:[],total:0,opened:[],roomName:'Sas d’entrée'};}
export function validGameProgress(v){
 return !!v&&Array.isArray(v.visited)&&v.visited.every(x=>typeof x==='string')&&Array.isArray(v.opened)&&v.opened.every(x=>typeof x==='string')&&Array.isArray(v.rooms)&&v.rooms.every(r=>r&&typeof r.id==='string'&&typeof r.name==='string'&&Array.isArray(r.roomIds)&&r.roomIds.every(id=>typeof id==='string'))&&Number.isFinite(v.steps)&&v.steps>=0&&(!('position'in v)||(Array.isArray(v.position)&&v.position.length===2&&v.position.every(Number.isFinite)));
}
