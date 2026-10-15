import { useEffect, useMemo, useRef, useState } from 'react';
import { roomName, ACTIVITY_COLORS } from '../core.js';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const fit = ([w, h]) => ({ x: -2, y: -2, w: w + 4, h: h + 4 });
const floorNames = { RDC: 'Rez-de-chaussée', 'R+1': '1er étage', 'R+2': '2e étage' };

export default function Map2D({ rooms = [], activeActivities, typeFilter = 'all', floors, level, selectedId, route, onSelect, onClearSelection, onUseAsStart, onUseAsEnd, lang = 'fr' }) {
  const size = floors.levels[level]?.size || [60, 60];
  const svgRef = useRef(null);
  const drag = useRef(null);
  const suppressClick = useRef(false);
  const [view, setView] = useState(() => fit(size));
  const [shapes, setShapes] = useState({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [hovered, setHovered] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [planError, setPlanError] = useState(false);
  const levelRooms = useMemo(() => rooms.filter(r => r.level === level), [rooms, level]);
  const selected = levelRooms.find(r => r.id === selectedId);
  const active = activeActivities instanceof Set ? activeActivities : new Set(['teaching', 'research', 'student_life', 'companies']);
  const matchesFilters = (r) =>
    (typeFilter === 'all' || r.type === typeFilter) &&
    (r.activities || []).some(a => active.has(a));
  const matchingCount = levelRooms.filter(matchesFilters).length;
  const colorFor = (r) => {
    const category = (r.activities || []).find(a => active.has(a));
    return ACTIVITY_COLORS[category] || '#818cf8';
  };
  const planUrl = `/plans/plan_${level}.svg`;

  useEffect(() => {
    let active = true;
    setView(fit(size));
    setHovered(null);
    setShapes({});
    setPlanError(false);
    fetch(planUrl).then(r => { if (!r.ok) throw new Error('Plan absent'); return r.text(); })
      .then(xml => {
        const doc = new DOMParser().parseFromString(xml, 'image/svg+xml');
        const paths = {};
        doc.querySelectorAll('#pieces path[id]').forEach(path => { paths[path.id] = path.getAttribute('d'); });
        if (active) setShapes(paths);
      }).catch(() => { if (active) setPlanError(true); });
    return () => { active = false; };
  }, [level, size[0], size[1], planUrl]);

  useEffect(() => { if (selectedId && selected) setDetailsOpen(true); }, [selectedId, level]);

  const matches = useMemo(() => {
    const q = term.trim().toLocaleLowerCase();
    return q ? levelRooms.filter(r => `${r.number || ''} ${roomName(r, lang)} ${r.designation_plan || ''}`.toLocaleLowerCase().includes(q)).slice(0, 12) : [];
  }, [term, levelRooms, lang]);

  function zoom(factor, point) {
    setView(v => {
      const w = clamp(v.w * factor, 8, size[0] * 2.5);
      const h = w * v.h / v.w;
      const cx = point?.x ?? v.x + v.w / 2;
      const cy = point?.y ?? v.y + v.h / 2;
      return { x: cx - (cx - v.x) * w / v.w, y: cy - (cy - v.y) * h / v.h, w, h };
    });
  }
  function svgPoint(e) {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!m) return null;
    const p = svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(m.inverse());
  }
  function focusRoom(room) {
    if (!room?.centroid) return;
    const [x, y] = room.centroid;
    setView(v => {
      const w = Math.min(size[0] + 4, Math.max(32, size[0] * 0.55));
      const h = w * v.h / v.w;
      return { x: x - w / 2, y: size[1] - y - h / 2, w, h };
    });
  }
  function selectRoom(room) {
    onSelect?.(room.id);
    setDetailsOpen(true);
    setSearchOpen(false);
    setTerm('');
    // Ne pas zoomer automatiquement : la carte reste lisible.
  }
  const title = floorNames[level] || level;
  const routeIds = new Set(route?.ids || []);

  return (
    <div className="map-host ensii-modern-map ensii-blueprint-map">
      <svg ref={svgRef} className="map-2d ensii-map-svg" viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} preserveAspectRatio="xMidYMid meet" aria-label={`Plan interactif : ${title}`}
        onWheel={e => { e.preventDefault(); zoom(e.deltaY > 0 ? 1.12 : 0.89, svgPoint(e)); }}
        onPointerDown={e => {
          if (e.button !== 0) return;
          drag.current = { x: e.clientX, y: e.clientY, view: { ...view }, moved: false };
          suppressClick.current = false;
        }}
        onPointerMove={e => {
          if (!drag.current) return;
          const d = drag.current;
          if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) <= 5) return;
          if (!d.moved) {
            d.moved = true;
            suppressClick.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          const rect = e.currentTarget.getBoundingClientRect();
          const k = Math.max(d.view.w / rect.width, d.view.h / rect.height);
          setView({ ...d.view, x: d.view.x - (e.clientX - d.x) * k, y: d.view.y - (e.clientY - d.y) * k });
        }}
        onPointerUp={e => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
          drag.current = null;
        }}
        onPointerCancel={e => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
          drag.current = null;
        }}
        onClickCapture={e => {
          if (suppressClick.current) {
            e.stopPropagation();
            suppressClick.current = false;
          }
        }}>
        <rect x="-100" y="-100" width={size[0] + 200} height={size[1] + 200} fill="#f8fafc" />
        <image href={planUrl} x="0" y="0" width={size[0]} height={size[1]} preserveAspectRatio="none" />
        {levelRooms.map(r => {
          const d = shapes[r.id];
          if (!d) return null;
          const isSelected = r.id === selectedId;
          const matches = matchesFilters(r);
          const color = colorFor(r);
          const isHovered = hovered === r.id;
          return <g key={r.id} onPointerEnter={() => setHovered(r.id)} onPointerLeave={() => setHovered(null)}
            onClick={e => { e.stopPropagation(); selectRoom(r); }}
            style={{ cursor: 'pointer' }}>
            <path d={d}
              fill={isSelected ? '#818cf8' : color}
              fillOpacity={isSelected ? .62 : matches ? (isHovered ? .42 : .23) : .015}
              stroke={isSelected ? '#4f46e5' : routeIds.has(r.id) ? '#0d9488' : matches ? color : 'none'}
              strokeOpacity={isSelected ? 1 : matches ? .9 : 0}
              strokeWidth={isSelected ? .28 : matches ? .12 : 0}
              strokeLinejoin="round" />
            {isSelected && r.centroid && <circle cx={r.centroid[0]} cy={size[1] - r.centroid[1]} r=".22" fill="#4f46e5" pointerEvents="none" />}
          </g>;
        })}
        {showLabels && levelRooms.filter(r => !shapes[r.id] && r.centroid && (matchesFilters(r) || r.id === selectedId)).map(r => <circle key={r.id} cx={r.centroid[0]} cy={size[1] - r.centroid[1]} r=".28" fill={r.id === selectedId ? '#4f46e5' : colorFor(r)} stroke="#fff" strokeWidth=".08" onClick={() => selectRoom(r)} style={{ cursor: 'pointer' }} />)}
      </svg>
      <div className="ensii-floor-card"><strong>{title}</strong><span>{matchingCount} / {levelRooms.length} espaces affichés · plan architectural</span></div>
      <div className="ensii-map-controls" aria-label="Commandes de la carte">
        <button type="button" title="Zoom avant" onClick={() => zoom(.78)}>＋</button>
        <button type="button" title="Zoom arrière" onClick={() => zoom(1.28)}>−</button>
        <button type="button" title="Afficher tout l'étage" onClick={() => setView(fit(size))}>⛶</button>
        <button type="button" disabled={!selected} title="Centrer sur la salle" onClick={() => focusRoom(selected)}>⌖</button>
      </div>
      {hovered && !detailsOpen && <div className="ensii-hover-label">{roomName(levelRooms.find(r => r.id === hovered), lang)}</div>}
      <div className="ensii-modern-legend"><strong>Légende</strong><span><i className="ensii-legend-dot selected" /> Salle sélectionnée</span>{[['teaching','Enseignement'],['research','Recherche'],['student_life','Vie étudiante'],['companies','Entreprises']].map(([key,label]) => <span key={key} style={{opacity: active.has(key) ? 1 : .35}}><i className="ensii-legend-dot" style={{background:ACTIVITY_COLORS[key]}} /> {label}</span>)}<span><i className="ensii-legend-dot" style={{ background: '#fff', border: '2px solid #ea580c', borderRadius: '50%' }} /> Position sans contour</span><label><input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} /> Positions seules</label></div>
      {planError && <div className="ensii-plan-error">Plan introuvable : place plan_{level}.svg dans public/plans/.</div>}
      <div className="ensii-search-wrap">
        {searchOpen && <div className="ensii-search-panel"><input autoFocus value={term} onChange={e => setTerm(e.target.value)} placeholder="Numéro ou nom de salle…" /><div className="ensii-search-results">{matches.map(r => <button type="button" key={r.id} onClick={() => selectRoom(r)}><strong>{r.number || '—'}</strong><span>{roomName(r, lang)}</span></button>)}{term && !matches.length && <p>Aucune salle trouvée à cet étage.</p>}</div></div>}
        <button className="ensii-search-trigger" type="button" onClick={() => setSearchOpen(v => !v)}>{searchOpen ? 'Fermer' : '⌕  Rechercher une salle'}</button>
      </div>
      {selected && detailsOpen && <aside className="ensii-side-details" aria-label="Informations de la salle">
        <button className="ensii-sheet-close" type="button" aria-label="Fermer la fiche" onClick={() => { setDetailsOpen(false); onClearSelection?.(); setHovered(null); }}>×</button>
        <span className="ensii-sheet-tag">Espace · {title}</span>
        <h2>{selected.number || roomName(selected, lang)}</h2>
        <p className="ensii-sheet-subtitle">{selected.designation_plan || roomName(selected, lang)}</p>
        <div className="ensii-sheet-grid"><div><small>Étage</small><strong>{title}</strong></div><div><small>Type</small><strong>{selected.type || 'Non renseigné'}</strong></div><div><small>Surface du plan</small><strong>{selected.area_plan_m2 != null ? `${selected.area_plan_m2} m²` : 'Non renseignée'}</strong></div><div><small>Accessibilité PMR</small><strong>{selected.accessible == null ? 'À vérifier' : selected.accessible ? 'Indiquée accessible' : 'Non indiquée'}</strong></div></div>
        <p className="ensii-sheet-description">{selected[`description_${lang}`] || selected.description_fr || 'Aucune description disponible.'}</p>
        <div className="ensii-sheet-actions"><button type="button" onClick={() => onUseAsStart?.(selected.id)}>Départ</button><button type="button" onClick={() => onUseAsEnd?.(selected.id)}>Arrivée</button></div>
        <small className="ensii-sheet-warning">Les itinéraires et l'accessibilité restent à vérifier sur place.</small>
      </aside>}
    </div>
  );
}
