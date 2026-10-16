import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {offlineWorkerSource} from '../src/offlineBundle.js';
test('offline handler serves only this build and bypasses API, writes and external URLs',async()=>{
 const handlers={},seen=[];
 const self={location:{origin:'http://localhost'},addEventListener:(type,handler)=>handlers[type]=handler};
 vm.runInNewContext(offlineWorkerSource(['/index.html','/data/rooms.json'],'test'),{self,URL,caches:{open:async()=>({match:async key=>{seen.push(key);return 'cached';}})},fetch:()=>{throw Error('network');}});
 const request=(url,extra={})=>({url,method:'GET',...extra});
 for(const req of [request('http://localhost/api/bootstrap'),request('https://elsewhere/data/rooms.json'),request('http://localhost/data/rooms.json',{method:'POST'}),request('http://localhost/missing.json')]){
  handlers.fetch({request:req,respondWith(){assert.fail('must not intercept');}});
 }
 let response;handlers.fetch({request:request('http://localhost/data/rooms.json'),respondWith:p=>response=p});assert.equal(await response,'cached');
 handlers.fetch({request:request('http://localhost/',{mode:'navigate'}),respondWith:p=>response=p});assert.equal(await response,'cached');
 assert.deepEqual(seen,['/data/rooms.json','/index.html']);
});
