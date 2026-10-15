import { useMemo, useRef, useState } from 'react';
import { polyToPath, roomColor } from '../core.js';

export default function Map2D({
  rooms,
  floors,
  links,
  zones,
  level,
  selectedId,
  route,
  onSelect,
  lang
}) {
  const svgRef = useRef(null);
  const size = floors.levels[level]?.size || [60, 60];
  const [view, setView] = useState({ x: -4, y: -4, w: size[0] + 8, h: size[1] + 8 });
  const drag = useRef(null);

  const levelRooms = useMemo(() => rooms.filter((r) => r.level === level), [rooms, level]);
  const routePts = useMemo(() => {
    if (!route) return [];
    return route.nodes.filter((n) => n.level === level);
  }, [route, level]);

  const zonePaths = useMemo(() => {
    if (level !== 'R+2' || !zones?.features) return [];
    return zones.features.map((f, i) => {
      const ring = f.geometry?.coordinates?.[0];
      if (!ring) return null;
      const h = size[1];
      const d = ring
        .map((p, idx) => `${idx ? 'L' : 'M'}${p[0].toFixed(2)} ${(h - p[1]).toFixed(2)}`)
        .join(' ');
      return { d, kind: f.properties.kind, nom: f.properties.nom, i };
    }).filter(Boolean);
  }, [zones, level, size]);

  function clientToWorld(e) {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    const p = pt.matrixTransform(ctm.inverse());
    return [p.x, size[1] - p.y];
  }

  return (
    <div className="map-host">
      <svg
        ref={svgRef}
        className="map-2d"
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        onWheel={(e) => {
          e.preventDefault();
          const factor = e.deltaY > 0 ? 1.08 : 0.92;
          const [wx, wy] = clientToWorld(e);
          const sx = wx;
          const sy = size[1] - wy;
          const nw = view.w * factor;
          const nh = view.h * factor;
          const nx = sx - ((sx - view.x) / view.w) * nw;
          const ny = sy - ((sy - view.y) / view.h) * nh;
          setView({ x: nx, y: ny, w: nw, h: nh });
        }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const svg = svgRef.current;
          const k = view.w / svg.clientWidth;
          setView((v) => ({
            ...v,
            x: drag.current.vx - (e.clientX - drag.current.x) * k,
            y: drag.current.vy - (e.clientY - drag.current.y) * k
          }));
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(45,212,191,0.12)" strokeWidth="0.08" />
          </pattern>
        </defs>
        <rect x={0} y={0} width={size[0]} height={size[1]} fill="#10181c" />
        <rect x={0} y={0} width={size[0]} height={size[1]} fill="url(#grid)" />
        <rect x={0} y={0} width={size[0]} height={size[1]} fill="none" stroke="#2dd4bf55" strokeWidth="0.25" />

        {zonePaths.map((z) => (
          <path
            key={z.i}
            d={z.d}
            fill={z.kind === 'batiment' ? 'none' : 'rgba(56,189,248,0.07)'}
            stroke={z.kind === 'batiment' ? '#99f6e4' : '#38bdf8'}
            strokeWidth={z.kind === 'batiment' ? 0.35 : 0.18}
          />
        ))}

        {levelRooms.map((r) => {
          const d = polyToPath(r.polygon, true, size[1]);
          const c = roomColor(r);
          const selected = r.id === selectedId;
          const onRoute = route?.ids.includes(r.id);
          const [cx, cy] = r.centroid;
          return (
            <g key={r.id} onClick={(e) => { e.stopPropagation(); onSelect(r.id); }} style={{ cursor: 'pointer' }}>
              <path
                d={d}
                fill={c}
                fillOpacity={selected ? 0.85 : r.reliable ? 0.45 : 0.22}
                stroke={selected ? '#ecfeff' : onRoute ? '#2dd4bf' : '#0b1220'}
                strokeWidth={selected ? 0.35 : 0.12}
              />
              {view.w < 90 && (
                <text className="room-label" x={cx} y={size[1] - cy} textAnchor="middle" dy="0.35">
                  {r.number || r.designation_plan?.slice(0, 10)}
                </text>
              )}
            </g>
          );
        })}

        {routePts.length > 1 && (
          <polyline
            fill="none"
            stroke="#2dd4bf"
            strokeWidth="0.45"
            strokeDasharray="0.8 0.5"
            points={routePts.map((n) => `${n.x},${size[1] - n.y}`).join(' ')}
          />
        )}
        {routePts.map((n, i) => (
          <circle key={i} cx={n.x} cy={size[1] - n.y} r="0.45" fill="#99f6e4" />
        ))}

        {links.flatMap((link) =>
          link.points
            .filter((p) => p.level === level)
            .map((p) => (
              <g key={`${link.id}-${level}`}>
                {link.type === 'lift' ? (
                  <rect x={p.x - 0.7} y={size[1] - p.y - 0.7} width="1.4" height="1.4" fill="#fbbf24" stroke="#111" strokeWidth="0.08" />
                ) : (
                  <circle cx={p.x} cy={size[1] - p.y} r="0.8" fill="#fb7185" />
                )}
                <text x={p.x} y={size[1] - p.y + 0.25} textAnchor="middle" className="room-label">
                  {link.type === 'lift' ? 'L' : 'S'}
                </text>
              </g>
            ))
        )}

        <g transform={`translate(2, ${size[1] - 3})`}>
          <line className="scale-bar" x1="0" y1="0" x2="10" y2="0" />
          <text className="room-label" x="5" y="-0.4" textAnchor="middle">10 m</text>
        </g>
      </svg>
      <div className="banner">
        {floors.levels[level]?.[`label_${lang}`]} · {levelRooms.length} {lang === 'fr' ? 'espaces' : 'spaces'} ·{' '}
        {lang === 'fr' ? 'molette pour zoomer, glisser pour déplacer' : 'scroll to zoom, drag to pan'}
      </div>
    </div>
  );
}
