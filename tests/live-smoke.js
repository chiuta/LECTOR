/* Verificare rapidă a site-ului publicat: node live-smoke.js <motor> [url] */
const {chromium,firefox,webkit}=require('playwright');const fs=require('fs'),path=require('path');
const eng={chromium,firefox,webkit}[process.argv[2]||'chromium'];
let url=process.argv[3];if(!url){const c=path.join(__dirname,'..','CNAME');url='https://'+fs.readFileSync(c,'utf8').trim()+'/'}
(async()=>{const br=await eng.launch();const ctx=await br.newContext();const pg=await ctx.newPage();const errs=[],bad=[];
 pg.on('pageerror',e=>errs.push(String(e).slice(0,200)));pg.on('requestfailed',r=>bad.push(r.url().slice(0,100)));
 let fail=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)fail++};
 const r=await pg.goto(url,{waitUntil:'load',timeout:60000});ok(r&&r.status()===200,'HTTP 200 la '+url);
 ok(r&&/^https:/.test(r.url()),'HTTPS');ok((await pg.title()).length>3,'titlu: '+await pg.title());
 const sw=await pg.evaluate(async()=>{try{const r=await Promise.race([navigator.serviceWorker.ready,new Promise((_,j)=>setTimeout(()=>j('timeout'),20000))]);return 'activ'}catch(e){return String(e)}});ok(sw==='activ','service worker: '+sw);
 const mf=await pg.evaluate(async()=>{const l=document.querySelector('link[rel=manifest]');if(!l)return 'lipsă';const r=await fetch(l.href);return r.ok?'ok':'HTTP '+r.status});ok(mf==='ok','manifest: '+mf);
 ok(errs.length===0,'fără erori JS '+JSON.stringify(errs));ok(bad.length===0,'fără cereri eșuate '+JSON.stringify(bad));
 const hdr=r.headers();console.log('server:',hdr['server']||'-');await br.close();process.exit(fail?1:0)})();
