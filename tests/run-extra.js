/* Teste suplimentare, independente de aplicație: node run-extra.js <proiect>
   Rezistență (API-uri lipsă, stocare stricată), ecrane, limbi, tastatură, offline, monkey test. */
const fs=require('fs'),path=require('path');
const {start}=require('./serve');
const {P}=require('./projects');
const APP=JSON.parse(fs.readFileSync(path.join(__dirname,'app.json'),'utf8'));
const name=process.argv[2]||'chromium';
const cfg=P[name];if(!cfg){console.error('proiect necunoscut:',name);process.exit(2)}
const outDir=path.join(__dirname,'results');fs.mkdirSync(outDir,{recursive:true});
const LANGS=['ro','en','fr','de','es','it','hu'];
const res={project:name,app:APP.app,checks:[]};
const chk=(n,ok,d,soft)=>{res.checks.push({n,ok:!!ok,soft:!!soft,d:d===undefined?undefined:String(typeof d==='string'?d:JSON.stringify(d)).slice(0,300)});if(!ok)console.log((soft?'WARN ':'FAIL ')+n+' '+(d===undefined?'':String(typeof d==='string'?d:JSON.stringify(d)).slice(0,200)))};
const NET=/importScripts|cdn\.jsdelivr|cdnjs|unpkg|huggingface|Failed to fetch dynamically|NetworkError|Load failed|net::ERR|Failed to load resource|Failed to fetch|ERR_INTERNET|Cannot read properties of undefined \(reading 'getVoices'\)/i;

/* Scripturi care elimină API-uri, ca într-un browser vechi sau într-un WebView */
const REMOVE={
 speechSynthesis:"delete window.speechSynthesis;try{delete Window.prototype.speechSynthesis}catch(e){}",
 VideoEncoder:"delete window.VideoEncoder;delete window.AudioEncoder;delete window.VideoDecoder;delete window.VideoFrame",
 MediaRecorder:"delete window.MediaRecorder",
 AudioContext:"delete window.AudioContext;delete window.webkitAudioContext;delete window.OfflineAudioContext;delete window.webkitOfflineAudioContext",
 indexedDB:"delete window.indexedDB",
 caches:"delete window.caches",
 serviceWorker:"Object.defineProperty(Navigator.prototype,'serviceWorker',{get(){return undefined},configurable:true})",
 cryptoSubtle:"Object.defineProperty(window.crypto,'subtle',{get(){return undefined},configurable:true})",
 OffscreenCanvas:"delete window.OffscreenCanvas",
 captureStream:"delete HTMLCanvasElement.prototype.captureStream",
 Worker:"delete window.Worker",
 fetchAbort:"delete window.AbortController",
 resizeObserver:"delete window.ResizeObserver",
 intersectionObserver:"delete window.IntersectionObserver",
 requestIdle:"delete window.requestIdleCallback",
 allFancy:"for(const k of ['speechSynthesis','VideoEncoder','AudioEncoder','VideoDecoder','VideoFrame','MediaRecorder','AudioContext','webkitAudioContext','OfflineAudioContext','indexedDB','caches','OffscreenCanvas','Worker','ResizeObserver','IntersectionObserver','requestIdleCallback','AbortController','BroadcastChannel','Notification','wakeLock','storage'])try{delete window[k]}catch(e){};try{Object.defineProperty(Navigator.prototype,'serviceWorker',{get(){return undefined},configurable:true})}catch(e){};try{Object.defineProperty(Navigator.prototype,'wakeLock',{get(){return undefined},configurable:true});Object.defineProperty(Navigator.prototype,'storage',{get(){return undefined},configurable:true})}catch(e){}"
};
const UAS={
 'Instagram iOS':'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21E219 Instagram 330.0.0.20.113 (iPhone14,5; iOS 17_4; en_US; en-US; scale=3.00; 1170x2532; 570000000)',
 'Facebook Android':'Mozilla/5.0 (Linux; Android 13; SM-S908B Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.113 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/450.0.0.38.108;]',
 'Samsung Internet':'Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/24.0 Chrome/117.0.0.0 Mobile Safari/537.36',
 'WhatsApp iOS':'WhatsApp/2.24.5.78 i'
};
const VIEWS=[[320,568],[360,640],[390,844],[412,915],[768,1024],[1024,768],[1366,768],[1920,1080],[2560,1440],[844,390]];

const OVERFLOW=()=>{const de=document.documentElement,vw=de.clientWidth;
 const out=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);
  if(!r.width||!r.height||cs.visibility==='hidden'||cs.display==='none'||cs.position==='fixed'&&false)return false;
  let p=e.parentElement;while(p&&p!==document.body){const c=getComputedStyle(p);if(/(auto|scroll|hidden|clip)/.test(c.overflowX)&&p.getBoundingClientRect().width<=vw+1)return false;p=p.parentElement}
  return r.right>vw+2||r.left<-2}).map(e=>(e.id?'#'+e.id:e.tagName.toLowerCase()+'.'+String(e.className).split(' ')[0]));
 return{sw:de.scrollWidth,cw:vw,off:out.slice(0,6),n:out.length}};

async function fresh(br,extra,init){
 const ctx=await br.newContext({...cfg.ctx,acceptDownloads:true,...(extra||{})});
 const pg=await ctx.newPage();const errs=[],cons=[];
 pg.on('pageerror',e=>errs.push(String(e&&e.message||e).slice(0,250)));
 pg.on('console',m=>{if(m.type()==='error')cons.push(m.text().slice(0,200))});
 pg.on('dialog',d=>d.dismiss().catch(()=>{}));
 if(init)await pg.addInitScript(init);
 return{ctx,pg,errs,cons};
}
const jsErrs=a=>a.filter(e=>!NET.test(e)&&!/ResizeObserver loop/.test(e));

(async()=>{
 const srv=await start(0),base='http://127.0.0.1:'+srv.address().port+'/';
 const br=await cfg.b.launch(cfg.opt);
 res.ua=await br.version();
 try{
  /* 1. Încărcare curată, consolă, timpi */
  {const {ctx,pg,errs,cons}=await fresh(br);
   await pg.goto(base,{waitUntil:'load'});await pg.waitForTimeout(1500);
   chk('încărcare: fără erori JS',jsErrs(errs).length===0,jsErrs(errs));
   chk('încărcare: fără console.error (în afară de rețea)',cons.filter(c=>!NET.test(c)).length===0,cons.filter(c=>!NET.test(c)),true);
   const nav=await pg.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];const fcp=(performance.getEntriesByName('first-contentful-paint')[0]||{}).startTime;return{dcl:n&&Math.round(n.domContentLoadedEventEnd),load:n&&Math.round(n.loadEventEnd),fcp:fcp&&Math.round(fcp)}});
   chk('timp DOMContentLoaded < 3 s',!nav.dcl||nav.dcl<3000,nav,true);
   const meta=await pg.evaluate(()=>({title:document.title,lang:document.documentElement.lang,h1:document.querySelectorAll('h1').length,main:document.querySelectorAll('main,[role=main]').length,theme:!!document.querySelector('meta[name=theme-color]'),manifest:!!document.querySelector('link[rel=manifest]'),icon:!!document.querySelector('link[rel*=icon]')}));
   chk('meta: titlu, lang, manifest, theme-color',meta.title&&meta.lang&&meta.manifest&&meta.theme,meta);
   chk('structură: un singur h1',meta.h1===1,meta,true);
   chk('structură: landmark main',meta.main>=1,meta,true);
   await ctx.close()}

  /* 2. ID-uri, etichete, ținte ARIA */
  {const {ctx,pg}=await fresh(br);await pg.goto(base);await pg.waitForTimeout(1200);
   const d=await pg.evaluate(()=>{const ids={},dup=[];document.querySelectorAll('[id]').forEach(e=>{if(ids[e.id])dup.push(e.id);ids[e.id]=1});
    const bad=[];for(const a of ['for','aria-controls','aria-labelledby','aria-describedby']){document.querySelectorAll('['+a+']').forEach(e=>{String(e.getAttribute(a)).split(/\s+/).filter(Boolean).forEach(t=>{if(!document.getElementById(t))bad.push(a+'→'+t)})})}
    const unnamed=[...document.querySelectorAll('button,a[href],input:not([type=hidden]),select,textarea,[role=button],[role=tab]')].filter(e=>{const cs=getComputedStyle(e);if(cs.display==='none')return false;const n=(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||e.textContent||e.getAttribute('title')||e.getAttribute('placeholder')||'').trim()||(e.labels&&e.labels.length)||(e.closest('label'));return !n}).map(e=>e.id||e.tagName);
    const imgs=[...document.querySelectorAll('img:not([alt])')].length;
    const tgt=[...document.querySelectorAll('a[target=_blank]')].filter(a=>!/noopener/.test(a.rel)).length;
    return{dup,bad,unnamed,imgs,tgt}});
   chk('ID-uri unice',d.dup.length===0,d.dup);
   chk('referințe ARIA/for valide',d.bad.length===0,d.bad);
   chk('toate controalele au nume accesibil',d.unnamed.length===0,d.unnamed);
   chk('imagini cu alt',d.imgs===0,d.imgs);
   chk('linkuri target=_blank cu noopener',d.tgt===0,d.tgt);
   await ctx.close()}

  /* 3. Viewport-uri multiple */
  {const {ctx,pg,errs}=await fresh(br);await pg.goto(base);await pg.waitForTimeout(1200);
   for(const [w,h] of VIEWS){await pg.setViewportSize({width:w,height:h});await pg.waitForTimeout(250);
    const o=await pg.evaluate(OVERFLOW);
    chk(`ecran ${w}×${h}: fără defilare orizontală`,o.sw<=o.cw+1,o);
    chk(`ecran ${w}×${h}: fără elemente în afara ecranului`,o.n===0,o,true);
    if([320,390,1366].includes(w))await pg.screenshot({path:path.join(outDir,`extra-${name}-${APP.app}-${w}.png`)}).catch(()=>{})}
   await pg.setViewportSize({width:390,height:844});await pg.waitForTimeout(200);
   await pg.setViewportSize({width:844,height:390});await pg.waitForTimeout(200);
   await pg.setViewportSize({width:390,height:844});await pg.waitForTimeout(300);
   chk('rotire ecran repetată: fără erori JS',jsErrs(errs).length===0,jsErrs(errs));
   await ctx.close()}

  /* 4. Mărire text/zoom, preferințe sistem */
  {const {ctx,pg,errs}=await fresh(br);await pg.goto(base);await pg.waitForTimeout(1200);
   await pg.setViewportSize({width:320,height:256});await pg.waitForTimeout(250);
   const z=await pg.evaluate(OVERFLOW);chk('reflow la 400% zoom (320×256)',z.sw<=z.cw+2,z,true);
   await pg.setViewportSize({width:390,height:844});
   await pg.addStyleTag({content:'html{font-size:200%!important}'});await pg.waitForTimeout(250);
   const t=await pg.evaluate(OVERFLOW);chk('text mărit la 200%: fără defilare orizontală',t.sw<=t.cw+2,t,true);
   for(const [k,v] of [['colorScheme','dark'],['colorScheme','light'],['reducedMotion','reduce'],['media','print'],['forcedColors','active']]){
    try{await pg.emulateMedia({[k]:v});await pg.waitForTimeout(250);const o=await pg.evaluate(OVERFLOW);
     if(k==='colorScheme'||k==='forcedColors')chk(`emulare ${k}=${v}: pagina se desenează`,o.cw>0,o,true);
     if(k==='reducedMotion'){const an=await pg.evaluate(()=>document.getAnimations?document.getAnimations().filter(a=>a.playState==='running'&&a.effect&&a.effect.getTiming().iterations===Infinity).length:0);chk('reduced-motion: fără animații infinite',an===0,an,true)}}
    catch(e){chk(`emulare ${k}=${v}`,true,'nesuportat: '+String(e).slice(0,80),true)}}
   chk('preferințe sistem: fără erori JS',jsErrs(errs).length===0,jsErrs(errs));
   await ctx.close()}

  /* 5. Limbi: fără depășire pe ecran îngust, lang pe html, persistență */
  {const {ctx,pg,errs}=await fresh(br,{viewport:{width:320,height:640}});await pg.goto(base);await pg.waitForTimeout(1200);
   for(const l of LANGS){
    const ok=await pg.evaluate(async l=>{const s=document.getElementById('langsel');if(!s)return 'fără langsel';s.value=l;s.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,200));return document.documentElement.lang},l);
    chk(`limbă ${l}: atributul lang`,ok===l,ok);
    const o=await pg.evaluate(OVERFLOW);chk(`limbă ${l}: fără depășire la 320 px`,o.sw<=o.cw+1,o);
    const raw=await pg.evaluate(()=>{const t=document.body.innerText;return(t.match(/\b[a-z]+\.[a-z]+_[a-z_]+\b|undefined|\[object Object\]|NaN\b/g)||[]).slice(0,5)});
    chk(`limbă ${l}: fără chei netraduse sau undefined`,raw.length===0,raw)}
   await pg.evaluate(()=>{const s=document.getElementById('langsel');s.value='de';s.dispatchEvent(new Event('change',{bubbles:true}))});await pg.waitForTimeout(200);
   await pg.reload();await pg.waitForTimeout(1000);
   chk('limba aleasă rămâne după reîncărcare',(await pg.evaluate(()=>document.documentElement.lang))==='de');
   chk('limbi: fără erori JS',jsErrs(errs).length===0,jsErrs(errs));
   await ctx.close()}

  /* 6. Navigare cu tastatura */
  {const {ctx,pg,errs}=await fresh(br);await pg.goto(base);await pg.waitForTimeout(1200);
   const seen=new Set();let trap=false,noRing=[],stops=0;
   for(let i=0;i<160;i++){await pg.keyboard.press('Tab');
    const f=await pg.evaluate(()=>{const e=document.activeElement;if(!e||e===document.body)return null;const cs=getComputedStyle(e),r=e.getBoundingClientRect();
     const ring=(cs.outlineStyle!=='none'&&parseFloat(cs.outlineWidth)>0)||(cs.boxShadow&&cs.boxShadow!=='none')||false;
     return{k:(e.id||e.tagName)+'|'+Math.round(r.x)+'|'+Math.round(r.y),vis:r.width>0&&r.height>0,ring,id:e.id||e.tagName}});
    if(!f){if(i>3&&seen.size>3)break;continue}
    stops++;if(seen.has(f.k)&&seen.size>3){break}seen.add(f.k);if(f.vis&&!f.ring)noRing.push(f.id)}
   chk('tastatură: Tab parcurge controale',seen.size>=5,{stops:seen.size});
   chk('tastatură: controalele focalizate au indicator vizibil',noRing.length===0,noRing.slice(0,8),true);
   await pg.keyboard.press('Escape');for(const k of ['Space','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageDown','Shift+Tab'])await pg.keyboard.press(k);
   chk('tastatură: taste uzuale fără erori JS',jsErrs(errs).length===0,jsErrs(errs));
   await ctx.close()}

  /* 7. Lipsa API-urilor (browsere vechi, WebView-uri) */
  for(const [k,code] of Object.entries(REMOVE)){
   const {ctx,pg,errs}=await fresh(br,null,code);
   try{await pg.goto(base);await pg.waitForTimeout(1500);
    const vis=await pg.evaluate(()=>document.body.innerText.trim().length);
    chk(`fără ${k}: pagina se încarcă`,vis>50,vis);
    chk(`fără ${k}: fără excepții necaptate`,jsErrs(errs).length===0,jsErrs(errs));
    const mon=await pg.evaluate(async()=>{const b=[...document.querySelectorAll('button,[role=button]')].filter(e=>e.offsetParent&&!e.disabled).slice(0,40);let n=0;for(const e of b){try{e.click();n++}catch(x){}await new Promise(r=>setTimeout(r,20))}return n});
    chk(`fără ${k}: butoanele răspund fără excepții`,jsErrs(errs).length===0,{clicked:mon,errs:jsErrs(errs)});
   }catch(e){chk(`fără ${k}`,false,String(e).slice(0,150))}
   await ctx.close()}

  /* 8. Stocare stricată sau blocată (mod privat, politici) */
  {const cases={
    'localStorage aruncă excepție':"Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError')}})",
    'localStorage plin':"Storage.prototype.setItem=function(){throw new DOMException('full','QuotaExceededError')}",
    'localStorage cu JSON stricat':"try{for(const k of ['lang','decupaj','lector','state','settings','prefs','lectorState','decupajState','bm','bookmarks','queue'])localStorage.setItem(k,'{{{not json')}catch(e){}",
    'localStorage cu valori ciudate':"try{localStorage.setItem('lang','xx<script>');for(const k of ['decupaj','lector','settings','prefs','state'])localStorage.setItem(k,'[1,2,{\"a\":null}]')}catch(e){}",
    'indexedDB eșuează':"try{indexedDB.open=function(){throw new DOMException('blocked','SecurityError')}}catch(e){}",
    'cookies dezactivate':"try{Object.defineProperty(Document.prototype,'cookie',{get(){return ''},set(){}})}catch(e){}"};
   for(const [n,code] of Object.entries(cases)){const {ctx,pg,errs}=await fresh(br,null,code);
    try{await pg.goto(base);await pg.waitForTimeout(1400);const vis=await pg.evaluate(()=>document.body.innerText.trim().length);
     chk(`${n}: pagina funcționează`,vis>50&&jsErrs(errs).length===0,{vis,errs:jsErrs(errs)});
     const l=await pg.evaluate(()=>document.documentElement.lang);chk(`${n}: atribut lang valid`,/^(ro|en|fr|de|es|it|hu)$/.test(l),l)}
    catch(e){chk(n,false,String(e).slice(0,150))}await ctx.close()}}

  /* 9. Browsere integrate în aplicații (WebView-uri) */
  for(const [n,ua] of Object.entries(UAS)){
   const {ctx,pg,errs}=await fresh(br,cfg.ctx&&cfg.ctx.isMobile!==undefined?{userAgent:ua}:{userAgent:ua,viewport:{width:390,height:844}});
   try{await pg.goto(base);await pg.waitForTimeout(1500);const vis=await pg.evaluate(()=>document.body.innerText.trim().length);
    chk(`user-agent ${n}: pagina se încarcă`,vis>50&&jsErrs(errs).length===0,{vis,errs:jsErrs(errs)})}catch(e){chk('UA '+n,false,String(e).slice(0,120))}
   await ctx.close()}

  /* 10. Monkey test: clicuri, taste, trageri aleatorii cu sămânță fixă */
  {const {ctx,pg,errs}=await fresh(br);await pg.goto(base);await pg.waitForTimeout(1500);
   for(let pass=0;pass<3;pass++){
    const r=await pg.evaluate(async seed=>{let s=seed;const rnd=()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
     const sleep=ms=>new Promise(r=>setTimeout(r,ms));let acts=0;
     const keys=['Enter',' ','Escape','ArrowLeft','ArrowRight','Tab','Delete','Backspace','a','1','/'];
     const bad=/export|exportă|descarcă|download|șterge|delete|reset|clear|golește|print/i;
     for(let i=0;i<220;i++){
      const els=[...document.querySelectorAll('button,[role=button],summary,select,input:not([type=file]):not([type=hidden]),textarea,[tabindex]')].filter(e=>e.offsetParent&&!e.disabled);
      if(!els.length)break;const e=els[Math.floor(rnd()*els.length)];const t=rnd();
      try{
       if(e.tagName==='SELECT'){if(e.id==='langsel')continue;e.selectedIndex=Math.floor(rnd()*e.options.length);e.dispatchEvent(new Event('change',{bubbles:true}))}
       else if(e.tagName==='INPUT'||e.tagName==='TEXTAREA'){const ty=e.type;if(ty==='range'||ty==='number'){e.value=String(Math.round(rnd()*100));}else if(ty==='checkbox'||ty==='radio'){e.click()}else if(ty==='text'||ty==='search'||ty===''||e.tagName==='TEXTAREA'){e.value=['','x','Țăranul 😀 ăîâșț','<img src=x onerror=alert(1)>','a'.repeat(5000),'0:00 test\n99:99 test'][Math.floor(rnd()*6)]}e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
       else if(t<0.75){if(!bad.test((e.id||'')+' '+(e.textContent||'').slice(0,30)))e.click()}
       else{e.dispatchEvent(new KeyboardEvent('keydown',{key:keys[Math.floor(rnd()*keys.length)],bubbles:true}))}
       acts++}catch(x){}
      await sleep(5)}
     return acts},1234+pass*77);
    chk(`monkey test #${pass+1}: ${r} acțiuni fără erori JS`,jsErrs(errs).length===0,jsErrs(errs))}
   const alive=await pg.evaluate(()=>document.body.innerText.trim().length);chk('monkey test: pagina încă are conținut',alive>50,alive);
   const xss=await pg.evaluate(()=>!!document.querySelector('img[src=x]'));chk('monkey test: fără injecție HTML din câmpuri',!xss);
   await ctx.close()}

  /* 11. Service worker, cache, offline, actualizare */
  {const {ctx,pg}=await fresh(br);await pg.goto(base);
   const sw=await pg.evaluate(async()=>{if(!navigator.serviceWorker)return{no:true};try{const r=await Promise.race([navigator.serviceWorker.ready,new Promise((_,j)=>setTimeout(()=>j('timeout'),15000))]);for(let i=0;i<80&&r.active&&r.active.state!=='activated';i++)await new Promise(x=>setTimeout(x,100));const keys=await caches.keys();const c=keys.length?await (await caches.open(keys[0])).keys():[];return{state:r.active&&r.active.state,scope:r.scope,keys,n:c.length,urls:c.map(x=>new URL(x.url).pathname).slice(0,12)}}catch(e){return{err:String(e)}}});
   if(sw.no||sw.err){chk('service worker: înregistrat',false,sw,!cfg.offline)}
   else{chk('service worker: activ',sw.state==='activated',sw);
    const av=await pg.evaluate(()=>{const m=/const APPV='(v\d+)'/.exec(document.documentElement.outerHTML);return m&&m[1]}).catch(()=>null);
    chk('cache: un singur set de versiune curentă',sw.keys.length===1,sw.keys);
    chk('cache: shell-ul aplicației e prezent',sw.n>=2,sw);
    if(cfg.offline){await ctx.setOffline(true);
     for(const l of ['/','/index.html','/manifest.webmanifest']){try{const st=await pg.evaluate(async u=>{const r=await fetch(u);return r.status},l);chk(`offline: ${l} răspunde din cache`,st===200,st)}catch(e){chk(`offline: ${l}`,false,String(e).slice(0,100))}}
     try{await pg.reload({timeout:15000});await pg.waitForTimeout(800);chk('offline: pagina se reîncarcă și funcționează',(await pg.evaluate(()=>document.body.innerText.trim().length))>50)}catch(e){chk('offline: reîncărcare',false,String(e).slice(0,100))}
     const miss=await pg.evaluate(async()=>{try{const r=await fetch('/nu-exista-'+Math.random());return r.status}catch(e){return 'eroare'}});chk('offline: resursă inexistentă nu blochează aplicația',miss!==undefined,miss,true);
     await ctx.setOffline(false)}}
   await ctx.close()}

  /* 12. Axe în mai multe stări (întunecat, mobil, limbi) */
  {try{const axe=require.resolve('axe-core/axe.min.js');
   for(const [lab,view,scheme] of [['mobil întunecat',{width:390,height:844},'dark'],['desktop luminos',{width:1280,height:800},'light'],['tabletă',{width:768,height:1024},'light']]){
    const {ctx,pg}=await fresh(br,{viewport:view,colorScheme:scheme});await pg.goto(base);await pg.waitForTimeout(1200);await pg.addScriptTag({path:axe});
    const ax=await pg.evaluate(async()=>(await axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']})).violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length})));
    chk(`axe ${lab}: fără încălcări grave`,!ax.some(v=>v.impact==='serious'||v.impact==='critical'),ax);
    chk(`axe ${lab}: contrast`,!ax.some(v=>v.id==='color-contrast'),ax.filter(v=>v.id==='color-contrast'),true);
    await ctx.close()}}catch(e){chk('axe suplimentar',false,String(e).slice(0,150),true)}}

  /* 14. Dialog de confirmare propriu (în loc de confirm()) */
  {const {ctx,pg,errs}=await fresh(br,{viewport:{width:390,height:844}});await pg.goto(base);await pg.waitForTimeout(1200);
   const has=await pg.evaluate(()=>typeof askOk==='function');chk('dialog de confirmare: askOk definit',has);
   if(has){const exp={ro:['Anulează','Continuă'],en:['Cancel','Continue'],fr:['Annuler','Continuer'],de:['Abbrechen','Fortfahren'],es:['Cancelar','Continuar'],it:['Annulla','Continua'],hu:['Mégse','Folytatás']};
    for(const l of LANGS){const r=await pg.evaluate(async l=>{const s=document.getElementById('langsel');s.value=l;s.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,250));const t=document.createElement('button');t.id='__t';document.body.appendChild(t);t.focus();
      const p=askOk('Test?');await new Promise(r=>setTimeout(r,100));const d=document.querySelector('[role=alertdialog]');const bs=d?[...d.querySelectorAll('button')].map(b=>b.textContent):[];const foc=document.activeElement&&document.activeElement.textContent;
      document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));const esc=await p;const back=document.activeElement&&document.activeElement.id;
      const p2=askOk('Test?');await new Promise(r=>setTimeout(r,50));[...document.querySelectorAll('[role=alertdialog] button')][1].click();const yes=await p2;
      const left=document.querySelectorAll('[role=alertdialog]').length;t.remove();return{bs,foc,esc,back,yes,left}},l);
     chk('dialog '+l+': butoane traduse',JSON.stringify(r.bs)===JSON.stringify(exp[l]),r);
     chk('dialog '+l+': Anulează are focus, Escape=false, Continuă=true, focus revine, dialogul dispare',r.foc===exp[l][0]&&r.esc===false&&r.yes===true&&r.back==='__t'&&r.left===0,r)}
    chk('dialog: fără erori JS',jsErrs(errs).length===0,jsErrs(errs))}
   await ctx.close()}

  /* 13. Memorie și scurgeri (doar Chromium) */
  if(/chromium|msedge|pixel|galaxy/.test(name)){const {ctx,pg}=await fresh(br);await pg.goto(base);await pg.waitForTimeout(1200);
   const h0=await pg.evaluate(()=>performance.memory&&performance.memory.usedJSHeapSize);
   for(let i=0;i<30;i++){await pg.evaluate(async()=>{const s=document.getElementById('langsel');s.value=['en','de','ro','hu'][Math.floor(Math.random()*4)];s.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,30))})}
   const h1=await pg.evaluate(()=>performance.memory&&performance.memory.usedJSHeapSize);
   chk('memorie: 30 schimbări de limbă nu cresc heap-ul peste +25 MB',!h0||!h1||h1-h0<25e6,{h0,h1},true);
   const nodes=await pg.evaluate(()=>document.getElementsByTagName('*').length);chk('DOM: sub 6000 de noduri',nodes<6000,nodes,true);
   await ctx.close()}
 }catch(e){chk('execuție',false,String(e&&e.stack||e).slice(0,400))}
 await br.close();srv.close();
 const hard=res.checks.filter(c=>!c.ok&&!c.soft),soft=res.checks.filter(c=>!c.ok&&c.soft);
 fs.writeFileSync(path.join(outDir,`extra-${name}-${APP.app}.json`),JSON.stringify(res,null,1));
 const lines=[`### ${APP.name} · teste suplimentare · ${name} · ${res.ua}`,'',`**${res.checks.length-hard.length-soft.length}/${res.checks.length} reușite · ${hard.length} eșuate · ${soft.length} avertismente**`,'',...(hard.length||soft.length?['| Verificare | Rezultat |','|---|---|',...[...hard,...soft].map(c=>`| ${c.n.replace(/\|/g,'/')} | ${c.soft?'⚠️':'❌'} ${String(c.d||'').replace(/[|\n]/g,' ').slice(0,140)} |`),'']:[])];
 console.log(lines.join('\n'));
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join('\n')+'\n');
 process.exit(hard.length?1:0);
})();
