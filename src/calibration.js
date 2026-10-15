export const CALIBRATION_KEY = 'ensiie-alignment-v1';
export const LEVELS = ['RDC', 'R+1', 'R+2'];

export function newCalibration() {
  return { version: 1, navigation: 'both', landmarks: [
    { id: 'stairs-main', type: 'stairs', label: 'A', points: {} },
    { id: 'lift-1', type: 'lift', label: 'B', points: {} },
    { id: 'control-3', type: 'landmark', label: 'C', points: {} }
  ] };
}

export function validateCalibration(value, floors) {
  if (value?.version !== 1 || !Array.isArray(value.landmarks) || value.landmarks.length < 2 || value.landmarks.length > 20) throw new Error('Invalid calibration');
  const ids = new Set();
  for (const item of value.landmarks) {
    if (typeof item.id !== 'string' || ids.has(item.id) || !['stairs', 'lift', 'landmark'].includes(item.type) || typeof item.label !== 'string' || item.label.length > 80 || !item.points || typeof item.points !== 'object') throw new Error('Invalid landmark');
    ids.add(item.id);
    for (const [lv, p] of Object.entries(item.points)) {
      const size = floors.levels[lv]?.size;
      if (!size || !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite) || p[0] < 0 || p[1] < 0 || p[0] > size[0] || p[1] > size[1]) throw new Error('Invalid coordinates');
    }
  }
  return { version: 1, navigation: 'both', landmarks: value.landmarks.map(l => ({ ...l, points: { ...l.points } })) };
}

export function solveCalibration(draft) {
  const results = { RDC: { offset: [0, 0], rotation_deg: 0, residual_m: 0, count: draft.landmarks.filter(l => l.points.RDC).length } };
  for (const lv of LEVELS.slice(1)) {
    const pairs = draft.landmarks.filter(l => l.points.RDC && l.points[lv]).map(l => ({ local: l.points[lv], reference: l.points.RDC }));
    if (pairs.length < 2) { results[lv] = { error: 'points', count: pairs.length }; continue; }
    const span = key => Math.max(...pairs.flatMap(a => pairs.map(b => Math.hypot(a[key][0] - b[key][0], a[key][1] - b[key][1]))));
    if (span('local') < 3 || span('reference') < 3) { results[lv] = { error: 'separation', count: pairs.length }; continue; }
    const mean = key => [0, 1].map(i => pairs.reduce((sum, p) => sum + p[key][i], 0) / pairs.length);
    const a = mean('local'), b = mean('reference');
    let dot = 0, cross = 0;
    for (const p of pairs) {
      const x = p.local[0] - a[0], y = p.local[1] - a[1];
      const u = p.reference[0] - b[0], v = p.reference[1] - b[1];
      dot += x * u + y * v; cross += x * v - y * u;
    }
    const angle = Math.atan2(cross, dot), c = Math.cos(angle), s = Math.sin(angle);
    const offset = [b[0] - c * a[0] + s * a[1], b[1] - s * a[0] - c * a[1]];
    const residuals = pairs.map(p => Math.hypot(c * p.local[0] - s * p.local[1] + offset[0] - p.reference[0], s * p.local[0] + c * p.local[1] + offset[1] - p.reference[1]));
    const residual_m = Math.sqrt(residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length);
    results[lv] = { offset, rotation_deg: angle * 180 / Math.PI, residual_m, count: pairs.length, error: residual_m > 1 ? 'residual' : null };
  }
  const checks = [];
  const transform = (p, r) => {
    const a = r.rotation_deg * Math.PI / 180;
    return [Math.cos(a)*p[0]-Math.sin(a)*p[1]+r.offset[0], Math.sin(a)*p[0]+Math.cos(a)*p[1]+r.offset[1]];
  };
  for (const landmark of draft.landmarks) {
    if (landmark.points.RDC || !landmark.points['R+1'] || !landmark.points['R+2'] || !results['R+1'].offset || !results['R+2'].offset) continue;
    const a = transform(landmark.points['R+1'], results['R+1']), b = transform(landmark.points['R+2'], results['R+2']);
    checks.push({ label: landmark.label, error_m: Math.hypot(a[0]-b[0], a[1]-b[1]) });
  }
  return { levels: results, ready: LEVELS.slice(1).every(lv => !results[lv].error), checks };
}

export function calibratedScene(floors, links, draft) {
  if (!draft) return { floors, links };
  const solution = solveCalibration(draft);
  if (!solution.ready) return { floors, links };
  return {
    floors: { ...floors, reference: 'RDC', calibration_source: 'user-marked', levels: Object.fromEntries(Object.entries(floors.levels).map(([lv, meta]) => [lv, { ...meta, ...solution.levels[lv] }])) },
    links: draft.landmarks.filter(l => l.type !== 'landmark' && Object.keys(l.points).length >= 2).map(landmark => ({
      ...links.find(link => link.id === landmark.id), id: landmark.id, type: landmark.type, label: landmark.label,
      points: LEVELS.filter(lv => landmark.points[lv]).map(level => ({ level, x: landmark.points[level][0], y: landmark.points[level][1] }))
    }))
  };
}
