import test from 'node:test';
import assert from 'node:assert/strict';
import { newCalibration, solveCalibration, validateCalibration, calibratedScene } from '../src/calibration.js';
import { worldPoint } from '../src/core.js';

const floors = { levels: Object.fromEntries(['RDC', 'R+1', 'R+2'].map(lv => [lv, { size: [200, 200], offset: [99, 99], rotation_deg: 0 }])) };
function fixture(angle = 0, offset = [10, 20]) {
  const draft = newCalibration();
  const c = Math.cos(angle), s = Math.sin(angle);
  [[20, 20], [40, 20], [30, 45]].forEach((p, i) => {
    draft.landmarks[i].points = { 'R+1': p, 'R+2': p, RDC: [c*p[0]-s*p[1]+offset[0], s*p[0]+c*p[1]+offset[1]] };
  });
  return draft;
}
test('recovers a rigid rotation and translation without changing scale', () => {
  const draft = fixture(Math.PI / 6);
  const solved = solveCalibration(draft);
  assert(solved.ready);
  for (const lv of ['R+1', 'R+2']) {
    assert(Math.abs(solved.levels[lv].rotation_deg - 30) < 1e-8);
    assert(solved.levels[lv].residual_m < 1e-8);
    assert(Math.abs(solved.levels[lv].offset[0] - 10) < 1e-8);
  }
  const scene = calibratedScene(floors, [], draft);
  const actual = worldPoint(scene.floors, 'R+1', 20, 20, true);
  actual.forEach((n,i) => assert(Math.abs(n-draft.landmarks[0].points.RDC[i]) < 1e-8));
  assert.deepEqual(worldPoint(scene.floors, 'R+1', 20, 20, false), [20,20]);
});
test('rejects incomplete, coincident and badly matching points', () => {
  assert(!solveCalibration(newCalibration()).ready);
  const close = fixture(); close.landmarks = close.landmarks.slice(0,2);
  close.landmarks[1].points = structuredClone(close.landmarks[0].points);
  assert.equal(solveCalibration(close).levels['R+1'].error, 'separation');
  const wrong = fixture(); wrong.landmarks[2].points['R+1'] = [90,90];
  assert.equal(solveCalibration(wrong).levels['R+1'].error, 'residual');
  assert(!solveCalibration(wrong).ready);
});
test('checks imported bounds, finite values, identifiers and versions', () => {
  assert(validateCalibration(fixture(), floors));
  const invalid = fixture(); invalid.landmarks[0].points.RDC = [Infinity,0];
  assert.throws(() => validateCalibration(invalid, floors));
  invalid.landmarks[0].points.RDC = [-1,0];
  assert.throws(() => validateCalibration(invalid, floors));
  assert.throws(() => validateCalibration({ ...fixture(), version: 2 }, floors));
  const duplicate = fixture(); duplicate.landmarks[1].id = duplicate.landmarks[0].id;
  assert.throws(() => validateCalibration(duplicate, floors));
});
test('uses marked vertical links and leaves original scene data untouched', () => {
  const draft = fixture(); draft.landmarks[1].type = 'stairs';
  const original = structuredClone(floors);
  const scene = calibratedScene(floors, [{ id:'lift-1', type:'lift', points:[] }], draft);
  assert.equal(scene.links[1].type, 'stairs');
  assert.equal(scene.links[0].points.length, 3);
  assert.deepEqual(floors, original);
  assert.equal(calibratedScene(floors, [], newCalibration()).floors, floors);
});

test('reports independent marks between upper floors without silently using them in the RDC fit', () => {
  const draft = fixture();
  draft.landmarks.push({id:'check',type:'landmark',label:'D',points:{'R+1':[20,20],'R+2':[23,24]}});
  const solution = solveCalibration(draft);
  assert(solution.ready);
  assert.equal(solution.checks.length,1);
  assert(Math.abs(solution.checks[0].error_m-5)<1e-8);
});
