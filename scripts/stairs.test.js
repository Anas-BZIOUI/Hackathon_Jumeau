import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { stairPath, pathPosition, buildStairs } from '../src/stairs.js';

test('switchback traversal starts and ends exactly on the marked landings in both directions', () => {
  const a=new THREE.Vector3(10,.3,-20), b=new THREE.Vector3(10.4,5.3,-20.1);
  const path=stairPath(a,b);
  assert(pathPosition(path,0).distanceTo(a)<1e-9);
  assert(pathPosition(path,1).distanceTo(b)<1e-9);
  assert(pathPosition([...path].reverse(),1).distanceTo(a)<1e-9);
  let height=a.y;
  for(let i=0;i<=100;i++) {
    const p=pathPosition(path,i/100);
    assert(p.toArray().every(Number.isFinite));
    assert(p.y>=height-1e-8); height=p.y;
  }
});
test('stairs contain clickable steps, finite geometry, and rails in compact and exploded display', () => {
  for(const rise of [5,48]) {
    const stairs=buildStairs(new THREE.Vector3(0,0,0),new THREE.Vector3(.2,rise,.3),'stairs-A');
    let steps=0,rails=0;
    stairs.traverse(mesh=>{
      if(mesh.userData.linkId) {assert.equal(mesh.userData.linkId,'stairs-A');steps++;}
      if(mesh.geometry) {
        assert(mesh.geometry.attributes.position.array.every(Number.isFinite));
        if(mesh.geometry.type==='CylinderGeometry')rails++;
        mesh.geometry.dispose();mesh.material.dispose();
      }
    });
    assert.equal(steps,29); assert(rails>10);
  }
});
test('path sampling clamps progress and handles one-point positioning',()=>{
  const p=new THREE.Vector3(1,2,3);
  assert(pathPosition([p],.5).equals(p));
  assert(pathPosition([p,new THREE.Vector3(4,5,6)],-1).equals(p));
});
