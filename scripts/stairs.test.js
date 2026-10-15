import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { stairPath, pathPosition, buildStairs, stairProgress } from '../src/stairs.js';

test('one straight flight joins level landings and can be traversed in both directions', () => {
  const a=new THREE.Vector3(10,.3,-20), b=new THREE.Vector3(10.4,5.3,-20.1);
  const path=stairPath(a,b);
  assert.equal(path.length,2);
  assert.equal(pathPosition(path,0).y,a.y);
  assert.equal(pathPosition(path,1).y,b.y);
  assert(pathPosition([...path].reverse(),1).distanceTo(path[0])<1e-9);
  assert.equal(stairProgress(path,path[0]),0);
  assert.equal(stairProgress(path,path[1]),1);
  assert.equal(stairProgress(path,new THREE.Vector3(100,0,100)),null);
  let height=a.y;
  for(let i=0;i<=100;i++) {
    const p=pathPosition(path,i/100);
    assert(p.toArray().every(Number.isFinite));
    assert(p.y>=height-1e-8); height=p.y;
  }
});
test('stairs contain clickable steps, finite geometry, and rails in compact and exploded display', () => {
  for(const rise of [3.2,48]) {
    const stairs=buildStairs(new THREE.Vector3(0,0,0),new THREE.Vector3(.2,rise,.3),'stairs-A');
    let steps=0,rails=0;
    stairs.traverse(mesh=>{
      if(mesh.userData.surface==='step') {assert.equal(mesh.userData.linkId,'stairs-A');steps++;}
      if(mesh.geometry) {
        assert(mesh.geometry.attributes.position.array.every(Number.isFinite));
        if(mesh.geometry.type==='CylinderGeometry')rails++;
        mesh.geometry.dispose();mesh.material.dispose();
      }
    });
    assert.equal(steps,Math.max(12,Math.min(32,Math.ceil(rise/.18)))); assert(rails>10);
  }
});
test('the first step rests on the lower floor and the final step meets the upper floor',()=>{
  const a=new THREE.Vector3(0,.3,0),b=new THREE.Vector3(.2,3.5,.1),model=buildStairs(a,b,'stairs');
  const steps=model.children.filter(m=>m.userData.surface==='step');
  const first=new THREE.Box3().setFromObject(steps[0]),last=new THREE.Box3().setFromObject(steps.at(-1));
  assert(Math.abs(first.min.y-a.y)<1e-6);assert(Math.abs(last.max.y-b.y)<1e-6);
  for(const landing of model.children.filter(m=>m.userData.surface==='landing')){
    const top=new THREE.Box3().setFromObject(landing).max.y;
    assert(Math.min(Math.abs(top-a.y),Math.abs(top-b.y))<1e-6);
  }
});
test('path sampling clamps progress and handles one-point positioning',()=>{
  const p=new THREE.Vector3(1,2,3);
  assert(pathPosition([p],.5).equals(p));
  assert(pathPosition([p,new THREE.Vector3(4,5,6)],-1).equals(p));
});
