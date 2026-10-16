import * as THREE from 'three';

// The marks identify the stair core, not the entry/exit. Use one straight flight
// along the plan's horizontal stair axis, with level landings at both ends.
export function stairPath(a,b,direction=new THREE.Vector3(1,0,0)) {
  const axis=direction.clone().setY(0).normalize();
  return [a.clone().addScaledVector(axis,-2.7),b.clone().addScaledVector(axis,2.7)];
}
export function pathPosition(points,progress) {
  const lengths=points.slice(1).map((p,i)=>p.distanceTo(points[i]));
  let remaining=Math.max(0,Math.min(1,progress))*lengths.reduce((a,b)=>a+b,0);
  for(let i=0;i<lengths.length;i++) {
    if(remaining<=lengths[i]||i===lengths.length-1)return points[i].clone().lerp(points[i+1],lengths[i]?remaining/lengths[i]:0);
    remaining-=lengths[i];
  }return points[0].clone();
}
export function stairProgress(path,position,width=.82) {
  const [a,b]=path,dx=b.x-a.x,dz=b.z-a.z,length=dx*dx+dz*dz;
  if(length<.01)return null;
  const t=((position.x-a.x)*dx+(position.z-a.z)*dz)/length;
  const distance=Math.hypot(position.x-a.x-t*dx,position.z-a.z-t*dz);
  return t>=-.14&&t<=1.14&&distance<=width?Math.max(0,Math.min(1,t)):null;
}
export function stairVisitState(record,position,to=null){
  if(!record)return {stairLink:null,stairProgress:null,stairTo:null};
  const progress=stairProgress(record.path,position,.85);
  return progress===null?{stairLink:null,stairProgress:null,stairTo:null}:{stairLink:record.linkId,stairProgress:progress,stairTo:to===record.lower||to===record.upper?to:null};
}
export function buildStairs(a,b,linkId,direction) {
  const group=new THREE.Group(),path=stairPath(a,b,direction),[start,end]=path;
  const horizontal=Math.hypot(end.x-start.x,end.z-start.z),rise=end.y-start.y;
  const count=Math.max(12,Math.min(32,Math.ceil(Math.abs(rise)/.18))),angle=Math.atan2(end.x-start.x,end.z-start.z);
  const material=new THREE.MeshStandardMaterial({color:'#8297aa',roughness:.8});
  const edgeMaterial=new THREE.MeshBasicMaterial({color:'#f5d573'});
  const railMaterial=new THREE.MeshStandardMaterial({color:'#38566e',roughness:.5});
  function box(width,height,depth,position,mat=material) {
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),mat);mesh.position.copy(position);mesh.rotation.y=angle;mesh.userData.linkId=linkId;group.add(mesh);return mesh;
  }
  for(let i=0;i<count;i++) {
    const center=start.clone().lerp(end,(i+.5)/count),height=Math.abs(rise)/count;
    box(1.5,height,horizontal/count+.015,center).userData.surface='step';
    const nose=start.clone().lerp(end,(i+1)/count);nose.y+=.016;
    box(1.5,.032,.045,nose,edgeMaterial);
  }
  for(const p of [start,end])box(1.7,.12,.9,p.clone().add(new THREE.Vector3(0,-.06,0))).userData.surface='landing';
  const right=new THREE.Vector3(Math.cos(angle),0,-Math.sin(angle));
  function rail(a,b,radius=.035) {
    const delta=b.clone().sub(a);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,delta.length(),8),railMaterial);
    mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());group.add(mesh);
  }
  for(const side of [-1,1]) {
    const a=start.clone().addScaledVector(right,side*.78),b=end.clone().addScaledVector(right,side*.78);
    rail(a.clone().add(new THREE.Vector3(0,.95,0)),b.clone().add(new THREE.Vector3(0,.95,0)),.05);
    for(let i=0;i<=6;i++){const p=a.clone().lerp(b,i/6);rail(p,p.clone().add(new THREE.Vector3(0,.95,0)));}
  }
  return group;
}
