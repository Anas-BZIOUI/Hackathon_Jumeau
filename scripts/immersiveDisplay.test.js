import test from 'node:test';
import assert from 'node:assert/strict';
import {expandImmersion,collapseImmersion} from '../src/immersiveDisplay.js';

test('fullscreen targets the scene and can be exited without touching another fullscreen element',async()=>{
 const doc={fullscreenElement:null,async exitFullscreen(){this.fullscreenElement=null;}};
 const scene={async requestFullscreen(){doc.fullscreenElement=this;}};
 assert.equal(await expandImmersion(scene,doc),'native');
 assert.equal(await collapseImmersion(scene,doc),true);
 const other={};doc.fullscreenElement=other;
 assert.equal(await collapseImmersion(scene,doc),true);assert.equal(doc.fullscreenElement,other);
});
test('unsupported or rejected native fullscreen falls back to an in-window view',async()=>{
 assert.equal(await expandImmersion({},{}),'window');
 assert.equal(await expandImmersion({requestFullscreen:async()=>{throw Error('denied');}},{}),'window');
 assert.equal(await expandImmersion({requestFullscreen:async()=>{}},{}),'window');
});
test('a rejected fullscreen exit does not report a successful exit',async()=>{
 const scene={},doc={fullscreenElement:scene,exitFullscreen:async()=>{throw Error('denied');}};
 assert.equal(await collapseImmersion(scene,doc),false);
});
