import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5173');await page.getByRole('button',{name:'Aventure',exact:true}).click();await page.locator('.entrance-overlay').waitFor({state:'hidden'});
 fs.mkdirSync('docs/campus-previews',{recursive:true});
 for(const [name,width,height]of [['retro-desktop',1920,1080],['retro-laptop',1440,900],['retro-tablet',768,1024],['retro-mobile',390,844]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(150);
  const bounds=await page.locator('canvas').boundingBox(),main=await page.locator('.retro-adventure').boundingBox();
  assert(Math.abs(bounds.x+bounds.width/2-width/2)<3,`${name}: game not centered`);
  assert(Math.abs(bounds.width/bounds.height-4/3)<.01,`${name}: distorted game`);
  assert(bounds.x>=0&&bounds.x+bounds.width<=width,`${name}: horizontal game clipping`);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name}: horizontal overflow`);
  assert.equal(await page.locator('.adv-log:visible,.adv-dialog:visible,.adventure-persona-intro:visible').count(),0);
  assert(main.height>300);
  await page.screenshot({path:`docs/campus-previews/${name}.png`,fullPage:true});
 }
 await page.setViewportSize({width:1440,height:900});
 await page.getByRole('button',{name:'Carnet de découverte',exact:false}).click();await page.locator('.retro-notebook').waitFor({state:'visible'});
 await page.keyboard.press('Escape');await page.locator('.retro-notebook').waitFor({state:'hidden'});
 await page.locator('canvas').click();await page.keyboard.press('p');await page.getByRole('dialog',{name:'Journal de quêtes',exact:true}).waitFor({state:'visible'});await page.keyboard.press('Escape');
 await page.keyboard.press('i');await page.getByRole('dialog',{name:'Inventaire',exact:true}).waitFor({state:'visible'});assert.equal(await page.locator('.inventory-slot').count(),16);await page.keyboard.press('Escape');
 assert.deepEqual(errors,[]);
 console.log('PASS: centered, undistorted game on desktop/laptop/tablet/mobile, no sidebar or bottom panel, notebook/Escape and game P/I controls.');
}finally{await browser.close();}
