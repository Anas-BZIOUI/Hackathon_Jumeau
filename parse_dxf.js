const fs = require('fs');

const raw = fs.readFileSync('Plan ENSIIE R+2 présentation.dxf', 'utf8');
const lines = raw.split(/\r?\n/);

const polylines = [];
let current = null;
let inEntities = false;
let i = 0;
while (i < lines.length) {
  const code = parseInt(lines[i].trim());
  const value = lines[i + 1] ? lines[i + 1].trim() : '';
  if (code === 2 && value === 'ENTITIES') { inEntities = true; i += 2; continue; }
  if (code === 0 && value === 'ENDSEC' && inEntities) { inEntities = false; i += 2; continue; }
  if (!inEntities) { i += 2; continue; }
  if (code === 0) {
    if (current && current.type === 'LWPOLYLINE') polylines.push(current);
    if (value === 'LWPOLYLINE') current = { type: 'LWPOLYLINE', layer: '', vertices: [], closed: false };
    else current = null;
    i += 2; continue;
  }
  if (!current) { i += 2; continue; }
  if (code === 8) current.layer = value;
  else if (code === 70) current.closed = (parseInt(value) & 1) === 1;
  else if (code === 10) current.vertices.push([parseFloat(value), parseFloat(lines[i+3]?lines[i+3].trim():'0')]);
  i += 2;
}
if (current && current.type === 'LWPOLYLINE') polylines.push(current);

function polyArea(v) { let a=0; for (let k=0;k<v.length;k++){const[x1,y1]=v[k],[x2,y2]=v[(k+1)%v.length];a+=x1*y2-x2*y1;} return Math.abs(a)/2; }

const ox = -493.519, oy = 915.713;

const namedLayers = new Set(['amphi 201','C1','C2','C3','C4','C5','Entresol technique','Entresol technique 2','école']);

const features = [];

for (const p of polylines) {
  if (!p.closed || p.vertices.length < 3) continue;
  const area = polyArea(p.vertices);
  const layer = p.layer;
  const isBuilding = layer === 'école';
  const isZone = namedLayers.has(layer) && !isBuilding;
  if (!isBuilding && !isZone) continue;
  const coords = p.vertices.map(([x,y]) => [x + ox, y + oy]);
  coords.push(coords[0]);
  features.push({
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {
      kind: isBuilding ? 'batiment' : 'zone',
      nom: layer,
      surface: Math.round(area * 10) / 10
    }
  });
}

const csvRaw = fs.readFileSync('salles.csv', 'utf8');
const csvLines = csvRaw.split(/\r?\n/).filter(Boolean);
const header = csvLines.shift().split(',');
for (const line of csvLines) {
  const cells = parseCsvLine(line);
  const row = {};
  header.forEach((h, idx) => { row[h] = cells[idx] ?? ''; });
  if (row.niveau !== 'R+2') continue;
  const x = parseFloat(row.x), y = parseFloat(row.y);
  if (Number.isNaN(x) || Number.isNaN(y)) continue;
  features.push({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [x, y] },
    properties: {
      kind: 'salle',
      numero: row.numero,
      libelle: row.libelle,
      etage: row.etage,
      type_piece: row.type_piece,
      surface: parseFloat(row.surface_polygone_m2) || null,
      fiable: row.contour === 'oui'
    }
  });
}

const geojson = { type: 'FeatureCollection', features };
fs.writeFileSync('pieces_R+2.geojson', JSON.stringify(geojson, null, 2));

const polys = features.filter(f => f.geometry.type === 'Polygon').length;
const pts = features.filter(f => f.geometry.type === 'Point').length;
console.log(`Wrote pieces_R+2.geojson: ${polys} polygons (batiment + zones), ${pts} room points`);

function parseCsvLine(line) {
  const out=[];let cur='';let inQ=false;
  for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(inQ&&line[i+1]==='"'){cur+='"';i++;}else inQ=!inQ;}else if(c===','&&!inQ){out.push(cur);cur='';}else cur+=c;}
  out.push(cur);return out;
}
