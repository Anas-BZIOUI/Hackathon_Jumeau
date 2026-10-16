import {guidanceState} from '../guidance.js';
export default function RouteGuide({route,position,lang,onResume}){
 if(!route)return null;
 const fr=lang==='fr',{steps,progress,index:nextIndex,next,distanceToNext}=guidanceState(route,position);
 const action={fr:{left:'Tourner à gauche',right:'Tourner à droite',uturn:'Faire demi-tour',straight:'Continuer tout droit'},en:{left:'Turn left',right:'Turn right',uturn:'Turn around',straight:'Continue straight'}};
 return <details className="route-guide"><summary>{fr?'Consignes du trajet':'Route directions'} · {progress?progress.remaining:route.metres} m {fr?'estimés restants':'estimated remaining'}</summary>
  {position&&<small>{fr?'Guidage depuis la position virtuelle du personnage':'Guidance from the virtual character position'} · {position.floor}</small>}
  {position?.inLift?<p role="status">{fr?'Déplacement virtuel en ascenseur ; guidage repris à l’arrivée.':'Virtual lift journey; guidance resumes on arrival.'}</p>:next&&<p role="status"><strong>{fr?'Prochaine action':'Next action'} : {progress?(action[lang][next.kind]||next['text_'+lang]):next['text_'+lang]}</strong>{distanceToNext!==null&&next.kind!=='arrival'&&' · '+(distanceToNext===0?(fr?'maintenant':'now'):distanceToNext+' m')}</p>}
  <p className="hint">{fr?'Trajet calculé sur les plans, à vérifier sur place.':'Route calculated from plans; verify on site.'}{route.stepFree&&(fr?' Évite les escaliers ; accessibilité complète non vérifiée.':' Avoids stairs; full accessibility is unverified.')}</p>
  {progress?.offRoute&&!position?.inLift&&<p role="status">{fr?'Vous êtes à l’écart du trajet.':'You are away from the route.'}</p>}
  {position&&onResume&&<button className="ghost" disabled={position.inLift} onClick={onResume}>{fr?"Recalculer / reprendre depuis mon personnage":"Recalculate / resume from my character"}</button>}
  <ol>{steps.map((s,i)=><li key={i} aria-current={i===nextIndex?'step':undefined}><strong>{s.level}</strong> · {s[`text_${lang}`]}</li>)}</ol>
 </details>;
}
