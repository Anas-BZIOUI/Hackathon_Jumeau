import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {offlineWorkerSource} from '../src/offlineBundle.js';
const root=path.resolve('dist');
async function list(dir){const entries=await fs.readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?list(path.join(dir,e.name)):path.join(dir,e.name)))).flat();}
const files=(await list(root)).filter(p=>!p.endsWith('offline-sw.js')).sort();
const hash=createHash('sha256');for(const file of files){hash.update(path.relative(root,file));hash.update(await fs.readFile(file));}
const version=hash.digest('hex').slice(0,16),urls=files.map(file=>'/'+path.relative(root,file).split(path.sep).map(encodeURIComponent).join('/'));
await fs.writeFile(path.join(root,'offline-sw.js'),offlineWorkerSource(urls,version));
console.log(`Offline bundle: ${urls.length} local files, version ${version}.`);
