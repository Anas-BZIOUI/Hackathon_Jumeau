import { useEffect,useRef,useState } from 'react';
import * as THREE from 'three';
import { worldPoint,roomName,roomLabel } from '../core.js';
import { collisionMap,safePosition,walkingPath } from '../walking.js';
import { buildStairs,stairPath,pathPosition,stairProgress } from '../stairs.js';
import { cutOpenings,roomAt } from '../openings.js';
import { TYPE_LABEL } from '../i18n.js';
import {physicalNavigation} from '../physicalNavigation.js';
import RoomPracticalInfo from './RoomPracticalInfo.jsx';
import ImmersivePlan from './ImmersivePlan.jsx';
import {floorLeg} from '../visitNavigation.js';
import {createAvatar} from '../avatar.js';
import {dampFactor,dampAngle,cameraFraction} from '../motion.js';
import groundPlan from '../../plan_RDC.png';
import firstPlan from '../../plan_R+1.png';
import secondPlan from '../../plan_R+2.png';
const PLANS={RDC:groundPlan,'R+1':firstPlan,'R+2':secondPlan};
const LEVELS=['RDC','R+1','R+2'];
const ROOM_COLORS={classroom:'#367bb0',amphitheatre:'#5268ae',lab:'#178d85',office:'#a57748',admin:'#a57748',association:'#a068a1',student_life:'#a068a1',restaurant:'#ca8742',toilets:'#558d9c',other:'#738292'};

export default function Walkthrough({rooms,floors,links,selected,lang,onOverview,onFloorChange,geometry=null,mapProps,initialPosition,onPositionChange,route,destination,stepFree=false,requestRoute}) {
  const host=useRef(null),api=useRef(null),props=useRef(null),thirdPerson=useRef(true);
  const [perspective,setPerspective]=useState('third');
  props.current={rooms,floors,links,selected,lang,onFloorChange,initialPosition,onPositionChange,route,destination,stepFree,requestRoute};
  const [hud,setHud]=useState(null),[error,setError]=useState(''),[message,setMessage]=useState('');
  const [connectionId,setConnectionId]=useState(links[0]?.id||''),[busy,setBusy]=useState(false);
  const fr=lang==='fr';
  useEffect(()=>{
    const el=host.current;
    let disposed=false,renderer,raf,cleanup=()=>{};
    const abort=new AbortController();
    async function start(){
      let data,doorData;
      try {const responses=await Promise.all(['walls','doors'].map(name=>fetch(`/data/${name}.json`,{signal:abort.signal})));if(responses.some(r=>!r.ok))throw Error();[data,doorData]=await Promise.all(responses.map(r=>r.json()));}
      catch(e){if(!disposed)setError('data');return;}
      if(disposed)return;
      const routingInput={walls:data,doors:doorData,geometry,floors:props.current.floors,links:props.current.links,rooms:props.current.rooms};
      const physical=physicalNavigation(routingInput);data=physical.walls;doorData=physical.doors;
      try{renderer=new THREE.WebGLRenderer({antialias:true});}catch{setError('webgl');return;}
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.25));renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement);
      const scene=new THREE.Scene();scene.background=new THREE.Color('#cbdce9');scene.fog=new THREE.Fog('#cbdce9',65,170);
      const camera=new THREE.PerspectiveCamera(72,1,.07,400);camera.rotation.order='YXZ';
      scene.add(new THREE.HemisphereLight(0xffffff,0xbac5cc,2.4));
      const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(20,80,50);scene.add(sun);
      const groups={},maps={},cameraMaps={},textures=[];
      const levels=props.current.floors.levels;
      const elevation=lv=>LEVELS.indexOf(lv)*3.2;
      const toWorld=(lv,p)=>{const [x,y]=worldPoint(props.current.floors,lv,...p,true);return new THREE.Vector3(x,elevation(lv)+.3,-y);};
      const toLocal=(lv,p)=>{const meta=levels[lv],a=-(meta.rotation_deg||0)*Math.PI/180;const x=p.x-meta.offset[0],y=-p.z-meta.offset[1];return [Math.cos(a)*x-Math.sin(a)*y,Math.sin(a)*x+Math.cos(a)*y];};
      const stairRecords=physical.stairs;
      const doorLeaves=[],floorColors={RDC:'#3f806a','R+1':'#416d9c','R+2':'#86659d'};
      function sign(value,width=1.4,height=.48,color='#244f80',subtitle='',detail=''){
        const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=320;const ctx=canvas.getContext('2d');
        ctx.fillStyle='#f7f8f5';ctx.fillRect(0,0,1024,320);ctx.fillStyle=color;ctx.fillRect(0,0,22,320);
        ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 108px system-ui';ctx.fillText(value,524,detail?85:subtitle?115:160,950);
        if(subtitle){ctx.fillStyle='#465866';ctx.font='500 48px system-ui';ctx.fillText(subtitle,524,detail?190:245,950);}
        if(detail){ctx.font='500 36px system-ui';ctx.fillText(detail,524,275,950);}
        const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();textures.push(texture);
        const panel=new THREE.Group();
        for(const side of [1,-1]){const face=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture}));face.position.z=side*.095;face.rotation.y=side===1?0:Math.PI;panel.add(face);}
        return panel;
      }
      const material=new THREE.MeshStandardMaterial({color:'#f0eee8',roughness:1});
      const baseMaterial=new THREE.MeshStandardMaterial({color:'#547391',roughness:.9});
      const box=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
      function surface(lv,ceiling=false){
        const meta=levels[lv],shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(meta.size[0],0);shape.lineTo(meta.size[0],meta.size[1]);shape.lineTo(0,meta.size[1]);shape.closePath();
        for(const record of stairRecords.filter(r=>ceiling?r.lower===lv:r.upper===lv)){
          const a=toLocal(lv,record.path[0]),b=toLocal(lv,record.path[1]),dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),nx=-dy/length*.9,ny=dx/length*.9;
          const corners=[[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]];
          if(corners.some(p=>p[0]<=0||p[1]<=0||p[0]>=meta.size[0]||p[1]>=meta.size[1]))continue;
          const hole=new THREE.Path();corners.forEach((p,i)=>i?hole.lineTo(...p):hole.moveTo(...p));hole.closePath();shape.holes.push(hole);
        }
        const geometry=new THREE.ShapeGeometry(shape),positions=geometry.attributes.position,uv=geometry.attributes.uv;
        for(let i=0;i<positions.count;i++)uv.setXY(i,positions.getX(i)/meta.size[0],positions.getY(i)/meta.size[1]);
        return geometry.rotateZ((meta.rotation_deg||0)*Math.PI/180).rotateX(-Math.PI/2);
      }
      for(const lv of LEVELS){
        const meta=levels[lv],doors=doorData[lv]||[];
        const openings=doors.map(d=>({a:d.hinge,b:d.end,width:.45}));
        for(const r of stairRecords.filter(r=>r.lower===lv||r.upper===lv))openings.push({a:toLocal(lv,r.path[0]),b:toLocal(lv,r.path[1]),width:1.85});
        const segments=physical.segments[lv];cameraMaps[lv]=collisionMap(segments,meta.size,.18);maps[lv]=physical.maps[lv];
        const group=new THREE.Group();groups[lv]=group;scene.add(group);
        const angle=(meta.rotation_deg||0)*Math.PI/180;
        const walls=new THREE.InstancedMesh(box,material,segments.length),base=new THREE.InstancedMesh(box,baseMaterial,segments.length);
        segments.forEach(([a,b,settings],i)=>{
          const pa=toWorld(lv,a),pb=toWorld(lv,b);const length=pa.distanceTo(pb);
          const height=settings?.height||2.8,thickness=settings?.thickness||.1;
          dummy.position.copy(pa).add(pb).multiplyScalar(.5);dummy.position.y=elevation(lv)+.3+height/2;
          dummy.rotation.set(0,Math.atan2(pb.x-pa.x,pb.z-pa.z),0);dummy.scale.set(thickness,height,length);dummy.updateMatrix();walls.setMatrixAt(i,dummy.matrix);
          dummy.position.y=elevation(lv)+.43;dummy.scale.set(.13,.22,length);dummy.updateMatrix();base.setMatrixAt(i,dummy.matrix);
        });base.material=baseMaterial.clone();base.material.color.set(floorColors[lv]);walls.userData.cameraObstacle=true;group.add(walls,base);
        const planeGeometry=surface(lv);
        const floorMaterial=new THREE.MeshStandardMaterial({color:'#eceff1',roughness:1,side:THREE.DoubleSide});
        const plane=new THREE.Mesh(planeGeometry,floorMaterial);plane.position.copy(toWorld(lv,[0,0]));plane.userData.floor=lv;group.add(plane);
        const ceiling=new THREE.Mesh(surface(lv,true),new THREE.MeshStandardMaterial({color:'#f8f8f3',roughness:1,side:THREE.DoubleSide}));ceiling.position.copy(plane.position).add(new THREE.Vector3(0,2.8,0));ceiling.userData.ceiling=true;group.add(ceiling);
        new THREE.TextureLoader().load(PLANS[lv],texture=>{if(disposed){texture.dispose();return;}
          const regions=geometry?.levels[lv]?.regions||[];
          if(regions.length){const canvas=document.createElement('canvas');canvas.width=texture.image.width;canvas.height=texture.image.height;const ctx=canvas.getContext('2d');ctx.drawImage(texture.image,0,0);ctx.fillStyle='#edf0f3';for(const r of regions)ctx.fillRect(r.min[0]/meta.size[0]*canvas.width,(meta.size[1]-r.max[1])/meta.size[1]*canvas.height,(r.max[0]-r.min[0])/meta.size[0]*canvas.width,(r.max[1]-r.min[1])/meta.size[1]*canvas.height);texture.dispose();texture=new THREE.CanvasTexture(canvas);}
          texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();textures.push(texture);floorMaterial.map=texture;floorMaterial.color.set('#ffffff');floorMaterial.needsUpdate=true;
        });
        // Room identity uses the source contours; decorative inlays do not affect navigation.
        for(const room of props.current.rooms.filter(r=>r.level===lv&&r.polygon?.length>2&&r.type!=='circulation')){
          const shape=new THREE.Shape();room.polygon.forEach((p,i)=>i?shape.lineTo(...p):shape.moveTo(...p));shape.closePath();
          const inlay=new THREE.Mesh(new THREE.ShapeGeometry(shape).rotateZ(angle).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:ROOM_COLORS[room.type]||ROOM_COLORS.other,transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide}));
          inlay.position.copy(toWorld(lv,[0,0])).add(new THREE.Vector3(0,.012,0));group.add(inlay);
        }
        for(const door of doors){
          const room=props.current.rooms.find(r=>r.id===door.roomId);if(!room)continue;
          const frame=new THREE.Group(),a=toWorld(lv,door.hinge),b=toWorld(lv,door.end),theta=Math.atan2(-(b.z-a.z),b.x-a.x);frame.position.copy(a);frame.rotation.y=theta;group.add(frame);
          const frameMat=new THREE.MeshStandardMaterial({color:'#344b59',roughness:.55});
          const part=(w,h,d,x,y,z,mat=frameMat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);frame.add(m);return m;};
          part(.07,2.2,.15,0,1.1,0);part(.07,2.2,.15,door.width,1.1,0);part(door.width+.1,.1,.15,door.width/2,2.2,0);
          const leafPivot=new THREE.Group();frame.add(leafPivot);
          const leaf=new THREE.Mesh(new THREE.BoxGeometry(door.width-.08,2.08,.045),new THREE.MeshStandardMaterial({color:'#ddd2bb',roughness:.65}));leaf.position.set(door.width/2,1.04,0);leafPivot.add(leaf);
          const window=new THREE.Mesh(new THREE.BoxGeometry(door.width*.45,.55,.052),new THREE.MeshStandardMaterial({color:ROOM_COLORS[room.type]||'#738292',metalness:.25,roughness:.3}));window.position.set(door.width/2,1.5,0);leafPivot.add(window);
          for(const side of [1,-1]){
            const handle=new THREE.Mesh(new THREE.BoxGeometry(.17,.035,.035),new THREE.MeshStandardMaterial({color:'#89969c',metalness:.8,roughness:.25}));handle.position.set(door.width-.19,1,side*.075);leafPivot.add(handle);
          }
          const plaque=sign(`${room.number||room.designation_plan}`,Math.max(1.65,door.width),.58,ROOM_COLORS[room.type]||floorColors[lv],roomLabel(room,props.current.lang),`${TYPE_LABEL[props.current.lang][room.type]||''} · ${lv}`);plaque.position.set(door.width/2,2.5,0);frame.add(plaque);
          const normal=toWorld(lv,[door.hinge[0]+door.normal[0],door.hinge[1]+door.normal[1]]).sub(a);
          doorLeaves.push({frame,room,pivot:leafPivot,center:toWorld(lv,door.center),floor:lv,angle:-Math.sign(normal.x*Math.sin(theta)+normal.z*Math.cos(theta))*Math.PI/2});
        }
      }
      const stairs=new THREE.Group();scene.add(stairs);
      for(const link of props.current.links){
        const points=[...link.points].sort((a,b)=>LEVELS.indexOf(a.level)-LEVELS.indexOf(b.level));
        for(let i=1;i<points.length;i++)if(link.type==='stairs')stairs.add(buildStairs(toWorld(points[i-1].level,[points[i-1].x,points[i-1].y]),toWorld(points[i].level,[points[i].x,points[i].y]),link.id));
      }
      // A warm locator at every marked landing remains visible at eye level.
      const beacons=[];
      for(const link of props.current.links)for(const p of link.points){
        const beacon=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,1.5,12),new THREE.MeshStandardMaterial({color:link.type==='lift'?'#318cad':'#d69a47',emissive:link.type==='lift'?'#154c61':'#62451b',emissiveIntensity:.4}));
        beacon.position.copy(toWorld(p.level,[p.x,p.y])).add(new THREE.Vector3(0,.75,link.type==='stairs'?1.15:0));groups[p.level].add(beacon);beacons.push(beacon);
        const label=sign(`${link.type==='stairs'?(props.current.lang==='fr'?'Escalier':'Stairs'):(props.current.lang==='fr'?'Ascenseur':'Lift')} ${link.label||link.id}`,1.9,.5,floorColors[p.level],`${p.level} · ${link.points.map(point=>point.level).join(' / ')}`);
        label.position.copy(beacon.position).add(new THREE.Vector3(0,1.2,0));groups[p.level].add(label);
      }
      const character=createAvatar(props.current.initialPosition?.heading||0),avatar=character.root;scene.add(avatar);
      const previousPosition=new THREE.Vector3(),visualPosition=new THREE.Vector3();let viewYaw=0,viewPitch=0,viewReady=false,visibilityTime=0;
      const targetMarker=new THREE.Mesh(new THREE.TorusGeometry(.35,.06,8,24),new THREE.MeshBasicMaterial({color:'#e69528'}));targetMarker.rotation.x=Math.PI/2;targetMarker.visible=false;scene.add(targetMarker);
      const savedPosition=props.current.initialPosition;
      let floor=savedPosition?.floor||props.current.selected?.level||'RDC',position=new THREE.Vector3(),yaw=savedPosition?.yaw||0,pitch=savedPosition?.pitch||0,path=[],journey=null,onStair=null,pendingStair=null,last=performance.now(),hudTime=0;
      const guideLine=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:'#2689d6',depthTest:false}));guideLine.visible=false;guideLine.renderOrder=5;scene.add(guideLine);
      function snapshot(){const p=toLocal(floor,position);return {floor,x:p[0],y:p[1],yaw,pitch,heading:avatar.rotation.y,stairLink:onStair?.linkId,stairProgress:onStair?stairProgress(onStair.path,position,.85):null};}
      const keys=new Set();
      function showFloors(other){for(const lv of LEVELS)groups[lv].visible=lv===floor||lv===other;}
      function place(lv,p){
        const safe=safePosition(maps[lv],p);if(!safe){setMessage(props.current.lang==='fr'?'Position trop proche des murs. Choisissez un autre point.':'Position too close to walls. Choose another point.');return;}
        guideLine.visible=false;floor=lv;position.copy(toWorld(lv,safe));viewReady=false;visibilityTime=0;keys.clear();path=[];journey=null;onStair=null;pendingStair=null;setBusy(false);targetMarker.visible=false;showFloors();props.current.onFloorChange?.(floor);hudTime=0;
      }
      const initial=savedPosition?[savedPosition.x,savedPosition.y]:props.current.selected?.centroid||props.current.links[0]?.points.find(p=>p.level===floor);
      place(floor,Array.isArray(initial)?initial:initial?[initial.x,initial.y]:levels[floor].size.map(v=>v/2));
      if(savedPosition?.stairLink&&Number.isFinite(savedPosition.stairProgress)){
        const record=stairRecords.find(r=>r.linkId===savedPosition.stairLink&&(r.lower===floor||r.upper===floor));
        if(record){position.copy(pathPosition(record.path,savedPosition.stairProgress));onStair=record;showFloors(record.lower===floor?record.upper:record.lower);}
      }
      function travel(linkId,to){
        if(journey)return;
        const link=props.current.links.find(l=>l.id===linkId),from=link?.points.find(p=>p.level===floor),dest=link?.points.find(p=>p.level===to);
        if(!from||!dest||to===floor)return;
        if(Math.hypot(...toLocal(floor,position).map((v,i)=>v-[from.x,from.y][i]))>4){setMessage(props.current.lang==='fr'?'Approchez du repère de l’escalier ou utilisez « Me placer au palier ».':'Approach the landing marker or use “Place me at the landing”.');return;}
        const ascending=LEVELS.indexOf(to)>LEVELS.indexOf(floor),a=toWorld(floor,[from.x,from.y]),b=toWorld(to,[dest.x,dest.y]);
        const route=link.type==='stairs'?(ascending?stairPath(a,b):stairPath(b,a).reverse()):[a,b];
        const entry=toLocal(floor,route[0]);
        if(!maps[floor].lineClear(toLocal(floor,position),entry)){setMessage(props.current.lang==='fr'?'Rejoignez le pied de l’escalier : le passage direct est bloqué.':'Reach the stair entrance: the direct approach is blocked.');return;}
        route.unshift(position.clone());
        path=[];onStair=null;targetMarker.visible=false;keys.clear();journey={path:route,to,dest,started:performance.now()};yaw=Math.atan2(-(route.at(-1).x-route[0].x),-(route.at(-1).z-route[0].z));setBusy(true);showFloors(to);setMessage('');
      }
      function nearestLink(){const local=toLocal(floor,position);return props.current.links.map(l=>({link:l,p:l.points.find(p=>p.level===floor)})).filter(v=>v.p).sort((a,b)=>Math.hypot(local[0]-a.p.x,local[1]-a.p.y)-Math.hypot(local[0]-b.p.x,local[1]-b.p.y))[0];}
      const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let drag=null;
      const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label',props.current.lang==='fr'?'Visite immersive : ZQSD ou WASD pour marcher, glisser pour regarder':'Immersive visit: WASD to walk, drag to look');
      function down(e){if(e.button!==0)return;guideRequest++;navigationGoal=null;continueGuidance=false;if(!journey)setBusy(false);path=[];pendingStair=null;targetMarker.visible=false;canvas.focus();drag={x:e.clientX,y:e.clientY,moved:0};canvas.setPointerCapture(e.pointerId);}
      function move(e){if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved+=Math.abs(dx)+Math.abs(dy);yaw-=dx*.004;pitch=THREE.MathUtils.clamp(pitch-dy*.004,-1.15,1.15);drag.x=e.clientX;drag.y=e.clientY;}
      function up(e){const d=drag;drag=null;if(!d||d.moved>5||journey)return;
        const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);
        const hit=ray.intersectObjects(groups[floor].children).find(h=>h.object.userData.floor===floor);
        const stairHit=ray.intersectObjects(stairs.children,true).find(h=>h.object.userData.linkId);
        if(stairHit&&(!hit||stairHit.distance<hit.distance+.1)){
          const record=stairRecords.find(r=>r.linkId===stairHit.object.userData.linkId&&r.lower===floor)||stairRecords.find(r=>r.linkId===stairHit.object.userData.linkId&&r.upper===floor);
          if(record){const up=record.lower===floor,entry=toLocal(floor,record.path[up?0:1]),planned=walkingPath(maps[floor],toLocal(floor,position),entry);
            if(planned){path=planned;pendingStair={linkId:record.linkId,to:up?record.upper:record.lower};setMessage('');return;}
          }
        }
        if(!hit)return;const local=toLocal(floor,hit.point),start=toLocal(floor,position);const planned=walkingPath(maps[floor],start,local);
        if(!planned){setMessage(props.current.lang==='fr'?'Passage non reconnu. Cliquez plus près ou déplacez-vous au clavier.':'Passage not recognized. Click closer or move using the keyboard.');return;}
        path=planned;targetMarker.position.copy(toWorld(floor,local)).add(new THREE.Vector3(0,.04,0));targetMarker.visible=true;setMessage('');
      }
      const codes=new Set(['KeyW','KeyA','KeyS','KeyD','KeyZ','KeyQ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight']);
      function keydown(e){if(document.activeElement!==canvas)return;
        if(codes.has(e.code)){e.preventDefault();keys.add(e.code);guideRequest++;navigationGoal=null;continueGuidance=false;if(!journey)setBusy(false);path=[];pendingStair=null;targetMarker.visible=false;}
        if(e.code==='Escape'){keys.clear();path=[];pendingStair=null;canvas.blur();}
        if(e.code==='PageUp'||e.code==='PageDown'){
          e.preventDefault();const nearest=nearestLink();if(!nearest)return;
          const points=nearest.link.points.slice().sort((a,b)=>LEVELS.indexOf(a.level)-LEVELS.indexOf(b.level));const index=points.findIndex(p=>p.level===floor)+(e.code==='PageUp'?1:-1);if(points[index])travel(nearest.link.id,points[index].level);
        }
      }
      function keyup(e){keys.delete(e.code);}
      function blur(){keys.clear();drag=null;}
      canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',()=>{drag=null;});canvas.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);canvas.addEventListener('blur',blur);
      const resize=()=>{const {width,height}=el.getBoundingClientRect();if(width<2||height<2)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};
      const observer=new ResizeObserver(resize);observer.observe(el);resize();
      let navigationGoal=null,continueGuidance=false,arrivalTarget=null,guideRequest=0;
      async function guide(){
        const room=props.current.destination||props.current.selected;if(!room)return;
        const began=snapshot(),request=++guideRequest;keys.clear();path=[];pendingStair=null;setBusy(true);
        const plan=await props.current.requestRoute?.(began,room.id,props.current.stepFree);
        if(disposed||request!==guideRequest)return;setBusy(false);
        const current=snapshot();if(current.floor!==began.floor||Math.hypot(current.x-began.x,current.y-began.y)>.4)return;
        if(!plan){navigationGoal=null;guideLine.visible=false;setMessage(props.current.lang==='fr'?'Aucun passage accessible vers cette salle dans la géométrie actuelle.':'No accessible passage to this room in the current geometry.');return;}
        const first=plan.legs.find(l=>l.kind==='walk'&&l.level===floor),transition=plan.legs.find(l=>l.kind!=='walk');
        // Concatenate all walking legs before the first vertical transition.
        const planned=[];for(const leg of plan.legs){if(leg.kind!=='walk')break;planned.push(...leg.points);}
        if(!first||!planned.length)return;
        guideLine.geometry.dispose();guideLine.geometry=new THREE.BufferGeometry().setFromPoints(planned.map(p=>toWorld(floor,p).add(new THREE.Vector3(0,.06,0))));guideLine.visible=true;
        keys.clear();journey=null;onStair=null;setBusy(false);path=planned;navigationGoal=room.id;
        pendingStair=transition?{linkId:transition.linkId,to:transition.to}:null;arrivalTarget=transition?null:planned.at(-1);
        setMessage(transition?`${props.current.lang==='fr'?'Vers':'Towards'} ${transition.kind==='stairs'?(props.current.lang==='fr'?'l’escalier':'stairs'):(props.current.lang==='fr'?'l’ascenseur':'lift')} ${props.current.links.find(l=>l.id===transition.linkId)?.label||''} → ${transition.to}`:'');
      }
      api.current={clearGuide:()=>{guideRequest++;setBusy(false);guideLine.visible=false;path=[];pendingStair=null;navigationGoal=null;},guide,
      teleport:(lv,p)=>{guideRequest++;navigationGoal=null;continueGuidance=false;
        const safe=safePosition(maps[lv],p);if(!safe||Math.hypot(safe[0]-p[0],safe[1]-p[1])>.8){setMessage(props.current.lang==='fr'?'Ce point est bloqué. Choisissez un espace libre à côté.':'This point is blocked. Choose a nearby open space.');return;}
        place(lv,safe);setMessage('');
      },walkTo:(lv,p)=>{guideRequest++;navigationGoal=null;continueGuidance=false;
        if(lv!==floor)return;const planned=walkingPath(maps[floor],toLocal(floor,position),p);
        if(!planned){setMessage(props.current.lang==='fr'?'Aucun passage accessible vers ce point.':'No accessible path to this point.');return;}
        keys.clear();journey=null;onStair=null;pendingStair=null;setBusy(false);path=planned;targetMarker.position.copy(toWorld(floor,p)).add(new THREE.Vector3(0,.04,0));targetMarker.visible=true;setMessage('');
      },travel,stop:()=>{guideRequest++;navigationGoal=null;continueGuidance=false;keys.clear();path=[];pendingStair=null;journey=null;targetMarker.visible=false;setBusy(false);},goToDoor:()=>{
        const room=props.current.selected;if(!room||room.level!==floor){setMessage(props.current.lang==='fr'?'Placez-vous d’abord dans la salle sélectionnée.':'First place yourself in the selected room.');return;}
        const candidates=(doorData[floor]||[]).filter(d=>d.roomId===room.id).sort((a,b)=>toWorld(floor,a.center).distanceTo(position)-toWorld(floor,b.center).distanceTo(position));
        for(const door of candidates){const destination=door.center.map((v,i)=>v-door.normal[i]*.8),planned=walkingPath(maps[floor],toLocal(floor,position),destination);if(planned){path=planned;targetMarker.position.copy(toWorld(floor,destination)).add(new THREE.Vector3(0,.04,0));targetMarker.visible=true;setMessage('');return;}}
        setMessage(props.current.lang==='fr'?'Aucune porte accessible détectée pour cette salle.':'No reachable door detected for this room.');
      },placeSelected:()=>{const r=props.current.selected;if(r)place(r.level,r.centroid);},placeLanding:id=>{
        const record=stairRecords.find(r=>r.linkId===id&&r.lower===floor)||stairRecords.find(r=>r.linkId===id&&r.upper===floor)||stairRecords.find(r=>r.linkId===id);
        if(record){const up=record.lower===floor||!(record.upper===floor),entry=record.path[up?0:1],direction=record.path[1].clone().sub(record.path[0]);direction.y=0;direction.normalize().multiplyScalar(up?1:-1);const start=entry.clone().addScaledVector(direction,-.5);place(up?record.lower:record.upper,toLocal(up?record.lower:record.upper,start));yaw=Math.atan2(-direction.x,-direction.z);pitch=up?.15:-.45;return;}
        const l=props.current.links.find(l=>l.id===id),p=l?.points.find(p=>p.level===floor)||l?.points[0];if(p)place(p.level,[p.x,p.y]);
      },turn:delta=>{yaw+=delta;}};
      function update(now){
        const dt=Math.min(.05,(now-last)/1000);last=now;
        if(journey){
          const t=matchMedia('(prefers-reduced-motion: reduce)').matches?1:Math.min(1,(now-journey.started)/2800);position.copy(pathPosition(journey.path,t));
          if(t===1){const {to,path:route}=journey,end=route.at(-1),before=route.at(-2),direction=end.clone().sub(before);direction.y=0;direction.normalize();journey=null;const goal=navigationGoal;place(to,toLocal(to,end.clone().addScaledVector(direction,.45)));navigationGoal=goal;continueGuidance=!!goal;}
        }else{
          const forward=(keys.has('KeyW')||keys.has('KeyZ')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0);
          const side=(keys.has('KeyD')?1:0)-(keys.has('KeyA')||keys.has('KeyQ')?1:0);
          if(keys.has('ArrowLeft'))yaw+=dt*1.5;if(keys.has('ArrowRight'))yaw-=dt*1.5;
          let target=null;
          if(forward||side){const scale=(keys.has('ShiftLeft')||keys.has('ShiftRight')?4:2.2)*dt/Math.max(1,Math.hypot(forward,side));target=position.clone().add(new THREE.Vector3(-Math.sin(yaw)*forward+Math.cos(yaw)*side,0,-Math.cos(yaw)*forward-Math.sin(yaw)*side).multiplyScalar(scale));}
          else if(path.length){const next=toWorld(floor,path[0]),delta=next.clone().sub(position);delta.y=0;if(delta.length()<.12){path.shift();if(!path.length)targetMarker.visible=false;}else{target=position.clone().add(delta.normalize().multiplyScalar(Math.min(2.2*dt,position.distanceTo(next))));yaw=Math.atan2(-delta.x,-delta.z);}}
          if(target){
            const ramp=stairRecords.find(r=>{
              if(r.lower!==floor&&r.upper!==floor&&r!==onStair)return false;
              const t=stairProgress(r.path,target,.6),old=stairProgress(r.path,position,.85);
              return t!==null&&old!==null&&(r===onStair||Math.abs(pathPosition(r.path,old).y-position.y)<.3);
            });
            if(ramp){const t=stairProgress(ramp.path,target,.6);target.y=pathPosition(ramp.path,t).y;position.copy(target);onStair=ramp;showFloors(floor===ramp.lower?ramp.upper:ramp.lower);
              const next=t>=1?ramp.upper:t<=0?ramp.lower:floor;if(next!==floor){floor=next;props.current.onFloorChange?.(floor);hudTime=0;}
            }else if(onStair&&stairProgress(onStair.path,position,.85)>0&&stairProgress(onStair.path,position,.85)<1){path=[];}
            else {
            onStair=null;showFloors();
            const hole=stairRecords.some(r=>r.upper===floor&&stairProgress(r.path,target,.9)>0&&stairProgress(r.path,target,.9)<1);
            const a=toLocal(floor,position),b=toLocal(floor,target),map=maps[floor];let p=a;
            if(hole){path=[];}else if(map.lineClear(a,b))p=b;else if(map.lineClear(a,[b[0],a[1]]))p=[b[0],a[1]];else if(map.lineClear(a,[a[0],b[1]]))p=[a[0],b[1]];else{path=[];targetMarker.visible=false;}
            position.copy(toWorld(floor,p));
            }
          }
        }
        if(navigationGoal&&arrivalTarget&&!path.length&&!journey&&!pendingStair&&Math.hypot(...toLocal(floor,position).map((v,i)=>v-arrivalTarget[i]))<.3){const room=props.current.rooms.find(r=>r.id===navigationGoal);setMessage(`${props.current.lang==='fr'?'Arrivée à':'Arrived at'} ${room?roomName(room,props.current.lang):navigationGoal}`);navigationGoal=null;arrivalTarget=null;}
        if(continueGuidance&&!journey){continueGuidance=false;if(navigationGoal)guide();}
        if(pendingStair&&!path.length&&!journey){const pending=pendingStair;pendingStair=null;travel(pending.linkId,pending.to);}
        const moved=position.distanceTo(previousPosition),heading=Math.atan2(-(position.x-previousPosition.x),-(position.z-previousPosition.z));previousPosition.copy(position);
        if(!viewReady){visualPosition.copy(position);viewYaw=yaw;viewPitch=pitch;viewReady=true;}
        visualPosition.lerp(position,dampFactor(22,dt));viewYaw=dampAngle(viewYaw,yaw,20,dt);viewPitch+=(pitch-viewPitch)*dampFactor(20,dt);
        avatar.visible=thirdPerson.current;avatar.position.copy(visualPosition);character.update(dt,moved,heading,matchMedia('(prefers-reduced-motion: reduce)').matches);
        if(thirdPerson.current){
          const target=visualPosition.clone().add(new THREE.Vector3(0,1.4,0));
          const offset=new THREE.Vector3(Math.sin(viewYaw)*2.7,THREE.MathUtils.clamp(.6+Math.sin(-viewPitch)*1.1,.1,1.1),Math.cos(viewYaw)*2.7);
          const fraction=cameraFraction(cameraMaps[floor],toLocal(floor,position),toLocal(floor,target.clone().add(offset)));
          camera.position.copy(target).addScaledVector(offset,fraction);avatar.visible=fraction*offset.length()>.65;
          camera.lookAt(target.clone().add(new THREE.Vector3(-Math.sin(viewYaw)*1.2,0,-Math.cos(viewYaw)*1.2)));
        }else{camera.position.copy(visualPosition).add(new THREE.Vector3(0,1.65,0));camera.rotation.set(viewPitch,viewYaw,0,'YXZ');}
        if(now-visibilityTime>120){visibilityTime=now;for(const door of doorLeaves)door.frame.visible=groups[door.floor].visible&&door.center.distanceToSquared(position)<32*32;}
        if(now-hudTime>250){hudTime=now;const p=toLocal(floor,position),near=nearestLink();const nearby=near&&Math.hypot(p[0]-near.p.x,p[1]-near.p.y)<4?near.link.id:null;
          const room=roomAt(p,props.current.rooms.filter(r=>r.level===floor));
          let closest=null;for(const door of doorLeaves){if(door.floor!==floor)continue;const distance=door.center.distanceTo(position);if(!closest||distance<closest.distance)closest={door,distance};}
          const nearRoom=closest&&closest.distance<6?closest.door.room:null;
          props.current.onPositionChange?.(snapshot());
          setHud({floor,x:p[0],y:p[1],nearby,yaw,room:room?roomName(room,props.current.lang):null,detail:room||nearRoom,inside:!!room,doorDistance:closest?.distance,onStair:!!onStair});
        }
        for(const door of doorLeaves){if(!door.frame.visible)continue;const close=door.floor===floor&&position.distanceToSquared(door.center)<2.4*2.4;door.pivot.rotation.y=THREE.MathUtils.lerp(door.pivot.rotation.y,close?door.angle:0,dampFactor(5,dt));}
        renderer.render(scene,camera);raf=requestAnimationFrame(update);
      }raf=requestAnimationFrame(update);
      cleanup=()=>{props.current.onPositionChange?.(snapshot(),true);observer.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);scene.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});textures.forEach(t=>t.dispose());};
    }
    start();return()=>{disposed=true;abort.abort();cancelAnimationFrame(raf);cleanup();renderer?.dispose();renderer?.domElement.remove();api.current=null;};
  },[floors,links,geometry,lang,rooms]);
  useEffect(()=>{api.current?.clearGuide();},[destination?.id,selected?.id,stepFree]);
  const connection=links.find(l=>l.id===(hud?.nearby||connectionId))||links[0];
  const points=connection?.points.slice().sort((a,b)=>LEVELS.indexOf(a.level)-LEVELS.indexOf(b.level))||[];
  const index=points.findIndex(p=>p.level===hud?.floor);
  return <div className="walkthrough">
    <div className="walk-stage" ref={host}/>
    <div className="walk-top" style={{borderLeft:`6px solid ${{RDC:'#3f806a','R+1':'#416d9c','R+2':'#86659d'}[hud?.floor]||'#416d9c'}`}}><div><strong>{hud?.room||(fr?'Couloir / espace commun':'Corridor / shared space')}</strong><span>{hud?`${hud.floor} · x ${hud.x.toFixed(1)} m · y ${hud.y.toFixed(1)} m${hud.onStair?(fr?' · Dans l’escalier':' · On the stairs'):''}`:(fr?'Préparation du bâtiment…':'Preparing the building…')}</span></div><button className="ghost" onClick={onOverview}>{fr?'Sortir vers le plan 2D':'Return to 2D plan'}</button></div>
    <div className="walk-perspective" role="group" aria-label={fr?'Point de vue':'Viewpoint'}>{[['third',fr?'Personnage':'Character'],['first',fr?'Première personne':'First person']].map(([id,label])=><button key={id} aria-pressed={perspective===id} onClick={()=>{thirdPerson.current=id==='third';setPerspective(id);}}>{label}</button>)}</div>
    {hud?.detail&&<aside className="walk-room-info" style={{borderTopColor:ROOM_COLORS[hud.detail.type]||ROOM_COLORS.other}}><small>{hud.inside?(fr?'VOUS ÊTES DANS':'YOU ARE IN'):(fr?'À PROXIMITÉ':'NEARBY')}</small><strong>{roomName(hud.detail,lang)}</strong><span>{TYPE_LABEL[lang][hud.detail.type]} · {hud.floor}{!hud.inside&&hud.doorDistance?` · ${hud.doorDistance.toFixed(1)} m`:''}</span><p>{hud.detail[`description_${lang}`]}</p><div>{hud.detail.area_plan_m2?`${hud.detail.area_plan_m2} m²`:''}{hud.detail.capacity?` · ${hud.detail.capacity} ${fr?'places':'seats'}`:''}</div><RoomPracticalInfo room={hud.detail} lang={lang}/><button className="ghost" onClick={()=>mapProps?.onEditRoom(hud.detail)}>{fr?'Modifier les informations':'Edit room information'}</button><small>{hud.detail.verified_on_site?(fr?'Vérifié sur place':'Verified on site'):(fr?'Informations issues du plan':'Information from the plan')}</small></aside>}
    <div className="walk-crosshair" aria-hidden="true">+</div>
    {hud&&mapProps&&<ImmersivePlan hud={hud} mapProps={mapProps} onTeleport={(lv,p)=>api.current?.teleport(lv,p)} onWalk={(lv,p)=>api.current?.walkTo(lv,p)}/>}
    {(destination||selected)&&<div className="walk-itinerary"><strong>{fr?'Destination':'Destination'} : {roomName(destination||selected,lang)}</strong>{route&&<span>{route.metres} m · {route.minutes} min · {fr?'itinéraire indicatif':'approximate route'}</span>}<button disabled={busy} onClick={()=>api.current?.guide()}>{fr?'Me guider depuis ma position':'Guide me from my position'}</button><button onClick={()=>api.current?.stop()}>{fr?'Arrêter':'Stop'}</button></div>}
    <details className="walk-controls"><summary>{fr?'Commandes de déplacement':'Movement controls'}</summary><p>{fr?'Cliquez dans la vue, puis ZQSD / WASD pour marcher. Flèches ← → pour tourner. Glissez la souris pour regarder. Cliquez au sol pour avancer. Échap pour libérer le clavier.':'Click the view, then WASD to walk. Left/right arrows turn. Drag to look. Click the floor to walk. Escape releases the keyboard.'}</p><div className="three-buttons"><button onClick={()=>api.current?.placeSelected()} disabled={!selected}>{fr?'Me placer dans la salle sélectionnée':'Place me in the selected room'}</button><button onClick={()=>api.current?.goToDoor()} disabled={!selected||busy}>{fr?'Aller à la porte':'Walk to the door'}</button><button onClick={()=>api.current?.stop()}>{fr?'Arrêter':'Stop'}</button><button onClick={()=>api.current?.turn(Math.PI)}>{fr?'Demi-tour':'Turn around'}</button></div><small>{fr?'Portes détectées sur les plans et associées aux salles. Dimensions et sens d’ouverture reconstitués ; à vérifier sur place.':'Doors detected on the plans and matched to rooms. Reconstructed sizes and opening directions require on-site checking.'}</small></details>
    <details className="walk-landings"><summary>{fr?'Changer d’étage':'Change floor'}</summary><label>{fr?'Escalier ou ascenseur':'Stairs or lift'}<select aria-label={fr?'Liaison de la visite':'Walkthrough connection'} value={connectionId} onChange={e=>setConnectionId(e.target.value)}>{links.map((l,i)=><option key={l.id} value={l.id}>{l.type==='stairs'?(fr?'Escalier':'Stairs'):(fr?'Ascenseur':'Lift')} {l.label||i+1}</option>)}</select></label><button className="ghost" disabled={busy} onClick={()=>api.current?.placeLanding(connectionId)}>{fr?'Me placer au palier':'Place me at the landing'}</button><p aria-live="polite">{busy?(fr?'Changement d’étage…':'Changing floor…'):hud?.nearby?(fr?'Marchez sur les marches pour changer d’étage.':'Walk onto the steps to change floors.'):(fr?'Approchez d’un palier pour changer d’étage.':'Approach a landing to change floors.')}</p><div className="three-buttons"><button disabled={busy||!hud?.nearby||index<=0} onClick={()=>api.current?.travel(connection.id,points[index-1].level)}>↓ {fr?'Descendre':'Go down'}</button><button disabled={busy||!hud?.nearby||index<0||index>=points.length-1} onClick={()=>api.current?.travel(connection.id,points[index+1].level)}>↑ {fr?'Monter':'Go up'}</button></div><small>{fr?'Une volée continue : marchez ou cliquez sur les marches. Page ↑ / Page ↓ reste disponible.':'One continuous flight: walk or click the steps. Page Up / Page Down remains available.'}</small></details>
    {message&&<div className="walk-message" role="status">{message}<button aria-label={fr?'Fermer le message':'Dismiss message'} onClick={()=>setMessage('')}>×</button></div>}
    {error&&<div className="three-unavailable">{error==='webgl'?(fr?'WebGL indisponible.':'WebGL unavailable.'):(fr?'Impossible de charger les murs. Relancez npm run data.':'Could not load walls. Run npm run data again.')}<button className="primary" onClick={onOverview}>{fr?'Sortir vers le plan 2D':'Return to 2D plan'}</button></div>}
  </div>;
}
