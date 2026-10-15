import {useState} from 'react';
import {ACTIVITY_COLORS,roomColor,roomName} from '../core.js';
export default function Constellation({rooms,selectedId,onSelect,onRoute,onActivity,t,lang='fr'}){
 const [activity,setActivity]=useState(null),fr=lang==='fr';
 const linked=rooms.filter(r=>r.activities?.length&&(!activity||r.activities.includes(activity)));
 return <div className="view-host discovery-view"><h2>{t.constellation}</h2><div className="actions">{Object.keys(ACTIVITY_COLORS).map(id=><button className="ghost" key={id} aria-pressed={activity===id} onClick={()=>{const next=activity===id?null:id;setActivity(next);onActivity(next);}}>{t[id]} · {rooms.filter(r=>r.activities?.includes(id)).length}</button>)}</div><p>{fr?'Chaque lieu est relié aux activités indiquées dans les données du projet.':'Each place is linked to the activities recorded in project data.'}</p><div className="constellation-rooms">{linked.map(r=><div key={r.id} className={r.id===selectedId?'selected':''} style={{borderLeft:`4px solid ${roomColor(r)}`}}><button className="ghost" onClick={()=>onSelect(r.id)}>{roomName(r,lang)} · {r.level}</button><small>{r.activities.map(a=>t[a]).join(' · ')}</small><button className="ghost" onClick={()=>onRoute(r.id)}>{fr?'Itinéraire':'Route'}</button></div>)}</div></div>;
}
