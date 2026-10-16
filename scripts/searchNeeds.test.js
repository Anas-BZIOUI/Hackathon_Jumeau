import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {searchRooms} from '../src/core.js';
const rooms=JSON.parse(fs.readFileSync('public/data/rooms.json','utf8'));
const synonyms=JSON.parse(fs.readFileSync('public/data/synonyms.json','utf8'));
test('French and English needs match recorded services without inventing rooms',()=>{
 for(const query of ['printing','scanner','photocopie','reprographie','restroom','washroom','toilettes','cafeteria','lunch','student club','conference room','business']){
  const results=searchRooms(query,rooms,synonyms,'en');assert(results.length>0,query);
  assert(results.every(r=>rooms.includes(r)),query);
 }
 assert.equal(searchRooms('R+1 131',rooms,synonyms,'en')[0].id,'R+1-131');
});
