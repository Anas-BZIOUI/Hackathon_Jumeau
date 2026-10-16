// Fictional presentation examples only. Never imported into authoritative room data.
export const DEMO_ROOMS={
 'RDC-011':{capacity:6,equipment:['DEMO · 2 imprimantes / 2 printers','DEMO · scanner'],opening_hours:'DEMO · lun–ven / Mon–Fri 09:00–17:00'},
 'RDC-028':{capacity:30,equipment:['DEMO · tables conviviales / shared tables','DEMO · micro-ondes / microwave'],opening_hours:'DEMO · lun–ven / Mon–Fri 08:00–19:00'},
 'RDC-Amphi002':{capacity:120,equipment:['DEMO · vidéoprojecteur / projector','DEMO · microphones'],opening_hours:'DEMO · sur réservation / by booking'},
 'R+1-121':{capacity:24,equipment:['DEMO · 24 postes / 24 workstations','DEMO · tableau / whiteboard'],opening_hours:'DEMO · lun–ven / Mon–Fri 08:00–18:00'},
 'R+1-127':{capacity:12,equipment:['DEMO · postes de recherche / research workstations','DEMO · écran partagé / shared display'],opening_hours:'DEMO · accès sur autorisation / authorized access'},
 'R+2-216':{capacity:10,equipment:['DEMO · visioconférence / video conferencing','DEMO · table de réunion / meeting table'],opening_hours:'DEMO · sur rendez-vous / by appointment'}
};
export function withDemoRooms(rooms,enabled){
 if(!enabled)return rooms;
 return rooms.map(room=>DEMO_ROOMS[room.id]?{...room,...DEMO_ROOMS[room.id],demo_data:true,capacity_estimated:null,verified_on_site:false,verification:null,information_source:'DEMO — Fiction inventée pour la présentation / Fictional presentation data; not observed on site.'}:room);
}
