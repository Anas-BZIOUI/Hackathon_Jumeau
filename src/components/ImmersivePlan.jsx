import {useEffect,useState} from 'react';
import Map2D from './Map2D.jsx';

export default function ImmersivePlan({hud,mapProps,onTeleport,onWalk}){
 const [open,setOpen]=useState(false),[level,setLevel]=useState(hud.floor),[follow,setFollow]=useState(true);
 const fr=mapProps.lang==='fr';
 useEffect(()=>{if(follow)setLevel(hud.floor);},[hud.floor,follow]);
 return <section className={`immersive-plan ${open?'is-open':''}`} aria-label={fr?'Plan 2D de la visite':'Walkthrough 2D plan'}>
  <header><strong>{fr?'Plan 2D · votre position':'2D plan · your position'}</strong><div>{open&&<select aria-label={fr?'Étage du plan immersif':'Immersive plan floor'} value={level} onChange={e=>{setLevel(e.target.value);setFollow(false);}}>{Object.keys(mapProps.floors.levels).map(lv=><option key={lv}>{lv}</option>)}</select>}<button onClick={()=>{setFollow(true);setLevel(hud.floor);}}>{fr?'Moi':'Me'}</button><button aria-label={open?(fr?'Réduire le plan 2D':'Collapse 2D plan'):(fr?'Ouvrir le plan 2D':'Open 2D plan')} onClick={()=>setOpen(v=>!v)}>{open?'×':'⤢'}</button></div></header>
  <Map2D {...mapProps} level={level} position={hud} compact={!open} onLocatePosition={lv=>{setLevel(lv);setFollow(true);}} onVisit={room=>{onTeleport(room.level,room.centroid);setOpen(false);}} onWalkTo={room=>{onWalk(room.level,room.centroid);setOpen(false);}} onSelect={id=>{mapProps.onSelect(id);}}/>
 </section>;
}
