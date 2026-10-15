import { useEffect, useMemo, useState } from 'react';
import { STRINGS, TYPE_LABEL } from './i18n.js';
import {
  ACTIVITY_COLORS,
  parseHash,
  roomDesc,
  roomName,
  searchRooms,
  setHash,
  shortestPath
} from './core.js';
import Map2D from './components/Map2D.jsx';
import Map3D from './components/Map3D.jsx';
import MetroMap from './components/MetroMap.jsx';
import Constellation from './components/Constellation.jsx';
import Dashboard from './components/Dashboard.jsx';
import AdventureView from './components/AdventureView.jsx';
import CalibrationTool from './components/CalibrationTool.jsx';
import { CALIBRATION_KEY, calibratedScene, validateCalibration, solveCalibration } from './calibration.js';
import projectCalibration from '../ensiie-control-points.json';

const ACTIVITIES = ['teaching', 'research', 'student_life', 'companies'];
const LEVELS = ['RDC', 'R+1', 'R+2'];
const TYPES = Object.keys(TYPE_LABEL.fr);
const DATA_KEYS = ['rooms', 'floors', 'links', 'graph', 'tours', 'metro', 'synonyms', 'zones', 'resources'];

async function loadDataset() {
  try {
    const r = await fetch('/api/bootstrap');
    if (r.ok) return r.json();
  } catch {
    /* fall through to static JSON */
  }
  const entries = await Promise.all(
    DATA_KEYS.map(async (key) => {
      const r = await fetch(`/data/${key}.json`);
      if (!r.ok) throw new Error(key);
      return [key, await r.json()];
    })
  );
  return Object.fromEntries(entries);
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState('fr');
  const [view, setView] = useState('guide');
  const [mode, setMode] = useState('map2d');
  const [persona, setPersona] = useState('student');
  const [level, setLevel] = useState('R+2');
  const [acts, setActs] = useState(() => new Set(ACTIVITIES));
  const [typeFilter, setTypeFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('R+2-C53');
  const [startId, setStartId] = useState(null);
  const [endId, setEndId] = useState(null);
  const [stepFree, setStepFree] = useState(false);
  const [aligned, setAligned] = useState(true);
  const [explode, setExplode] = useState(true);
  const [tourId, setTourId] = useState(null);
  const [tourStep, setTourStep] = useState(0);
  const [openSearch, setOpenSearch] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const [calibration, setCalibration] = useState(null);
  const sceneData = useMemo(() => data ? calibratedScene(data.floors, data.links, calibration) : null, [data, calibration]);

  const t = STRINGS[lang];

  useEffect(() => {
    let cancelled = false;
    loadDataset()
      .then((d) => {
        if (cancelled) return;
        setData(d);
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
        if (h.view === 'adventure') setView('adventure');
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
    return () => { cancelled = true; };
  }, []);

  const rooms = data?.rooms || [];
  const selected = rooms.find((r) => r.id === selectedId) || null;

  const filtered = useMemo(() => {
    return rooms.filter((r) => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (acts.size && r.activities.length) {
        if (!r.activities.some((a) => acts.has(a))) return false;
      } else if (acts.size && !r.activities.length && typeFilter === 'all') {
        return true;
      }
      return true;
    });
  }, [rooms, acts, typeFilter]);

  const hits = useMemo(
    () => (query.trim() ? searchRooms(query, rooms, data?.synonyms, lang) : []),
    [query, rooms, data, lang]
  );

  const route = useMemo(() => {
    if (!data || !startId || !endId) return null;
    return shortestPath(data.graph, startId, endId, { stepFree });
  }, [data, startId, endId, stepFree]);

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
    setQuery('');
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
    student: rooms.find((r) => r.id === 'R+2-accueil')?.id,
    visitor: rooms.find((r) => /cabanes/i.test(r.designation_plan || ''))?.id,
    company: rooms.find((r) => r.number === '216')?.id
  };

  const currentTour = data.tours.find((x) => x.id === tourId);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src="/logo.png" alt="EnsiiExplore" className="brand-logo" />
          <div className="brand-text">
            <p>{t.app}</p>
          </div>
        </div>
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            value={query}
            placeholder={t.search}
            onChange={(e) => { setQuery(e.target.value); setOpenSearch(true); }}
            onFocus={() => setOpenSearch(true)}
          />
          {openSearch && query && (
            <div className="search-results">
              {hits.length === 0 && <button type="button">{t.emptySearch}</button>}
              {hits.map((r) => (
                <button key={r.id} type="button" onClick={() => selectRoom(r.id)}>
                  {roomName(r, lang)}
                  <br />
                  <small>{r.level} · {TYPE_LABEL[lang][r.type]} · {r.area_plan_m2 ?? '—'} m²</small>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="topbar-right">
          <div className="seg">
            <button className={view === 'guide' ? 'active' : ''} onClick={() => setView('guide')}>{t.guide}</button>
            <button className={view === 'adventure' ? 'active' : ''} onClick={() => setView('adventure')}>{t.adventure}</button>
          </div>
          <div className="pills">
            {['student', 'visitor', 'company'].map((p) => (
              <button key={p} className={`pill ${persona === p ? 'active' : ''}`} onClick={() => {
                setPersona(p);
                if (personaStart[p]) setStartId(personaStart[p]);
              }}>{t[p]}</button>
            ))}
          </div>
          <button className="lang pill" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}>
            {lang === 'fr' ? 'FR | en' : 'fr | EN'}
          </button>
        </div>
      </header>

      {showCalibration && <CalibrationTool floors={data.floors} lang={lang} applied={calibration} onClose={() => setShowCalibration(false)} onApply={(draft) => {
        setCalibration(draft);
        try { localStorage.setItem(CALIBRATION_KEY, JSON.stringify(draft)); } catch { /* Session preview still works. */ }
        setAligned(true); setMode('map3d'); setView('guide'); setShowCalibration(false);
      }} />}

      {view === 'adventure' ? (
        <AdventureView t={t} lang={lang} selected={selected} level={level} rooms={rooms} />
      ) : (
        <div className="workspace">
          <aside className="left">
            <div className="section-title">{t.filters}</div>
            {ACTIVITIES.map((a) => (
              <button
                key={a}
                className={`filter-row ${acts.has(a) ? '' : 'off'}`}
                onClick={() => {
                  const n = new Set(acts);
                  if (n.has(a)) n.delete(a); else n.add(a);
                  setActs(n);
                }}
              >
                <span className="dot" style={{ background: ACTIVITY_COLORS[a] }} />
                {t[a]}
              </button>
            ))}
            <div className="section-title">{t.types}</div>
            <select className="type-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">{t.allTypes}</option>
              {TYPES.map((tp) => (
                <option key={tp} value={tp}>{TYPE_LABEL[lang][tp]}</option>
              ))}
            </select>
            <div className="section-title">{t.floors}</div>
            <div className="floor-list">
              {LEVELS.map((lv) => (
                <button key={lv} className={level === lv ? 'active' : ''} onClick={() => { setLevel(lv); setMode('map2d'); }}>
                  {data.floors.levels[lv][`label_${lang}`]}
                  <div className="hint">{rooms.filter((r) => r.level === lv).length} {t.rooms}</div>
                </button>
              ))}
            </div>
            <div className="section-title">{t.tours}</div>
            <div className="tour-list">
              {data.tours.map((tour) => (
                <button key={tour.id} className={tourId === tour.id ? 'active' : ''} onClick={() => startTour(tour.id)}>
                  {lang === 'en' ? tour.title_en : tour.title_fr}
                </button>
              ))}
            </div>
            {currentTour && (
              <div className="tour-progress">
                {tourStep + 1}/{currentTour.steps.length} — {lang === 'en' ? currentTour.steps[tourStep].text_en : currentTour.steps[tourStep].text_fr}
                <div className="actions" style={{ marginTop: 8 }}>
                  <button className="ghost" onClick={() => setTourStep((s) => Math.max(0, s - 1))}>{t.prev}</button>
                  <button className="ghost" onClick={() => setTourStep((s) => Math.min(currentTour.steps.length - 1, s + 1))}>{t.next}</button>
                  <button className="ghost" onClick={() => setTourId(null)}>{t.stopTour}</button>
                </div>
              </div>
            )}
            <div className="section-title">{t.resources}</div>
            {data.resources.map((res) => (
              res.href
                ? <a key={res.id} href={res.href} target="_blank" rel="noreferrer" className="hint" style={{ display: 'block', color: 'var(--accent-2)', marginBottom: 6 }}>{lang === 'en' ? res.label_en : res.label_fr}</a>
                : <div key={res.id} className="hint">{lang === 'en' ? res.label_en : res.label_fr}</div>
            ))}
          </aside>

          <main className="center">
            <div className="toolbar">
              <div className="seg">
                {[
                  ['map2d', t.map2d],
                  ['map3d', t.map3d],
                  ['metro', t.metro],
                  ['constellation', t.constellation],
                  ['quality', t.quality]
                ].map(([id, label]) => (
                  <button key={id} className={mode === id ? 'active' : ''} onClick={() => setMode(id)}>{label}</button>
                ))}
              </div>
              {mode === 'map3d' && (
                <>
                  <button className={`pill ${aligned ? 'active' : ''}`} onClick={() => setAligned((v) => !v)}>{aligned ? t.aligned : t.raw}</button>
                  <button className={`pill ${explode ? 'active' : ''}`} onClick={() => setExplode((v) => !v)}>{explode ? t.explode : t.compact}</button>
                </>
              )}
              <button className="ghost" onClick={() => setShowCalibration(true)}>{lang === 'fr' ? 'Aligner les étages' : 'Align floors'}</button>
              {calibration && <button className="ghost" onClick={() => {
                setCalibration(null);
                try { localStorage.removeItem(CALIBRATION_KEY); } catch { /* Session reset still works. */ }
              }}>{lang === 'fr' ? 'Annuler le calibrage' : 'Reset calibration'}</button>}
              <label className="hint" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="checkbox" checked={stepFree} onChange={(e) => setStepFree(e.target.checked)} />
                {t.stepFree}
              </label>
              <div className="spacer" />
              <button className="ghost" onClick={() => {
                const start = personaStart[persona];
                if (start) setStartId(start);
                if (selectedId) setEndId(selectedId);
              }}>{t.imLost}</button>
            </div>

            {mode === 'map2d' && (
              <Map2D
                rooms={filtered}
                floors={data.floors}
                links={data.links}
                zones={data.zones}
                level={level}
                selectedId={selectedId}
                route={route}
                onSelect={selectRoom}
                lang={lang}
              />
            )}
            {mode === 'map3d' && (
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
            {mode === 'metro' && (
              <MetroMap metro={data.metro} rooms={rooms} selectedId={selectedId} onSelect={selectRoom} lang={lang} />
            )}
            {mode === 'constellation' && (
              <Constellation rooms={filtered} selectedId={selectedId} onSelect={selectRoom} t={t} />
            )}
            {mode === 'quality' && <Dashboard rooms={rooms} graph={data.graph} t={t} />}

            <div className="route-bar">
              {route ? (
                <>
                  <strong>{t.routeBar}</strong>
                  <span>{rooms.find((r) => r.id === startId)?.name_fr} → {rooms.find((r) => r.id === endId)?.name_fr}</span>
                  <span>{route.metres} {t.m} · {route.minutes} {t.min}</span>
                  {stepFree && <span className="badge ok">{t.stepFree}</span>}
                  {route.steps.map((s, i) => (
                    <span key={i} className="badge">{lang === 'en' ? s.text_en : s.text_fr}</span>
                  ))}
                  <button className="ghost" onClick={() => { setStartId(null); setEndId(null); }}>{t.clearRoute}</button>
                </>
              ) : (
                <span className="hint">{startId && endId ? t.routeNone : t.pickStart}</span>
              )}
            </div>
          </main>

          <aside className="right">
            {selected ? (
              <div className="sheet">
                <span className={`badge ${selected.verified_on_site ? 'ok' : 'warn'}`}>
                  {selected.verified_on_site ? t.verified : t.unverified}
                </span>
                <h2>{roomName(selected, lang)}</h2>
                <div className="sub">{selected.level} · {TYPE_LABEL[lang][selected.type]} · {t.fromPlan}</div>
                <div className="tags">
                  {selected.activities.map((a) => (
                    <span key={a} className="tag" style={{ background: ACTIVITY_COLORS[a] + '33' }}>{t[a]}</span>
                  ))}
                  <span className="tag">{selected.reliable ? t.reliable : t.doubtful}</span>
                </div>
                <p>{roomDesc(selected, lang)}</p>
                {selected.programme_plan && (
                  <p className="hint">{selected.programme_plan}</p>
                )}
                <div className="meta">
                  <div><small>{t.area}</small>{selected.area_plan_m2 ?? '—'} m²</div>
                  <div><small>{t.capacity}</small>{selected.capacity_estimated ? `${t.estimated} ${selected.capacity_estimated}` : t.unknown}</div>
                  <div><small>{t.reliability}</small>{selected.contour_quality}</div>
                  <div><small>PMR</small>{selected.accessible === true ? 'oui' : t.unknown}</div>
                </div>
                <div className="actions">
                  <button className="primary" onClick={() => setStartId(selected.id)}>{t.useAsStart}</button>
                  <button className="ghost" onClick={() => { setEndId(selected.id); if (!startId && personaStart[persona]) setStartId(personaStart[persona]); }}>{t.useAsEnd}</button>
                </div>
                <p className="deeplink">{t.deeplink}: #/room/{selected.id}</p>
                <p className="hint">{t.simulation}</p>
              </div>
            ) : (
              <p className="hint">{t.pickStart}</p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
