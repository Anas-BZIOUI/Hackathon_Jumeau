import {useState} from 'react';
export default function OfflineTools({lang}){
 const fr=lang==='fr',[state,setState]=useState('idle');
 async function prepare(){
  setState('loading');
  try{if(!('serviceWorker'in navigator))throw Error();await navigator.serviceWorker.register('/offline-sw.js');let timer;try{await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),30000);})]);}finally{clearTimeout(timer);}setState('ready');}catch{setState('error');}
 }
 return <section className="offline-tools"><button className="ghost" disabled={!import.meta.env.PROD||state==='loading'} onClick={prepare}>{fr?'Préparer une copie hors ligne':'Prepare an offline copy'}</button><p role="status">{!import.meta.env.PROD?(fr?'Disponible dans la version compilée.':'Available in the production build.'):state==='loading'?(fr?'Préparation des plans et données locales…':'Preparing local plans and data…'):state==='ready'?(fr?'Copie locale prête. Rechargez puis testez sans réseau avant la démonstration.':'Local copy ready. Reload and test without network before presenting.'):state==='error'?(fr?'Copie indisponible. Vérifiez le stockage et la connexion.':'Copy unavailable. Check storage and connection.'):(fr?'Enregistre les fichiers privés de cette application dans ce navigateur, sans transmission externe. Les modifications de fiches restent dans le stockage local.':'Stores this app’s private files in this browser without external transmission. Room edits remain in local storage.')}</p></section>;
}
