import test from 'node:test';
import assert from 'node:assert/strict';
import {loadDataset,fetchJson} from '../src/dataset.js';
import {readSaved} from '../src/preferences.js';
test('missing or malformed API falls back to static files',async()=>{
 const requested=[];
 const data=await loadDataset({fetcher:async url=>{requested.push(url);return {ok:true,json:async()=>url==='/api/bootstrap'?{}:url.includes('rooms')?[]:url.includes('floors')?{levels:{}}:{}};}});
 assert(Array.isArray(data.rooms));assert.equal(requested.length,12);
});
test('missing static file rejects instead of pretending data loaded',async()=>{
 await assert.rejects(loadDataset({fetcher:async()=>({ok:false})}));
});
test('slow requests are aborted and cancellation does not start fallback work',async()=>{
 const fetcher=(_url,{signal})=>new Promise((resolve,reject)=>{if(signal.aborted)reject(Error('aborted'));else signal.addEventListener('abort',()=>reject(Error('aborted')),{once:true});});
 await assert.rejects(fetchJson('/slow',{fetcher,timeout:5}),/aborted/);
 const controller=new AbortController();controller.abort();let calls=0;
 await assert.rejects(loadDataset({signal:controller.signal,fetcher:(...args)=>{calls++;return fetcher(...args);}}));assert.equal(calls,1);
});
test('unavailable, malformed and invalid saved values use fallback',()=>{
 const previous=globalThis.localStorage;
 try{
  globalThis.localStorage={getItem(){throw Error('denied');}};assert.equal(readSaved('x',7),7);
  globalThis.localStorage={getItem:()=>'{bad'};assert.equal(readSaved('x',7),7);
  globalThis.localStorage={getItem:()=>'"wrong"'};assert.equal(readSaved('x',7,Number.isFinite),7);
 }finally{if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous;}
});
