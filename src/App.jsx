import { useEffect, useMemo, useState, useRef } from "react";
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
import Map3D from './components/Map3D.jsx';
import Walkthrough from './components/Walkthrough.jsx';
import GeometryEditor from './components/GeometryEditor.jsx';
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
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState("fr");
  const [view, setView] = useState("guide");
  const lastPosition=useRef(null),routingWorker=useRef(null),routeRequest=useRef(0),walkRequests=useRef(new Map()),walkRequestId=useRef(0);
  const [route,setRoute]=useState(null),[routeStatus,setRouteStatus]=useState('idle');
  const [playerPosition,setPlayerPosition]=useState(null);
  const [mode, setMode] = useState("map2d");
  const [persona, setPersona] = useState("student");
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
  const [tourId, setTourId] = useState(null);
  const [tourStep, setTourStep] = useState(0);
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

  const rooms = data?.rooms || [];
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
    if(!startId||!endId||!routingWorker.current){setRouteStatus('idle');return;}
    setRouteStatus('routing');routingWorker.current.postMessage({type:'route',id,from:startId,to:endId,stepFree});
  },[data,sceneData,drawnGeometry,startId,endId,stepFree]);

  useEffect(() => {
    if (!selectedId) return;
    setHash({ view, roomId: selectedId, fromId: startId, toId: endId });
  }, [view, selectedId, startId, endId]);

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
    setTourStep(0);
    const first = tour.steps[0].roomId;
    selectRoom(first);
    setEndId(first);
  }

  useEffect(() => {
    if (!tourId || !data) return;
    const tour = data.tours.find((x) => x.id === tourId);
    const step = tour?.steps[tourStep];
    if (!step?.roomId) return;
    const room = data.rooms.find((r) => r.id === step.roomId);
    if (!room) return;
    setSelectedId(room.id);
    setLevel(room.level);
    setEndId(room.id);
  }, [tourId, tourStep, data]);

  if (error) return <div className="error">{t.error}</div>;
  if (!data) return <div className="loading">{t.loading}</div>;

  const personaStart = {
    student: rooms.find((r) => r.id === "R+2-accueil")?.id,
    visitor: rooms.find((r) => /cabanes/i.test(r.designation_plan || ""))?.id,
    company: rooms.find((r) => r.number === "216")?.id,
  };

  const currentTour = data.tours.find((x) => x.id === tourId);
  const mapProps={onLocatePosition:setLevel,rooms,activeActivities:acts,typeFilter,floors:data.floors,links:sceneData.links,zones:data.zones,level,selectedId,startId,endId,route,routeStatus,onSelect:selectRoom,synonyms:data.synonyms,onClearSelection:closeRoomDetails,
    onUseAsStart:id=>{setStartId(id);if(id===endId)setEndId(null);},
    onUseAsEnd:id=>{setEndId(id);if(id===startId)setStartId(null);},
    onClearRoute:()=>{setStartId(null);setEndId(null);},onSwapRoute:()=>{setStartId(endId);setEndId(startId);},lang};
  function enterRoom(room){const p={floor:room.level,x:room.centroid[0],y:room.centroid[1],yaw:lastPosition.current?.yaw||0,pitch:0};lastPosition.current=p;setPlayerPosition(p);setLevel(room.level);setMode('walk');}
  function updatePosition(p,final=false){lastPosition.current=p;if(final)setPlayerPosition(p);}
  function requestWalkRoute(position,to,stepFree){if(!routingWorker.current)return Promise.resolve(null);const id=`walk-${++walkRequestId.current}`;return new Promise(resolve=>{walkRequests.current.set(id,resolve);routingWorker.current.postMessage({type:'route',id,from:null,to,stepFree,startPosition:position});});}
  function switchMode(next){if(next==='map2d'&&lastPosition.current){setPlayerPosition(lastPosition.current);setLevel(lastPosition.current.floor);}setMode(next);}


  return (
    <div className="app">
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
                <button type="button">{t.emptySearch}</button>
              )}
              {hits.map((r) => (
                <button
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
                </button>
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
        <AdventureView t={t} lang={lang} selected={selected} level={level} rooms={rooms} />
      ) : (
        <div className={`workspace modern-workspace mode-${mode}`}>
          <aside
            className={`left modern-filters ${filtersOpen ? "is-open" : ""}`}
          >
            <button
              className="filters-close"
              onClick={() => setFiltersOpen(false)}
            >
              × Fermer les filtres
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
            {currentTour && (
              <div className="tour-progress">
                {tourStep + 1}/{currentTour.steps.length} —{" "}
                {lang === "en"
                  ? currentTour.steps[tourStep].text_en
                  : currentTour.steps[tourStep].text_fr}
                <div className="actions" style={{ marginTop: 8 }}>
                  <button
                    className="ghost"
                    onClick={() => setTourStep((s) => Math.max(0, s - 1))}
                  >
                    {t.prev}
                  </button>
                  <button
                    className="ghost"
                    onClick={() =>
                      setTourStep((s) =>
                        Math.min(currentTour.steps.length - 1, s + 1),
                      )
                    }
                  >
                    {t.next}
                  </button>
                  <button className="ghost" onClick={() => setTourId(null)}>
                    {t.stopTour}
                  </button>
                </div>
              </div>
            )}
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

          <main className="center">
            <div className="toolbar">
              <button
                className="ghost filters-toggle"
                onClick={() => setFiltersOpen((v) => !v)}
              >
                ☰ Filtres et étages
              </button>
              <div className="seg">
                {[
                  ['map2d', t.map2d],
                  ['map3d', t.map3d],
                  ['walk', lang === 'fr' ? 'Visite immersive' : 'First-person visit'],
                  ['metro', t.metro],
                  ['constellation', t.constellation],
                  ['quality', t.quality]
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

            {mode === "map2d" && (
              <Map2D {...mapProps} position={playerPosition} onVisit={enterRoom}/>
            )}
            {mode === "map3d" && (
              <Map3D
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
              />
            )}
            {mode === 'walk' && <Walkthrough geometry={drawnGeometry} rooms={rooms} floors={sceneData.floors} links={sceneData.links} selected={selected} lang={lang} requestRoute={requestWalkRoute} mapProps={mapProps} initialPosition={lastPosition.current} onPositionChange={updatePosition} route={route} destination={rooms.find(r=>r.id===endId)} stepFree={stepFree} onOverview={() => switchMode('map2d')} onFloorChange={setLevel} />}
            {mode === 'metro' && (
              <MetroMap metro={data.metro} rooms={rooms} selectedId={selectedId} onSelect={selectRoom} lang={lang} />
            )}
            {mode === "constellation" && (
              <Constellation
                rooms={filtered}
                selectedId={selectedId}
                onSelect={selectRoom}
                t={t}
              />
            )}
            {mode === "quality" && (
              <Dashboard rooms={rooms} graph={data.graph} t={t} />
            )}

            <div className="route-bar">
              <span className="hint">
                {startId && endId
                  ? `Départ : ${rooms.find((r) => r.id === startId)?.number || startId} → Arrivée : ${rooms.find((r) => r.id === endId)?.number || endId} · ${route ? `Trajet automatique indicatif (${route.metres} m estimés, ${route.minutes} min estimées). Passages calculés sur les murs et portes ; à vérifier sur place.` : (routeStatus==='routing'?'Calcul du passage entre les murs…':'Aucun passage accessible dans la géométrie actuelle.')}`
                  : startId
                    ? "Départ défini. Choisissez maintenant une arrivée."
                    : endId
                      ? "Arrivée définie. Choisissez maintenant un départ."
                      : "Choisissez une salle de départ, puis une arrivée."}
              </span>
              {route?.steps?.map((step,i)=><span className="hint" key={i}>{step[`text_${lang}`]}</span>)}
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
                    {selected.capacity_estimated
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
          rooms={rooms}
          onClose={() => setLostOpen(false)}
          onNavigate={(origin, destination) => {
            setView("guide");
            setMode("map2d");
            setLevel(origin.level);

            setStartId(origin.id);
            setEndId(destination.id);
            setSelectedId(destination.id);
          }}
        />
      )}
    </div>
  );
}
