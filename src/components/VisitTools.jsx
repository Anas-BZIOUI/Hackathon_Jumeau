import MissionPanel from './MissionPanel.jsx';
import OfflineTools from './OfflineTools.jsx';
import PrintVisit from './PrintVisit.jsx';
import {visitReport,downloadVisit} from '../visitExport.js';
import {playCue} from '../audio.js';
import {useState} from 'react';
import {roomName} from '../core.js';
export default function VisitTools({rooms,selected,lang,favorites,onFavorite,recents,onSelect,onLocate,onTutorial,settings,onSettings,tour,onPause,onAdvance,onPrevious,onStop,discovered=[],onDiscover,tourRoomIds=[],readGuides=[],onReadGuide,onMissionRoute}){
 const fr=lang==='fr',[open,setOpen]=useState(false),[printText,setPrintText]=useState(null);
 return <section className="visit-tools" aria-label={fr?'Outils de visite':'Visit tools'}>
  <button className="ghost" aria-expanded={open} onClick={()=>setOpen(!open)}>{fr?'Favoris et réglages':'Favorites and settings'}</button>
  <button className="ghost" onClick={onTutorial}>{fr?'Aide rapide':'Quick help'}</button>
  {settings.demoData&&<p className="demo-data-warning" role="status">{fr?"DÉMO : certaines capacités, équipements et horaires sont fictifs. Désactivez les données de démonstration pour retrouver les fiches d’origine.":"DEMO: some capacities, equipment and hours are fictional. Disable demo data to restore original records."}</p>}
  {selected&&<><button className="ghost" onClick={()=>onDiscover(selected.id)} disabled={discovered.includes(selected.id)}>{discovered.includes(selected.id)?(fr?'Découverte enregistrée':'Discovery saved'):(fr?'Valider la découverte sans marcher':'Record discovery without walking')}</button><button className="ghost" onClick={()=>onFavorite(selected.id)}>{favorites.includes(selected.id)?'★':'☆'} {fr?'Favori':'Favorite'}</button><button className="ghost" onClick={()=>onLocate(selected.id)}>{fr?'Je suis près de cette salle (position déclarée)':'I am near this room (declared position)'}</button></>}
  {tour&&<div className="shared-tour" role="status"><strong>{tour.title}</strong> · {tour.index+1}/{tour.total}<p>{tour.objective|| (fr?'Objectif : découvrir les lieux et leurs activités.':'Goal: discover places and their activities.')} {fr?'Durée de lecture indicative':'Estimated reading time'} : {tour.total*2} min ({fr?'déplacements non inclus':'travel excluded'}).</p><p>{tour.text}</p><small>{tour.verified?(fr?'Lieu marqué vérifié dans les données':'Place marked verified in the data'):(fr?'Étape fondée sur le plan ; à vérifier sur place':'Plan-based step; verify on site')}</small><p>{tour.arrived?(fr?'Étape atteinte virtuellement.':'Step reached virtually.'):(fr?'Vous pouvez consulter et valider cette étape sans marcher.':'You can read and complete this step without walking.')}</p><button className="ghost" onClick={onPause}>{tour.paused?(fr?'Reprendre':'Resume'):(fr?'Pause':'Pause')}</button><button className="ghost" disabled={tour.paused||tour.index===0} onClick={onPrevious}>{fr?'Précédent':'Previous'}</button><button className="ghost" disabled={tour.paused} onClick={onAdvance}>{fr?'Valider / étape suivante':'Complete / next step'}</button><button className="ghost" disabled={tour.paused} onClick={onAdvance}>{fr?'Passer cette étape':'Skip this step'}</button><button className="ghost" onClick={onStop}>{fr?'Terminer le parcours':'End tour'}</button></div>}
  <button className="ghost" disabled={!discovered.length} onClick={()=>downloadVisit({rooms,ids:discovered,title:fr?"Passeport de découverte":"Discovery passport",lang})}>{fr?"Exporter mon passeport":"Export my passport"}</button>
  <button className="ghost" disabled={!discovered.length&&!tour} onClick={()=>setPrintText(visitReport({rooms,ids:tour?tourRoomIds:discovered,title:tour?.title||(fr?"Passeport de découverte":"Discovery passport"),lang}))}>{fr?"Version imprimable":"Printable version"}</button>
  {printText&&<PrintVisit text={printText} lang={lang} onClose={()=>setPrintText(null)}/>}
  {tour&&<button className="ghost" onClick={()=>downloadVisit({rooms,ids:tourRoomIds,title:tour.title,lang})}>{fr?"Exporter les étapes":"Export tour stops"}</button>}
  <MissionPanel discovered={discovered} read={readGuides} onRead={onReadGuide} onSelect={onSelect} onRoute={onMissionRoute} lang={lang}/>
  {open&&<div className="visit-settings">
   <OfflineTools lang={lang}/>
   <label><input type="checkbox" checked={settings.autoReroute!==false} onChange={e=>onSettings({...settings,autoReroute:e.target.checked})}/>{fr?'Recalcul automatique en cas d’écart en immersion':'Automatically recalculate when off route in immersion'}</label>
   <label><input type="checkbox" checked={!!settings.strafeFacing} onChange={e=>onSettings({...settings,strafeFacing:e.target.checked})}/>{fr?'Déplacement latéral : garder l’orientation de la vue':'Strafe: keep character aligned with view'}</label>
   <label><input type="checkbox" checked={!!settings.demoData} onChange={e=>onSettings({...settings,demoData:e.target.checked})}/>{fr?"Utiliser des exemples fictifs de démonstration":"Use fictional demo examples"}</label>
   {[['favorites',fr?'Favoris':'Favorites',favorites],['recent',fr?'Destinations récentes':'Recent destinations',recents]].map(([id,label,ids])=><div key={id}><strong>{label}</strong>{ids.map(id=>rooms.find(r=>r.id===id)).filter(Boolean).map(r=><button className="ghost" key={r.id} onClick={()=>onSelect(r.id)}>{roomName(r,lang)} · {r.level}</button>)}</div>)}
   <label><input type="checkbox" checked={!!settings.accessibilityLens} onChange={e=>onSettings({...settings,accessibilityLens:e.target.checked})}/>{fr?'Couche accessibilité : vert = confirmé, rouge = restriction, gris = inconnu':'Accessibility layer: green = confirmed, red = restricted, grey = unknown'}</label>
   <label><input type="checkbox" checked={settings.reducedMotion} onChange={e=>onSettings({...settings,reducedMotion:e.target.checked})}/>{fr?'Réduire les mouvements':'Reduce motion'}</label>
   <label><input type="checkbox" checked={!!settings.compactPanels} onChange={e=>onSettings({...settings,compactPanels:e.target.checked})}/>{fr?'Réduire les panneaux en immersion':'Reduce immersive panels'}</label>
   <label><input type="checkbox" checked={!!settings.sound} onChange={e=>{onSettings({...settings,sound:e.target.checked});if(e.target.checked)playCue('arrival');}}/>{fr?'Sons facultatifs':'Optional sound cues'}</label>
   <label><input type="checkbox" checked={!!settings.showPerformance} onChange={e=>onSettings({...settings,showPerformance:e.target.checked})}/>{fr?'Afficher les performances':'Show performance'}</label>
   <label>{fr?'Sensibilité caméra':'Camera sensitivity'}<input type="range" min="0.001" max="0.01" step="0.001" value={settings.sensitivity} onChange={e=>onSettings({...settings,sensitivity:Number(e.target.value)})}/></label>
   <label>{fr?"Vitesse de rotation au clavier":"Keyboard turn speed"}<input type="range" min="0.5" max="3" step="0.1" value={settings.turnSpeed||1.5} onChange={e=>onSettings({...settings,turnSpeed:Number(e.target.value)})}/></label>
   <label>{fr?'Distance caméra':'Camera distance'}<input type="range" min="1" max="6" step="0.5" value={settings.cameraDistance} onChange={e=>onSettings({...settings,cameraDistance:Number(e.target.value)})}/></label>
   <label><input type="checkbox" checked={settings.invertY} onChange={e=>onSettings({...settings,invertY:e.target.checked})}/>{fr?'Inverser la caméra verticale':'Invert vertical camera'}</label>
   <label>{fr?'Qualité graphique':'Graphics quality'}<select value={settings.quality} onChange={e=>onSettings({...settings,quality:e.target.value})}><option value="auto">Auto</option><option value="low">{fr?'Basse':'Low'}</option><option value="high">{fr?'Haute':'High'}</option></select></label>
   <label>{fr?'Couleur de la tenue':'Outfit color'}<input type="color" value={settings.outfit} onChange={e=>onSettings({...settings,outfit:e.target.value})}/></label>
   {['skin','hair','trousers'].map((part,i)=><label key={part}>{(fr?['Peau','Cheveux','Pantalon']:['Skin','Hair','Trousers'])[i]}<input type="color" value={settings[part]||['#d9ae8e','#342e30','#334359'][i]} onChange={e=>onSettings({...settings,[part]:e.target.value})}/></label>)}
   <label><input type="checkbox" checked={settings.backpack!==false} onChange={e=>onSettings({...settings,backpack:e.target.checked})}/>{fr?'Sac à dos':'Backpack'}</label>
   <button className="ghost" onClick={()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>{});}}>{fr?'Plein écran':'Full screen'}</button>
  </div>}
 </section>;
}
