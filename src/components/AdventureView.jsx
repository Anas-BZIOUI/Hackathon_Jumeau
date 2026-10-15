import { useState } from 'react';
import EntranceGame from '../game/EntranceGame.jsx';
export default function AdventureView({t,lang}) {
  const [state,setState]=useState({steps:0,visited:[],rooms:[],total:42,opened:[],roomName:'Sas d’entrée'});
  const fr=lang==='fr';
  return <div className="adventure entrance-adventure">
    <div className="adv-hud"><span>RDC · {state.roomName}</span><span>{t.steps}: {state.steps} · {t.explored}: {state.visited.length} / {state.total}</span></div>
    <EntranceGame lang={lang} onProgress={setState}/>
    <div className="adv-dialog"><div className="who">{fr?'Explorer le RDC':'Explore the ground floor'}</div><div>{fr?'Seule votre pièce est visible. Marchez directement dans une porte pour changer d’environnement. Les pièces voisines restent cachées.':'Only your current room is visible. Walk directly into a door to change environments. Neighbouring rooms stay hidden.'}</div></div>
    <aside className="adv-log"><div className="section-title">{fr?'Espaces du RDC':'Ground floor spaces'}</div>
      {state.rooms.map(r=><div key={r.id} className={`entrance-objective ${state.visited.includes(r.id)?'done':''}`}><span>{state.visited.includes(r.id)?'✓':'○'}</span>{r.name}</div>)}
      <div className="section-title">{fr?'Plan de référence':'Reference plan'}</div><p className="hint">{fr?'Contours issus du plan. Certains passages sont reconstruits et restent à vérifier sur place.':'Contours from the floor plan. Some passages are reconstructed and need on-site verification.'}</p>
    </aside>
  </div>;
}
