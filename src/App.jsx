import { useEffect, useMemo, useState, useRef, lazy, Suspense, useCallback } from "react";
import SimulationView from './components/SimulationView.jsx';
import { STRINGS, TYPE_LABEL } from "./i18n.js";
import LostAssistant from "./components/LostAssistant.jsx";
import {
  ACTIVITY_COLORS,
  parseHash,
  roomDesc,
  roomName,
  searchRooms,
  setHash,
} from './core.js';
import Map2D from './components/Map2D.jsx';
const Map3D=lazy(()=>import('./components/Map3D.jsx'));
const Walkthrough=lazy(()=>import('./components/Walkthrough.jsx'));
import {routeProgress} from './guidance.js';
import RouteGuide from './components/RouteGuide.jsx';
import VisitTools from './components/VisitTools.jsx';
import QuickHelp from './components/QuickHelp.jsx';
import {useSaved} from './preferences.js';
import GeometryEditor from './components/GeometryEditor.jsx';
import RoomDetailsEditor from './components/RoomDetailsEditor.jsx';
import RoomPracticalInfo from './components/RoomPracticalInfo.jsx';
import {ROOM_DETAILS_KEY,validateRoomDetails,applyRoomDetails} from './roomDetails.js';
import {GEOMETRY_KEY,validateGeometry} from './drawnGeometry.js';
import MetroMap from './components/MetroMap.jsx';
import Constellation from './components/Constellation.jsx';
import Dashboard from './components/Dashboard.jsx';
import AdventureView from './components/AdventureView.jsx';
import CalibrationTool from './components/CalibrationTool.jsx';
import { CALIBRATION_KEY, calibratedScene, validateCalibration, solveCalibration } from './calibration.js';
import projectCalibration from '../ensiie-control-points.json';
import projectGeometry from '../data-src/drawn-geometry.json';

const ACTIVITIES = ["teaching", "research", "student_life", "companies"];
const LEVELS = ["RDC", "R+1", "R+2"];
const TYPES = Object.keys(TYPE_LABEL.fr);
const DATA_KEYS = [
  "rooms",
  "floors",
  "links",
  "graph",
  "tours",
  "metro",
  "synonyms",
  "zones",
  "resources",
  "walls",
  "doors",
];

async function loadDataset() {
  try {
    const r = await fetch("/api/bootstrap");
    if (r.ok) {const data=await r.json();const [walls,doors]=await Promise.all(['walls','doors'].map(async name=>{const response=await fetch(`/data/${name}.json`);if(!response.ok)throw Error(name);return response.json();}));return {...data,walls,doors};}
  } catch {
    /* fall through to static JSON */
  }
  const entries = await Promise.all(
    DATA_KEYS.map(async (key) => {
      const r = await fetch(`/data/${key}.json`);
      if (!r.ok) throw new Error(key);
      return [key, await r.json()];
    }),
  );
  return Object.fromEntries(entries);
}

export default function App() {
  const [roomHistory,setRoomHistory]=useSaved('ensiie-room-history',[],v=>Array.isArray(v)&&v.length<=20);
  const [roomDetails,setRoomDetails]=useState({version:1,rooms:{}}),[editingRoomId,setEditingRoomId]=useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lang, setLang] = useSaved("ensiie-lang", "fr", v=>["fr","en"].includes(v));
  const [view, setView] = useState("guide");
  const lastPosition=useRef(null),routingWorker=useRef(null),routeRequest=useRef(0),walkRequests=useRef(new Map()),walkRequestId=useRef(0);
  const [route,setRoute]=useState(null),[routeStatus,setRouteStatus]=useState('idle');
  const [playerPosition,setPlayerPosition]=useState(null);
  const [mode, setMode] = useState("map2d");
  const [persona, setPersona] = useSaved("ensiie-persona", "student", v=>["student","visitor","company"].includes(v));
  const [level, setLevel] = useState("RDC");
  const [acts, setActs] = useState(() => new Set(ACTIVITIES));
  const [typeFilter, setTypeFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [startId, setStartId] = useState(null);
  const [endId, setEndId] = useState(null);
  const [stepFree, setStepFree] = useState(false);
  const [aligned, setAligned] = useState(true);
  const [explode, setExplode] = useState(true);
  const [tourId, setTourId] = useSaved("ensiie-tour-id", null, v=>typeof v==="string");
  const [tourStep, setTourStep] = useSaved("ensiie-tour-step", 0, v=>Number.isInteger(v)&&v>=0);
  const [tourPaused,setTourPaused]=useSaved('ensiie-tour-paused',false,v=>typeof v==='boolean');
  const [discovered,setDiscovered]=useSaved('ensiie-discovered-rooms',[],v=>Array.isArray(v)&&v.every(x=>typeof x==='string'));
  const [favorites,setFavorites]=useSaved('ensiie-favorites',[],v=>Array.isArray(v)&&v.every(x=>typeof x==='string'));
  const [recents,setRecents]=useSaved('ensiie-recents',[],v=>Array.isArray(v)&&v.every(x=>typeof x==='string'));
  const [settings,setSettings]=useSaved('ensiie-settings',{reducedMotion:false,sensitivity:.004,cameraDistance:3.5,invertY:false,quality:'auto',outfit:'#347b91'},v=>v&&typeof v.reducedMotion==='boolean'&&v.sensitivity>=.001&&v.sensitivity<=.01&&v.cameraDistance>=1&&v.cameraDistance<=6&&typeof v.invertY==='boolean'&&['auto','low','high'].includes(v.quality)&&/^#[0-9a-f]{6}$/i.test(v.outfit));
  const [helpOpen,setHelpOpen]=useState(false),[audit,setAudit]=useState(null),[auditStatus,setAuditStatus]=useState('idle');
  const auditWorker=useRef(null),[virtualStart,setVirtualStart]=useState(null);
  const [openSearch, setOpenSearch] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const [showGeometryEditor,setShowGeometryEditor]=useState(false);
  const [drawnGeometry,setDrawnGeometry]=useState(null);
  const [calibration, setCalibration] = useState(null);
  const sceneData = useMemo(() => data ? calibratedScene(data.floors, data.links, calibration) : null, [data, calibration]);
  const [lostOpen, setLostOpen] = useState(false);

  const t = STRINGS[lang];

  useEffect(() => {
    let cancelled = false;
    loadDataset()
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setDrawnGeometry(validateGeometry(projectGeometry,d.floors,d.rooms));
        try {
          const revisionKey=GEOMETRY_KEY+'-project-revision';
          if(localStorage.getItem(revisionKey)!==projectGeometry.project_revision){
            // Keep pre-adoption browser work recoverable while adopting the exported model.
            for(const key of [GEOMETRY_KEY,GEOMETRY_KEY+'-draft']){
              const previous=localStorage.getItem(key);
              if(previous)localStorage.setItem(key+'-before-project',previous);
              localStorage.setItem(key,JSON.stringify(projectGeometry));
            }
            localStorage.setItem(revisionKey,projectGeometry.project_revision);
          }
          const saved=JSON.parse(localStorage.getItem(GEOMETRY_KEY));
          if(saved)setDrawnGeometry(validateGeometry(saved,d.floors,d.rooms));
        } catch { /* Keep the generated scene if local drawings are unavailable. */ }
        let restoredCalibration = null;
        try {
          const saved = JSON.parse(localStorage.getItem(CALIBRATION_KEY));
          if (saved) {
            const checked = validateCalibration(saved, d.floors);
            if (solveCalibration(checked).ready) restoredCalibration = checked;
          }
        } catch { /* A missing or outdated calibration must never prevent loading. */ }
        if (!restoredCalibration) {
          try {
            const checked = validateCalibration(projectCalibration, d.floors);
            if (solveCalibration(checked).ready) restoredCalibration = checked;
          } catch { /* Invalid project marks leave the original plan alignment available. */ }
        }
        if (restoredCalibration) setCalibration(restoredCalibration);
        const h = parseHash();
        const initialRoom=d.rooms.find(r=>r.id===(h.fromId||h.roomId));
        if(initialRoom){const p={floor:initialRoom.level,x:initialRoom.centroid[0],y:initialRoom.centroid[1],yaw:0,pitch:0};lastPosition.current=p;setPlayerPosition(p);setLevel(initialRoom.level);}
        if (h.view === "adventure") setView("adventure");
        if (h.roomId) {
          setSelectedId(h.roomId);
          const rm = d.rooms.find((x) => x.id === h.roomId);
          if (rm) setLevel(rm.level);
        }
        if (h.fromId && h.toId) {
          setStartId(h.fromId);
          setEndId(h.toId);
          setSelectedId(h.toId);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(()=>{if(!data)return;try{const saved=JSON.parse(localStorage.getItem(ROOM_DETAILS_KEY));if(saved)setRoomDetails(validateRoomDetails(saved,data.rooms));}catch{/* Invalid local metadata never blocks the building. */}},[data]);
  const rooms=useMemo(()=>applyRoomDetails(data?.rooms||[],roomDetails),[data,roomDetails]);
  const selected = rooms.find((r) => r.id === selectedId) || null;

  // Un type choisi prime sur les catégories ; sinon filtrage par activité.
  const filtered = useMemo(() => {
    return rooms.filter((room) => {
      const matchType = typeFilter === "all" || room.type === typeFilter;

      const matchActivity =
        acts.size === 0 ||
        !room.activities?.length ||
        room.activities.some((activity) => acts.has(activity));

      return matchType && matchActivity;
    });
  }, [rooms, acts, typeFilter]);

  const hits = useMemo(
    () => (query.trim() ? searchRooms(query, rooms, data?.synonyms, lang) : []),
    [query, rooms, data, lang],
  );

  useEffect(()=>{
    if(!data||!sceneData)return;
    const worker=new Worker(new URL('./routing.worker.js',import.meta.url),{type:'module'});routingWorker.current=worker;
    worker.onmessage=({data:result})=>{if(walkRequests.current.has(result.id)){walkRequests.current.get(result.id)(result.route);walkRequests.current.delete(result.id);return;}if(result.id!==routeRequest.current)return;setRoute(result.route);setRouteStatus(result.error?'error':result.route?'ready':'unreachable');};
    worker.onerror=()=>{for(const resolve of walkRequests.current.values())resolve(null);walkRequests.current.clear();setRoute(null);setRouteStatus('error');};
    worker.postMessage({type:'init',input:{rooms:data.rooms,walls:data.walls,doors:data.doors,floors:sceneData.floors,links:sceneData.links,geometry:drawnGeometry}});
    return()=>{worker.terminate();routingWorker.current=null;for(const resolve of walkRequests.current.values())resolve(null);walkRequests.current.clear();};
  },[data,sceneData,drawnGeometry]);
  useEffect(()=>{
    const id=++routeRequest.current;setRoute(null);
    if((!startId&&!virtualStart)||!endId||!routingWorker.current){setRouteStatus('idle');return;}
    if(stepFree&&rooms.find(r=>r.id===endId)?.accessible===false){setRouteStatus('unreachable');return;}
    setRouteStatus('routing');routingWorker.current.postMessage({type:'route',id,from:virtualStart?null:startId,to:endId,stepFree,startPosition:virtualStart});
  },[data,sceneData,drawnGeometry,startId,endId,stepFree,roomDetails,virtualStart]);

  useEffect(() => {
    if (!data) return;
    setHash({ view, roomId: selectedId, fromId: startId, toId: endId });
  }, [view, selectedId, startId, endId, data]);

  function selectRoom(id) {
    const room = rooms.find((r) => r.id === id);
    if (!room) return;
    setSelectedId(id);
    setLevel(room.level);
    setOpenSearch(false);
    setQuery("");
  }
  function closeRoomDetails() {
    setSelectedId(null);
    // Closing information must not discard an itinerary shared with immersion.
    if(!startId&&!endId)window.history.replaceState(null,'',window.location.pathname+window.location.search);
  }

  function startTour(id) {
    const tour = data.tours.find((x) => x.id === id);
    if (!tour?.steps?.length) return;
    setTourId(id);
    setTourPaused(false);
    setTourStep(0);
    const first = tour.steps[0].roomId;
    selectRoom(first);
    setEndId(first);
    if(!startId)setStartId("RDC-011");
  }

  useEffect(() => {
    if (!tourId || !data || tourPaused) return;
    const tour = data.tours.find((x) => x.id === tourId);
    const step = tour?.steps[tourStep];
    if (!step?.roomId) return;
    const room = data.rooms.find((r) => r.id === step.roomId);
    if (!room) return;
    setSelectedId(room.id);
    setLevel(room.level);
    setEndId(room.id);
  }, [tourId, tourStep, data, tourPaused]);

  useEffect(()=>{setAudit(null);setAuditStatus('idle');auditWorker.current?.terminate();return()=>auditWorker.current?.terminate();},[data,sceneData,drawnGeometry]);
  useEffect(()=>{if(endId)setRecents(prev=>[endId,...prev.filter(id=>id!==endId)].slice(0,8));},[endId]);
  useEffect(()=>{document.documentElement.lang=lang;},[lang]);
  useEffect(()=>{document.documentElement.dataset.reducedMotion=String(settings.reducedMotion);},[settings.reducedMotion]);
  useEffect(()=>{
    const sync=()=>{const h=parseHash();setView(h.view);setSelectedId(h.roomId||h.toId);setStartId(h.fromId);setEndId(h.toId);setVirtualStart(null);const r=rooms.find(r=>r.id===(h.roomId||h.toId));if(r)setLevel(r.level);};
    window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync);
  },[rooms]);
  const offRoute=mode==='walk'&&route&&playerPosition&&!playerPosition.stairLink&&routeProgress(route,playerPosition)?.offRoute;
  useEffect(()=>{
    if(mode!=='walk'||!route||!endId||!playerPosition||playerPosition.stairLink||routeStatus==='routing')return;
    if(!routeProgress(route,playerPosition)?.offRoute)return;
    const timer=setTimeout(()=>setVirtualStart({...lastPosition.current}),900);
    return()=>clearTimeout(timer);
  },[mode,route,endId,!!offRoute,routeStatus]);
  const requestRoomRoute=useCallback((from,to)=>{if(!routingWorker.current)return Promise.resolve(null);const id='walk-'+(++walkRequestId.current);return new Promise(resolve=>{walkRequests.current.set(id,resolve);routingWorker.current.postMessage({type:'route',id,from,to,stepFree:false});});},[]);
  function runAudit(){
    auditWorker.current?.terminate();const worker=new Worker(new URL('./routing.worker.js',import.meta.url),{type:'module'});auditWorker.current=worker;setAuditStatus('running');
    worker.onmessage=({data:r})=>{if(r.error)setAuditStatus('error');else if(r.audit){setAudit(r.audit);setAuditStatus('ready');}worker.terminate();};
    worker.onerror=()=>{setAuditStatus('error');worker.terminate();};
    worker.postMessage({type:'init',input:{rooms,walls:data.walls,doors:data.doors,floors:sceneData.floors,links:sceneData.links,geometry:drawnGeometry}});
    worker.postMessage({type:'audit',id:'quality-audit',rooms,origins:{RDC:'RDC-011','R+1':'R+1-131'}});
  }
  if (error) return <div className="error" role="alert">{t.error}<p>{lang==='fr'?'Vérifiez le serveur local et les fichiers de données.':'Check the local server and data files.'}</p><button className="primary" onClick={()=>location.reload()}>{lang==='fr'?'Réessayer':'Retry'}</button></div>;
  if (!data) return <div className="loading">{t.loading}</div>;

  const personaStart = {
    student: rooms.find((r) => r.id === "R+2-accueil")?.id,
    visitor: rooms.find((r) => /cabanes/i.test(r.designation_plan || ""))?.id,
    company: rooms.find((r) => r.number === "216")?.id,
  };

  const currentTour = data.tours.find((x) => x.id === tourId && x.steps[tourStep]);
  const mapProps={accessibilityLens:!!settings.accessibilityLens,onEditRoom:room=>setEditingRoomId(room.id),onLocatePosition:setLevel,rooms,activeActivities:acts,typeFilter,floors:data.floors,links:sceneData.links,zones:data.zones,level,selectedId,startId,endId,route,routeStatus,onSelect:selectRoom,synonyms:data.synonyms,onClearSelection:closeRoomDetails,
    onUseAsStart:id=>{setVirtualStart(null);setStartId(id);if(id===endId)setEndId(null);},
    onUseAsEnd:id=>{setEndId(id);if(id===startId)setStartId(null);},
    onClearRoute:()=>{setVirtualStart(null);setStartId(null);setEndId(null);},onSwapRoute:()=>{setVirtualStart(null);setStartId(endId);setEndId(startId);},lang};
  function enterRoom(room){const p={floor:room.level,x:room.centroid[0],y:room.centroid[1],yaw:lastPosition.current?.yaw||0,pitch:0};lastPosition.current=p;setPlayerPosition(p);setLevel(room.level);setMode('walk');}
  function updatePosition(p,final=false){lastPosition.current=p;setPlayerPosition(p);}
  function requestWalkRoute(position,to,stepFree){if(stepFree&&rooms.find(r=>r.id===to)?.accessible===false)return Promise.resolve(null);if(!routingWorker.current)return Promise.resolve(null);const id=`walk-${++walkRequestId.current}`;return new Promise(resolve=>{walkRequests.current.set(id,resolve);routingWorker.current.postMessage({type:'route',id,from:null,to,stepFree,startPosition:position});});}
  function switchMode(next){if(next==='map2d'&&lastPosition.current){setPlayerPosition(lastPosition.current);setLevel(lastPosition.current.floor);}setMode(next);}


  const tourRoom=rooms.find(r=>r.id===currentTour?.steps[tourStep]?.roomId);
  const tourReached=!!(tourRoom&&playerPosition?.floor===tourRoom.level&&Math.hypot(playerPosition.x-tourRoom.centroid[0],playerPosition.y-tourRoom.centroid[1])<1.5);
  function advanceTour(){if(!currentTour)return;if(tourStep+1>=currentTour.steps.length){setTourId(null);setTourStep(0);}else setTourStep(tourStep+1);}
  return (
    <div className="app">
      <a className="skip-link" href="#main-content" onClick={e=>{e.preventDefault();document.getElementById("main-content")?.focus();}}>{lang==='fr'?'Aller au contenu':'Skip to content'}</a>
      <header className="topbar">
        <div className="brand">
          <img src="/logo.png" alt="EnsiiExplore" className="brand-logo" />
          <div className="brand-text">
            <h1>EnsiiExplore</h1>
            <p>Explore l’ensIIE</p>
          </div>
        </div>
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            value={query}
            aria-label={t.search}
            onKeyDown={e=>{if(e.key==='Escape')setOpenSearch(false);if(e.key==='Enter'&&hits.length===1)selectRoom(hits[0].id);}}
            placeholder={t.search}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpenSearch(true);
            }}
            onFocus={() => setOpenSearch(true)}
          />
          {openSearch && query && (
            <div className="search-results">
              {hits.length === 0 && (
                <div role="status">{t.emptySearch}<p>{lang==='fr'?'Essayez un numéro de salle, un nom ou un étage.':'Try a room number, name or floor.'}</p><button type="button" onClick={()=>{setQuery('');setActs(new Set(ACTIVITIES));setTypeFilter('all');setOpenSearch(false);}}>{lang==='fr'?'Effacer et réinitialiser les filtres':'Clear and reset filters'}</button></div>
              )}
              {hits.map((r) => (
                <div className="search-hit" key={r.id}><button
                  key={r.id}
                  type="button"
                  onClick={() => selectRoom(r.id)}
                >
                  {roomName(r, lang)}
                  <br />
                  <small>
                    {r.level} · {TYPE_LABEL[lang][r.type]} ·{" "}
                    {r.area_plan_m2 ?? "—"} m²
                  </small>
                </button><button type="button" onClick={()=>{selectRoom(r.id);setEndId(r.id);if(!startId)setStartId('RDC-011');}}>{lang==='fr'?'Itinéraire':'Route'}</button></div>
              ))}
            </div>
          )}
        </div>
        <div className="topbar-right">
          <div className="seg">
            <button
              className={view === "guide" ? "active" : ""}
              onClick={() => setView("guide")}
            >
              {t.guide}
            </button>
            <button
              className={view === "adventure" ? "active" : ""}
              onClick={() => setView("adventure")}
            >
              {t.adventure}
            </button>
          </div>
          <div className="pills">
            {["student", "visitor", "company"].map((p) => (
              <button
                key={p}
                className={`pill ${persona === p ? "active" : ""}`}
                onClick={() => {
                  setPersona(p);
                  if (personaStart[p]) setStartId(personaStart[p]);
                }}
              >
                {t[p]}
              </button>
            ))}
          </div>
          <button
            className="lang pill"
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
          >
            {lang === "fr" ? "FR | en" : "fr | EN"}
          </button>
        </div>
      </header>

      {helpOpen&&<QuickHelp lang={lang} onClose={()=>setHelpOpen(false)}/>}
      {editingRoomId&&rooms.find(r=>r.id===editingRoomId)&&<RoomDetailsEditor key={editingRoomId} room={rooms.find(r=>r.id===editingRoomId)} baseRooms={data.rooms} details={roomDetails} lang={lang} onClose={()=>setEditingRoomId(null)} onSave={next=>{const checked=validateRoomDetails(next,data.rooms);try{localStorage.setItem(ROOM_DETAILS_KEY,JSON.stringify(checked));}catch{throw Error('storage');}setRoomHistory(prev=>[roomDetails,...prev].slice(0,20));setRoomDetails(checked);}}/>}
      {showGeometryEditor&&<GeometryEditor floors={data.floors} rooms={rooms} selected={selected} lang={lang} applied={drawnGeometry} onClose={()=>setShowGeometryEditor(false)} onApply={value=>{
        setDrawnGeometry(value);
        try{localStorage.setItem(GEOMETRY_KEY,JSON.stringify(value));}catch{/* The current preview still works. */}
        setShowGeometryEditor(false);setMode('walk');setView('guide');
      }} onRestore={()=>{
        setDrawnGeometry(null);
        try{localStorage.removeItem(GEOMETRY_KEY);}catch{/* The current preview still resets. */}
        setShowGeometryEditor(false);setMode('walk');
      }}/>}

      {showCalibration && <CalibrationTool floors={data.floors} lang={lang} applied={calibration} onClose={() => setShowCalibration(false)} onApply={(draft) => {
        setCalibration(draft);
        try { localStorage.setItem(CALIBRATION_KEY, JSON.stringify(draft)); } catch { /* Session preview still works. */ }
        setAligned(true); setMode('map3d'); setView('guide'); setShowCalibration(false);
      }} />}

      {view === 'adventure' ? (
        <AdventureView discovered={discovered} onDiscover={ids=>setDiscovered(prev=>ids.every(id=>prev.includes(id))?prev:[...new Set([...prev,...ids])])} persona={persona} onPosition={p=>{lastPosition.current=p;setPlayerPosition(p);}} onSelect={id=>{selectRoom(id);setView('guide');setMode('map2d');}} onGuide={id=>{selectRoom(id);setView('guide');setMode('map2d');setEndId(id);if(!startId)setStartId('RDC-011');}} t={t} lang={lang} selected={selected} level={level} rooms={rooms} />
      ) : (
        <div className={`workspace modern-workspace mode-${mode} ${selected?'has-selection':'no-selection'}`}>
          <aside
            className={`left modern-filters ${filtersOpen ? "is-open" : ""}`}
          >
            <button
              className="filters-close"
              onClick={() => setFiltersOpen(false)}
            >
              {lang==='fr'?'× Fermer les filtres':'× Close filters'}
            </button>
            <div className="section-title">{t.filters}</div>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setActs(new Set(ACTIVITIES));
                setTypeFilter("all");
              }}
            >
              {lang === "fr" ? "Réinitialiser les filtres" : "Reset filters"}
            </button>
            {ACTIVITIES.map((a) => (
              <button
                key={a}
                className={`filter-row ${acts.has(a) ? "" : "off"}`}
                onClick={() => {
                  const n = new Set(acts);
                  if (n.has(a)) n.delete(a);
                  else n.add(a);
                  setActs(n);
                }}
              >
                <span
                  className="dot"
                  style={{ background: ACTIVITY_COLORS[a] }}
                />
                {t[a]}
              </button>
            ))}
            <div className="section-title">{t.types}</div>
            <select
              className="type-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">{t.allTypes}</option>
              {TYPES.map((tp) => (
                <option key={tp} value={tp}>
                  {TYPE_LABEL[lang][tp]}
                </option>
              ))}
            </select>
            <div className="section-title">{t.floors}</div>
            <div className="floor-list">
              {LEVELS.map((lv) => (
                <button
                  key={lv}
                  className={level === lv ? "active" : ""}
                  onClick={() => {
                    setLevel(lv);
                    setMode("map2d");
                    setFiltersOpen(false);
                  }}
                >
                  {data.floors.levels[lv][`label_${lang}`]}
                  <div className="hint">
                    {rooms.filter((r) => r.level === lv).length} {t.rooms}
                  </div>
                </button>
              ))}
            </div>
            <div className="section-title">{t.tours}</div>
            <div className="tour-list">
              {data.tours.map((tour) => (
                <button
                  key={tour.id}
                  className={tourId === tour.id ? "active" : ""}
                  onClick={() => startTour(tour.id)}
                >
                  {lang === "en" ? tour.title_en : tour.title_fr}
                </button>
              ))}
            </div>
            <div className="section-title">{t.resources}</div>
            {data.resources.map((res) =>
              res.href ? (
                <a
                  key={res.id}
                  href={res.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hint"
                  style={{
                    display: "block",
                    color: "var(--accent-2)",
                    marginBottom: 6,
                  }}
                >
                  {lang === "en" ? res.label_en : res.label_fr}
                </a>
              ) : (
                <div key={res.id} className="hint">
                  {lang === "en" ? res.label_en : res.label_fr}
                </div>
              ),
            )}
          </aside>

          <main className="center" id="main-content" tabIndex={-1}>
            <div className="toolbar">
              <button
                className="ghost filters-toggle"
                onClick={() => setFiltersOpen((v) => !v)}
              >
                {lang==='fr'?'☰ Filtres et étages':'☰ Filters and floors'}
              </button>
              <div className="seg">
                {[
                  ['map2d', t.map2d],
                  ['map3d', t.map3d],
                  ['walk', lang === 'fr' ? 'Visite immersive' : 'First-person visit'],
                  ['metro', t.metro],
                  ['constellation', t.constellation],
                  ['quality', t.quality], ['simulation', 'Simulation']
                ].map(([id, label]) => (
                  <button
                    key={id}
                    className={mode === id ? "active" : ""}
                    onClick={() => switchMode(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {mode === "map3d" && (
                <>
                  <button
                    className={`pill ${aligned ? "active" : ""}`}
                    onClick={() => setAligned((v) => !v)}
                  >
                    {aligned ? t.aligned : t.raw}
                  </button>
                  <button
                    className={`pill ${explode ? "active" : ""}`}
                    onClick={() => setExplode((v) => !v)}
                  >
                    {explode ? t.explode : t.compact}
                  </button>
                </>
              )}
              {(mode==='map3d'||mode==='walk')&&<>
              <button className="ghost" onClick={() => setShowCalibration(true)}>{lang === 'fr' ? 'Aligner les étages' : 'Align floors'}</button>
              <button className="ghost" onClick={()=>setShowGeometryEditor(true)}>{lang==='fr'?'Dessiner murs / portes':'Draw walls / doors'}{drawnGeometry?' ●':''}</button>
              {calibration && <button className="ghost" onClick={() => {
                setCalibration(null);
                try { localStorage.removeItem(CALIBRATION_KEY); } catch { /* Session reset still works. */ }
              }}>{lang === 'fr' ? 'Annuler le calibrage' : 'Reset calibration'}</button>}
              </>}
              <label className="hint" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="checkbox" checked={stepFree} onChange={(e) => setStepFree(e.target.checked)} />
                {t.stepFree}
              </label>
              <div className="spacer" />
              <button
                type="button"
                className="ghost"
                onClick={() => setLostOpen(true)}
              >
                🧭 {t.imLost}
              </button>
            </div>

            <div className="visit-tools-row">{roomHistory.length>0&&<button className="ghost" onClick={()=>{try{const previous=validateRoomDetails(roomHistory[0],data.rooms);localStorage.setItem(ROOM_DETAILS_KEY,JSON.stringify(previous));setRoomDetails(previous);setRoomHistory(roomHistory.slice(1));}catch{setRoomHistory([]);}}}>{lang==='fr'?'Annuler la dernière modification des fiches':'Undo last room edit'}</button>}
            <VisitTools discovered={discovered} onDiscover={id=>setDiscovered(prev=>prev.includes(id)?prev:[...prev,id])} rooms={rooms} selected={selected} lang={lang} favorites={favorites} recents={recents} onFavorite={id=>setFavorites(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id])} onSelect={selectRoom} onLocate={id=>{setVirtualStart(null);setStartId(id);}} onTutorial={()=>setHelpOpen(true)} settings={settings} onSettings={setSettings} tour={currentTour&&tourRoom?{title:currentTour['title_'+lang],index:tourStep,total:currentTour.steps.length,text:currentTour.steps[tourStep]['text_'+lang],verified:!!tourRoom.verified_on_site,paused:tourPaused,arrived:tourReached}:null} onPause={()=>setTourPaused(!tourPaused)} onPrevious={()=>setTourStep(s=>Math.max(0,s-1))} onAdvance={advanceTour} onStop={()=>{setTourId(null);setTourStep(0);}}/></div>
            {mode === "map2d" && (
              <Map2D {...mapProps} position={playerPosition} onVisit={enterRoom}/>
            )}
            {mode === "map3d" && (
              <Suspense fallback={<p role="status">{t.loading}</p>}><Map3D
                onFloorChange={setLevel}
                onCompactRequest={() => setExplode(false)}
                lang={lang}
                onOpen2D={(floor) => { setLevel(floor); setMode('map2d'); }}
                rooms={filtered}
                floors={sceneData.floors}
                links={sceneData.links}
                zones={data.zones}
                selectedId={selectedId}
                route={route}
                aligned={aligned}
                explode={explode}
                onSelect={selectRoom}
              /></Suspense>
            )}
            {mode === 'walk' && <Suspense fallback={<p role="status">{t.loading}</p>}><Walkthrough onGuidancePlan={setRoute} settings={settings} geometry={drawnGeometry} rooms={rooms} floors={sceneData.floors} links={sceneData.links} selected={selected} lang={lang} requestRoute={requestWalkRoute} mapProps={mapProps} initialPosition={lastPosition.current} onPositionChange={updatePosition} route={route} destination={rooms.find(r=>r.id===endId)} stepFree={stepFree} onOverview={() => switchMode('map2d')} onFloorChange={setLevel} /></Suspense>}
            {mode === 'metro' && (
              <MetroMap onRoute={id=>{setEndId(id);if(!startId)setStartId('RDC-011');selectRoom(id);setMode('map2d');}} metro={data.metro} rooms={rooms} selectedId={selectedId} onSelect={selectRoom} lang={lang} />
            )}
            {mode === "constellation" && (
              <Constellation lang={lang} onActivity={id=>setActs(new Set(id?[id]:ACTIVITIES))} onRoute={id=>{setEndId(id);if(!startId)setStartId('RDC-011');selectRoom(id);setMode('map2d');}}
                rooms={rooms}
                selectedId={selectedId}
                onSelect={selectRoom}
                t={t}
              />
            )}
            {mode==='simulation'&&<SimulationView lang={lang} floors={data.floors} requestRoute={requestRoomRoute}/>}
            {mode === "quality" && (
              <Dashboard rooms={rooms} t={t} lang={lang} audit={audit} auditStatus={auditStatus} onAudit={runAudit} onSelect={id=>{selectRoom(id);setMode("map2d");}} calibration={calibration}/>
            )}

            <div className="route-bar" aria-live="polite">
              <span className="hint">
                {(startId||virtualStart)&&endId
                  ? (lang==='fr'?'Départ':'Start')+' : '+(virtualStart?(lang==='fr'?'position virtuelle':'virtual position'):(rooms.find(r=>r.id===startId)?.number||startId))+' → '+(rooms.find(r=>r.id===endId)?.number||endId)+' · '+(route?route.metres+' m · '+route.minutes+' min · '+(lang==='fr'?'estimations du modèle':'model estimates'):routeStatus==='routing'?(lang==='fr'?'Calcul en cours…':'Calculating…'):(lang==='fr'?'Aucun passage trouvé dans le modèle actuel.':'No passage found in the current model.'))
                  : lang==='fr'?'Choisissez un départ et une destination.':'Choose a start and a destination.'}
              </span>
              <RouteGuide route={route} position={mode==='walk'?playerPosition:null} lang={lang} onResume={()=>{if(lastPosition.current)setVirtualStart({...lastPosition.current});}}/>
              {route&&stepFree&&<span className="badge">{t.stepFree}</span>}
            </div>
          </main>

          <aside className="right legacy-room-panel">
            {selected ? (
              <div className="sheet">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    className={`badge ${selected.verified_on_site ? "ok" : "warn"}`}
                  >
                    {selected.verified_on_site ? t.verified : t.unverified}
                  </span>

                  <button
                    type="button"
                    className="ghost"
                    onClick={closeRoomDetails}
                    aria-label="Fermer"
                  >
                    ✕
                  </button>
                </div>

                <h2>{roomName(selected, lang)}</h2>
                <div className="sub">
                  {selected.level} · {TYPE_LABEL[lang][selected.type]} ·{" "}
                  {t.fromPlan}
                </div>
                <div className="tags">
                  {selected.activities.map((a) => (
                    <span
                      key={a}
                      className="tag"
                      style={{ background: ACTIVITY_COLORS[a] + "33" }}
                    >
                      {t[a]}
                    </span>
                  ))}
                  <span className="tag">
                    {selected.reliable ? t.reliable : t.doubtful}
                  </span>
                </div>
                <p>{roomDesc(selected, lang)}</p>
                <RoomPracticalInfo room={selected} lang={lang}/>
                <button className="ghost" onClick={()=>setEditingRoomId(selected.id)}>{lang==='fr'?'Modifier les informations':'Edit room information'}</button>
                {selected.programme_plan && (
                  <p className="hint">{selected.programme_plan}</p>
                )}
                <div className="meta">
                  <div>
                    <small>{t.area}</small>
                    {selected.area_plan_m2 ?? "—"} m²
                  </div>
                  <div>
                    <small>{t.capacity}</small>
                    {selected.capacity!=null?selected.capacity:selected.capacity_estimated
                      ? `${t.estimated} ${selected.capacity_estimated}`
                      : t.unknown}
                  </div>
                  <div>
                    <small>{t.reliability}</small>
                    {selected.contour_quality}
                  </div>
                  <div>
                    <small>PMR</small>
                    {selected.accessible === true ? "oui" : t.unknown}
                  </div>
                </div>
                <div className="actions">
                  <button
                    className="primary"
                    onClick={() => setStartId(selected.id)}
                  >
                    {t.useAsStart}
                  </button>
                  <button
                    className="ghost"
                    onClick={() => {
                      setEndId(selected.id);
                      if (!startId && personaStart[persona])
                        setStartId(personaStart[persona]);
                    }}
                  >
                    {t.useAsEnd}
                  </button>
                </div>
                <p className="deeplink">
                  {t.deeplink}: #/room/{selected.id}
                </p>
                <p className="hint">{t.simulation}</p>
              </div>
            ) : (
              <p className="hint">{t.pickStart}</p>
            )}
          </aside>
        </div>
      )}
      {lostOpen && (
        <LostAssistant
          rooms={rooms} lang={lang} position={playerPosition} onVirtualNavigate={room=>{setEndId(room.id);setSelectedId(room.id);setVirtualStart({...lastPosition.current});setView('guide');}}
          onClose={() => setLostOpen(false)}
          onNavigate={(origin, destination) => {
            setView("guide");
            setMode("map2d");
            setLevel(origin.level);

            setVirtualStart(null);setStartId(origin.id);
            setEndId(destination.id);
            setSelectedId(destination.id);
          }}
        />
      )}
    </div>
  );
}
