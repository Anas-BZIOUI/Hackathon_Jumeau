export function fold(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, ' ')
    .trim();
}

export function worldPoint(floors, level, x, y, aligned) {
  const off = floors.levels[level]?.offset || [0, 0];
  const a = aligned ? 1 : 0;
  return [x + off[0] * a, y + off[1] * a];
}

export function roomName(room, lang) {
  return (lang === 'en' ? room.name_en : room.name_fr) || room.name_fr || room.id;
}

export function roomDesc(room, lang) {
  const t = lang === 'en' ? room.description_en : room.description_fr;
  return t || room.description_fr || room.description_en || '';
}

const NUMBER_RE = /(?:r\s*\+?\s*[012]|rdc)?\s*([cC]?\d{1,3}(?:bis|[A-F])?|amphi\s*\d+)/i;

export function searchRooms(query, rooms, synonyms, lang) {
  const q = fold(query);
  if (!q) return [];
  const scored = [];

  const numMatch = query.match(NUMBER_RE);
  const compact = fold(query).replace(/\s/g, '');

  for (const room of rooms) {
    let score = 0;
    const num = fold(room.number || '').replace(/\s/g, '');
    const idf = fold(room.id).replace(/\s/g, '');
    if (num && (num === compact || compact.endsWith(num))) score += 100;
    if (idf === compact) score += 120;
    if (numMatch) {
      const n = fold(numMatch[1]).replace(/\s/g, '');
      if (num === n || idf.endsWith(n)) score += 90;
    }
    const blob = fold(
      [
        room.name_fr,
        room.name_en,
        room.designation_plan,
        room.programme_plan,
        room.type,
        room.level,
        ...(room.keywords || []),
        ...(room.activities || [])
      ].join(' ')
    );
    if (blob.includes(q)) score += 40;
    const words = q.split(' ').filter(Boolean);
    let hit = 0;
    for (const w of words) if (blob.includes(w)) hit += 1;
    score += hit * 8;
    for (const [canon, list] of Object.entries(synonyms || {})) {
      const keys = [canon, ...list].map(fold);
      if (keys.some((k) => q.includes(k) || k.includes(q))) {
        if (blob.includes(canon) || (room.keywords || []).some((k) => keys.includes(fold(k)))) score += 25;
        if (room.type === canon) score += 20;
      }
    }
    if (score > 0) scored.push({ room, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 8).map((s) => s.room);
}

function neighbors(graph) {
  const map = new Map();
  for (const n of graph.nodes) map.set(n.id, []);
  for (const e of graph.edges) {
    map.get(e.a)?.push({ to: e.b, ...e });
    map.get(e.b)?.push({ to: e.a, ...e });
  }
  return map;
}

export function shortestPath(graph, fromId, toId, { stepFree = false } = {}) {
  if (!graph || fromId === toId) return null;
  const adj = neighbors(graph);
  if (!adj.has(fromId) || !adj.has(toId)) return null;
  const distM = new Map([[fromId, 0]]);
  const prev = new Map();
  const prevEdge = new Map();
  const pq = [[0, fromId]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (d !== distM.get(u)) continue;
    if (u === toId) break;
    for (const e of adj.get(u) || []) {
      if (stepFree && e.kind === 'stairs') continue;
      const walk = e.kind === 'walk';
      const cost = walk ? e.w / (graph.walking_m_s || 1.2) : e.w;
      const nd = d + cost;
      if (nd < (distM.get(e.to) ?? Infinity)) {
        distM.set(e.to, nd);
        prev.set(e.to, u);
        prevEdge.set(e.to, e);
        pq.push([nd, e.to]);
      }
    }
  }
  if (!prev.has(toId) && fromId !== toId) return null;
  const ids = [];
  let cur = toId;
  ids.push(cur);
  while (cur !== fromId) {
    cur = prev.get(cur);
    if (!cur) return null;
    ids.push(cur);
  }
  ids.reverse();
  const nodeById = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));
  const pathNodes = ids.map((id) => nodeById[id]);
  let metres = 0;
  let seconds = 0;
  const steps = [];
  for (let i = 1; i < ids.length; i++) {
    const e = prevEdge.get(ids[i]);
    const a = nodeById[ids[i - 1]];
    const b = nodeById[ids[i]];
    if (e?.kind === 'walk') {
      metres += e.w;
      seconds += e.w / (graph.walking_m_s || 1.2);
    } else {
      seconds += e?.w || 0;
    }
    if (a.level !== b.level) {
      steps.push({
        kind: e?.kind || 'vertical',
        from: a,
        to: b,
        text_fr: `${e?.kind === 'lift' ? 'Ascenseur' : 'Escaliers'} : ${a.level} → ${b.level}`,
        text_en: `${e?.kind === 'lift' ? 'Lift' : 'Stairs'}: ${a.level} → ${b.level}`
      });
    }
  }
  const roomsOnly = pathNodes.filter((n) => n.type === 'room');
  return {
    ids,
    nodes: pathNodes,
    rooms: roomsOnly,
    metres: Math.round(metres),
    seconds: Math.round(seconds),
    minutes: Math.max(1, Math.round(seconds / 60)),
    steps,
    stepFree
  };
}

export function parseHash() {
  const raw = (typeof location === 'undefined' ? '' : location.hash.replace(/^#/, '')) || '';
  const parts = raw.split('/').filter(Boolean);
  const out = { view: 'guide', roomId: null, fromId: null, toId: null };
  if (parts[0] === 'adventure') out.view = 'adventure';
  if (parts[0] === 'room' && parts[1]) out.roomId = decodeURIComponent(parts.slice(1).join('/'));
  if (parts[0] === 'route' && parts[1] && parts[2]) {
    out.fromId = decodeURIComponent(parts[1]);
    out.toId = decodeURIComponent(parts[2]);
  }
  return out;
}

export function setHash(state) {
  let h = '';
  if (state.view === 'adventure') h = '/adventure';
  else if (state.fromId && state.toId) h = `/route/${encodeURIComponent(state.fromId)}/${encodeURIComponent(state.toId)}`;
  else if (state.roomId) h = `/room/${encodeURIComponent(state.roomId)}`;
  const next = `#${h}`;
  if (location.hash !== next) history.replaceState(null, '', next || '#');
}

export const ACTIVITY_COLORS = {
  teaching: '#5b9dff',
  research: '#b794f6',
  student_life: '#4ade80',
  companies: '#f5c542'
};

export function roomColor(room) {
  if (room.activities?.includes('teaching')) return ACTIVITY_COLORS.teaching;
  if (room.activities?.includes('research')) return ACTIVITY_COLORS.research;
  if (room.activities?.includes('student_life')) return ACTIVITY_COLORS.student_life;
  if (room.activities?.includes('companies')) return ACTIVITY_COLORS.companies;
  if (room.type === 'toilets') return '#64748b';
  if (room.type === 'office') return '#94a3b8';
  if (room.type === 'admin') return '#fb923c';
  return '#6b7280';
}

export function polyToPath(poly, flipY, h) {
  return poly
    .map((p, i) => {
      const x = p[0];
      const y = flipY ? h - p[1] : p[1];
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}
