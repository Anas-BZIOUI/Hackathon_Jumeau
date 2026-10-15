import test from 'node:test';
import assert from 'node:assert/strict';
import {createAvatar} from '../src/avatar.js';
test('avatar remains finite while walking, stopping and turning; reduced motion stops gait',()=>{
 const avatar=createAvatar();
 for(let i=0;i<120;i++)avatar.update(1/60,.035,i<60?Math.PI-.01:-Math.PI+.01);
 for(let i=0;i<60;i++)avatar.update(1/60,0,0);
 avatar.update(1/60,.03,0,true);avatar.root.updateMatrixWorld(true);
 let meshes=0;avatar.root.traverse(o=>{assert.ok(o.matrixWorld.elements.every(Number.isFinite));if(o.isMesh)meshes++;});
 assert.ok(meshes>20&&meshes<50);
 assert.equal(avatar.root.children[0].position.y,0);
 avatar.root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});
