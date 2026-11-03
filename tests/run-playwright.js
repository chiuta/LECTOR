/* Rulează scenariile aplicației într-un motor de browser: node run-playwright.js <proiect> */
const {chromium,firefox,webkit,devices}=require('playwright');
const fs=require('fs'),path=require('path');
const {start}=require('./serve');
const APP=JSON.parse(fs.readFileSync(path.join(__dirname,'app.json'),'utf8'));
const scen=fs.readFileSync(path.join(__dirname,'scen.js'),'utf8');
const name=process.argv[2]||'chromium';
const DESK={viewport:{width:1280,height:800}};
const CHR=['--autoplay-policy=no-user-gesture-required'];
const P={
 chromium:{b:chromium,opt:{args:CHR},ctx:DESK,offline:true},
 msedge:{b:chromium,opt:{channel:'msedge',args:CHR},ctx:DESK,offline:true},
 firefox:{b:firefox,opt:{firefoxUserPrefs:{'media.autoplay.default':0,'media.autoplay.blocking_policy':0}},ctx:DESK},
 webkit:{b:webkit,opt:{},ctx:DESK},
 iphone:{b:webkit,opt:{},ctx:devices['iPhone 13'],mobile:true},
 ipad:{b:webkit,opt:{},ctx:devices['iPad (gen 7)'],mobile:true},
 pixel:{b:chromium,opt:{args:CHR},ctx:devices['Pixel 7'],mobile:true,offline:true},
 galaxy:{b:chromium,opt:{args:CHR},ctx:devices['Galaxy S9+'],mobile:true}
};
const cfg=P[name];if(!cfg){console.error('proiect necunoscut:',name,'— alege dintre',Object.keys(P).join(', '));process.exit(2)}
const outDir=path.join(__dirname,'results');fs.mkdirSync(outDir,{recursive:true});
async function runScen(pg,phase){
  return pg.evaluate(async({s,phase})=>{window.__res=undefined;window.__phase=phase;window.__done=r=>{window.__res=r};
    const e=document.createElement('script');e.textContent='{'+s+'\n}';document.body.appendChild(e);
    const t0=Date.now();while(window.__res===undefined&&Date.now()-t0<420000)await new Promise(r=>setTimeout(r,500));
    return window.__res||{probe:{},R:[{n:'TIMEOUT scenariu',ok:false,d:'420s'}],errs:[]}},{s:scen,phase});
}
(async()=>{
  const srv=await start(0),base='http://127.0.0.1:'+srv.address().port+'/';
  const br=await cfg.b.launch(cfg.opt);const ctx=await br.newContext({...cfg.ctx,acceptDownloads:true});const pg=await ctx.newPage();
  const pageErrs=[];pg.on('pageerror',e=>pageErrs.push(String(e).slice(0,300)));pg.on('dialog',d=>d.dismiss().catch(()=>{}));
  const res={project:name,app:APP.app,ua:await br.version(),checks:[]};
  const chk=(n,ok,d,soft)=>res.checks.push({n,ok:!!ok,soft:!!soft,d:d===undefined?undefined:String(typeof d==='string'?d:JSON.stringify(d)).slice(0,300)});
  try{
    await pg.goto(base);await pg.evaluate(()=>localStorage.setItem('lang','ro'));await pg.goto(base);await pg.waitForTimeout(1500);
    // aspect și ținte tactile
    const lay=await pg.evaluate(()=>{const de=document.documentElement;
      const small=[...document.querySelectorAll('button,a,select,[role=button]')].filter(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&(r.height<32||r.width<32)}).map(e=>(e.id||e.className||e.tagName)+':'+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height));
      return{sw:de.scrollWidth,cw:de.clientWidth,small:small.slice(0,10),n:small.length}});
    chk('fără defilare orizontală',lay.sw<=lay.cw+1,lay);
    chk('ținte tactile ≥ 32 px',lay.n===0,lay.small,true);
    // accesibilitate
    try{await pg.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
      const ax=await pg.evaluate(async()=>(await axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21aa','best-practice']})).violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length})));
      chk('axe: fără încălcări grave',!ax.some(v=>v.impact==='serious'||v.impact==='critical'),ax);
      chk('axe: fără alte încălcări',ax.length===0,ax,true)}catch(e){chk('axe',false,String(e),true)}
    // PWA
    try{const sw=await pg.evaluate(async()=>{if(!('serviceWorker' in navigator))return 'lipsește API';try{const r=await Promise.race([navigator.serviceWorker.ready,new Promise((_,j)=>setTimeout(()=>j('timeout 15s'),15000))]);return 'activ:'+(r.active?r.active.state:'?')}catch(e){return String(e)}});
      chk('service worker activ',/^activ/.test(sw),sw,!cfg.offline);
      if(cfg.offline){await ctx.setOffline(true);try{await pg.reload({timeout:15000});const t=await pg.title();chk('reîncărcare offline',t.length>0,t)}catch(e){chk('reîncărcare offline',false,String(e).slice(0,120))}await ctx.setOffline(false)}}catch(e){chk('PWA',false,String(e),true)}
    await pg.goto(base);await pg.waitForTimeout(1000);
    // scenarii
    let out;
    if(APP.app==='lec'){const a=await runScen(pg,'A');await pg.goto(base);await pg.waitForTimeout(1500);const b=await runScen(pg,'B');out={probe:a.probe,R:[...a.R,...b.R],errs:[...(a.errs||[]),...(b.errs||[])]}}
    else out=await runScen(pg,undefined);
    delete out.exportB64;res.probe=out.probe;
    for(const r of out.R)chk('scenariu: '+r.n,r.ok,r.d);
    const allErrs=[...pageErrs,...(out.errs||[])],netErrs=allErrs.filter(e=>/importScripts|cdn\.jsdelivr|Failed to fetch dynamically|NetworkError/i.test(e)),jsErrs=allErrs.filter(e=>!netErrs.includes(e));
    chk('fără erori JS în pagină',jsErrs.length===0,jsErrs);
    chk('fără erori de rețea către CDN',netErrs.length===0,netErrs,true);
    await pg.screenshot({path:path.join(outDir,`${name}-${APP.app}.png`)}).catch(()=>{});
  }catch(e){chk('execuție',false,String(e&&e.stack||e).slice(0,400))}
  await br.close();srv.close();
  const hard=res.checks.filter(c=>!c.ok&&!c.soft),soft=res.checks.filter(c=>!c.ok&&c.soft);
  fs.writeFileSync(path.join(outDir,`${name}-${APP.app}.json`),JSON.stringify(res,null,1));
  const lines=[`### ${APP.name} · ${name} · ${res.ua}`,'','| Verificare | Rezultat |','|---|---|',...res.checks.map(c=>`| ${c.n.replace(/\|/g,'/')} | ${c.ok?'✅':(c.soft?'⚠️':'❌')}${c.ok||!c.d?'':' '+String(c.d).replace(/[|\n]/g,' ').slice(0,140)} |`),'',`**${res.checks.length-hard.length-soft.length}/${res.checks.length} reușite · ${hard.length} eșuate · ${soft.length} avertismente**`,''];
  console.log(lines.join('\n'));
  if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join('\n')+'\n');
  process.exit(hard.length?1:0);
})();
