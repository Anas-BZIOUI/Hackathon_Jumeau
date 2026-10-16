import {validateRoomDetails,applyRoomDetails} from '../src/roomDetails.js';
import {SCHOOL_RESOURCES} from '../src/schoolResources.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractDoors } from './doors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'data');
fs.mkdirSync(outDir, { recursive: true });

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.length);
  const rows = lines.map((line) => {
    const out = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = !inQ;
      } else if (c === ',' && !inQ) {
        out.push(cur);
        cur = '';
      } else cur += c;
    }
    out.push(cur);
    return out;
  });
  const header = rows.shift();
  return rows.map((cells) => {
    const row = {};
    header.forEach((h, i) => {
      row[h] = cells[i] ?? '';
    });
    return row;
  });
}

function slug(s) {
  return String(s || 'espace')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 28) || 'espace';
}

function classify(libelle, numero, programme) {
  const t = `${libelle} ${numero} ${programme}`.toLowerCase();
  if (/amphi/.test(t)) {
    return {
      type: 'amphitheatre',
      activities: ['teaching'],
      audience: 'all',
      keywords: ['amphi', 'conférence', 'lecture', 'cours magistral']
    };
  }
  if (/salle de td|salle de cours/.test(t)) {
    return {
      type: 'classroom',
      activities: ['teaching'],
      audience: 'students',
      keywords: ['td', 'cours', 'classe', 'classroom']
    };
  }
  if (/salle de tp|atelier informatique|plateforme technologique|platech/.test(t)) {
    return {
      type: 'lab',
      activities: ['teaching', 'research'],
      audience: 'students',
      keywords: ['tp', 'lab', 'labo', 'informatique', 'platech']
    };
  }
  if (/salle de réunion|salle mutualisée/.test(t)) {
    return {
      type: 'office',
      activities: ['companies', 'teaching'],
      audience: 'all',
      keywords: ['réunion', 'meeting', 'entreprises', 'business', 'conference room']
    };
  }
  if (/scolarité|archives rh|accueil|comptabilité|courrier/.test(t)) {
    return {
      type: 'admin',
      activities: [],
      audience: 'all',
      keywords: ['admin', 'scolarité', 'accueil', 'secrétariat', 'rh']
    };
  }
  if (/foyer|cafét|cuisine/.test(t)) {
    return {
      type: 'restaurant',
      activities: ['student_life'],
      audience: 'students',
      keywords: ['manger', 'eat', 'cafet', 'foyer', 'restauration']
    };
  }
  if (/local étudiants|club|association|salle bleue|espace détente|salle de sport|forum/.test(t)) {
    const companies = /forum/.test(t);
    return {
      type: /sport/.test(t) ? 'student_life' : 'association',
      activities: companies ? ['student_life', 'companies'] : ['student_life'],
      audience: 'students',
      keywords: ['asso', 'clubs', 'vie étudiante', 'détente', 'sport']
    };
  }
  if (/sanit|douche|wc/.test(t)) {
    return {
      type: 'toilets',
      activities: [],
      audience: 'all',
      keywords: ['toilettes', 'wc', 'sanitaires', 'pmr']
    };
  }
  if (/data center|serveur|local informatique|reprograph/.test(t)) {
    return {
      type: 'admin',
      activities: ['research'],
      audience: 'staff',
      keywords: ['serveur', 'print', 'imprimer', 'photocopie', 'reprographie']
    };
  }
  if (/bureau/.test(t)) {
    return {
      type: 'office',
      activities: [],
      audience: 'staff',
      keywords: ['bureau', 'office', 'enseignant']
    };
  }
  if (/dépôt pédagogique|réserve pédagogique|salle des enseignants/.test(t)) {
    return {
      type: 'other',
      activities: ['teaching'],
      audience: 'staff',
      keywords: ['dépôt', 'pédagogie']
    };
  }
  if (/sas|issue de secours/.test(t)) {
    return {
      type: 'circulation',
      activities: [],
      audience: 'all',
      keywords: ['entrée', 'sortie', 'secours']
    };
  }
  if (/\blt\b|local technique|cta|ménage|entretien|vélo|vestiaire/.test(t)) {
    return {
      type: 'other',
      activities: [],
      audience: 'staff',
      keywords: ['technique', 'local']
    };
  }
  return {
    type: 'other',
    activities: [],
    audience: 'all',
    keywords: []
  };
}

const TYPE_FR = {
  classroom: 'Salle de cours',
  amphitheatre: 'Amphithéâtre',
  lab: 'Laboratoire / TP',
  office: 'Bureau',
  admin: 'Service administratif',
  association: 'Local associatif',
  student_life: 'Vie étudiante',
  restaurant: 'Restauration',
  circulation: 'Circulation',
  stairs: 'Escalier',
  lift: 'Ascenseur',
  toilets: 'Sanitaires',
  other: 'Autre espace'
};
const TYPE_EN = {
  classroom: 'Classroom',
  amphitheatre: 'Lecture hall',
  lab: 'Lab / practical room',
  office: 'Office',
  admin: 'Administration',
  association: 'Student club space',
  student_life: 'Student life',
  restaurant: 'Food / foyer',
  circulation: 'Circulation',
  stairs: 'Stairs',
  lift: 'Lift',
  toilets: 'Toilets',
  other: 'Other space'
};

function describe(room) {
  const place = room.number ? `${room.number}` : room.designation_plan;
  const fr = `${TYPE_FR[room.type] || 'Espace'} « ${room.designation_plan || place} » au ${room.level}. Informations tirées des plans d'architecte ; usage réel à confirmer sur place.`;
  const en = `${TYPE_EN[room.type] || 'Space'} “${room.designation_plan || place}” on ${room.level}. Taken from architect plans; real use must be confirmed on site.`;
  return { fr, en };
}

function rectFromArea(x, y, area) {
  const a = Math.max(Number(area) || 12, 4);
  const w = Math.sqrt(a * 1.4);
  const h = a / w;
  return [
    [x - w / 2, y - h / 2],
    [x + w / 2, y - h / 2],
    [x + w / 2, y + h / 2],
    [x - w / 2, y + h / 2],
    [x - w / 2, y - h / 2]
  ];
}

function dist(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.hypot(dx, dy);
}

const csv = parseCsv(fs.readFileSync(path.join(root, 'salles.csv'), 'utf8'));
const usedIds = new Map();

// The SVG exports preserve the architect's room outlines, including R+2
// (whose GeoJSON contains only room label points). Convert SVG y-down to metres y-up.
const namedContours = new Map();
for (const [level, height] of [['RDC', 35], ['R+1', 60], ['R+2', 125]]) {
  const svgPath = path.join(root, `plan_${level}.svg`);
  if (!fs.existsSync(svgPath)) continue;
  const svg = fs.readFileSync(svgPath, 'utf8');
  for (const match of svg.matchAll(/<path\s+id="([^"]+)"\s+d="([^"]+)"/g)) {
    // Current exports use absolute M/L/Z commands only. Never silently interpret curves.
    if (/[ACHQSTVachlmqstv]/.test(match[2])) continue;
    const values = match[2].match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    const ring = [];
    for (let i = 0; i + 1 < values.length; i += 2) ring.push([values[i], height - values[i + 1]]);
    if (ring.length >= 3) {
      const key = slug(match[1]);
      if (!namedContours.has(key)) namedContours.set(key, []);
      namedContours.get(key).push(ring);
    }
  }
}

const rooms = csv
  .filter((r) => r.niveau)
  .map((r, index) => {
    const level = r.niveau.trim();
    const number = (r.numero || '').trim();
    const designation = (r.libelle || '').trim();
    let idBase = number ? `${level}-${number.replace(/\s+/g, '')}` : `${level}-${slug(designation || 'espace')}`;
    const n = usedIds.get(idBase) || 0;
    usedIds.set(idBase, n + 1);
    const id = n === 0 ? idBase : `${idBase}-${n + 1}`;
    const cls = classify(designation, number, r.nom_programme);
    const x = parseFloat(r.x);
    const y = parseFloat(r.y);
    const areaPlan = parseFloat(r.surface_m2);
    const areaContour = parseFloat(r.surface_polygone_m2);
    const reliable = r.contour === 'oui';
    const nameFr = [number, designation].filter(Boolean).join(' · ') || id;
    const nameEn = nameFr;
    const candidates = namedContours.get(slug(`${level}-${number || designation}`)) || [];
    const contour = candidates.length === 1 ? candidates[0] : candidates.slice().sort((a, b) => {
      const distance = ring => {
        const cx = ring.reduce((s, p) => s + p[0], 0) / ring.length;
        const cy = ring.reduce((s, p) => s + p[1], 0) / ring.length;
        return Math.hypot(cx - x, cy - y);
      };
      return distance(a) - distance(b);
    })[0];
    const room = {
      id,
      level,
      number: number || null,
      designation_plan: designation || null,
      programme_plan: (r.nom_programme || '').trim() || null,
      area_plan_m2: Number.isFinite(areaPlan) ? areaPlan : null,
      area_contour_m2: Number.isFinite(areaContour) ? areaContour : null,
      reliable,
      contour_quality: r.contour || 'non',
      centroid: [x, y],
      polygon: contour || rectFromArea(x, y, areaContour || areaPlan || 12),
      geometry_source: contour ? 'architect-svg' : 'estimated-marker',
      type: cls.type,
      activities: cls.activities,
      audience: cls.audience,
      name_fr: nameFr,
      name_en: nameEn,
      description_fr: '',
      description_en: '',
      capacity: null,
      capacity_estimated:
        cls.type === 'classroom' || cls.type === 'lab'
          ? Math.max(8, Math.round((areaPlan || areaContour || 20) / 1.6))
          : cls.type === 'amphitheatre'
            ? Math.max(40, Math.round((areaPlan || 80) / 0.85))
            : null,
      equipment: [],
      accessible: /pmr/i.test(`${designation} ${number}`) ? true : null,
      opening_hours: null,
      keywords: cls.keywords,
      photo: null,
      verified_on_site: false,
      source: 'architect-plan'
    };

    if (id === 'R+2-C53' || /c53/i.test(number)) {
      room.verified_on_site = true;
      room.source = 'brief';
      room.keywords.push('hackathon', 'platech', 'sIIEnext');
      room.activities = [...new Set([...room.activities, 'teaching', 'research'])];
      room.description_fr =
        'Plateforme technologique (Platech 1) au sIIEnext. Salle de travail du hackathon (C53). Usage confirmé par l’énoncé du projet.';
      room.description_en =
        'Technology platform (Platech 1) at sIIEnext. Hackathon work room (C53). Confirmed by the project brief.';
    }
    if (/cabanes/i.test(designation)) {
      room.verified_on_site = true;
      room.source = 'brief';
      room.description_fr =
        'Amphithéâtre Cabanes. Cité dans le programme du hackathon (conférence, jury des projets 1 à 3).';
      room.description_en =
        'Cabanes lecture hall. Named in the hackathon schedule (talk, jury for projects 1–3).';
    }
    if (number === '101' && level === 'R+1') {
      room.verified_on_site = true;
      room.source = 'brief';
      room.description_fr = 'Amphithéâtre 101. Lieu de lancement du hackathon selon l’énoncé.';
      room.description_en = 'Lecture hall 101. Hackathon launch venue according to the brief.';
    }
    if (!room.description_fr) {
      const d = describe(room);
      room.description_fr = d.fr;
      room.description_en = d.en;
    }
    return room;
  });

const floors = {
  reference: 'RDC',
  levels: {
    RDC: { offset: [38, 42], rotation_deg: 0, z: 0, size: [60, 35], label_fr: 'Rez-de-chaussée', label_en: 'Ground floor' },
    'R+1': { offset: [38, 32], rotation_deg: 0, z: 7.5, size: [60, 60], label_fr: 'Niveau 1', label_en: 'Level 1' },
    'R+2': { offset: [0, 0], rotation_deg: 0, z: 15, size: [135, 125], label_fr: 'Niveau 2 / sIIEnext', label_en: 'Level 2 / sIIEnext' }
  },
  control_points: ['stairs-main', 'lift-1'],
  residual_m: null,
  note: 'Offsets are a working alignment so floors share a visual core. They must be refined with on-site control points (stairs, lift).'
};

const findRoom = (pred) => rooms.find(pred);

const accueil = findRoom((r) => r.level === 'R+2' && /accueil/i.test(r.designation_plan || ''));
const foyer = findRoom((r) => /foyer/i.test(r.designation_plan || ''));
const rotonde = findRoom((r) => /rotonde/i.test(r.designation_plan || ''));
const forum = findRoom((r) => r.number === 'C3');
const c53 = findRoom((r) => r.number === 'C53');

const links = [
  {
    id: 'stairs-main',
    type: 'stairs',
    accessible: false,
    cost_s_per_level: 20,
    points: [
      { level: 'RDC', x: foyer ? foyer.centroid[0] : 36, y: foyer ? foyer.centroid[1] + 8 : 20 },
      { level: 'R+1', x: rotonde ? rotonde.centroid[0] : 30, y: rotonde ? rotonde.centroid[1] + 12 : 22 },
      { level: 'R+2', x: forum ? forum.centroid[0] + 10 : 30, y: forum ? forum.centroid[1] : 64 }
    ]
  },
  {
    id: 'lift-1',
    type: 'lift',
    accessible: true,
    cost_s_wait: 15,
    cost_s_per_level: 8,
    points: [
      { level: 'RDC', x: 50, y: 18 },
      { level: 'R+1', x: 50, y: 28 },
      { level: 'R+2', x: accueil ? accueil.centroid[0] : 62, y: accueil ? accueil.centroid[1] - 6 : 110 }
    ]
  }
];

function world(level, x, y, aligned = true) {
  const off = floors.levels[level].offset;
  const a = aligned ? 1 : 0;
  return [x + off[0] * a, y + off[1] * a];
}

const nodes = rooms.map((r) => ({
  id: r.id,
  type: 'room',
  level: r.level,
  x: r.centroid[0],
  y: r.centroid[1]
}));

for (const link of links) {
  for (const p of link.points) {
    nodes.push({
      id: `${link.id}@${p.level}`,
      type: link.type,
      level: p.level,
      x: p.x,
      y: p.y,
      accessible: link.accessible
    });
  }
}

const hubs = [
  { id: 'hub-RDC-foyer', level: 'RDC', x: foyer ? foyer.centroid[0] : 46, y: foyer ? foyer.centroid[1] : 13 },
  { id: 'hub-R+1-core', level: 'R+1', x: 28, y: 30 },
  { id: 'hub-R+2-2xx', level: 'R+2', x: 100, y: 40 },
  { id: 'hub-R+2-cxx', level: 'R+2', x: 40, y: 100 }
];
for (const h of hubs) {
  nodes.push({ id: h.id, type: 'corridor', level: h.level, x: h.x, y: h.y });
}

const edges = [];
function addEdge(a, b, extra = {}) {
  const na = nodes.find((n) => n.id === a);
  const nb = nodes.find((n) => n.id === b);
  if (!na || !nb) return;
  const w = extra.w ?? dist([na.x, na.y], [nb.x, nb.y]);
  edges.push({ a, b, w: Math.round(w * 10) / 10, accessible: extra.accessible ?? true, kind: extra.kind || 'walk' });
}

const byLevel = {};
for (const n of nodes.filter((n) => n.type === 'room')) {
  (byLevel[n.level] ||= []).push(n);
}

for (const [level, list] of Object.entries(byLevel)) {
  for (const n of list) {
    const nearest = list
      .filter((o) => o.id !== n.id)
      .map((o) => ({ o, d: dist([n.x, n.y], [o.x, o.y]) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .filter((x) => x.d < 22);
    for (const { o, d } of nearest) {
      if (n.id < o.id) addEdge(n.id, o.id, { w: d });
    }
    const levelHubs = hubs.filter((h) => h.level === level);
    let best = null;
    for (const h of levelHubs) {
      const d = dist([n.x, n.y], [h.x, h.y]);
      if (!best || d < best.d) best = { h, d };
    }
    if (best) addEdge(n.id, best.h.id, { w: best.d });
  }
}

for (const h of hubs) {
  for (const link of links) {
    const nid = `${link.id}@${h.level}`;
    if (nodes.some((n) => n.id === nid) && h.level === link.points.find((p) => p.level === h.level)?.level) {
      const p = link.points.find((p) => p.level === h.level);
      addEdge(h.id, nid, { w: dist([h.x, h.y], [p.x, p.y]) });
    }
  }
}

const order = ['RDC', 'R+1', 'R+2'];
for (const link of links) {
  for (let i = 0; i < order.length - 1; i++) {
    const a = `${link.id}@${order[i]}`;
    const b = `${link.id}@${order[i + 1]}`;
    const cost = (link.cost_s_wait || 0) + link.cost_s_per_level;
    addEdge(a, b, { w: cost, accessible: link.accessible, kind: link.type });
  }
}

const graph = { nodes, edges, walking_m_s: 1.2 };

const tours = [
  {
    id: 'tour-student',
    persona: 'student',
    title_fr: 'Première semaine',
    title_en: 'First week',
    steps: [
      { roomId: accueil?.id, text_fr: 'L’accueil du sIIEnext (R+2). Point d’entrée naturel du bâtiment récent.', text_en: 'sIIEnext reception (level 2). Natural entry to the newer wing.' },
      { roomId: c53?.id, text_fr: 'C53 — Platech 1, votre salle de projet.', text_en: 'C53 — Platech 1, your project room.' },
      { roomId: forum?.id, text_fr: 'Espace C3 : son identification comme Forum reste à confirmer.', text_en: 'Space C3: its identification as the Forum still needs confirmation.' },
      { roomId: foyer?.id, text_fr: 'Le foyer étudiants au rez-de-chaussée : vie associative et restauration sur le plan.', text_en: 'Student foyer on the ground floor: clubs and catering on the plan.' }
    ].filter((s) => s.roomId)
  },
  {
    id: 'tour-visitor',
    persona: 'visitor',
    title_fr: 'Visite ouverte',
    title_en: 'Open-day overview',
    steps: [
      { roomId: findRoom((r) => /cabanes/i.test(r.designation_plan || ''))?.id, text_fr: 'Amphithéâtre Cabanes, grand espace de conférence au RDC.', text_en: 'Cabanes lecture hall, the large conference space on the ground floor.' },
      { roomId: foyer?.id, text_fr: 'Foyer : premier contact avec la vie étudiante.', text_en: 'Foyer: first contact with student life.' },
      { roomId: findRoom((r) => r.level === 'R+1' && r.number === '101')?.id, text_fr: 'Amphi 101 au premier étage.', text_en: 'Lecture hall 101 on level 1.' },
      { roomId: c53?.id, text_fr: 'sIIEnext et la plateforme technologique C53.', text_en: 'sIIEnext and the C53 technology platform.' }
    ].filter((s) => s.roomId)
  },
  {
    id: 'tour-company',
    persona: 'company',
    title_fr: 'Parcours entreprises',
    title_en: 'Company route',
    steps: [
      { roomId: accueil?.id, text_fr: 'Accueil R+2.', text_en: 'Level-2 reception.' },
      { roomId: findRoom((r) => r.number === '216')?.id, text_fr: 'Salle de réunion 216, identifiée sur le plan.', text_en: 'Meeting room 216, labelled on the plan.' },
      { roomId: forum?.id, text_fr: 'C3 — espace de rencontre possible ; appellation Forum à confirmer sur place.', text_en: 'C3 — possible meeting space; Forum name needs on-site confirmation.' },
      { roomId: c53?.id, text_fr: 'Plateforme technologique C53.', text_en: 'C53 technology platform.' }
    ].filter((s) => s.roomId)
  }
];

const metro = {
  lines: [
    { id: 'teaching', color: '#3b82f6' },
    { id: 'research', color: '#8b5cf6' },
    { id: 'student_life', color: '#22c55e' },
    { id: 'companies', color: '#eab308' }
  ],
  stations: [
    { id: 'st-cabanes', roomId: findRoom((r) => /cabanes/i.test(r.designation_plan || ''))?.id, x: 80, y: 260, lines: ['teaching'], label: 'Cabanes' },
    { id: 'st-foyer', roomId: foyer?.id, x: 180, y: 260, lines: ['student_life'], label: 'Foyer' },
    { id: 'st-101', roomId: findRoom((r) => r.id === 'R+1-101')?.id, x: 80, y: 180, lines: ['teaching'], label: 'Amphi 101' },
    { id: 'st-tp', roomId: findRoom((r) => r.id === 'R+1-130')?.id, x: 180, y: 180, lines: ['teaching', 'research'], label: 'TP 130' },
    { id: 'st-201', roomId: findRoom((r) => r.number === '201')?.id, x: 300, y: 120, lines: ['teaching'], label: 'Augé' },
    { id: 'st-216', roomId: findRoom((r) => r.number === '216')?.id, x: 380, y: 80, lines: ['companies'], label: 'Réunion 216' },
    { id: 'st-forum', roomId: forum?.id, x: 260, y: 80, lines: ['student_life', 'companies'], label: 'Forum' },
    { id: 'st-accueil', roomId: accueil?.id, x: 180, y: 40, lines: ['student_life'], label: 'Accueil' },
    { id: 'st-c53', roomId: c53?.id, x: 380, y: 40, lines: ['teaching', 'research'], label: 'C53 Platech' },
    { id: 'st-sport', roomId: findRoom((r) => r.number === 'C44')?.id, x: 300, y: 40, lines: ['student_life'], label: 'Sport' },
    { id: 'st-bleue', roomId: findRoom((r) => r.number === 'C36')?.id, x: 220, y: 80, lines: ['student_life'], label: 'Salle bleue' }
  ].filter((s) => s.roomId)
};

const synonyms = {
  print: ['imprimer', 'photocopie', 'reprographie', 'printer', 'printing', 'photocopier', 'scan', 'scanner'],
  eat: ['manger', 'restaurant', 'cafet', 'foyer', 'cuisine', 'food', 'lunch', 'cafeteria'],
  toilets: ['wc', 'toilettes', 'sanitaires', 'bathroom', 'restroom', 'washroom'],
  lift: ['ascenseur', 'elevator', 'pmr'],
  clubs: ['associations', 'assos', 'club', 'foyer', 'student club', 'student society'],
  admin: ['scolarité', 'secrétariat', 'accueil', 'administration', 'student services', 'registrar', 'reception'],
  lab: ['tp', 'labo', 'laboratoire', 'platech', 'c53'],
  sport: ['gym', 'salle de sport'],
  meeting: ['réunion', 'meeting', 'entreprises', 'business', 'conference room'],
  amphi: ['amphithéâtre', 'lecture', 'conférence'],
  classroom: ['td', 'cours', 'salle'],
  entrance: ['entrée', 'accueil', 'sas']
};

const resources = [
  ...SCHOOL_RESOURCES
];

let zones = { type: 'FeatureCollection', features: [] };
const geoPath = path.join(root, 'pieces_R+2.geojson');
if (fs.existsSync(geoPath)) {
  const gj = JSON.parse(fs.readFileSync(geoPath, 'utf8'));
  zones = {
    type: 'FeatureCollection',
    features: gj.features.filter((f) => f.properties && (f.properties.kind === 'zone' || f.properties.kind === 'batiment'))
  };
}

const write = (name, data) => {
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(data, null, 2));
  console.log('wrote', name, Array.isArray(data) ? data.length : data.features?.length ?? Object.keys(data).length);
};

const roomDetailsFile=path.join(root,'data-src','room-details.json');
const sharedRooms=fs.existsSync(roomDetailsFile)?applyRoomDetails(rooms,validateRoomDetails(JSON.parse(fs.readFileSync(roomDetailsFile,'utf8')),rooms),'project-export'):rooms;
write('rooms.json', sharedRooms);
write('floors.json', floors);
write('links.json', links);
write('graph.json', graph);
write('tours.json', tours);
write('metro.json', metro);
write('synonyms.json', synonyms);
write('zones.json', zones);
write('resources.json', resources);

// Long straight strokes from the architect's wall layer. Short door swings and
// annotation details are intentionally omitted from this simplified walkthrough.
const walls = {};
for (const [level, height] of [['RDC',35],['R+1',60],['R+2',125]]) {
  const svg = fs.readFileSync(path.join(root, `plan_${level}.svg`), 'utf8');
  const group = svg.match(/<g id="murs"[^>]*>([\s\S]*?)<\/g>/)?.[1] || '';
  const segments = [], seen = new Set();
  for (const path of group.matchAll(/<path[^>]*\sd="([^"]+)"/g)) {
    let previous = null;
    for (const token of path[1].matchAll(/([ML])\s*(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/g)) {
      const p = [Number(token[2]), height - Number(token[3])];
      if (token[1] === 'L' && previous && Math.hypot(p[0]-previous[0],p[1]-previous[1]) >= 1.3) {
        const key = [previous.join(','), p.join(',')].sort().join(':');
        if (!seen.has(key)) { seen.add(key); segments.push([previous,p]); }
      }
      previous = p;
    }
  }
  walls[level] = segments;
}
write('walls.json', walls);
const doors = {};
const symbolFile=path.join(root,'data-src','door-symbols.json');
const doorSymbols=fs.existsSync(symbolFile)?JSON.parse(fs.readFileSync(symbolFile,'utf8')):{};
for (const [level,height] of [['RDC',35],['R+1',60],['R+2',125]]) {
  doors[level] = extractDoors(fs.readFileSync(path.join(root,`plan_${level}.svg`),'utf8'),height,rooms.filter(r=>r.level===level),doorSymbols[level]);
}
write('doors.json',doors);

console.log(`rooms=${rooms.length} nodes=${nodes.length} edges=${edges.length}`);
