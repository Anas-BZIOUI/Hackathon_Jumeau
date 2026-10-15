import * as THREE from 'three';

// Schematic switchback: the marked endpoints are measured; flights and heights are illustrative.
export function stairPath(a, b) {
  const middle = (a.y + b.y) / 2;
  return [a.clone(), new THREE.Vector3(a.x, middle, a.z + 3.4), new THREE.Vector3(b.x + 1.5, middle, b.z + 3.4), b.clone()];
}

export function pathPosition(points, progress) {
  const lengths = points.slice(1).map((p, i) => p.distanceTo(points[i]));
  let remaining = Math.max(0, Math.min(1, progress)) * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] || i === lengths.length - 1) return points[i].clone().lerp(points[i + 1], lengths[i] ? remaining / lengths[i] : 0);
    remaining -= lengths[i];
  }
  return points[0].clone();
}

export function buildStairs(a, b, linkId) {
  const group = new THREE.Group();
  const path = stairPath(a, b);
  const material = new THREE.MeshStandardMaterial({ color: '#7792b0', roughness: .8 });
  const edgeMaterial = new THREE.MeshBasicMaterial({ color: '#e3edf8' });
  const railMaterial = new THREE.MeshStandardMaterial({ color: '#45627f', roughness: .5 });
  function bar(start, end, radius = .045) {
    const direction = end.clone().sub(start);
    if (direction.length() < .001) return;
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 6), railMaterial);
    mesh.position.copy(start).add(end).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    group.add(mesh);
  }
  for (let flight = 0; flight < 3; flight++) {
    const start = path[flight], end = path[flight + 1];
    const horizontal = Math.hypot(end.x - start.x, end.z - start.z);
    const count = flight === 1 ? 1 : 14;
    const angle = Math.atan2(end.x - start.x, end.z - start.z);
    const right = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle));
    for (let i = 0; i < count; i++) {
      const p = start.clone().lerp(end, (i + .5) / count);
      const height = flight === 1 ? .18 : Math.abs(end.y - start.y) / count;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.35, Math.max(.12, height), Math.max(.12, horizontal / count + .03)), material);
      mesh.position.copy(p); mesh.position.y -= height / 2; mesh.rotation.y = angle;
      mesh.userData.linkId = linkId; group.add(mesh);
      const nosing = new THREE.Mesh(new THREE.BoxGeometry(1.35, .035, .04), edgeMaterial);
      nosing.position.copy(p); nosing.position.y += .02; nosing.rotation.y = angle; group.add(nosing);
    }
    for (const side of [-1, 1]) {
      const ra = start.clone().addScaledVector(right, side * .68).add(new THREE.Vector3(0, 1, 0));
      const rb = end.clone().addScaledVector(right, side * .68).add(new THREE.Vector3(0, 1, 0));
      bar(ra, rb);
      for (let i = 0; i <= 4; i++) {
        const foot = start.clone().lerp(end, i / 4).addScaledVector(right, side * .68);
        bar(foot, foot.clone().add(new THREE.Vector3(0, 1, 0)), .035);
      }
    }
  }
  return group;
}
