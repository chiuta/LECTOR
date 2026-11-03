/* Service worker: învelișul aplicației + cache la rulare pentru bibliotecile externe (funcționare offline după prima folosire). */
const V='v14';const SHELL='shell-'+V,RT='rt-'+V;
const SHELL_FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
const RT_HOSTS=['cdn.jsdelivr.net','tessdata.projectnaptha.com','huggingface.co','cdn-lfs.huggingface.co','cdn-lfs.hf.co','cas-bridge.xethub.hf.co','unpkg.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(SHELL_FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==SHELL&&k!==RT).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.origin===location.origin){ // aplicația: rețea întâi (ca să primești versiuni noi), cache la căderea rețelei
  e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(SHELL).then(ch=>ch.put(r,c))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));return}
 if(RT_HOSTS.some(h=>u.hostname===h||u.hostname.endsWith('.'+h))){ // biblioteci/modele: cache întâi
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok&&res.status===200&&!r.headers.get('range')){const c=res.clone();caches.open(RT).then(ch=>ch.put(r,c).catch(()=>{}))}return res})))}});
