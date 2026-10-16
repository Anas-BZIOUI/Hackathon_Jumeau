// Scope the cache to this app and explicit build files; never cache API responses.
export function offlineWorkerSource(files,version){
 return `const CACHE=${JSON.stringify('ensiiexplore-offline-'+version)};
const FILES=${JSON.stringify(files)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('ensiiexplore-offline-')&&key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 const path=event.request.mode==='navigate'?'/index.html':url.pathname;
 if(!FILES.includes(path))return;
 event.respondWith(caches.open(CACHE).then(cache=>cache.match(path)).then(cached=>cached||fetch(event.request)));
});`;
}
