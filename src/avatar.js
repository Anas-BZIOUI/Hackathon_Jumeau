import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {dampFactor,dampAngle} from './motion.js';

// Original procedural student, built from shared, lightweight geometry.
// The navigation footprint and animation API are independent of this model.
export function createAvatar(initialHeading=0){
 const root=new THREE.Group(),body=new THREE.Group();root.add(body);
 root.name='student-avatar';body.name='student-body';
 const materials={
  jacket:new THREE.MeshStandardMaterial({color:'#347b91',roughness:.88}),
  trim:new THREE.MeshStandardMaterial({color:'#255565',roughness:1}),
  shirt:new THREE.MeshStandardMaterial({color:'#f3eee3',roughness:1}),
  skin:new THREE.MeshStandardMaterial({color:'#d9ae8e',roughness:.92}),
  hair:new THREE.MeshStandardMaterial({color:'#342e30',roughness:1}),
  trousers:new THREE.MeshStandardMaterial({color:'#334359',roughness:1}),
  shoe:new THREE.MeshStandardMaterial({color:'#f5f0e7',roughness:.85}),
  sole:new THREE.MeshStandardMaterial({color:'#b9c4c4',roughness:1}),
  bag:new THREE.MeshStandardMaterial({color:'#3c4c5d',roughness:1}),
  accent:new THREE.MeshStandardMaterial({color:'#d3ad71',roughness:.7}),
  dark:new THREE.MeshStandardMaterial({color:'#29333c',roughness:1}),
  eyes:new THREE.MeshStandardMaterial({color:'#fffaf2',roughness:.6})
 };
 const roundBox=new RoundedBoxGeometry(1,1,1,2,.15),sphere=new THREE.SphereGeometry(1,16,12);
 function mesh(parent,geometry,material,x,y,z,scale){
  const object=new THREE.Mesh(geometry,materials[material]);object.position.set(x,y,z);
  if(scale)object.scale.set(...scale);parent.add(object);return object;
 }
 const rounded=(parent,size,mat,x,y,z)=>mesh(parent,roundBox,mat,x,y,z,size);
 const ellipsoid=(parent,size,mat,x,y,z)=>mesh(parent,sphere,mat,x,y,z,size);
 function capsule(parent,r,length,mat,x,y,z){return mesh(parent,new THREE.CapsuleGeometry(r,length,4,10),mat,x,y,z);}
 function cord(parent,points,radius,mat){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  return mesh(parent,new THREE.TubeGeometry(curve,12,radius,5,false),mat,0,0,0);
 }
 // A softly tailored, open jacket over a T-shirt, with cuffs and pocket seams.
 rounded(body,[.43,.50,.25],'jacket',0,1.135,0);
 rounded(body,[.15,.39,.018],'shirt',0,1.18,-.128);
 rounded(body,[.39,.045,.24],'trim',0,.91,0);
 rounded(body,[.012,.36,.016],'accent',.079,1.17,-.141);
 ellipsoid(body,[.145,.072,.13],'jacket',0,1.375,.045);
 for(const side of [-1,1]){
  const seam=rounded(body,[.075,.014,.014],'trim',side*.13,1.025,-.133);seam.rotation.z=side*.2;
 }
 ellipsoid(body,[.017,.017,.005],'accent',-.13,1.255,-.135);
 mesh(body,new THREE.CylinderGeometry(.063,.071,.105,12),'skin',0,1.438,0);

 const head=new THREE.Group();head.name='student-face';head.position.set(0,1.63,-.008);body.add(head);
 ellipsoid(head,[.149,.177,.146],'skin',0,0,0);
 // The hairline is raised at the front, so the face is not hidden by a helmet.
 const hairGeometry=new THREE.SphereGeometry(.166,16,12,0,Math.PI*2,0,Math.PI*.65);
 const vertices=hairGeometry.attributes.position;
 for(let i=0;i<vertices.count;i++){
  const x=vertices.getX(i),z=vertices.getZ(i);
  if(z<-.015)vertices.setY(i,Math.max(vertices.getY(i),.045+.009*Math.sin(x*19)));
 }
 hairGeometry.computeVertexNormals();
 mesh(head,hairGeometry,'hair',0,.025,.014);
 const fringe=ellipsoid(head,[.082,.029,.05],'hair',.038,.15,-.082);fringe.rotation.z=-.22;
 for(const side of [-1,1]){
  ellipsoid(head,[.025,.038,.023],'skin',side*.147,-.006,.005);
  ellipsoid(head,[.022,.018,.012],'eyes',side*.052,.021,-.139);
  ellipsoid(head,[.009,.011,.006],'dark',side*.052,.02,-.153);
  const brow=capsule(head,.005,.03,'hair',side*.052,.063,-.135);brow.rotation.z=Math.PI/2+side*.10;
 }
 ellipsoid(head,[.017,.022,.025],'skin',0,-.015,-.151);
 cord(head,[[-.029,-.051,-.136],[0,-.060,-.143],[.029,-.051,-.136]],.0035,'dark');

 // The entire bag, including both straps, is one hideable accessory group.
 const bag=new THREE.Group();bag.name='student-backpack';body.add(bag);
 rounded(bag,[.285,.345,.135],'bag',0,1.135,.18);
 rounded(bag,[.22,.12,.045],'trim',0,1.055,.26);
 rounded(bag,[.26,.025,.025],'accent',0,.995,.25);
 cord(bag,[[-.045,1.302,.19],[-.04,1.358,.19],[.04,1.358,.19],[.045,1.302,.19]],.012,'dark');
 for(const side of [-1,1])cord(bag,[[side*.145,.99,-.137],[side*.17,1.24,-.14],[side*.16,1.392,.02],[side*.13,1.30,.16]],.014,'bag');

 const joints=[];
 for(const side of [-1,1]){
  const leg=new THREE.Group();leg.position.set(side*.108,.86,0);body.add(leg);
  capsule(leg,.078,.205,'trousers',0,-.17,0);
  const knee=new THREE.Group();knee.position.y=-.35;leg.add(knee);
  capsule(knee,.066,.23,'trousers',0,-.17,0);
  rounded(knee,[.105,.07,.11],'shirt',0,-.365,-.005);
  rounded(knee,[.16,.115,.275],'shoe',0,-.435,-.05);
  rounded(knee,[.168,.032,.28],'sole',0,-.481,-.05);
  const arm=new THREE.Group();arm.position.set(side*.239,1.315,0);body.add(arm);
  capsule(arm,.066,.175,'jacket',side*.009,-.13,0);
  const elbow=new THREE.Group();elbow.position.set(side*.009,-.27,0);arm.add(elbow);
  capsule(elbow,.052,.155,'jacket',0,-.115,0);
  rounded(elbow,[.10,.04,.10],'trim',0,-.23,0);
  ellipsoid(elbow,[.047,.065,.044],'skin',0,-.282,-.008);
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
 return {root,update,setAppearance:settings=>{
  if(lastAppearance===settings)return;lastAppearance=settings;
  for(const key of ['skin','hair','trousers'])if(/^#[0-9a-f]{6}$/i.test(settings[key]||''))materials[key].color.set(settings[key]);
  bag.visible=settings.backpack!==false;
 },setOutfit:color=>{
  if(lastOutfit===color)return;lastOutfit=color;
  if(/^#[0-9a-f]{6}$/i.test(color||'')){materials.jacket.color.set(color);materials.trim.color.set(color).multiplyScalar(.68);}
 }};
}
