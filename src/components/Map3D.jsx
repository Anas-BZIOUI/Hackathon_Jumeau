import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { roomColor, roomName, worldPoint } from '../core.js';
import groundPlan from '../../plan_RDC.png';
import firstPlan from '../../plan_R+1.png';
import secondPlan from '../../plan_R+2.png';

const PLAN_IMAGES = { RDC: groundPlan, 'R+1': firstPlan, 'R+2': secondPlan };

export default function Map3D({ rooms, floors, links, selectedId, route, aligned, explode, onSelect, lang = 'fr', onOpen2D }) {
  const host = useRef(null);
  const api = useRef(null);
  const current = useRef(null);
  const pendingRoom = useRef(null);
  const [focus, setFocus] = useState('all');
  const [top, setTop] = useState(false);
  const [labels, setLabels] = useState(true);
  const [plans, setPlans] = useState(true);
  const [hover, setHover] = useState(null);
  const [failed, setFailed] = useState(false);
  const [missingPlans, setMissingPlans] = useState(false);
  const fr = lang === 'fr';
  current.current = { rooms, floors, links, selectedId, route, aligned, explode, onSelect, focus, top, labels, plans, lang };

  useEffect(() => {
    const el = host.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); }
    catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor('#f2f5f8');
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, .1, 3000);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = .09;
    controls.maxPolarAngle = Math.PI * .48;
    controls.minDistance = 8;
    controls.maxDistance = 650;
    controls.screenSpacePanning = true;
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb7c5d6, 2.4));
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(0, 180, 70); scene.add(light);
    const root = new THREE.Group(); scene.add(root);
    const textures = new Map();
    const loader = new THREE.TextureLoader();
    let disposed = false;
    let meshes = [];
    let labelSprites = [];
    let targetView = null;
    let lastView = '';
    const ray = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const floorY = lv => {
      const d = current.current;
      return Object.keys(d.floors.levels).indexOf(lv) * (d.explode ? 48 : 5);
    };
    function point(lv, x, y, lift = 0) {
      const d = current.current;
      const [wx, wy] = worldPoint(d.floors, lv, x, y, d.aligned);
      return new THREE.Vector3(wx, floorY(lv) + lift, -wy);
    }
    function clear() {
      root.traverse(o => {
        o.geometry?.dispose();
        for (const m of o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []) {
          if (m.map && ![...textures.values()].includes(m.map)) m.map.dispose();
          m.dispose();
        }
      });
      root.clear(); meshes = []; labelSprites = [];
    }
    function text(value, position, color = '#254b75', width = 15) {
      const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffffee'; ctx.beginPath(); ctx.roundRect(4, 8, 760, 112, 24); ctx.fill();
      ctx.fillStyle = color; ctx.font = '600 46px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(value, 384, 64, 720);
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
      sprite.position.copy(position); sprite.scale.set(width, width / 6, 1); sprite.renderOrder = 10;
      const pixelWidth = width >= 20 ? 210 : width >= 12 ? 100 : 48;
      sprite.onBeforeRender = () => {
        const unitsPerPixel = 2 * camera.position.distanceTo(sprite.position) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / Math.max(1, renderer.domElement.clientHeight);
        const fitted = Math.min(width, pixelWidth * unitsPerPixel);
        sprite.scale.set(fitted, fitted / 6, 1);
      };
      root.add(sprite); return sprite;
    }
    function line(points, color, dashed = false) {
      if (points.length < 2) return;
      const material = dashed ? new THREE.LineDashedMaterial({ color, dashSize: 1, gapSize: .65 }) : new THREE.LineBasicMaterial({ color });
      const object = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
      if (dashed) object.computeLineDistances();
      root.add(object);
    }
    function fit(roomId) {
      const d = current.current;
      const room = d.rooms.find(r => r.id === roomId);
      let bounds = new THREE.Box3();
      if (room) {
        const points = room.polygon.map(p => point(room.level, ...p));
        bounds.setFromPoints(points);
      } else {
        for (const [lv, meta] of Object.entries(d.floors.levels)) {
          if (d.focus !== 'all' && d.focus !== lv) continue;
          bounds.expandByPoint(point(lv, 0, 0));
          bounds.expandByPoint(point(lv, ...meta.size, 3));
        }
      }
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const extent = Math.max(size.x / Math.max(camera.aspect, .35), size.z, size.y, room ? 24 : 45);
      const distance = extent / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.3;
      const direction = d.top ? new THREE.Vector3(0, 1, .001) : new THREE.Vector3(.35, .95, .85).normalize();
      targetView = {
        center, position: center.clone().addScaledVector(direction, distance),
        fromPosition: camera.position.clone(), fromCenter: controls.target.clone(), started: performance.now()
      };
    }
    function rebuild() {
      if (disposed) return;
      clear();
      const d = current.current;
      for (const [lv, meta] of Object.entries(d.floors.levels)) {
        if (d.focus !== 'all' && d.focus !== lv) continue;
        const [w, h] = meta.size;
        const texture = d.plans ? textures.get(lv) : null;
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({
          map: texture || null, color: texture ? '#ffffff' : '#e8eef4', side: THREE.DoubleSide,
          transparent: !!texture, alphaTest: .05
        }));
        plane.rotation.x = -Math.PI / 2;
        plane.position.copy(point(lv, w / 2, h / 2)); root.add(plane);
        text(`${lv} · ${meta['label_' + d.lang] || lv}`, point(lv, w / 2, h + 4, 1), '#254b75', Math.min(w * .7, 32));
      }
      for (const room of d.rooms) {
        if (d.focus !== 'all' && room.level !== d.focus) continue;
        const selected = room.id === d.selectedId;
        const onRoute = d.route?.ids.includes(room.id);
        const exact = room.geometry_source === 'architect-svg';
        let geometry;
        if (exact) {
          const shape = new THREE.Shape();
          room.polygon.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
          shape.closePath();
          geometry = new THREE.ExtrudeGeometry(shape, { depth: selected ? 1.1 : .35, bevelEnabled: false, steps: 1, curveSegments: 1 });
          geometry.rotateX(-Math.PI / 2);
        } else {
          // A point label has no measured boundary. Show a locator, never a fabricated room volume.
          geometry = new THREE.CylinderGeometry(selected ? 1 : .55, selected ? 1 : .55, .35, 24);
        }
        const color = selected ? '#2865b0' : onRoute ? '#cf7620' : roomColor(room);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
          color, roughness: .9, transparent: true, opacity: selected ? .9 : exact ? (d.plans ? .25 : .7) : .8,
          depthWrite: selected || !exact
        }));
        mesh.position.copy(exact ? point(room.level, 0, 0, .12) : point(room.level, ...room.centroid, .65));
        mesh.userData.roomId = room.id; root.add(mesh); meshes.push(mesh);
        if (exact) {
          const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 30), new THREE.LineBasicMaterial({ color: selected ? '#1b4b86' : '#667d93', transparent: true, opacity: selected ? 1 : .35 }));
          edge.position.copy(mesh.position); root.add(edge);
        }
        if (d.labels && (selected || onRoute || (d.focus !== 'all' && room.number))) {
          const sprite = text(selected ? roomName(room, d.lang) : room.number || room.id, point(room.level, ...room.centroid, selected ? 3 : 1.7), selected ? '#1e4e86' : '#53677b', selected ? 23 : 6);
          labelSprites.push({ sprite, priority: selected || onRoute });
        }
      }
      for (const link of d.links) {
        const color = link.type === 'lift' ? '#337ca0' : '#9265a8';
        const points = link.points.filter(p => d.focus === 'all' || p.level === d.focus);
        if (d.focus === 'all') line(points.map(p => point(p.level, p.x, p.y, 1.5)), color, !d.aligned);
        for (const p of points) {
          const g = link.type === 'lift' ? new THREE.BoxGeometry(1.8, 1.3, 1.8) : new THREE.CylinderGeometry(1, 1, 1.3, 24);
          const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color }));
          m.position.copy(point(p.level, p.x, p.y, 1)); root.add(m);
          text(d.lang === 'fr' ? (link.type === 'lift' ? 'Ascenseur' : 'Escaliers') : (link.type === 'lift' ? 'Lift' : 'Stairs'), point(p.level, p.x, p.y, 4), color, 12);
        }
      }
      if (d.route?.nodes?.length > 1) {
        const nodes = d.route.nodes;
        for (let i = 1; i < nodes.length; i++) {
          const a = nodes[i - 1], b = nodes[i];
          if (d.focus !== 'all' && (a.level !== d.focus || b.level !== d.focus)) continue;
          const pa = point(a.level, a.x, a.y, 1.8), pb = point(b.level, b.x, b.y, 1.8);
          if (pa.distanceTo(pb) < .01) continue;
          const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(pa, pb), 1, .22, 6, false), new THREE.MeshBasicMaterial({ color: '#d16e1e' }));
          root.add(tube);
        }
      }
      const key = [d.focus, d.top, d.aligned, d.explode].join(':');
      if (key !== lastView) { fit(); lastView = key; }
    }
    for (const lv of Object.keys(current.current.floors.levels)) {
      loader.load(PLAN_IMAGES[lv], texture => {
        if (disposed) { texture.dispose(); return; }
        // Remove only the white paper, leaving the architect's walls, furniture,
        // labels and room fills. Blank paper must not obscure the lower floors.
        const canvas = document.createElement('canvas');
        canvas.width = texture.image.width; canvas.height = texture.image.height;
        const ctx = canvas.getContext('2d'); ctx.drawImage(texture.image, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < pixels.data.length; i += 4) {
          if (Math.min(pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]) > 246) pixels.data[i + 3] = 0;
        }
        ctx.putImageData(pixels, 0, 0); texture.dispose();
        const clean = new THREE.CanvasTexture(canvas);
        clean.colorSpace = THREE.SRGBColorSpace; clean.anisotropy = renderer.capabilities.getMaxAnisotropy();
        textures.set(lv, clean); rebuild();
      }, undefined, () => { if (!disposed) setMissingPlans(true); });
    }
    function resize() {
      const { width, height } = el.getBoundingClientRect();
      if (width < 2 || height < 2) return;
      camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height);
      fit();
    }
    const ro = new ResizeObserver(resize); ro.observe(el);
    camera.position.set(180, 200, 130); resize(); rebuild();
    controls.addEventListener('start', () => { targetView = null; });
    let raf;
    function animate() {
      if (targetView) {
        const progress = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : Math.min(1, (performance.now() - targetView.started) / 550);
        const eased = progress * progress * (3 - 2 * progress);
        camera.position.lerpVectors(targetView.fromPosition, targetView.position, eased);
        controls.target.lerpVectors(targetView.fromCenter, targetView.center, eased);
        controls.enableDamping = false;
        if (progress === 1) targetView = null;
      } else {
        controls.enableDamping = true;
      }
      controls.update();
      // Keep dense office labels out of the overview and reveal them as the user zooms in.
      const near = camera.position.distanceTo(controls.target) < 115;
      for (const item of labelSprites) item.sprite.visible = item.priority || near;
      renderer.render(scene, camera); raf = requestAnimationFrame(animate);
    }
    animate();
    function hit(e) {
      const r = renderer.domElement.getBoundingClientRect();
      pointer.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
      ray.setFromCamera(pointer, camera);
      return ray.intersectObjects(meshes)[0]?.object.userData.roomId;
    }
    let down = null;
    function pointerDown(e) { down = [e.clientX, e.clientY]; setHover(null); }
    function pointerUp(e) {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) { down = null; return; }
      down = null; const id = hit(e); if (id) current.current.onSelect(id);
    }
    function pointerMove(e) {
      if (e.buttons) return;
      const id = hit(e);
      renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
      setHover(id ? current.current.rooms.find(r => r.id === id) : null);
    }
    function leave() { setHover(null); }
    renderer.domElement.addEventListener('pointerdown', pointerDown);
    renderer.domElement.addEventListener('pointerup', pointerUp);
    renderer.domElement.addEventListener('pointermove', pointerMove);
    renderer.domElement.addEventListener('pointerleave', leave);
    api.current = { rebuild, fit };
    return () => {
      disposed = true; cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); clear();
      textures.forEach(t => t.dispose()); renderer.dispose(); renderer.domElement.remove(); api.current = null;
    };
  }, []);

  useEffect(() => {
    api.current?.rebuild(); setHover(null);
    if (pendingRoom.current) { api.current?.fit(pendingRoom.current); pendingRoom.current = null; }
  }, [rooms, floors, links, selectedId, route, aligned, explode, focus, top, labels, plans, lang]);
  const selected = rooms.find(r => r.id === selectedId);
  function locate() {
    if (!selected) return;
    if (focus === selected.level) api.current?.fit(selected.id);
    else { pendingRoom.current = selected.id; setFocus(selected.level); }
  }
  return <div className="map-host map3d">
    <div className="three-stage" ref={host} />
    <div className="three-navigation">
      <div className="three-eyebrow">{fr ? 'EXPLORER LE BÂTIMENT' : 'EXPLORE THE BUILDING'}</div>
      <div className="three-buttons">
        <button className={focus === 'all' ? 'active' : ''} onClick={() => { setFocus('all'); setTop(false); api.current?.fit(); }}>{fr ? 'Tous les étages' : 'All floors'}</button>
        {Object.keys(floors.levels).map(lv => <button key={lv} className={focus === lv ? 'active' : ''} onClick={() => setFocus(lv)}>{lv}</button>)}
      </div>
      <div className="three-buttons">
        <button className={top ? 'active' : ''} onClick={() => setTop(v => !v)}>{fr ? 'Vue du dessus' : 'Top view'}</button>
        <button onClick={() => api.current?.fit()}>{fr ? 'Recentrer' : 'Reset view'}</button>
        <button onClick={locate} disabled={!selected}>{fr ? 'Localiser la sélection' : 'Locate selection'}</button>
      </div>
      <div className="three-options">
        <label><input type="checkbox" checked={plans} onChange={e => setPlans(e.target.checked)} />{fr ? 'Plan architecte' : 'Architect plan'}</label>
        <label><input type="checkbox" checked={labels} onChange={e => setLabels(e.target.checked)} />{fr ? 'Étiquettes' : 'Labels'}</label>
      </div>
    </div>
    <div className="three-info" aria-live="polite">
      <strong>{hover ? roomName(hover, lang) : focus === 'all' ? (fr ? 'Comprendre les étages' : 'Understand the floors') : floors.levels[focus]['label_' + lang]}</strong>
      {hover ? <><span>{hover.level} · {hover.area_plan_m2 ?? '—'} m²</span><span>{hover.geometry_source === 'architect-svg' ? (fr ? 'Contour issu du plan' : 'Outline from the plan') : (fr ? 'Repère de position · contour indisponible' : 'Location marker · outline unavailable')}</span></> : <span>{fr ? 'Isolez un étage pour lire les salles. Cliquez une salle pour ouvrir sa fiche.' : 'Isolate a floor to read the rooms. Click a room to open its details.'}</span>}
      {focus !== 'all' && <button className="ghost" onClick={() => onOpen2D?.(focus)}>{fr ? 'Ouvrir cet étage en 2D →' : 'Open this floor in 2D →'}</button>}
    </div>
    <div className="three-footer"><span>{fr ? 'Glisser : tourner · clic droit : déplacer · molette : zoom' : 'Drag: rotate · right drag: pan · scroll: zoom'}</span><span>{fr ? 'Alignement et liaisons approximatifs · hauteur illustrative' : 'Approximate alignment and links · illustrative height'}</span>{missingPlans && <span>{fr ? 'Fond de plan indisponible' : 'Plan background unavailable'}</span>}</div>
    {failed && <div className="three-unavailable">{fr ? 'La 3D nécessite WebGL.' : '3D requires WebGL.'}<button className="primary" onClick={() => onOpen2D?.(selected?.level || 'R+2')}>{fr ? 'Ouvrir le plan 2D' : 'Open 2D map'}</button></div>}
  </div>;
}
