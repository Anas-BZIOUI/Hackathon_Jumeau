import {useEffect,useState} from 'react';
import {DAY_PHASES,daySnapshot,simulationClock} from '../simulation.js';
const COLORS=['#246f58','#3c64a0','#8a4a94'];
export default function SimulationView({lang,floors,requestRoute,reducedMotion=false}){
 const fr=lang==='fr',[time,setTime]=useState(8),[routes,setRoutes]=useState(null),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(15),[failed,setFailed]=useState(0),[retry,setRetry]=useState(0);
 useEffect(()=>{
  let active=true;setRoutes(null);setFailed(0);
  Promise.allSettled([['RDC-011','RDC-028'],['RDC-003','RDC-Amphi002'],['R+1-131','R+1-148']].map(([a,b])=>requestRoute(a,b))).then(results=>{
   if(!active)return;
   const valid=results.filter(r=>r.status==='fulfilled'&&r.value?.legs?.some(l=>l.kind==='walk'&&l.points?.length>1)).map(r=>r.value);
   setRoutes(valid);setFailed(results.length-valid.length);
  });
  return()=>{active=false;};
 },[requestRoute,retry]);
 useEffect(()=>{
  if(!playing||reducedMotion)return;
  const timer=setInterval(()=>setTime(t=>Math.min(18,t+speed/240)),250);
  const hidden=()=>{if(document.hidden)setPlaying(false);};
  document.addEventListener('visibilitychange',hidden);
  return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',hidden);};
 },[playing,speed,reducedMotion]);
 useEffect(()=>{if(time>=18||reducedMotion)setPlaying(false);},[time,reducedMotion]);
 const snapshot=daySnapshot(routes||[],time);
 return <div className="view-host discovery-view day-simulation">
  <header><small>{fr?'SCÉNARIO ILLUSTRATIF · AUCUNE DONNÉE EN TEMPS RÉEL':'ILLUSTRATIVE SCENARIO · NO LIVE DATA'}</small><h2>{fr?'Simulation · Une journée fictive':'Simulation · A fictional day'}</h2><p>{fr?'Agents synthétiques et horaires inventés. Aucune occupation réelle, aucun emploi du temps ni donnée personnelle. Les déplacements suivent les trajets disponibles dans le modèle.':'Synthetic agents and invented schedules. No real occupancy, timetable or personal data. Movement follows available routes in the model.'}</p></header>
  <div className="simulation-controls"><label>{fr?'Heure simulée':'Simulated time'} <strong>{simulationClock(time)}</strong><input aria-label={fr?'Heure simulée':'Simulated time'} type="range" min="8" max="18" step="0.05" value={time} onChange={e=>{setPlaying(false);setTime(Number(e.target.value));}}/></label><button type="button" disabled={reducedMotion||!routes?.length} onClick={()=>{if(time>=18)setTime(8);setPlaying(p=>!p);}}>{playing?'Pause':(fr?'Lire la journée':'Play the day')}</button><button type="button" onClick={()=>{setPlaying(false);setTime(8);}}>{fr?'Revenir à 08:00':'Reset to 08:00'}</button><label>{fr?'Minutes fictives par seconde':'Fictional minutes per second'}<select value={speed} onChange={e=>setSpeed(Number(e.target.value))}>{[5,15,30].map(value=><option key={value} value={value}>{value}</option>)}</select></label></div>
  {reducedMotion&&<p>{fr?'Mouvements réduits : utilisez le curseur pour avancer manuellement.':'Reduced motion: use the slider to advance manually.'}</p>}
  <p role="status"><strong>{snapshot.phase[fr?'fr':'en']}</strong> · {snapshot.agents.length} {fr?'agents fictifs affichés':'fictional agents shown'}</p>
  <ol className="simulation-phases">{DAY_PHASES.map(phase=><li key={phase.start} aria-current={snapshot.phase===phase?'step':undefined}><button type="button" onClick={()=>{setPlaying(false);setTime(phase.start);}}>{simulationClock(phase.start)}–{simulationClock(phase.end)}<span>{phase[fr?'fr':'en']}</span></button></li>)}</ol>
  {routes===null?<p role="status">{fr?'Calcul des trajets simulés…':'Calculating simulated routes…'}</p>:<>
   {failed>0&&<p>{fr?`${failed}/3 trajets illustratifs indisponibles : ils sont exclus, sans dessiner de raccourci à travers les murs.`:`${failed}/3 illustrative routes unavailable: excluded without drawing shortcuts through walls.`} <button type="button" onClick={()=>{setPlaying(false);setRetry(n=>n+1);}}>{fr?'Réessayer':'Retry'}</button></p>}
   {routes.length===0?<p role="status">{fr?'Aucun trajet disponible pour la simulation.':'No routes available for simulation.'}</p>:['RDC','R+1'].filter(lv=>floors.levels[lv]).map(lv=><section className="simulation-floor" key={lv}><h3>{lv} · {snapshot.agents.filter(a=>a.position.floor===lv).length} {fr?'agents fictifs':'fictional agents'}</h3><svg viewBox={`0 0 ${floors.levels[lv].size.join(' ')}`} role="img" aria-label={`${fr?'Trajets et agents fictifs':'Fictional routes and agents'} · ${lv}`}><title>{fr?'Schéma de trajets, pas une mesure de fréquentation':'Route diagram, not a measure of occupancy'}</title>{routes.flatMap((r,i)=>r.legs.filter(l=>l.kind==='walk'&&l.level===lv).map((l,j)=><polyline key={`${i}-${j}`} points={l.points.map(p=>`${p[0]},${floors.levels[lv].size[1]-p[1]}`).join(' ')} stroke={COLORS[i%COLORS.length]} strokeWidth=".3" fill="none"/>))}{snapshot.agents.filter(a=>a.position.floor===lv).map(a=><circle key={a.id} cx={a.position.x} cy={floors.levels[lv].size[1]-a.position.y} r=".55" fill={COLORS[a.group%COLORS.length]}/>)}</svg><p>{fr?'Lignes : trajets calculés · Points : agents fictifs. Aucun effectif réel de salle.':'Lines: calculated routes · Dots: fictional agents. No real room headcounts.'}</p></section>)}
  </>}
 </div>;
}
