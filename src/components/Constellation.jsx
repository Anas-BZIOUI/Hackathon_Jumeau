import { ACTIVITY_COLORS, roomColor } from '../core.js';

const PILLARS = [
  { id: 'teaching', x: 80, y: 70 },
  { id: 'research', x: 380, y: 70 },
  { id: 'student_life', x: 80, y: 280 },
  { id: 'companies', x: 380, y: 280 }
];

export default function Constellation({ rooms, selectedId, onSelect, t }) {
  const linked = rooms.filter((r) => r.activities?.length);
  const shown = linked.slice(0, 48);
  return (
    <div className="view-host">
      <svg className="const-svg" viewBox="0 0 460 360">
        <rect width="460" height="360" fill="#0c1114" />
        {shown.map((r, i) => {
          const col = i % 6;
          const row = Math.floor(i / 6);
          const x = 130 + col * 36;
          const y = 90 + row * 28;
          return r.activities.map((a) => {
            const p = PILLARS.find((k) => k.id === a);
            return (
              <line key={r.id + a} x1={x} y1={y} x2={p.x} y2={p.y} stroke={ACTIVITY_COLORS[a]} strokeOpacity="0.25" />
            );
          });
        })}
        {PILLARS.map((p) => (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r="22" fill={ACTIVITY_COLORS[p.id]} />
            <text x={p.x} y={p.y + 36} textAnchor="middle" fill="#c5d0cc" fontSize="11">{t[p.id]}</text>
          </g>
        ))}
        {shown.map((r, i) => {
          const col = i % 6;
          const row = Math.floor(i / 6);
          const x = 130 + col * 36;
          const y = 90 + row * 28;
          return (
            <circle
              key={r.id}
              cx={x}
              cy={y}
              r={r.id === selectedId ? 7 : 4.5}
              fill={roomColor(r)}
              stroke={r.id === selectedId ? '#fff' : 'none'}
              onClick={() => onSelect(r.id)}
              style={{ cursor: 'pointer' }}
            >
              <title>{r.name_fr}</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
}
