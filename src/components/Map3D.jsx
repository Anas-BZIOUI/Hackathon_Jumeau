import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { roomColor, worldPoint } from '../core.js';

export default function Map3D({
  rooms,
  floors,
  links,
  zones,
  selectedId,
  route,
  aligned,
  explode,
  onSelect
}) {
  const host = useRef(null);
  const pick = useRef({ rooms, onSelect, selectedId, route, aligned, explode, floors, links, zones });
  pick.current = { rooms, onSelect, selectedId, route, aligned, explode, floors, links, zones };

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 4000);
    camera.position.set(70, 110, 140);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    el.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(55, 10, 55);

    scene.add(new THREE.AmbientLight(0xc9a227, 0.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(40, 90, 20);
    scene.add(sun);

    const fillLight = new THREE.DirectionalLight(0x4a90e2, 0.4);
    fillLight.position.set(-40, 50, -20);
    scene.add(fillLight);

    const root = new THREE.Group();
    scene.add(root);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const meshes = [];
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    function floorY(level) {
      const z = pick.current.floors.levels[level].z;
      return pick.current.explode ? z * 1.8 : z;
    }

    function disposeGroup(group) {
      group.traverse((obj) => {
        if (obj.geometry && obj.geometry !== boxGeo) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });
      group.clear();
    }

    function addZoneOutline(ring, color, y, ox, oz) {
      const step = Math.max(1, Math.floor(ring.length / 400));
      const pts = [];
      for (let i = 0; i < ring.length; i += step) {
        pts.push(new THREE.Vector3(ring[i][0] + ox, y, ring[i][1] + oz));
      }
      if (pts.length > 1) pts.push(pts[0].clone());
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 }));
      root.add(line);
    }

    function rebuild() {
      disposeGroup(root);
      meshes.length = 0;
      const { rooms: rs, floors: fl, aligned: al, links: ln, zones: zn, selectedId: sel, route: rt } = pick.current;

      const grid = new THREE.GridHelper(200, 40, 0xc9a227, 0xe0e0e0);
      grid.position.y = -0.2;
      root.add(grid);

      for (const [level, meta] of Object.entries(fl.levels)) {
        const y = floorY(level);
        const slab = new THREE.Mesh(
          new THREE.BoxGeometry(meta.size[0], 0.2, meta.size[1]),
          new THREE.MeshStandardMaterial({ color: 0xe0e0e0, transparent: true, opacity: 0.8 })
        );
        const [ox, oy] = al ? meta.offset : [0, 0];
        slab.position.set(ox + meta.size[0] / 2, y, oy + meta.size[1] / 2);
        root.add(slab);
        const label = makeText(level);
        label.position.set(ox - 2, y + 1.2, oy);
        root.add(label);
      }

      if (zn?.features) {
        const [ox, oz] = worldPoint(fl, 'R+2', 0, 0, al);
        const y = floorY('R+2') + 0.35;
        for (const f of zn.features) {
          const ring = f.geometry?.coordinates?.[0];
          if (!ring || ring.length < 3) continue;
          const color = f.properties.kind === 'batiment' ? 0xc9a227 : 0x4a90e2;
          addZoneOutline(ring, color, y, ox, oz);
        }
      }

      for (const room of rs) {
        const poly = room.polygon;
        const xs = poly.map((p) => p[0]);
        const ys = poly.map((p) => p[1]);
        const w = Math.max(0.8, Math.max(...xs) - Math.min(...xs));
        const d = Math.max(0.8, Math.max(...ys) - Math.min(...ys));
        const [wx, wz] = worldPoint(fl, room.level, room.centroid[0], room.centroid[1], al);
        const h = 2.2;
        const color = new THREE.Color(roomColor(room));
        const mat = new THREE.MeshStandardMaterial({
          color,
          emissive: room.id === sel ? color : 0x000000,
          emissiveIntensity: room.id === sel ? 0.4 : 0,
          transparent: true,
          opacity: room.reliable ? 0.9 : 0.4
        });
        const mesh = new THREE.Mesh(boxGeo, mat);
        mesh.scale.set(w, h, d);
        mesh.position.set(wx, floorY(room.level) + h / 2 + 0.2, wz);
        mesh.userData.roomId = room.id;
        root.add(mesh);
        meshes.push(mesh);
        if (rt?.ids.includes(room.id)) {
          const halo = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 10, 10),
            new THREE.MeshBasicMaterial({ color: 0x2dd4bf })
          );
          halo.position.set(wx, floorY(room.level) + h + 1, wz);
          root.add(halo);
        }
      }

      for (const link of ln) {
        const pts = link.points.map((p) => {
          const [wx, wz] = worldPoint(fl, p.level, p.x, p.y, al);
          return new THREE.Vector3(wx, floorY(p.level) + 3, wz);
        });
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({ color: al ? 0x27ae60 : 0xe74c3c })
        );
        root.add(line);
      }

      if (rt?.nodes?.length > 1) {
        const pts = rt.nodes.map((n) => {
          const [wx, wz] = worldPoint(fl, n.level, n.x, n.y, al);
          return new THREE.Vector3(wx, floorY(n.level) + 3.2, wz);
        });
        root.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({ color: 0xc9a227 })
        ));
      }
    }

    rebuild();

    function resize() {
      const { width, height } = el.getBoundingClientRect();
      if (width < 2 || height < 2) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let raf;
    const loop = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    function onClick(e) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(meshes)[0];
      if (hit?.object.userData.roomId) pick.current.onSelect(hit.object.userData.roomId);
    }
    renderer.domElement.addEventListener('click', onClick);
    el.__rebuild = rebuild;

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener('click', onClick);
      controls.dispose();
      disposeGroup(root);
      boxGeo.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    host.current?.__rebuild?.();
  }, [rooms, selectedId, route, aligned, explode, floors, links, zones]);

  return <div className="map-host" ref={host} />;
}

function makeText(text) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2c3e50';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(text, 8, 40);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const s = new THREE.Sprite(mat);
  s.scale.set(8, 2, 1);
  return s;
}
