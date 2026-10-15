import { useEffect, useMemo, useRef, useState } from 'react';
import { CALIBRATION_KEY, LEVELS, newCalibration, solveCalibration, validateCalibration } from '../calibration.js';
import groundPlan from '../../plan_RDC.png';
import firstPlan from '../../plan_R+1.png';
import secondPlan from '../../plan_R+2.png';
const PLANS = { RDC: groundPlan, 'R+1': firstPlan, 'R+2': secondPlan };
const COLORS = ['#275da2', '#8a5ba3', '#c56f24', '#29806b'];

export default function CalibrationTool({ floors, lang, applied, onApply, onClose }) {
  const fr = lang === 'fr';
  const dialog = useRef(null);
  const importInput = useRef(null);
  const [draft, setDraft] = useState(() => {
    try {
      const saved = validateCalibration(JSON.parse(localStorage.getItem(CALIBRATION_KEY + '-draft')), floors);
      return saved.landmarks.some(l => Object.keys(l.points).length) ? saved : applied || saved;
    }
    catch { return applied || newCalibration(); }
  });
  const [floor, setFloor] = useState('RDC');
  const [landmarkId, setLandmarkId] = useState(draft.landmarks[0].id);
  const [preview, setPreview] = useState(false);
  const [overlayFloor, setOverlayFloor] = useState('R+1');
  const [marking, setMarking] = useState(true);
  const [history, setHistory] = useState([]);
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState(false);
  const solution = useMemo(() => solveCalibration(draft), [draft]);
  const active = draft.landmarks.find(l => l.id === landmarkId) || draft.landmarks[0];
  const pointsCount = draft.landmarks.reduce((n, l) => n + Object.keys(l.points).length, 0);
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current.showModal();
    return () => previous?.focus();
  }, []);
  useEffect(() => {
    try { localStorage.setItem(CALIBRATION_KEY + '-draft', JSON.stringify(draft)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [draft]);
  function edit(next) {
    setHistory(h => [...h.slice(-29), draft]); setDraft(next); setNotice('');
  }
  function mark(point) {
    edit({ ...draft, landmarks: draft.landmarks.map(l => l.id === active.id ? { ...l, points: { ...l.points, [floor]: point } } : l) });
  }
  function removePoint() {
    const points = { ...active.points }; delete points[floor];
    edit({ ...draft, landmarks: draft.landmarks.map(l => l.id === active.id ? { ...l, points } : l) });
  }
  function exportDraft() {
    const content = { ...draft, reference: 'RDC', solution, exported_at: new Date().toISOString() };
    const url = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'ensiie-control-points.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importDraft(e) {
    const file = e.target.files[0]; if (!file) return;
    try {
      if (file.size > 100000) throw new Error('File too large');
      const value = validateCalibration(JSON.parse(await file.text()), floors);
      edit(value); setLandmarkId(value.landmarks[0].id);
      setNotice(fr ? 'Repères importés.' : 'Landmarks imported.');
    } catch { setNotice(fr ? 'Fichier invalide : utilisez un export de cet outil.' : 'Invalid file: use an export from this tool.'); }
    e.target.value = '';
  }
  const typeName = type => type === 'stairs' ? (fr ? 'Escalier' : 'Stairs') : type === 'lift' ? (fr ? 'Ascenseur' : 'Lift') : (fr ? 'Autre repère fixe' : 'Other fixed landmark');
  return <dialog className="calibration-dialog" ref={dialog} aria-labelledby="calibration-title" onCancel={e => { e.preventDefault(); onClose(); }}>
    <header className="calibration-header">
      <div><div className="three-eyebrow">{fr ? 'PRÉPARER LE BÂTIMENT CONNECTÉ' : 'PREPARE THE CONNECTED BUILDING'}</div><h2 id="calibration-title">{fr ? 'Aligner les étages' : 'Align the floors'}</h2><p>{fr ? 'Marquez les mêmes points physiques sur chaque plan. Le RDC sert de référence.' : 'Mark the same physical points on each plan. The ground floor is the reference.'}</p></div>
      <button className="ghost" onClick={onClose} aria-label={fr ? 'Fermer le calibrage' : 'Close calibration'}>✕</button>
    </header>
    <div className="calibration-body">
      <aside className="calibration-sidebar">
        <h3>{fr ? '1. Choisissez un repère' : '1. Choose a landmark'}</h3>
        <p className="hint">{fr ? 'A : un escalier commun. B : le même ascenseur. C : un troisième point pour vérifier, ou un autre escalier si l’ascenseur n’existe pas à tous les niveaux.' : 'A: a shared staircase. B: the same lift. C: a third check point, or another staircase if the lift does not serve every floor.'}</p>
        <div className="calibration-landmarks">{draft.landmarks.map((l, i) => <button key={l.id} className={active.id === l.id ? 'active' : ''} onClick={() => { setLandmarkId(l.id); setPreview(false); }}>
          <b style={{ background: COLORS[i % COLORS.length] }}>{l.label}</b><span>{typeName(l.type)}<small>{LEVELS.map(lv => `${lv} ${l.points[lv] ? '✓' : '—'}`).join(' · ')}</small></span>
        </button>)}</div>
        <label className="calibration-field">{fr ? 'Type de repère' : 'Landmark type'}<select value={active.type} onChange={e => edit({ ...draft, landmarks: draft.landmarks.map(l => l.id === active.id ? { ...l, type: e.target.value } : l) })}><option value="stairs">{typeName('stairs')}</option><option value="lift">{typeName('lift')}</option><option value="landmark">{typeName('landmark')}</option></select></label>
        <button className="ghost" disabled={draft.landmarks.length >= 12} onClick={() => {
          const id = `control-${Date.now()}`;
          edit({ ...draft, landmarks: [...draft.landmarks, { id, label: String.fromCharCode(65 + draft.landmarks.length), type: 'landmark', points: {} }] }); setLandmarkId(id); setPreview(false);
        }}>{fr ? '+ Ajouter un repère' : '+ Add landmark'}</button>
        <h3>{fr ? '2. Marquez chaque étage' : '2. Mark each floor'}</h3>
        <p className="hint">{fr ? 'Cliquez le centre du même palier, de la même cage d’escalier ou de la même cabine. Deux repères espacés d’au moins 3 m sont nécessaires sur chaque paire d’étages.' : 'Click the center of the same landing, stair core or lift cabin. At least two landmarks, 3 m apart, must match each pair of floors.'}</p>
        <div className="calibration-floor-list">{LEVELS.map(lv => <button key={lv} className={floor === lv && !preview ? 'active' : ''} onClick={() => { setFloor(lv); setPreview(false); }}><span>{lv}</span><span>{active.points[lv] ? '✓' : '○'}</span></button>)}</div>
        <div className="calibration-coordinate">{active.label} · {floor}<strong>{active.points[floor] ? `${active.points[floor][0].toFixed(2)} ; ${active.points[floor][1].toFixed(2)} m` : (fr ? 'Pas encore marqué' : 'Not marked yet')}</strong></div>
        <CoordinateEditor key={`${active.id}-${floor}-${active.points[floor]?.join(',')}`} point={active.points[floor]} size={floors.levels[floor].size} onMark={mark} fr={fr} />
        <div className="calibration-small-actions"><button className="ghost" disabled={!history.length} onClick={() => { setDraft(history[history.length - 1]); setHistory(h => h.slice(0, -1)); }}>{fr ? 'Annuler' : 'Undo'}</button><button className="ghost" disabled={!active.points[floor]} onClick={removePoint}>{fr ? 'Effacer ce point' : 'Remove point'}</button></div>
        <h3>{fr ? '3. Vérifiez la superposition' : '3. Check the overlap'}</h3>
        {LEVELS.slice(1).map(lv => {
          const r = solution.levels[lv];
          return <div className="calibration-result" key={lv}><strong>{lv} ↔ RDC</strong><span>{r.error === 'points' ? (fr ? `${r.count}/2 repères communs` : `${r.count}/2 shared landmarks`) : r.error === 'separation' ? (fr ? 'Repères trop proches' : 'Landmarks too close') : `${fr ? 'Écart moyen' : 'RMS error'} : ${r.residual_m.toFixed(2)} m`}</span>{r.error === 'residual' && <small>{fr ? 'Écart > 1 m : vérifiez les correspondances.' : 'Error > 1 m: check the matching points.'}</small>}{r.offset && <small>{fr ? 'Rotation' : 'Rotation'} {r.rotation_deg.toFixed(1)}° · {r.count} {fr ? 'repères' : 'landmarks'}</small>}</div>;
        })}
        <p className="hint">{fr ? 'Trois points donnent une meilleure vérification que deux. Les hauteurs et les itinéraires restent approximatifs.' : 'Three points provide a better check than two. Heights and routes remain approximate.'}</p>
        {solution.checks.map(check => <div className="calibration-result" key={check.label}>
          <strong>{check.label} · R+1 ↔ R+2</strong>
          <span>{fr ? 'Contrôle indépendant' : 'Independent check'} : {check.error_m.toFixed(2)} m</span>
          {check.error_m > 1 && <small style={{color:'var(--warn)'}}>{fr ? 'À corriger : ces points ne coïncident pas après alignement. Non utilisés dans le calcul sur le RDC.' : 'Needs correction: these points do not coincide after alignment. Not used in the ground-floor fit.'}</small>}
        </div>)}
      </aside>
      <section className="calibration-workspace">
        <div className="calibration-mapbar"><div className="seg"><button className={!preview ? 'active' : ''} onClick={() => setPreview(false)}>{fr ? 'Marquer sur le plan' : 'Mark the plan'}</button><button className={preview ? 'active' : ''} onClick={() => setPreview(true)}>{fr ? 'Superposer' : 'Overlay'}</button></div>{!preview ? <div className="seg"><button className={marking ? 'active' : ''} onClick={() => setMarking(true)}>{fr ? 'Placer un point' : 'Place a point'}</button><button className={!marking ? 'active' : ''} onClick={() => setMarking(false)}>{fr ? 'Déplacer le plan' : 'Pan the plan'}</button></div> : <label>{fr ? 'Comparer au RDC' : 'Compare with ground'} <select value={overlayFloor} onChange={e => setOverlayFloor(e.target.value)}><option>R+1</option><option>R+2</option></select></label>}</div>
        <PlanMarker key={preview ? `overlay-${overlayFloor}` : floor} floor={floor} floors={floors} draft={draft} active={active} marking={marking} onMark={mark} preview={preview} overlayFloor={overlayFloor} result={solution.levels[overlayFloor]} fr={fr} />
        <div className="calibration-instructions">{preview ? (fr ? 'RDC en fond · étage comparé à 50 % · les traits relient les repères correspondants.' : 'Ground floor beneath · compared floor at 50% · lines join matching landmarks.') : (fr ? `${active.label} sur ${floor} : cliquez pour placer ou corriger. Molette : zoom. Mode Déplacer : glisser. Clavier : flèches, +, −, 0 pour recentrer.` : `${active.label} on ${floor}: click to place or correct. Scroll: zoom. Pan mode: drag. Keyboard: arrows, +, −, 0 to reset.`)}</div>
      </section>
    </div>
    <footer className="calibration-footer"><div><span>{pointsCount} {fr ? 'points marqués' : 'marked points'} · {storageError ? (fr ? 'Sauvegarde locale indisponible : exportez votre travail.' : 'Local storage unavailable: export your work.') : (fr ? 'Brouillon conservé dans ce navigateur' : 'Draft saved in this browser')}</span><small>{fr ? 'Navigation virtuelle prévue : clic + clavier. Ce calibrage règle la géométrie ; il ne valide pas encore les itinéraires.' : 'Planned virtual navigation: click + keyboard. Calibration adjusts geometry; it does not validate routes yet.'}</small>{notice && <span role="status">{notice}</span>}</div><div className="calibration-small-actions"><input ref={importInput} type="file" accept="application/json,.json" hidden onChange={importDraft} /><button className="ghost" onClick={() => { edit(newCalibration()); setLandmarkId('stairs-main'); setPreview(false); }}>{fr ? 'Nouveau brouillon' : 'New draft'}</button><button className="ghost" onClick={() => importInput.current.click()}>{fr ? 'Importer' : 'Import'}</button><button className="ghost" onClick={exportDraft}>{fr ? 'Exporter JSON' : 'Export JSON'}</button><button className="primary" disabled={!solution.ready} onClick={() => onApply(draft)}>{fr ? 'Appliquer et voir en 3D' : 'Apply and view in 3D'}</button></div></footer>
  </dialog>;
}

function CoordinateEditor({ point, size, onMark, fr }) {
  const [x, setX] = useState(point?.[0] ?? '');
  const [y, setY] = useState(point?.[1] ?? '');
  return <form className="calibration-numeric" onSubmit={e => { e.preventDefault(); if (x !== '' && y !== '') onMark([Number(x), Number(y)]); }}>
    <label>X (m)<input aria-label={fr ? 'Coordonnée X en mètres' : 'X coordinate in metres'} type="number" min="0" max={size[0]} step="0.01" required value={x} onChange={e => setX(e.target.value)} /></label>
    <label>Y (m)<input aria-label={fr ? 'Coordonnée Y en mètres' : 'Y coordinate in metres'} type="number" min="0" max={size[1]} step="0.01" required value={y} onChange={e => setY(e.target.value)} /></label>
    <button className="ghost" type="submit">{fr ? 'Placer' : 'Place'}</button>
  </form>;
}

function PlanMarker({ floor, floors, draft, active, marking, onMark, preview, overlayFloor, result, fr }) {
  const svg = useRef(null);
  const gesture = useRef(null);
  const level = preview ? 'RDC' : floor;
  const [w, h] = floors.levels[level].size;
  const initial = useMemo(() => {
    if (!preview || !result.offset) return { x: -2, y: -2, w: w + 4, h: h + 4 };
    const [ow, oh] = floors.levels[overlayFloor].size;
    const angle = result.rotation_deg * Math.PI / 180;
    const corners = [[0,0],[ow,0],[ow,oh],[0,oh]].map(([x,y]) => [Math.cos(angle)*x-Math.sin(angle)*y+result.offset[0], h-(Math.sin(angle)*x+Math.cos(angle)*y+result.offset[1])]);
    const minX = Math.min(0, ...corners.map(p=>p[0])) - 3, minY = Math.min(0, ...corners.map(p=>p[1])) - 3;
    return { x:minX, y:minY, w:Math.max(w,...corners.map(p=>p[0]))-minX+3, h:Math.max(h,...corners.map(p=>p[1]))-minY+3 };
  }, [preview, result, w, h, floors, overlayFloor]);
  const [view, setView] = useState(initial);
  useEffect(() => setView(initial), [initial]);
  function local(e) {
    const p = svg.current.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(svg.current.getScreenCTM().inverse());
  }
  function zoom(factor, center = {x:view.x+view.w/2,y:view.y+view.h/2}) {
    const nextWidth = Math.max(2, Math.min(initial.w * 3, view.w * factor));
    const ratio = nextWidth / view.w;
    setView({ x:center.x-(center.x-view.x)*ratio, y:center.y-(center.y-view.y)*ratio, w:nextWidth, h:view.h*ratio });
  }
  function transform(p) {
    const a = (result.rotation_deg || 0) * Math.PI / 180;
    return [Math.cos(a)*p[0]-Math.sin(a)*p[1]+result.offset[0], Math.sin(a)*p[0]+Math.cos(a)*p[1]+result.offset[1]];
  }
  const radius = view.w / 100;
  return <div className="calibration-plan">
    <svg ref={svg} tabIndex={0} role="img" aria-label={preview ? (fr ? 'Aperçu de la superposition' : 'Alignment preview') : `${fr ? 'Plan à marquer' : 'Plan to mark'} ${floor}`} viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} style={{cursor:preview || !marking ? 'grab' : 'crosshair'}} onWheel={e => { const p=local(e); zoom(e.deltaY > 0 ? 1.12 : .89, p); }} onKeyDown={e => {
      const delta=view.w*.08;
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','0'].includes(e.key)) e.preventDefault();
      if (e.key==='+'||e.key==='=') zoom(.8); else if (e.key==='-') zoom(1.25); else if (e.key==='0') setView(initial);
      else if (e.key.startsWith('Arrow')) setView(v=>({...v,x:v.x+(e.key==='ArrowLeft'?-delta:e.key==='ArrowRight'?delta:0),y:v.y+(e.key==='ArrowUp'?-delta:e.key==='ArrowDown'?delta:0)}));
    }} onPointerDown={e => { if(e.button !== 0) return; svg.current.focus(); gesture.current={client:[e.clientX,e.clientY],point:local(e),view}; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={e => {
      const g=gesture.current; if(!g || (marking && !preview)) return;
      const p=local(e); setView(v=>({...v,x:v.x+g.point.x-p.x,y:v.y+g.point.y-p.y}));
    }} onPointerUp={e => {
      const g=gesture.current; gesture.current=null;
      if(!g || preview || !marking || Math.hypot(e.clientX-g.client[0],e.clientY-g.client[1])>5) return;
      const p=local(e), x=p.x, y=h-p.y;
      if(x>=0&&x<=w&&y>=0&&y<=h) onMark([Math.round(x*100)/100,Math.round(y*100)/100]);
    }} onPointerCancel={()=>{gesture.current=null;}}>
      <image href={PLANS[level]} x="0" y="0" width={w} height={h} />
      {preview && result.offset && <g transform={`translate(${result.offset[0]},${h-result.offset[1]}) rotate(${-result.rotation_deg}) scale(1,-1)`}><image href={PLANS[overlayFloor]} width={floors.levels[overlayFloor].size[0]} height={floors.levels[overlayFloor].size[1]} transform={`translate(0,${floors.levels[overlayFloor].size[1]}) scale(1,-1)`} opacity=".5" /></g>}
      {preview && !result.offset && <text x={w/2} y={h/2} textAnchor="middle" fontSize={w/35} fill="#244f80">{fr ? 'Marquez deux repères communs pour comparer.' : 'Mark two shared landmarks to compare.'}</text>}
      {draft.landmarks.map((l,i)=>{
        const p=l.points[level]; if(!p)return null;
        const other=preview&&result.offset&&l.points[overlayFloor] ? transform(l.points[overlayFloor]):null;
        const color=COLORS[i%COLORS.length];
        return <g key={l.id} pointerEvents="none"><circle cx={p[0]} cy={h-p[1]} r={radius*(active.id===l.id?1.2:1)} fill={color} stroke="white" strokeWidth={radius*.25}/><text x={p[0]} y={h-p[1]+radius*.35} fill="white" textAnchor="middle" fontSize={radius*1.25} fontWeight="700">{l.label}</text>{other&&<><line x1={p[0]} y1={h-p[1]} x2={other[0]} y2={h-other[1]} stroke={color} strokeWidth={radius*.2}/><circle cx={other[0]} cy={h-other[1]} r={radius*1.5} fill="none" stroke={color} strokeWidth={radius*.3}/></>}</g>;
      })}
    </svg>
    <div className="calibration-zoom"><button className="ghost" onClick={()=>zoom(.75)} aria-label={fr?'Agrandir le plan':'Zoom in'}>+</button><button className="ghost" onClick={()=>zoom(1.33)} aria-label={fr?'Réduire le plan':'Zoom out'}>−</button><button className="ghost" onClick={()=>setView(initial)}>{fr?'Recentrer':'Reset'}</button></div>
  </div>;
}
