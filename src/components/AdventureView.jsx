import {useRef,useState} from 'react';
import './AdventureView.css';
import EntranceGame from '../game/EntranceGame.jsx';
import MissionPanel from './MissionPanel.jsx';
import {missionProgress,validGameProgress,freshGameProgress} from '../discoveryMissions.js';
import {useSaved} from '../preferences.js';
export default function AdventureView({t,lang,persona='student',onSelect,onGuide,onPosition,discovered=[],onDiscover,readGuides=[],onReadGuide}){
 const notebook=useRef(null);
 const [saved,setSaved]=useSaved('ensiie-game-progress',null,validGameProgress);
 const [state,setState]=useState(saved||freshGameProgress()),[run,setRun]=useState(0),[reveal,setReveal]=useState(false),[requestedGuide,setRequestedGuide]=useState(null),[backup,setBackup]=useState(null);
 const fr=lang==='fr',intro={student:{fr:'Votre première visite : repérez un espace de cours, le foyer et les services indiqués sur les plans. Consultez les fiches pour préparer votre journée.',en:'Your first visit: find a teaching space, the foyer and services recorded on the plans. Use room records to prepare your day.'},visitor:{fr:'Votre visite découverte : commencez par l’amphithéâtre, découvrez la vie étudiante et utilisez le Guide pour préparer vos trajets.',en:'Your discovery visit: start with the lecture hall, discover student life and use the Guide to prepare your routes.'},company:{fr:'Votre visite entreprise : découvrez les espaces d’enseignement au RDC, puis utilisez les parcours du Guide pour explorer les lieux associés aux entreprises. Les usages restent à confirmer.',en:'Your company visit: discover ground-floor teaching spaces, then use Guide tours to explore places associated with companies. Their uses still need confirmation.'}}[persona]||null,visitedIds=new Set((state.rooms||[]).filter(r=>state.visited.includes(r.id)).flatMap(r=>r.roomIds||[]));
 for(const id of discovered)visitedIds.add(id);
 const completed=missionProgress([...visitedIds],readGuides).filter(m=>m.complete),percent=state.total?Math.round(state.visited.length/state.total*100):0;
 function progress(value){setState(value);setSaved(value);if(value.roomIds?.length)onDiscover?.(value.roomIds);}
 function reset(){setBackup({saved,state});setSaved(null);setState(freshGameProgress());setReveal(false);setRun(n=>n+1);}
 return <main className="adventure retro-adventure" id="main-content" tabIndex={-1}>
  <div className="retro-shell">
   <header className="retro-hero">
    <img className="retro-logo" src="/logo.png" alt="EnsiiExplore"/>
    <div className="retro-intro"><span className="retro-edition"><i aria-hidden="true"/> {fr?'L’AVENTURE COMMENCE AU RDC':'YOUR ADVENTURE STARTS HERE'}</span><h1>{fr?<>Un campus.<br/>Mille aventures.</>:<>One campus.<br/>Endless adventures.</>}</h1><p>{fr?'Fais des rencontres. Accepte des quêtes. Trouve ta place.':'Meet new people. Take on quests. Find your place.'}</p></div>
   </header>
   <div className="retro-playground">
    <div className="retro-scenery retro-scenery-left" aria-hidden="true"><span className="retro-spark">✦</span><span className="retro-sticker">{fr?'À TOI DE JOUER !':'YOUR TURN!'}</span><div className="retro-vignette"><img className="retro-shelf" src="/game/decor/bookshelf.png" alt=""/><span className="retro-character retro-character-alex"/><img className="retro-plant" src="/game/decor/plant.png" alt=""/><img className="retro-paper" src="/game/decor/paper.png" alt=""/></div><span className="retro-side-caption">01 / {fr?'EXPLORER':'EXPLORE'}</span><span className="retro-pixel-star">+</span></div>
    <section className="retro-cabinet" aria-label={fr?'Fenêtre de jeu EnsiiExplore':'EnsiiExplore game window'}>
     <div className="retro-titlebar"><span><i aria-hidden="true"/> ENSIIEXPLORE.EXE</span><button onClick={()=>notebook.current.showModal()} aria-haspopup="dialog">{fr?'Carnet de découverte':'Discovery notebook'} <span aria-hidden="true">↗</span></button></div>
     <div className="retro-status"><span><i aria-hidden="true"/> {fr?'PARTIE EN COURS':'NOW PLAYING'}</span><span>{state.steps} {fr?'pas':'steps'} <b>·</b> {percent}% {fr?'exploré':'explored'}</span></div>
     <EntranceGame key={run} initialProgress={saved} lang={lang} onProgress={progress} onPosition={onPosition}/>
    </section>
    <div className="retro-scenery retro-scenery-right" aria-hidden="true"><span className="retro-pixel-star">+</span><span className="retro-side-caption">02 / {fr?'RENCONTRER':'CONNECT'}</span><div className="retro-vignette"><img className="retro-desk" src="/game/decor/desk.png" alt=""/><img className="retro-computer" src="/game/decor/computer.png" alt=""/><span className="retro-character retro-character-amelia"/><img className="retro-chair" src="/game/decor/chair.png" alt=""/><img className="retro-small-plant" src="/game/decor/plant.png" alt=""/></div><span className="retro-sticker retro-sticker-orange">{fr?'UNE QUÊTE T’ATTEND':'A QUEST AWAITS'}</span><span className="retro-spark">✦</span></div>
   </div>
   <footer className="retro-footer"><span><i aria-hidden="true"/> {fr?'UN JOUEUR · TOUT UN CAMPUS':'ONE PLAYER · A WHOLE CAMPUS'}</span><span>ENSIIE <b>✦</b> {fr?'ÉDITION AVENTURE':'ADVENTURE EDITION'}</span></footer>
  </div>
  <dialog ref={notebook} className="retro-notebook" aria-labelledby="retro-notebook-title" onKeyDownCapture={e=>e.stopPropagation()} onKeyUpCapture={e=>e.stopPropagation()}>
   <header><div><small>ENSIIEXPLORE / {fr?'PROGRESSION':'PROGRESS'}</small><h2 id="retro-notebook-title">{fr?'Carnet de découverte':'Discovery notebook'}</h2></div><button onClick={()=>notebook.current.close()} aria-label={fr?'Fermer le carnet':'Close notebook'}>✕</button></header>
   {intro&&<section className="retro-persona"><strong>{t[persona]}</strong><p>{intro[lang]}</p></section>}
   <div className="retro-notebook-stats"><span>{state.visited.length} / {state.total} {fr?'espaces':'spaces'}</span><span>{completed.length} / 4 {fr?'missions de découverte':'discovery missions'}</span></div>
  <div className="retro-notebook-content"><MissionPanel discovered={[...visitedIds]} read={readGuides} onRead={onReadGuide} onSelect={onSelect} onRoute={onGuide} lang={lang} requestedGuide={requestedGuide}/>
  <p>{fr?'Badges obtenus':'Earned badges'} : {completed.map(m=>m[lang]).join(' · ')||'—'}</p>
  <button className="ghost" onClick={()=>setReveal(!reveal)}>{reveal?(fr?'Masquer la liste complète':'Hide complete list'):(fr?'Révéler les espaces pour la démonstration':'Reveal spaces for the demo')}</button>
  {reveal&&<figure className="adventure-reveal"><img src="/game/maps/rdc-authored-preview.svg" alt={fr?"Vue complète de la géométrie du jeu RDC, y compris les espaces non découverts":"Full ground-floor game geometry, including undiscovered spaces"}/><a href="/game/maps/rdc-authored-preview.svg" target="_blank" rel="noreferrer">{fr?"Ouvrir la carte à pleine taille":"Open full-size map"}</a><figcaption>{fr?"Carte de démonstration ; ne valide pas les découvertes ni les accès réels.":"Demo overview; does not validate discoveries or real access."}</figcaption></figure>}
  {(state.rooms||[]).filter(r=>reveal||state.visited.includes(r.id)).map(r=><div key={r.id} className="entrance-objective">{state.visited.includes(r.id)?'✓':'○'} {r.name}</div>)}
  <p className="hint">{fr?'Le jeu conserve sa géométrie RDC dédiée. Deux passages sont déduits et restent à vérifier ; un espace de jeu peut regrouper plusieurs salles du plan.':'The game retains its dedicated ground-floor geometry. Two inferred passages need verification; one game space can group several plan rooms.'}</p><button className="ghost" onClick={reset}>{fr?'Réinitialiser la partie uniquement':'Reset game only'}</button><p className="hint">{fr?'Les découvertes et dialogues partagés du Guide sont conservés.':'Shared Guide discoveries and conversations are preserved.'}</p>{backup&&<button className="ghost" onClick={()=>{setSaved(backup.saved);setState(backup.state);setBackup(null);setRun(n=>n+1);}}>{fr?'Annuler la remise à zéro':'Undo game reset'}</button>}</div>
  </dialog>
 </main>;
}
