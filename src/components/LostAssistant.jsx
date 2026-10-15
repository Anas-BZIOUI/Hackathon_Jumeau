import {useEffect,useRef,useState} from 'react';
import {searchRooms,roomName} from '../core.js';
export default function LostAssistant({rooms,lang='fr',position,onVirtualNavigate,onClose,onNavigate}){
 const fr=lang==='fr',dialog=useRef(null),[origin,setOrigin]=useState(null),[query,setQuery]=useState(''),[destination,setDestination]=useState(null);
 useEffect(()=>{const previous=document.activeElement;dialog.current.showModal();return()=>previous?.focus();},[]);
 const hits=query.trim()?searchRooms(query,rooms,{},lang):[];
 function choose(room){if(!origin){setOrigin(room);setQuery('');}else{setDestination(room);onNavigate(origin,room);}}
 return <dialog ref={dialog} className="room-editor lost-dialog" aria-labelledby="lost-title" onCancel={e=>{e.preventDefault();onClose();}}>
  <header><div><h2 id="lost-title">{fr?'Retrouver mon chemin':'Find my way'}</h2><p>{fr?'Déclarez la salle près de laquelle vous êtes, puis choisissez votre destination.':'Select the room you are near, then choose a destination.'}</p></div><button className="ghost" aria-label={fr?'Fermer':'Close'} onClick={onClose}>×</button></header>
  <div className="room-editor-body">
   {position&&<p>{fr?'Position virtuelle du personnage':'Virtual character position'} : {position.floor}, {position.x.toFixed(1)} / {position.y.toFixed(1)} m.</p>}
   {origin&&<p>{fr?'Départ déclaré':'Declared start'} : {roomName(origin,lang)} · {origin.level}</p>}
   {destination?<><p role="status">{fr?'Destination sélectionnée. Le calcul du trajet est affiché dans la vue principale.':'Destination selected. Route calculation appears in the main view.'}</p><button className="primary" onClick={onClose}>{fr?'Voir le trajet':'View route'}</button><button className="ghost" onClick={()=>{setOrigin(null);setDestination(null);setQuery('');}}>{fr?'Recommencer':'Start again'}</button></>:<>
    <label>{origin?(fr?'Destination':'Destination'):(fr?'Salle proche ou repère connu':'Nearby room or known landmark')}<input autoFocus value={query} onChange={e=>setQuery(e.target.value)}/></label>
    {!query&&<p className="hint">{fr?'Cherchez un numéro, un nom ou un étage. Les résultats restent distincts pour éviter les ambiguïtés.':'Search for a number, name or floor. Results stay separate to avoid ambiguity.'}</p>}
    {query&&!hits.length&&<p role="status">{fr?'Aucun résultat. Essayez le numéro avec son étage.':'No results. Try a room number with its floor.'}</p>}
    {origin&&!query&&<div><strong>{fr?'Repères marqués vérifiés dans les données':'Landmarks marked verified in the data'}</strong>{rooms.filter(r=>r.verified_on_site&&r.id!==origin.id).slice(0,5).map(r=><button className="ghost" key={r.id} onClick={()=>choose(r)}>{roomName(r,lang)} · {r.level}</button>)}</div>}
    <div className="lost-results">{hits.map(r=><div key={r.id}><button className="ghost" onClick={()=>choose(r)}>{roomName(r,lang)} · {r.level} · {r.id}</button>{!origin&&position&&<button className="ghost" onClick={()=>{onVirtualNavigate(r);onClose();}}>{fr?'Depuis la position virtuelle':'From virtual position'}</button>}</div>)}</div>
   </>}
  </div>
 </dialog>;
}
