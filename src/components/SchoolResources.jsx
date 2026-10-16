import {useEffect,useRef,useState} from 'react';
import {SCHOOL_RESOURCES,CATEGORIES,FIRST_DAYS,searchSchoolResources} from '../schoolResources.js';
import {useSaved} from '../preferences.js';

const CONTACTS={
 admissions:['concours@listes.ensiie.fr','https://www.ensiie.fr/faq'],
 housing:['logements@listes.ensiie.fr','https://www.ensiie.fr/vie-etudiante/logements'],
 outgoing:['rel-int@listes.ensiie.fr','https://www.ensiie.fr/international/mobilite-internationale'],
 partners:['com_re@listes.ensiie.fr','https://www.ensiie.fr/ecole/actualites-et-evenements/inscriptions-reveal-week-semaine-entreprises-2026'],
 accessibility:['dirscol@listes.ensiie.fr','https://www.etudiant.gouv.fr/fr/trouvez-le-referent-handicap-de-votre-etablissement-3319']
};

export default function SchoolResources({lang,persona,initialSection='catalogue',rooms,onLocate,onClose}){
 const fr=lang==='fr',dialog=useRef(null);
 const [query,setQuery]=useState(''),[audience,setAudience]=useState(persona),[category,setCategory]=useState('all'),[section,setSection]=useState(initialSection);
 const [done,setDone]=useSaved('ensiie-first-days',[],v=>Array.isArray(v)&&v.every(id=>FIRST_DAYS.includes(id)));
 useEffect(()=>{const node=dialog.current,trigger=document.activeElement;node.showModal();return()=>{if(node.open)node.close();if(trigger?.isConnected)trigger.focus();};},[]);
 const results=section==='first-days'?FIRST_DAYS.map(id=>SCHOOL_RESOURCES.find(r=>r.id===id)):searchSchoolResources(SCHOOL_RESOURCES,{query,persona:section==='help'?'all':audience,category:section==='help'?'help':category});
 return <dialog className="school-resources" ref={dialog} onCancel={onClose} aria-labelledby="school-resources-title">
  <header><div><small>{fr?'SERVICES PARTAGÉS · PLAN ET IMMERSION':'SHARED SERVICES · PLAN AND IMMERSION'}</small><h2 id="school-resources-title">{fr?'L’école, en pratique':'Your school companion'}</h2><p>{fr?'Trouvez une démarche, un service ou un interlocuteur.':'Find a service, a process or a contact.'}</p></div><button type="button" className="ghost" onClick={onClose}>{fr?'Fermer':'Close'} ×</button></header>
  <nav className="school-resources-tabs" aria-label={fr?'Rubriques des services':'Service sections'}>{[['catalogue',fr?'Tous les services':'All services'],['first-days',fr?'Mes premiers jours':'My first days'],['help',fr?'Besoin d’aide':'Need help']].map(([id,label])=><button type="button" key={id} aria-pressed={section===id} onClick={()=>{setSection(id);setQuery('');}}>{label}</button>)}</nav>
  {section!=='first-days'&&<div className="school-resources-filters"><label>{fr?'Rechercher un besoin':'Search by need'}<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={fr?'Stage, logement, certificat…':'Internship, housing, certificate…'}/></label>{section==='catalogue'&&<><label>{fr?'Pour qui ?':'Who is it for?'}<select value={audience} onChange={e=>setAudience(e.target.value)}>{[['all',fr?'Tous les profils':'All profiles'],['student',fr?'Étudiant':'Student'],['visitor',fr?'Visiteur / candidat':'Visitor / applicant'],['company',fr?'Entreprise':'Company']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label>{fr?'Thème':'Topic'}<select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">{fr?'Tous les thèmes':'All topics'}</option>{Object.entries(CATEGORIES).map(([id,labels])=><option key={id} value={id}>{labels[fr?0:1]}</option>)}</select></label></>}</div>}
  {section==='first-days'&&<p>{fr?'Une liste personnelle de ressources à consulter, conservée sur ce navigateur. Cocher ne valide aucune démarche administrative.':'A personal reading checklist saved in this browser. Checking an item does not complete any administrative process.'} <strong>{done.length}/{FIRST_DAYS.length}</strong> <button className="ghost" type="button" onClick={()=>setDone([])}>{fr?'Tout décocher':'Uncheck all'}</button></p>}
  <p className="school-resources-note">{fr?'Sources collectées le 16/10/2026 ; liens et procédures susceptibles d’évoluer. Les portails privés n’ont pas été testés après connexion. Aucune localisation ci-dessous n’est vérifiée sur place.':'Sources collected on 16 Oct 2026; links and procedures may change. Private portals have not been tested after login. None of the locations below have been verified on site.'}</p>
  <p role="status">{results.length} {fr?'ressource(s)':'resource(s)'}</p>
  <div className="school-resources-grid">{results.map(r=><article key={r.id}>
   <div className="school-resource-badges"><span>{CATEGORIES[r.category][fr?0:1]}</span><span>{({public:fr?'Information publique':'Public information',account:fr?'Compte requis':'Account required',mixed:fr?'Accès mixte':'Mixed access'})[r.access]}</span><span>{r.publisher==='partner'?(fr?'Partenaire / communauté':'Partner / community'):r.publisher==='ministry'?(fr?'Ministère':'Ministry'):'ENSIIE'}</span></div>
   <h3>{r[`label_${lang}`]}</h3><p>{r[`summary_${lang}`]}</p>
   {section==='first-days'&&<label className="school-resource-check"><input type="checkbox" aria-label={`${fr?'Ressource consultée':'Resource reviewed'} : ${r[`label_${lang}`]}`} checked={done.includes(r.id)} onChange={e=>setDone(prev=>e.target.checked?[...prev,r.id]:prev.filter(id=>id!==r.id))}/>{fr?'Ressource consultée':'Resource reviewed'}</label>}
   <div className="school-resource-actions"><a href={r.href} target="_blank" rel="noreferrer">{fr?'Ouvrir la ressource':'Open resource'} ↗</a>{CONTACTS[r.id]&&<a href={`mailto:${CONTACTS[r.id][0]}`}>{CONTACTS[r.id][0]}</a>}</div>
   {CONTACTS[r.id]&&<small><a href={CONTACTS[r.id][1]} target="_blank" rel="noreferrer">{fr?'Source du contact':'Contact source'} ↗</a></small>}
   {r.candidate_room_id&&<div className="school-resource-location"><strong>{r.candidate_room_id}</strong><p>{fr?'Correspondance de bureau proposée par les sources ; étage et accès à confirmer. Aucun trajet garanti.':'Office match suggested by sources; floor and access need confirmation. No guaranteed route.'}</p>{rooms.some(room=>room.id===r.candidate_room_id)&&<button type="button" className="ghost" onClick={()=>{onLocate(r.candidate_room_id);onClose();}}>{fr?'Voir le bureau candidat sur le plan':'Show candidate office on the plan'}</button>}</div>}
   <details><summary>{fr?'Provenance et limites':'Sources and limitations'}</summary><p>{fr?'Sélection issue de RESSOURCES_ENSIIE.md, collecte du 16/10/2026.':'Selected from RESSOURCES_ENSIIE.md, collected on 16 Oct 2026.'} {r.evidence!=='public-page'?(fr?'Référence institutionnelle ; ouverture directe ou usage authentifié non vérifiés.':'Institutional reference; direct access or authenticated use not verified.'):(fr?'Page publique signalée comme consultée dans la collecte.':'Public page recorded as consulted in the collection.')} {fr?'Une ressource en ligne ne prouve ni les horaires ni l’accès physique à un service.':'An online resource does not establish opening hours or physical access to a service.'}</p></details>
  </article>)}</div>
  {!results.length&&<p>{fr?'Aucun résultat. Essayez un autre mot ou élargissez les filtres.':'No results. Try another term or broaden the filters.'}<button type="button" className="ghost" onClick={()=>{setQuery('');setAudience('all');setCategory('all');}}>{fr?'Effacer les filtres':'Clear filters'}</button></p>}
 </dialog>;
}
