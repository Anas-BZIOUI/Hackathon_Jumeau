export const ROOM_DETAILS_KEY='ensiie-room-details-v1';
const TEXT=['name_fr','name_en','description_fr','description_en','opening_hours','information_source'];
const TYPES=['classroom','amphitheatre','lab','office','admin','association','student_life','restaurant','toilets','other'];
const ACTIVITIES=['teaching','research','student_life','companies'];
export function validateRoomDetails(value,rooms){
 if(value?.version!==1||!value.rooms||typeof value.rooms!=='object'||Array.isArray(value.rooms))throw Error('format');
 const result={version:1,rooms:{}};
 for(const [id,patch] of Object.entries(value.rooms)){
  const room=rooms.find(r=>r.id===id);if(!room||!patch||typeof patch!=='object'||Array.isArray(patch))throw Error('room');
  const clean={};
  for(const key of TEXT)if(key in patch){if(typeof patch[key]!=='string'||patch[key].length>4000)throw Error('text');clean[key]=patch[key].trim();}
  if('type'in patch){if(!TYPES.includes(patch.type)&&patch.type!==room.type)throw Error('type');clean.type=patch.type;}
  if('activities'in patch){if(!Array.isArray(patch.activities)||patch.activities.some(a=>!ACTIVITIES.includes(a)))throw Error('activities');clean.activities=[...new Set(patch.activities)];}
  if('equipment'in patch){if(!Array.isArray(patch.equipment)||patch.equipment.length>50||patch.equipment.some(e=>typeof e!=='string'||e.length>200))throw Error('equipment');clean.equipment=patch.equipment.map(e=>e.trim()).filter(Boolean);}
  if('capacity'in patch){if(patch.capacity!==null&&(!Number.isInteger(patch.capacity)||patch.capacity<1||patch.capacity>2000))throw Error('capacity');clean.capacity=patch.capacity;}
  if('accessible'in patch){if(![null,true,false].includes(patch.accessible))throw Error('accessible');clean.accessible=patch.accessible;}
  if('verified_on_site'in patch){if(typeof patch.verified_on_site!=='boolean')throw Error('verified');clean.verified_on_site=patch.verified_on_site;}
  if('resources'in patch){if(!Array.isArray(patch.resources)||patch.resources.length>10)throw Error('resources');clean.resources=patch.resources.map(r=>{if(typeof r.label!=='string'||r.label.length>200||!r.label.trim()||typeof r.href!=='string')throw Error('resources');let url;try{url=new URL(r.href);}catch{throw Error('url');}if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw Error('url');return {label:r.label.trim(),href:url.href};});}
  if(clean.verified_on_site&&!clean.information_source)throw Error('source');
  result.rooms[id]=clean;
 }
 return result;
}
export function applyRoomDetails(rooms,details){
 return rooms.map(room=>{
  const patch=details.rooms[room.id];if(!patch)return room;
  return {...room,...patch,name_fr:patch.name_fr||room.name_fr,name_en:patch.name_en||room.name_en,description_fr:patch.description_fr||room.description_fr,description_en:patch.description_en||room.description_en,capacity_estimated:patch.capacity!=null?null:room.capacity_estimated,metadata_source:'local-editor'};
 });
}
