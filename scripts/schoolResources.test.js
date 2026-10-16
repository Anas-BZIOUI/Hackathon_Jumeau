import test from 'node:test';
import assert from 'node:assert/strict';
import {SCHOOL_RESOURCES,searchSchoolResources,FIRST_DAYS,CATEGORIES} from '../src/schoolResources.js';

test('service catalogue has unique bilingual entries, stable HTTPS URLs and evidence',()=>{
 assert.equal(new Set(SCHOOL_RESOURCES.map(r=>r.id)).size,SCHOOL_RESOURCES.length);
 assert.ok(SCHOOL_RESOURCES.length>=25);
 for(const r of SCHOOL_RESOURCES){
  assert.equal(new URL(r.href).protocol,'https:');
  for(const field of ['label_fr','label_en','summary_fr','summary_en','collected_at','source','evidence'])assert.ok(r[field]);
  assert.ok(CATEGORIES[r.category]);assert.ok(['public','account','mixed'].includes(r.access));
 }
});
test('need search handles accents, English, administrative synonyms and combined words',()=>{
 for(const [query,id] of [['certificat','aurion'],['emploi du temps','aurion'],['convention stage','agreement'],['internship agreement','agreement'],['logement','housing'],['accessibilite','accessibility'],['Dièse','diese']])assert.ok(searchSchoolResources(SCHOOL_RESOURCES,{query}).some(r=>r.id===id),query);
 assert.equal(searchSchoolResources(SCHOOL_RESOURCES,{query:'no-such-resource'}).length,0);
});
test('profile and category filters intersect, and all audiences include general contact',()=>{
 const results=searchSchoolResources(SCHOOL_RESOURCES,{persona:'company',category:'company'});
 assert.ok(results.some(r=>r.id==='recruit'));assert.ok(!results.some(r=>r.id==='aurion'));
 assert.ok(searchSchoolResources(SCHOOL_RESOURCES,{persona:'company'}).some(r=>r.id==='contact'));
 assert.equal(searchSchoolResources(SCHOOL_RESOURCES,{persona:'visitor',category:'digital'}).length,0);
});
test('candidate offices are separate from verified room and route assignments',()=>{
 const candidates=SCHOOL_RESOURCES.filter(r=>r.candidate_room_id);
 assert.deepEqual([...new Set(candidates.map(r=>r.candidate_room_id))].sort(),['R+2-220','R+2-221']);
 for(const r of SCHOOL_RESOURCES){assert.equal(r.room_id,undefined);assert.equal(r.verified_on_site,undefined);}
});
test('first-days checklist uses distinct existing services, private portals announce account access',()=>{
 assert.equal(new Set(FIRST_DAYS).size,FIRST_DAYS.length);
 for(const id of FIRST_DAYS)assert.ok(SCHOOL_RESOURCES.some(r=>r.id===id));
 for(const id of ['aurion','moodle','career','agreement','helpdesk'])assert.equal(SCHOOL_RESOURCES.find(r=>r.id===id).access,'account');
});
