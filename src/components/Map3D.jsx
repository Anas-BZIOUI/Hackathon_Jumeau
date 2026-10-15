import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { roomColor, roomName, worldPoint } from '../core.js';
import { buildStairs, stairPath, pathPosition } from '../stairs.js';
import groundPlan from '../../plan_RDC.png';
import firstPlan from '../../plan_R+1.png';
import secondPlan from '../../plan_R+2.png';

const PLAN_IMAGES = { RDC: groundPlan, 'R+1': firstPlan, 'R+2': secondPlan };

export default function Map3D({ rooms, floors, links, selectedId, route, aligned, explode, onSelect, lang = 'fr', onOpen2D, onFloorChange, onCompactRequest }) {
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
  const [hiddenFloors, setHiddenFloors] = useState(() => new Set());
  const [activeLink, setActiveLink] = useState(links.find(l => l.type === 'stairs')?.id || links[0]?.id);
  const [location, setLocation] = useState(null);
  const [travelling, setTravelling] = useState(false);
  const [travelRequest, setTravelRequest] = useState(null);
  const fr = lang === 'fr';
  current.current = { rooms, floors, links, selectedId, route, aligned, explode, onSelect, focus, top, labels, plans, lang, hiddenFloors, activeLink, location, onFloorChange };

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
    let connectors = [];
    let labelSprites = [];
    let targetView = null;
    let lastView = '';
    let journey = null;
    const traveller = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.28, .36, .85, 12), new THREE.MeshStandardMaterial({ color: '#e89b32' }));
    body.position.y = .65; traveller.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.25, 12, 10), new THREE.MeshStandardMaterial({ color: '#fff2d5' }));
    head.position.y = 1.3; traveller.add(head);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.65, .08, 8, 32), new THREE.MeshBasicMaterial({ color: '#c8751d' }));
    ring.rotation.x = Math.PI / 2; ring.position.y = .12; traveller.add(ring);
    traveller.visible = false; scene.add(traveller);
    const ray = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const floorY = lv => {
      const d = current.current;
      return Object.keys(d.floors.levels).indexOf(lv) * (d.explode ? 48 : 3.2);
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
      root.clear(); meshes = []; connectors = []; labelSprites = [];
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
          if (d.hiddenFloors.has(lv) || (d.focus !== 'all' && d.focus !== lv)) continue;
          for (const p of [[0, 0], [meta.size[0], 0], [0, meta.size[1]], meta.size]) bounds.expandByPoint(point(lv, ...p, 3));
        }
        if (bounds.isEmpty()) for (const link of d.links) for (const p of link.points) bounds.expandByPoint(point(p.level, p.x, p.y));
        if (bounds.isEmpty()) bounds.set(new THREE.Vector3(0,0,0), new THREE.Vector3(20,10,20));
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
        if (d.hiddenFloors.has(lv) || (d.focus !== 'all' && d.focus !== lv)) continue;
        const [w, h] = meta.size;
        const texture = d.plans ? textures.get(lv) : null;
        const angle = d.aligned ? (meta.rotation_deg || 0) * Math.PI / 180 : 0;
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h).rotateZ(angle).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
          map: texture || null, color: texture ? '#ffffff' : '#e8eef4', side: THREE.DoubleSide,
          transparent: !!texture, alphaTest: .05
        }));
        plane.position.copy(point(lv, w / 2, h / 2)); root.add(plane);
        text(`${lv} · ${meta['label_' + d.lang] || lv}`, point(lv, w / 2, h + 4, 1), '#254b75', Math.min(w * .7, 32));
      }
      for (const room of d.rooms) {
        if (d.hiddenFloors.has(room.level) || (d.focus !== 'all' && room.level !== d.focus)) continue;
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
          if (d.aligned) geometry.rotateY((d.floors.levels[room.level].rotation_deg || 0) * Math.PI / 180);
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
        const points = [...link.points].sort((a,b) => Object.keys(d.floors.levels).indexOf(a.level) - Object.keys(d.floors.levels).indexOf(b.level));
        for (let i = 1; i < points.length; i++) {
          const a = point(points[i-1].level, points[i-1].x, points[i-1].y, .3);
          const b = point(points[i].level, points[i].x, points[i].y, .3);
          if (link.type === 'stairs') {
            const stairs = buildStairs(a, b, link.id);
            stairs.traverse(o => { if (o.userData.linkId) connectors.push(o); });
            root.add(stairs);
          } else {
            line([a,b], color, !d.aligned);
            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,a.distanceTo(b),12),new THREE.MeshStandardMaterial({color,transparent:true,opacity:.2,depthWrite:false}));
            shaft.position.copy(a).add(b).multiplyScalar(.5);
            shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), b.clone().sub(a).normalize());
            shaft.userData.linkId=link.id; root.add(shaft); connectors.push(shaft);
          }
        }
        for (const p of points) {
          const g = link.type === 'lift' ? new THREE.BoxGeometry(1.8, 1.3, 1.8) : new THREE.SphereGeometry(.18,8,8);
          const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color }));
          m.position.copy(point(p.level, p.x, p.y, .2)); m.userData.linkId = link.id; root.add(m); connectors.push(m);
          text(`${link.type === 'lift' ? (d.lang === 'fr' ? 'Ascenseur' : 'Lift') : (d.lang === 'fr' ? 'Escalier' : 'Stairs')} ${link.label || ''} · ${p.level}`, point(p.level, p.x, p.y, 2.6), color, 12);
        }
      }
      if (d.route?.nodes?.length > 1) {
        const nodes = d.route.nodes;
        for (let i = 1; i < nodes.length; i++) {
          const a = nodes[i - 1], b = nodes[i];
          if (d.hiddenFloors.has(a.level) || d.hiddenFloors.has(b.level)) continue;
          if (d.focus !== 'all' && (a.level !== d.focus || b.level !== d.focus)) continue;
          const pa = point(a.level, a.x, a.y, 1.8), pb = point(b.level, b.x, b.y, 1.8);
          if (pa.distanceTo(pb) < .01) continue;
          const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(pa, pb), 1, .22, 6, false), new THREE.MeshBasicMaterial({ color: '#d16e1e' }));
          root.add(tube);
        }
      }
      if (d.location && !journey) {
        const link=d.links.find(l=>l.id===d.location.linkId), p=link?.points.find(p=>p.level===d.location.level);
        traveller.visible=!!p;
        if(p) traveller.position.copy(point(p.level,p.x,p.y,.4));
      } else if (!journey) traveller.visible=false;
      const key = [d.focus, d.top, d.aligned, d.explode, [...d.hiddenFloors].join(','), JSON.stringify(d.floors.levels)].join(':');
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
    function stopTravel() {
      if (!journey) return;
      journey = null; setTravelling(false); rebuild();
    }
    controls.addEventListener('start', () => { targetView = null; stopTravel(); });
    function travel(linkId, from, to) {
      const d=current.current, link=d.links.find(l=>l.id===linkId);
      if(!link) return;
      const points=[...link.points].sort((a,b)=>Object.keys(d.floors.levels).indexOf(a.level)-Object.keys(d.floors.levels).indexOf(b.level));
      const start=points.findIndex(p=>p.level===from), finish=points.findIndex(p=>p.level===to);
      if(start<0||finish<0) return;
      let path=[];
      if(start===finish) path=[point(to,points[finish].x,points[finish].y,.3)];
      else {
        const direction=Math.sign(finish-start);
        for(let i=start;i!==finish;i+=direction) {
          const low=Math.min(i,i+direction), high=low+1;
          const a=point(points[low].level,points[low].x,points[low].y,.3), b=point(points[high].level,points[high].x,points[high].y,.3);
          const segment=link.type==='stairs'?stairPath(a,b):[a,b];
          if(direction<0)segment.reverse();
          path.push(...(path.length?segment.slice(1):segment));
        }
      }
      targetView=null;
      journey={path,linkId,to,started:performance.now(),duration:Math.max(700,Math.abs(finish-start)*2200),fromCamera:camera.position.clone(),fromTarget:controls.target.clone()};
      traveller.visible=true; setTravelling(true);
    }
    let raf;
    function animate() {
      if (journey) {
        const elapsed=performance.now()-journey.started;
        const progress=matchMedia('(prefers-reduced-motion: reduce)').matches?1:Math.min(1,elapsed/journey.duration);
        const position=pathPosition(journey.path,progress);
        traveller.position.copy(position);
        const blend=Math.min(1,elapsed/450);
        camera.position.lerpVectors(journey.fromCamera,position.clone().add(new THREE.Vector3(6,5,8)),blend);
        controls.target.lerpVectors(journey.fromTarget,position,blend);
        controls.enableDamping=false;
        if(progress===1) {
          const arrival={linkId:journey.linkId,level:journey.to}; journey=null;
          setLocation(arrival); setTravelling(false); current.current.onFloorChange?.(arrival.level);
        }
      } else if (targetView) {
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
      return ray.intersectObjects([...connectors,...meshes])[0]?.object.userData;
    }
    let down = null;
    function pointerDown(e) { down = [e.clientX, e.clientY]; setHover(null); }
    function pointerUp(e) {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) { down = null; return; }
      down = null; const hitData = hit(e);
      if(hitData?.linkId) setActiveLink(hitData.linkId);
      else if(hitData?.roomId) current.current.onSelect(hitData.roomId);
    }
    function pointerMove(e) {
      if (e.buttons) return;
      const hitData = hit(e);
      renderer.domElement.style.cursor = hitData ? 'pointer' : 'grab';
      setHover(hitData?.roomId ? current.current.rooms.find(r => r.id === hitData.roomId) : null);
    }
    function leave() { setHover(null); }
    renderer.domElement.addEventListener('pointerdown', pointerDown);
    renderer.domElement.addEventListener('pointerup', pointerUp);
    renderer.domElement.addEventListener('pointermove', pointerMove);
    renderer.domElement.addEventListener('pointerleave', leave);
    api.current = { rebuild, fit, travel, stopTravel };
    return () => {
      disposed = true; cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); clear();
      textures.forEach(t => t.dispose()); renderer.dispose(); renderer.domElement.remove(); api.current = null;
      traveller.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
    };
  }, []);

  useEffect(() => {
    api.current?.stopTravel();
    api.current?.rebuild(); setHover(null);
    if (pendingRoom.current) { api.current?.fit(pendingRoom.current); pendingRoom.current = null; }
  }, [rooms, floors, links, selectedId, route, aligned, explode, focus, top, labels, plans, lang, hiddenFloors, location]);
  useEffect(()=> { if(travelRequest) api.current?.travel(travelRequest.linkId,travelRequest.from,travelRequest.to); },[travelRequest]);
  const selected = rooms.find(r => r.id === selectedId);
  const connection = links.find(l=>l.id===activeLink) || links[0];
  const landingLevels = connection ? [...connection.points].sort((a,b)=>Object.keys(floors.levels).indexOf(a.level)-Object.keys(floors.levels).indexOf(b.level)).map(p=>p.level) : [];
  const departure = location && landingLevels.includes(location.level) ? location.level : landingLevels[0];
  function moveTo(to) {
    if(!connection || travelling) return;
    onCompactRequest?.();
    setHiddenFloors(previous=>{const next=new Set(previous);next.delete(departure);next.delete(to);return next;});
    setFocus('all'); setTop(false);
    setTravelRequest({linkId:connection.id,from:departure,to,stamp:Date.now()});
  }
  function moveBy(delta) {
    const i=landingLevels.indexOf(departure)+delta;
    if(i>=0&&i<landingLevels.length) moveTo(landingLevels[i]);
  }
  function locate() {
    if (!selected) return;
    setHiddenFloors(previous=>{const next=new Set(previous);next.delete(selected.level);return next;});
    if (focus === selected.level) api.current?.fit(selected.id);
    else { pendingRoom.current = selected.id; setFocus(selected.level); }
  }
  return <div className="map-host map3d" tabIndex={0} aria-label={fr?'Explorateur 3D · Page précédente pour monter, Page suivante pour descendre':'3D explorer · Page Up to ascend, Page Down to descend'} onKeyDown={e=>{
    if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
    if(e.key==='PageUp'||e.key==='PageDown'){e.preventDefault();moveBy(e.key==='PageUp'?1:-1);}
  }}>
    <div className="three-stage" ref={host} />
    <div className="three-navigation">
      <div className="three-eyebrow">{fr ? 'EXPLORER LE BÂTIMENT' : 'EXPLORE THE BUILDING'}</div>
      <div className="three-buttons">
        <button className={focus === 'all' ? 'active' : ''} onClick={() => { setFocus('all'); setTop(false); api.current?.fit(); }}>{fr ? 'Tous les étages' : 'All floors'}</button>
        {Object.keys(floors.levels).map(lv => <button key={lv} className={focus === lv ? 'active' : ''} onClick={() => {setHiddenFloors(previous=>{const next=new Set(previous);next.delete(lv);return next;});setFocus(lv);}}>{lv}</button>)}
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
      <div className="three-floor-visibility"><span>{fr?'Étages visibles':'Visible floors'}</span>{Object.keys(floors.levels).map(lv=><label key={lv}><input type="checkbox" checked={!hiddenFloors.has(lv)} onChange={e=>{setFocus('all');setHiddenFloors(previous=>{const next=new Set(previous);if(e.target.checked)next.delete(lv);else next.add(lv);return next;});}}/>{lv}</label>)}</div>
    </div>
    {connection && <div className="three-connections">
      <div className="three-eyebrow">{fr?'PASSER D’UN ÉTAGE À L’AUTRE':'MOVE BETWEEN FLOORS'}</div>
      <label>{fr?'Liaison':'Connection'}<select aria-label={fr?'Choisir un escalier ou ascenseur':'Choose stairs or lift'} value={connection.id} disabled={travelling} onChange={e=>setActiveLink(e.target.value)}>{links.map((link,i)=><option key={link.id} value={link.id}>{link.type==='stairs'?(fr?'Escalier':'Stairs'):(fr?'Ascenseur':'Lift')} {link.label || i+1}</option>)}</select></label>
      <p aria-live="polite">{travelling?(fr?'Déplacement en cours…':'Moving…'):location?`${fr?'Vous êtes ici':'You are here'} : ${location.level}`:`${fr?'Départ':'Start'} : ${departure}`}</p>
      <div className="three-buttons"><button disabled={travelling||landingLevels.indexOf(departure)<=0} onClick={()=>moveBy(-1)}>↓ {fr?'Descendre':'Go down'}</button><button disabled={travelling||landingLevels.indexOf(departure)>=landingLevels.length-1} onClick={()=>moveBy(1)}>↑ {fr?'Monter':'Go up'}</button></div>
      <div className="three-buttons">{landingLevels.map(lv=><button key={lv} className={location?.linkId===connection.id&&location.level===lv?'active':''} disabled={travelling} onClick={()=>moveTo(lv)}>{lv}</button>)}</div>
      <small>{fr?'Page ↑ / Page ↓ : changer d’étage. Escaliers schématiques, tracé et hauteur illustratifs.':'Page Up / Page Down: change floor. Schematic stairs, illustrative shape and height.'}</small>
    </div>}
    <div className="three-info" aria-live="polite">
      <strong>{hover ? roomName(hover, lang) : focus === 'all' ? (fr ? 'Comprendre les étages' : 'Understand the floors') : floors.levels[focus]['label_' + lang]}</strong>
      {hover ? <><span>{hover.level} · {hover.area_plan_m2 ?? '—'} m²</span><span>{hover.geometry_source === 'architect-svg' ? (fr ? 'Contour issu du plan' : 'Outline from the plan') : (fr ? 'Repère de position · contour indisponible' : 'Location marker · outline unavailable')}</span></> : <span>{fr ? 'Isolez un étage pour lire les salles. Cliquez une salle pour ouvrir sa fiche.' : 'Isolate a floor to read the rooms. Click a room to open its details.'}</span>}
      {focus !== 'all' && <button className="ghost" onClick={() => onOpen2D?.(focus)}>{fr ? 'Ouvrir cet étage en 2D →' : 'Open this floor in 2D →'}</button>}
    </div>
    <div className="three-footer"><span>{fr ? 'Glisser : tourner · clic droit : déplacer · molette : zoom' : 'Drag: rotate · right drag: pan · scroll: zoom'}</span><span>{floors.calibration_source === 'user-marked' ? (fr ? 'Alignement par vos repères · itinéraires encore approximatifs · hauteur illustrative' : 'Aligned using your landmarks · routes still approximate · illustrative height') : (fr ? 'Alignement et liaisons approximatifs · hauteur illustrative' : 'Approximate alignment and links · illustrative height')}</span>{missingPlans && <span>{fr ? 'Fond de plan indisponible' : 'Plan background unavailable'}</span>}</div>
    {failed && <div className="three-unavailable">{fr ? 'La 3D nécessite WebGL.' : '3D requires WebGL.'}<button className="primary" onClick={() => onOpen2D?.(selected?.level || 'R+2')}>{fr ? 'Ouvrir le plan 2D' : 'Open 2D map'}</button></div>}
  </div>;
}
