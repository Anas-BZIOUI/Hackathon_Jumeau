import test from 'node:test';
import assert from 'node:assert/strict';
import {dampFactor,dampAngle,cameraFraction} from '../src/motion.js';
import {collisionMap} from '../src/walking.js';
test('camera damping is independent of frame rate and turns across PI by the short path',()=>{
 const advance=(fps)=>{let angle=0;for(let i=0;i<fps;i++)angle=dampAngle(angle,1,12,1/fps);return angle;};
 assert.ok(Math.abs(advance(30)-advance(144))<1e-10);
 const a=dampAngle(Math.PI-.01,-Math.PI+.01,20,.016);
 assert.ok(a>Math.PI-.01&&a<Math.PI+.01);
 assert.equal(dampFactor(20,0),0);
});
test('camera boom stops before walls, passes openings, and respects boundaries',()=>{
 const map=collisionMap([[[5,0],[5,4]],[[5,6],[5,10]]],[10,10],.18);
 const t=cameraFraction(map,[3,3],[7,3]);
 assert.ok(t>0&&t<.5);assert.ok(map.clear(3+4*t,3));
 assert.equal(cameraFraction(map,[3,5],[7,5]),1);
 assert.ok(cameraFraction(map,[1,1],[-2,1])<1);
 assert.equal(cameraFraction(map,[1,1],[1,1]),1);
});
