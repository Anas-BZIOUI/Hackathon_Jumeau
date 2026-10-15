import {routeInstructions,routeProgress} from '../guidance.js';
export default function RouteGuide({route,position,lang,onResume}){
 if(!route)return null;
 const fr=lang==='fr',steps=routeInstructions(route),progress=routeProgress(route,position);
 const nextIndex=progress&&!progress.offRoute?steps.findIndex(s=>s.level===position.floor&&s.along>=progress.along-.3):0;
 const next=steps[Math.max(0,nextIndex)];
 return <details className="route-guide"><summary>{fr?'Consignes du trajet':'Route directions'} · {progress?progress.remaining:route.metres} m {fr?'estimés restants':'estimated remaining'}</summary>
  {next&&<p role="status"><strong>{fr?'Prochaine action':'Next action'} : {next['text_'+lang]}</strong>{progress&&!progress.offRoute&&' · '+Math.max(0,Math.round(next.along-progress.along))+' m'}</p>}
  <p className="hint">{fr?'Trajet calculé sur les plans, à vérifier sur place.':'Route calculated from plans; verify on site.'}{route.stepFree&&(fr?' Évite les escaliers ; accessibilité complète non vérifiée.':' Avoids stairs; full accessibility is unverified.')}</p>
  {progress?.offRoute&&<p role="status">{fr?'Vous êtes à l’écart du trajet.':'You are away from the route.'}{onResume&&<button className="ghost" onClick={onResume}>{fr?'Recalculer depuis ma position virtuelle':'Recalculate from my virtual position'}</button>}</p>}
  <ol>{steps.map((s,i)=><li key={i} aria-current={i===Math.max(0,nextIndex)?'step':undefined}><strong>{s.level}</strong> · {s[`text_${lang}`]}</li>)}</ol>
 </details>;
}
