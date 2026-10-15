import { ACTIVITY_COLORS } from '../core.js';

export default function MetroMap({ metro, rooms, selectedId, onSelect, lang }) {
  const byId = Object.fromEntries(rooms.map((r) => [r.id, r]));
  const stations = metro.stations || [];
  return (
    <div className="view-host">
      <svg className="metro-svg" viewBox="0 0 460 300">
        <rect width="460" height="300" fill="#0c1114" />
        {(metro.lines || []).map((line) => {
          const pts = stations.filter((s) => s.lines.includes(line.id));
          if (pts.length < 2) return null;
          const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
          return <path key={line.id} d={d} fill="none" stroke={line.color} strokeWidth="5" strokeLinejoin="round" />;
        })}
        {stations.map((s) => {
          const interchange = s.lines.length > 1;
          const room = byId[s.roomId];
          return (
            <g key={s.id} onClick={() => onSelect(s.roomId)} style={{ cursor: 'pointer' }}>
              <circle
                cx={s.x}
                cy={s.y}
                r={interchange ? 8 : 6}
                fill="#0c1114"
                stroke={s.roomId === selectedId ? '#ecfeff' : ACTIVITY_COLORS[s.lines[0]]}
                strokeWidth={interchange ? 4 : 3}
              />
              <text x={s.x + 12} y={s.y + 4} fill="#eef3f0" fontSize="11" fontFamily="IBM Plex Mono, monospace">
                {s.label}
              </text>
              {room && (
                <title>{lang === 'en' ? room.name_en : room.name_fr}</title>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
