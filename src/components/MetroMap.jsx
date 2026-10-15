import {useState} from 'react';
import {ACTIVITY_COLORS,roomName} from '../core.js';
import {STRINGS} from '../i18n.js';
export default function MetroMap({metro,rooms,selectedId,onSelect,onRoute,lang}){
 const [active,setActive]=useState(null),fr=lang==='fr',byId=new Map(rooms.map(r=>[r.id,r]));
 const stations=(metro.stations||[]).filter(s=>byId.has(s.roomId)),selected=stations.find(s=>s.roomId===selectedId);
 return <div className="view-host discovery-view"><div className="actions" aria-label={fr?'Lignes d’activité':'Activity lines'}><button className="ghost" aria-pressed={!active} onClick={()=>setActive(null)}>{fr?'Toutes les lignes':'All lines'}</button>{(metro.lines||[]).map(l=><button key={l.id} className="ghost" aria-pressed={active===l.id} onClick={()=>setActive(active===l.id?null:l.id)}><span style={{color:ACTIVITY_COLORS[l.id]}}>● </span>{STRINGS[lang][l.id]||l.id}</button>)}</div>
 <svg className="metro-svg" viewBox="0 0 460 300" role="img" aria-label={fr?'Plan métro schématique des activités':'Schematic activity metro map'}>
  <rect width="460" height="300" fill="#0c1114"/>{(metro.lines||[]).map(l=>{const p=stations.filter(s=>s.lines.includes(l.id));return <path key={l.id} d={p.map((s,i)=>`${i?'L':'M'}${s.x} ${s.y}`).join(' ')} fill="none" stroke={ACTIVITY_COLORS[l.id]||l.color} strokeWidth="5" opacity={!active||active===l.id?1:.15}/>;})}
  {stations.map(s=><g key={s.id} role="button" tabIndex={0} aria-label={roomName(byId.get(s.roomId),lang)} onKeyDown={e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();onSelect(s.roomId);}}} onClick={()=>onSelect(s.roomId)} opacity={!active||s.lines.includes(active)?1:.25}><circle cx={s.x} cy={s.y} r={s.lines.length>1?8:6} fill="#0c1114" stroke={selectedId===s.roomId?'white':ACTIVITY_COLORS[s.lines[0]]} strokeWidth="3"/><text x={s.x+12} y={s.y+4} fill="white" fontSize="11">{s.label}</text><title>{roomName(byId.get(s.roomId),lang)}</title></g>)}
 </svg><p className="hint">{fr?'Schéma de découverte ; la position des stations ne représente pas un itinéraire physique.':'Discovery diagram; station positions do not represent a physical route.'}</p>
 {selected&&<div className="actions"><strong>{roomName(byId.get(selected.roomId),lang)}</strong><button className="primary" onClick={()=>onRoute(selected.roomId)}>{fr?'Itinéraire vers cette station':'Route to this station'}</button></div>}
 <ul>{stations.filter(s=>!active||s.lines.includes(active)).map(s=><li key={s.id}><button className="ghost" onClick={()=>onSelect(s.roomId)}>{roomName(byId.get(s.roomId),lang)} · {byId.get(s.roomId).level}</button><button className="ghost" onClick={()=>onRoute(s.roomId)}>{fr?'Itinéraire':'Route'}</button></li>)}</ul></div>;
}
