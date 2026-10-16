import * as THREE from 'three';
import {dampFactor,dampAngle} from './motion.js';

// Lightweight, original stylized student: no downloaded assets or extra textures.
export function createAvatar(initialHeading=0){
 const root=new THREE.Group(),body=new THREE.Group();root.add(body);
 const materials={jacket:new THREE.MeshStandardMaterial({color:'#347b91',roughness:.85}),skin:new THREE.MeshStandardMaterial({color:'#d9ae8e',roughness:.9}),hair:new THREE.MeshStandardMaterial({color:'#342e30',roughness:1}),trousers:new THREE.MeshStandardMaterial({color:'#334359',roughness:1}),shoe:new THREE.MeshStandardMaterial({color:'#faf7ee',roughness:.8}),bag:new THREE.MeshStandardMaterial({color:'#c6904c',roughness:1}),dark:new THREE.MeshStandardMaterial({color:'#25323c'})};
 function mesh(parent,geometry,material,x,y,z){const m=new THREE.Mesh(geometry,materials[material]);m.position.set(x,y,z);parent.add(m);return m;}
 function capsule(parent,r,length,mat,x,y,z){return mesh(parent,new THREE.CapsuleGeometry(r,length,4,10),mat,x,y,z);}
 mesh(body,new THREE.CylinderGeometry(.22,.18,.48,10), 'jacket',0,1.09,0);
 capsule(body,.12,.12,'skin',0,1.40,0);
 const head=mesh(body,new THREE.SphereGeometry(.19,14,12),'skin',0,1.61,-.01);head.scale.set(.88,1.13,.94);
 const hair=mesh(body,new THREE.SphereGeometry(.198,14,10,0,Math.PI*2,0,Math.PI*.57),'hair',0,1.64,0);hair.scale.set(.9,1.1,1);
 for(const side of [-1,1]){mesh(body,new THREE.SphereGeometry(.023,8,6),'dark',side*.065,1.63,-.174);mesh(body,new THREE.SphereGeometry(.043,8,6),'skin',side*.17,1.60,0);}
 mesh(body,new THREE.SphereGeometry(.035,8,6),'skin',0,1.57,-.186);
 const bag=mesh(body,new THREE.BoxGeometry(.30,.36,.15),'bag',0,1.12,.20);
 mesh(bag,new THREE.BoxGeometry(.23,.12,.035),'jacket',0,-.07,.09);
 for(const side of [-1,1])mesh(body,new THREE.BoxGeometry(.035,.42,.04),'bag',side*.15,1.12,-.16);
 const joints=[];
 for(const side of [-1,1]){
  const leg=new THREE.Group();leg.position.set(side*.115,.84,0);body.add(leg);
  capsule(leg,.085,.22,'trousers',0,-.17,0);
  const knee=new THREE.Group();knee.position.y=-.35;leg.add(knee);capsule(knee,.073,.22,'trousers',0,-.16,0);
  const shoe=mesh(knee,new THREE.BoxGeometry(.16,.11,.29),'shoe',0,-.39,-.055);
  mesh(shoe,new THREE.BoxGeometry(.165,.025,.30),'dark',0,-.05,0);
  const arm=new THREE.Group();arm.position.set(side*.26,1.30,0);body.add(arm);
  capsule(arm,.069,.17,'jacket',0,-.13,0);
  const elbow=new THREE.Group();elbow.position.y=-.27;arm.add(elbow);capsule(elbow,.057,.15,'jacket',0,-.11,0);capsule(elbow,.06,.025,'skin',0,-.25,0);
  joints.push({side,leg,knee,arm,elbow});
 }
 let phase=0,blend=0,heading=initialHeading,lastAppearance=null,lastOutfit=null;
 function update(dt,distance,targetHeading,reduced=false,climbing=false){
  const moving=distance>.0005&&distance<.5;blend+=((moving?1:0)-blend)*dampFactor(14,dt);
  if(moving){phase+=distance*8;heading=dampAngle(heading,targetHeading,14,dt);}
  root.rotation.y=heading;
  body.position.y=reduced?0:Math.sin(phase*2)*.018*blend;
  const stride=Math.max(.7,Math.min(1.5,distance/Math.max(.001,dt)/2.2));
  for(const j of joints){const swing=Math.sin(phase)*j.side*blend;
   j.leg.rotation.x=reduced?0:swing*.55*stride-(climbing?.2*blend:0);j.knee.rotation.x=reduced?0:Math.max(0,-swing)*(climbing?1.1:.68)*stride;
   j.arm.rotation.x=reduced?0:-swing*.42;j.elbow.rotation.x=-.14-Math.max(0,swing)*.18;
  }
 }
 return {root,update,setAppearance:settings=>{if(lastAppearance===settings)return;lastAppearance=settings;for(const key of ['skin','hair','trousers'])if(/^#[0-9a-f]{6}$/i.test(settings[key]||''))materials[key].color.set(settings[key]);bag.visible=settings.backpack!==false;body.children.filter(o=>o.material===materials.bag).forEach(o=>o.visible=settings.backpack!==false);},setOutfit:color=>{if(lastOutfit===color)return;lastOutfit=color;if(/^#[0-9a-f]{6}$/i.test(color||''))materials.jacket.color.set(color);}};
}
