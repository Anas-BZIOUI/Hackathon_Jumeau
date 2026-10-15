import { useEffect, useMemo, useRef, useState } from "react";
import { roomName, ACTIVITY_COLORS,searchRooms } from "../core.js";
import {TYPE_LABEL} from '../i18n.js';
import groundPlan from '../../plan_RDC.svg?url';
import firstPlan from '../../plan_R+1.svg?url';
import secondPlan from '../../plan_R+2.svg?url';
const PLANS={RDC:groundPlan,'R+1':firstPlan,'R+2':secondPlan};
import { indoorFloorSegments } from "../navigation.js";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const fit = ([w, h]) => ({ x: -2, y: -2, w: w + 4, h: h + 4 });
const floorNames = {
  RDC: "Rez-de-chaussée",
  "R+1": "1er étage",
  "R+2": "2e étage",
};

export default function Map2D({
  rooms = [],
  activeActivities,
  typeFilter = "all",
  floors,
  links=[],
  level,
  selectedId,
  startId,
  endId,
  route,
  routeStatus='idle',
  onSelect,
  onClearSelection,
  onUseAsStart,
  onUseAsEnd,
  onClearRoute,
  onSwapRoute,
  lang = "fr",
  synonyms,
  position=null,
  compact=false,
  onVisit,
  onWalkTo,
  onLocatePosition,
}) {
  const fr=lang==='fr';
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
  const [term, setTerm] = useState("");
  const [planError, setPlanError] = useState(false);
  const levelRooms = useMemo(
    () => rooms.filter((r) => r.level === level),
    [rooms, level],
  );
  const selected = levelRooms.find((r) => r.id === selectedId);
  const departure = rooms.find((r) => r.id === startId);
  const arrival = rooms.find((r) => r.id === endId);
  const active =
    activeActivities instanceof Set
      ? activeActivities
      : new Set(["teaching", "research", "student_life", "companies"]);
  const matchesFilters = (r) =>
    typeFilter !== "all"
      ? r.type === typeFilter
      : active.size===0||!r.activities?.length||(r.activities || []).some((a) => active.has(a));
  const matchingCount = levelRooms.filter(matchesFilters).length;
  const colorFor = (r) => {
    const category = (r.activities || []).find((a) => active.has(a));
    // Les types sans activité (bureaux, escaliers, sanitaires...) restent visibles.
    return ACTIVITY_COLORS[category] || "#818cf8";
  };
  const planUrl = PLANS[level];

  useEffect(() => {
    let active = true;
    setView(fit(size));
    setHovered(null);
    setShapes({});
    setPlanError(false);
    fetch(planUrl)
      .then((r) => {
        if (!r.ok) throw new Error("Plan absent");
        return r.text();
      })
      .then((xml) => {
        const doc = new DOMParser().parseFromString(xml, "image/svg+xml");
        const paths = {};
        doc.querySelectorAll("#pieces path[id]").forEach((path) => {
          paths[path.id] = path.getAttribute("d");
        });
        if (active) setShapes(paths);
      })
      .catch(() => {
        if (active) setPlanError(true);
      });
    return () => {
      active = false;
    };
  }, [level, size[0], size[1], planUrl]);

  useEffect(() => {
    if (selectedId && selected) setDetailsOpen(true);
  }, [selectedId, level]);

  const matches = useMemo(() => {
    const q = term.trim().toLocaleLowerCase();
    return q
      ? searchRooms(q,levelRooms,synonyms,lang).slice(0,12)
      : [];
  }, [term, levelRooms, lang,synonyms]);

  function zoom(factor, point) {
    setView((v) => {
      const w = clamp(v.w * factor, 8, size[0] * 2.5);
      const h = (w * v.h) / v.w;
      const cx = point?.x ?? v.x + v.w / 2;
      const cy = point?.y ?? v.y + v.h / 2;
      return {
        x: cx - ((cx - v.x) * w) / v.w,
        y: cy - ((cy - v.y) * h) / v.h,
        w,
        h,
      };
    });
  }
  function svgPoint(e) {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!m) return null;
    const p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    return p.matrixTransform(m.inverse());
  }
  function focusRoom(room) {
    if (!room?.centroid) return;
    const [x, y] = room.centroid;
    setView((v) => {
      const w = Math.min(size[0] + 4, Math.max(32, size[0] * 0.55));
      const h = (w * v.h) / v.w;
      return { x: x - w / 2, y: size[1] - y - h / 2, w, h };
    });
  }
  function selectRoom(room) {
    onSelect?.(room.id);
    setDetailsOpen(true);
    setSearchOpen(false);
    setTerm("");
    // Ne pas zoomer automatiquement : la carte reste lisible.
  }
  const title = fr?(floorNames[level]||level):({RDC:'Ground floor','R+1':'First floor','R+2':'Second floor'}[level]||level);
  useEffect(()=>{if(compact&&position?.floor===level)setView({x:position.x-14,y:size[1]-position.y-11,w:28,h:22});},[compact,position?.x,position?.y,level]);
  useEffect(()=>{if(!compact)setView(fit(size));},[compact]);
  const routeIds = new Set(route?.ids || []);

  const routeSegments = useMemo(
    () => indoorFloorSegments(route, level, size[1]),
    [route, level, size[1]],
  );

  return (
    <div className={`map-host ensii-modern-map ensii-blueprint-map ${compact?'compact-plan':''}`}>
      <svg
        ref={svgRef}
        className="map-2d ensii-map-svg"
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label={`Plan interactif : ${title}`}
        onWheel={(e) => {
          e.preventDefault();
          zoom(e.deltaY > 0 ? 1.12 : 0.89, svgPoint(e));
        }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            view: { ...view },
            moved: false,
          };
          suppressClick.current = false;
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const d = drag.current;
          if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) <= 5)
            return;
          if (!d.moved) {
            d.moved = true;
            suppressClick.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          const rect = e.currentTarget.getBoundingClientRect();
          const k = Math.max(d.view.w / rect.width, d.view.h / rect.height);
          setView({
            ...d.view,
            x: d.view.x - (e.clientX - d.x) * k,
            y: d.view.y - (e.clientY - d.y) * k,
          });
        }}
        onPointerUp={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId))
            e.currentTarget.releasePointerCapture(e.pointerId);
          drag.current = null;
        }}
        onPointerCancel={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId))
            e.currentTarget.releasePointerCapture(e.pointerId);
          drag.current = null;
        }}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.stopPropagation();
            suppressClick.current = false;
            return;
          }

          // Maintenir Shift et cliquer pour relever
          // les coordonnées d'une porte sur le plan.
          if (e.shiftKey) {
            e.stopPropagation();

            const point = svgPoint(e);
            if (!point) return;

            const x = Number(point.x.toFixed(3));
            const y = Number((size[1] - point.y).toFixed(3));

            console.log("Coordonnées navigation :", {
              level,
              x,
              y,
            });
          }
        }}
      >
        <rect
          x="-100"
          y="-100"
          width={size[0] + 200}
          height={size[1] + 200}
          fill="#f8fafc"
        />
        <image
          href={planUrl}
          x="0"
          y="0"
          width={size[0]}
          height={size[1]}
          preserveAspectRatio="none"
        />
        {levelRooms.map((r) => {
          const d = shapes[r.id];
          if (!d) return null;
          const isSelected = r.id === selectedId;
          const matches = matchesFilters(r);
          const color = colorFor(r);
          const isHovered = hovered === r.id;
          return (
            <g
              key={r.id}
              onPointerEnter={() => setHovered(r.id)}
              onPointerLeave={() => setHovered(null)}
              onClick={(e) => {
                e.stopPropagation();
                selectRoom(r);
              }}
              style={{ cursor: "pointer" }}
            >
              <path
                d={d}
                fill={isSelected ? "#818cf8" : color}
                fillOpacity={
                  isSelected
                    ? 0.62
                    : matches
                      ? isHovered
                        ? 0.42
                        : 0.23
                      : 0.015
                }
                stroke={
                  isSelected
                    ? "#4f46e5"
                    : routeIds.has(r.id)
                      ? "#0d9488"
                      : matches
                        ? color
                        : "none"
                }
                strokeOpacity={isSelected ? 1 : matches ? 0.9 : 0}
                strokeWidth={isSelected ? 0.28 : matches ? 0.12 : 0}
                strokeLinejoin="round"
              />
              {isSelected && r.centroid && (
                <circle
                  cx={r.centroid[0]}
                  cy={size[1] - r.centroid[1]}
                  r=".22"
                  fill="#4f46e5"
                  pointerEvents="none"
                />
              )}
            </g>
          );
        })}

        {/* Itinéraire automatique indicatif */}
        <g className="automatic-route" pointerEvents="none">
          {routeSegments.map((segment, index) => {
            const points = segment.map((p) => `${p.x},${p.y}`).join(" ");

            return (
              <g key={`route-${index}`}>
                {/* Contour blanc pour distinguer le trajet */}
                <polyline
                  points={points}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.95"
                />

                {/* Chemin bleu en pointillés */}
                <polyline
                  points={points}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="0.65"
                  strokeDasharray="1.3 0.65"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}
        </g>

        {/* Repères indicatifs : centroïdes JSON, non des portes vérifiées. */}
        {[
          { room: departure, text: "D", color: "#16a34a" },
          { room: arrival, text: "A", color: "#dc2626" },
        ]
          .filter((item) => item.room?.level === level && item.room.centroid)
          .map((item) => (
            <g
              key={item.text}
              transform={`translate(${item.room.centroid[0]} ${size[1] - item.room.centroid[1]})`}
              pointerEvents="none"
            >
              <circle
                r="1.0"
                fill="white"
                stroke={item.color}
                strokeWidth=".25"
              />
              <circle r=".76" fill={item.color} />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize=".85"
                fontWeight="bold"
              >
                {item.text}
              </text>
            </g>
          ))}
        {showLabels &&
          levelRooms
            .filter(
              (r) =>
                !shapes[r.id] &&
                r.centroid &&
                (matchesFilters(r) || r.id === selectedId),
            )
            .map((r) => (
              <circle
                key={r.id}
                cx={r.centroid[0]}
                cy={size[1] - r.centroid[1]}
                r=".28"
                fill={r.id === selectedId ? "#4f46e5" : colorFor(r)}
                stroke="#fff"
                strokeWidth=".08"
                onClick={() => selectRoom(r)}
                style={{ cursor: "pointer" }}
              />
            ))}
        {links.flatMap(link=>link.points.filter(p=>p.level===level).map((p,i)=><g key={`${link.id}-${i}`} transform={`translate(${p.x} ${size[1]-p.y})`}><circle r=".8" fill={link.type==='lift'?'#278f9f':'#b87a32'} stroke="white" strokeWidth=".15"/><text textAnchor="middle" dominantBaseline="central" fill="white" fontSize=".85">{link.type==='lift'?'L':'S'}</text><title>{link.type==='lift'?(lang==='fr'?'Ascenseur':'Lift'):(lang==='fr'?'Escalier':'Stairs')} {link.label||link.id}</title></g>))}
        <g transform={`translate(${view.x+view.w*.04},${view.y+view.h*.93})`} pointerEvents="none"><path d="M0,-.4 V0 H10 V-.4" fill="none" stroke="#24445b" strokeWidth=".15"/><text x="5" y="-.7" textAnchor="middle" fontSize=".9" fill="#24445b" stroke="white" strokeWidth=".06" paintOrder="stroke">10 m</text></g>
        {position?.floor===level&&<g className="shared-character-marker" transform={`translate(${position.x} ${size[1]-position.y})`} role="img" aria-label={fr?'Votre personnage est ici':'Your character is here'}><circle r="1.1" fill="#fff" stroke="#247b96" strokeWidth=".18"/><g transform={`rotate(${(floors.levels[level].rotation_deg||0)-(position.yaw||0)*180/Math.PI})`}><path d="M0,-1.35 L.65,-.45 L-.65,-.45 Z" fill="#247b96"/></g><circle cy="-.23" r=".22" fill="#d9ae8e"/><path d="M-.3,.05 H.3 V.65 H.1 V.35 H-.1 V.65 H-.3 Z" fill="#247b96"/><title>{fr?'Vous êtes ici':'You are here'} · {level}</title></g>}
      </svg>
      <section className="ensii-route-picker" aria-label="Départ et arrivée">
        <div className="ensii-route-title">
          Itinéraire <small>Étape 1 : points de départ et d’arrivée</small>
        </div>
        <div className="ensii-route-entry">
          <span className="ensii-route-symbol start">D</span>
          <span>
            <small>{fr?'Départ':'Start'}</small>
            <strong>
              {departure
                ? `${departure.number || ""} · ${roomName(departure, lang)}`
                : (fr?"Choisir une salle":"Choose a room")}
            </strong>
          </span>
        </div>
        <div className="ensii-route-entry">
          <span className="ensii-route-symbol end">A</span>
          <span>
            <small>{fr?'Arrivée':'Destination'}</small>
            <strong>
              {arrival
                ? `${arrival.number || ""} · ${roomName(arrival, lang)}`
                : (fr?"Choisir une salle":"Choose a room")}
            </strong>
          </span>
        </div>
        <div className="ensii-route-actions">
          <button
            type="button"
            onClick={onSwapRoute}
            disabled={!startId || !endId}
          >
            {fr?'⇅ Inverser':'⇅ Swap'}
          </button>
          <button
            type="button"
            onClick={onClearRoute}
            disabled={!startId && !endId}
          >
            Effacer
          </button>
        </div>
        {departure && arrival && (
          <p className="ensii-route-note">
            {routeStatus==='routing'?(fr?'Calcul des passages…':'Finding walkable passages…'):routeSegments.length > 0
              ? `Trajet automatique indicatif affiché en bleu (${route?.metres ?? "—"} m estimés).`
              : "Aucun segment de trajet disponible sur cet étage."}
          </p>
        )}
        {route?.arrivalAtDoor&&<p className="ensii-route-note">{fr?'Arrivée à une porte de la salle.':'Arrival at a room doorway.'}</p>}
        {departure && arrival && departure.level !== arrival.level && (
          <p className="ensii-route-note">
            Changement d'étage : {departure.level} → {arrival.level} (liaison à
            vérifier).
          </p>
        )}
      </section>
      <div className="ensii-floor-card">
        <strong>{title}</strong>
        <span>
          {matchingCount} / {levelRooms.length} espaces correspondants · plan
          architectural
        </span>
      </div>
      <div className="ensii-map-controls" aria-label="Commandes de la carte">
        {position&&<button type="button" title={fr?'Localiser mon personnage':'Locate my character'} onClick={()=>{if(position.floor===level)focusRoom({centroid:[position.x,position.y]});else onLocatePosition?.(position.floor);}}>♟</button>}
        <button type="button" title={fr?"Zoom avant":"Zoom in"} onClick={() => zoom(0.78)}>
          ＋
        </button>
        <button type="button" title={fr?"Zoom arrière":"Zoom out"} onClick={() => zoom(1.28)}>
          −
        </button>
        <button
          type="button"
          title={fr?"Afficher tout l'étage":"Fit floor"}
          onClick={() => setView(fit(size))}
        >
          ⛶
        </button>
        <button
          type="button"
          disabled={!selected}
          title={fr?"Centrer sur la salle":"Center on room"}
          onClick={() => focusRoom(selected)}
        >
          ⌖
        </button>
      </div>
      {hovered && !detailsOpen && (
        <div className="ensii-hover-label">
          {roomName(
            levelRooms.find((r) => r.id === hovered),
            lang,
          )}
        </div>
      )}
      <div className="ensii-modern-legend">
        <strong>{fr?'Légende':'Legend'}</strong>
        <span>
          <i className="ensii-legend-dot selected" /> Salle sélectionnée
        </span>
        {[
          ["teaching", "Enseignement"],
          ["research", "Recherche"],
          ["student_life", "Vie étudiante"],
          ["companies", "Entreprises"],
        ].map(([key, label]) => (
          <span key={key} style={{ opacity: active.has(key) ? 1 : 0.35 }}>
            <i
              className="ensii-legend-dot"
              style={{ background: ACTIVITY_COLORS[key] }}
            />{" "}
            {label}
          </span>
        ))}
        <span>
          <i
            className="ensii-legend-dot"
            style={{
              background: "#fff",
              border: "2px solid #ea580c",
              borderRadius: "50%",
            }}
          />{" "}
          Position sans contour
        </span>
        <label>
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
          />{" "}
          Positions seules
        </label>
      </div>
      {planError && (
        <div className="ensii-plan-error">
          {fr?'Plan indisponible. Réessayez en rechargeant la page.':'Plan unavailable. Try reloading the page.'}
        </div>
      )}
      <div className="ensii-search-wrap">
        {searchOpen && (
          <div className="ensii-search-panel">
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Numéro ou nom de salle…"
            />
            <div className="ensii-search-results">
              {matches.map((r) => (
                <button type="button" key={r.id} onClick={() => selectRoom(r)}>
                  <strong>{r.number || "—"}</strong>
                  <span>{roomName(r, lang)}</span>
                </button>
              ))}
              {term && !matches.length && (
                <p>Aucune salle trouvée à cet étage.</p>
              )}
            </div>
          </div>
        )}
        <button
          className="ensii-search-trigger"
          type="button"
          onClick={() => setSearchOpen((v) => !v)}
        >
          {searchOpen ? (fr?"Fermer":"Close") : (fr?"⌕  Rechercher une salle":"⌕  Find a room")}
        </button>
      </div>
      {selected && detailsOpen && (
        <aside
          className="ensii-side-details"
          aria-label="Informations de la salle"
        >
          <button
            className="ensii-sheet-close"
            type="button"
            aria-label="Fermer la fiche"
            onClick={() => {
              setDetailsOpen(false);
              onClearSelection?.();
              setHovered(null);
            }}
          >
            ×
          </button>
          <span className="ensii-sheet-tag">Espace · {title}</span>
          <h2>{selected.number || roomName(selected, lang)}</h2>
          <p className="ensii-sheet-subtitle">
            {selected.designation_plan || roomName(selected, lang)}
          </p>
          <div className="ensii-sheet-grid">
            <div>
              <small>{fr?'Étage':'Floor'}</small>
              <strong>{title}</strong>
            </div>
            <div>
              <small>Type</small>
              <strong>{TYPE_LABEL[lang][selected.type] || "Non renseigné"}</strong>
            </div>
            <div>
              <small>{fr?'Surface du plan':'Plan area'}</small>
              <strong>
                {selected.area_plan_m2 != null
                  ? `${selected.area_plan_m2} m²`
                  : "Non renseignée"}
              </strong>
            </div>
            <div>
              <small>{fr?'Accessibilité PMR':'Step-free access'}</small>
              <strong>
                {selected.accessible == null ? (fr?"À vérifier":"Unknown") : selected.accessible ? (fr?"Indiquée accessible":"Reported accessible") : (fr?"Non accessible":"Not accessible")}
              </strong>
            </div>
          </div>
          <p className="ensii-sheet-description">
            {selected[`description_${lang}`] ||
              selected.description_fr ||
              "Aucune description disponible."}
          </p>
          <div className="ensii-sheet-grid"><div><small>{lang==='fr'?'Capacité':'Capacity'}</small><strong>{selected.capacity??(selected.capacity_estimated?`${lang==='fr'?'Environ':'About'} ${selected.capacity_estimated}`:(lang==='fr'?'Inconnue':'Unknown'))}</strong></div><div><small>{lang==='fr'?'Qualité des données':'Data quality'}</small><strong>{selected.verified_on_site?(lang==='fr'?'Vérifié sur place':'Verified on site'):(lang==='fr'?'À vérifier sur place':'Not verified on site')}</strong></div></div>
          <div className="tags">{selected.activities?.map(a=><span className="tag" key={a} style={{background:ACTIVITY_COLORS[a]+'22'}}>{({teaching:lang==='fr'?'Enseignement':'Teaching',research:lang==='fr'?'Recherche':'Research',student_life:lang==='fr'?'Vie étudiante':'Student life',companies:lang==='fr'?'Entreprises':'Companies'})[a]}</span>)}</div>
          <p className="deeplink"><a href={`#/room/${encodeURIComponent(selected.id)}`}>{lang==='fr'?'Lien vers cette salle':'Link to this room'}</a></p>
          <div className="ensii-sheet-actions">
            {onVisit&&<button type="button" onClick={()=>onVisit(selected)}>{fr?'Explorer ici en immersion':'Explore here in 3D'}</button>}
            {onWalkTo&&<button type="button" disabled={position?.floor!==selected.level} onClick={()=>onWalkTo(selected)}>{fr?'Marcher vers cette salle':'Walk to this room'}</button>}
            <button type="button" onClick={() => onUseAsStart?.(selected.id)}>
              {startId === selected.id ? (fr?"✓ Départ":"✓ Start") : (fr?"Départ":"Start")}
            </button>
            <button type="button" onClick={() => onUseAsEnd?.(selected.id)}>
              {endId === selected.id ? (fr?"✓ Arrivée":"✓ Destination") : (fr?"Arrivée":"Destination")}
            </button>
          </div>
          <small className="ensii-sheet-warning">
            {fr?"Les itinéraires et l'accessibilité restent à vérifier sur place.":"Routes and accessibility require on-site verification."}
          </small>
        </aside>
      )}
    </div>
  );
}
