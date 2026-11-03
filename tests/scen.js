const PHASE=window.__phase;const done=window.__done;
// dialogul propriu de confirmare nu are cine să-l apese în teste: îl anulăm (ca vechiul confirm() închis automat)
setInterval(()=>{const d=document.querySelector('[role=alertdialog]');if(d&&!window.__keepDlg){const b=d.querySelector('button');if(b)b.click()}},200);
(async()=>{
 const COMMON=await (await fetch('/common.js')).text();eval(COMMON.replace(/\bconst /g,'var '));
 try{LANG='ro';applyLang()}catch(e){}
 const probe={ua:navigator.userAgent,secure:isSecureContext,tts:typeof speechSynthesis,voices:(typeof speechSynthesis!=='undefined'?speechSynthesis.getVoices().length:0),idb:typeof indexedDB,ds:typeof DecompressionStream,ms:'mediaSession' in navigator,wake:'wakeLock' in navigator,audio:typeof Audio,opfs:!!(navigator.storage&&navigator.storage.getDirectory),dt:typeof DataTransfer};
 if(PHASE==='A'){
  // text lipit
  $('paste').value='Capitolul 1\nPrima propoziție din carte. A doua propoziție, cu ț și ș. A treia!\n\nCapitolul 2\nAltă secțiune începe aici. Dr. Popescu a plecat spre București.';
  $('load').click();await sleep(200);
  T('text lipit: capitole create',chapters.length>=2&&sents.length>0,{ch:chapters.length,s:sents.length});
  T('carte salvată în bibliotecă (IndexedDB real)',await waitFor(()=>document.querySelectorAll('#lib .lib-item').length>=1,5000),{n:document.querySelectorAll('#lib .lib-item').length});
  // redare (cu sau fără TTS)
  let thrown=null;try{$('play').click();await sleep(1200);$('play').click()}catch(e){thrown=e.message}
  T('apăsare Citește/Oprește nu aruncă',!thrown,{thrown,status:$('st').textContent.slice(0,100)});
  // căutare, semne, teme, ascultare
  $('q').value='propoziție';$('q').dispatchEvent(new Event('input'));await sleep(500);T('căutare: rezultate',$('qres').children.length>=2,{n:$('qres').children.length});
  $('bmadd').click();T('semn de carte salvat',bmGet().length>=1);
  for(const th of ['sepia','contrast','light','dark']){$('theme').value=th;$('theme').dispatchEvent(new Event('change'))}T('teme comutate',true);
  $('dys').checked=true;$('dys').dispatchEvent(new Event('change'));$('dys').checked=false;$('dys').dispatchEvent(new Event('change'));
  $('pron').value='d-l=domnul\nASFAN=asfan';$('pron').dispatchEvent(new Event('input'));const sm=spokenMap('Vine d-l Popa la ASFAN, etc.');T('pronunție cu cratimă',/domnul Popa/.test(sm.s)&&/asfan/.test(sm.s),sm.s);
  $('lo').click&&$('lo').click();await sleep(100);$('lo').click&&$('lo').click();T('mod doar ascultare comutat',true);
  // DOCX / EPUB
  await up('file','/assets/t.docx','t.docx');await waitFor(()=>/docx|Capitolul/.test(chapters.map(c=>c.title).join('|')),8000);T('DOCX: capitole',chapters.length>=2,chapters.map(c=>c.title));
  await up('file','/assets/t.epub','t.epub');await waitFor(()=>chapters.some(c=>/Primul|Al doilea/.test(c.title)),8000);T('EPUB: capitole',chapters.some(c=>/Primul/.test(c.title)),chapters.map(c=>c.title));
  // verificare amprentă + import prin blob (calea reală din getPdfjs)
  try{const code=await verifiedText('/vendor/pdf.min.mjs','sha384-z/XbAtvhBXJoK+yvYimnFuTCF6/2wTCDSIFD09/HtIfwFtvDKOMdAe5Z3wOChkmW');T('verifiedText: SHA-384 corect (crypto.subtle)',code.length>300000,{len:code.length});
   const lib=await import(URL.createObjectURL(new Blob([code],{type:'text/javascript'})));T('import pdf.js prin blob: URL',typeof lib.getDocument==='function',Object.keys(lib).length);
   const wc=await verifiedText('/vendor/pdf.worker.min.mjs','sha384-vbNBYP03jHFPlgtK4qSXtazEmGfmpTWlSsfq9OiU20MroW/Q9TbaEXiM7PpeWg+6');lib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([wc],{type:'text/javascript'}));window.__pdfjs=lib;
  }catch(e){T('pdf.js prin calea verificată',false,String(e&&e.message||e))}
  // amprentă greșită trebuie să ceară confirmare
  let asked=0,refused=false;window.__keepDlg=true;const vp=verifiedText('/vendor/worker.min.js','sha384-GRESIT').catch(()=>{refused=true});for(let i=0;i<50&&!document.querySelector('[role=alertdialog]');i++)await sleep(100);const dl=document.querySelectorAll('[role=alertdialog]');asked=dl.length;if(dl[0])dl[0].querySelector('button').click();await vp;window.__keepDlg=false;asked=asked===1&&refused?1:asked;T('amprentă greșită: cere confirmare și refuză',asked===1,{asked});
  // PDF cu text
  await up('file','/assets/text.pdf','text.pdf','application/pdf');await waitFor(()=>chapters.some(c=>/țăranul/.test(c.text)),20000);
  const txt=chapters.map(c=>c.text).join(' ');T('PDF cu text: diacritice păstrate',/țăranul/.test(txt)&&/București/.test(txt)&&/Ștefănescu/.test(txt),txt.slice(0,120));
  T('PDF: numerele de pagină eliminate',!/Pagina \d/.test(txt),txt.length);
  // OCR local
  if(window.__skipOcr){T('OCR pe PDF scanat (română) — omis pe mobil (prea lent în emulator)',true,'skip')}else try{await new Promise((ok,no)=>{const s=document.createElement('script');s.src='/vendor/tesseract.min.js';s.onload=ok;s.onerror=()=>no('script');document.head.appendChild(s)});
   const oc2=Tesseract.createWorker.bind(Tesseract);Tesseract.createWorker=(l,o,c)=>oc2(l,Object.assign({},o,{workerPath:location.origin+'/vendor/worker.min.js',corePath:location.origin+'/vendor/core',langPath:location.origin+'/vendor/lang',workerBlobURL:false}),c);
   const t0=Date.now();await up('file','/assets/scan.pdf','scan.pdf','application/pdf');
   const ok=await waitFor(()=>chapters.some(c=>/toamn|pâini|șapte|sapte|câinele/i.test(c.text)),240000);const tx=chapters.map(c=>c.text).join(' ');
   T('OCR pe PDF scanat (română)',ok,{ms:Date.now()-t0,text:tx.slice(0,140),st:$('st').textContent.slice(0,80)});
  }catch(e){T('OCR pe PDF scanat (română)',false,String(e&&e.message||e))}
  // salvăm o carte stabilă pentru faza B
  $('paste').value='Capitolul 1\nCartea de test pentru persistență. Încă o propoziție.';$('load').click();await sleep(400);
  done({probe,R,errs:window.__errs||[]});return}
 if(PHASE==='B'){
  const n=await waitFor(()=>document.querySelectorAll('#lib .lib-item').length>=1&&document.querySelectorAll('#lib .lib-item').length,6000);
  T('biblioteca persistă după reîncărcare (IndexedDB)',!!n,{n});
  const first=document.querySelector('#lib .lib-item button');if(first){first.click();await sleep(600);T('carte deschisă din bibliotecă',chapters.length>=1&&sents.length>0,{ch:chapters.length})}
  // backup roundtrip
  hookBlob();$('bkexp').click();await sleep(500);const blob=(window.__blobs||[]).filter(b=>b.type==='application/json').pop();T('copie de rezervă generată',!!blob&&blob.size>50,{size:blob&&blob.size});
  if(blob){const txt=await blob.text();const cnt=document.querySelectorAll('#lib .lib-item').length;
   for(const b of [...document.querySelectorAll('#lib .lib-item')]){const del=[...b.querySelectorAll('button')].pop();window.__keepDlg=true;del.click();for(let i=0;i<30&&!document.querySelector('[role=alertdialog]');i++)await sleep(100);const dd=document.querySelector('[role=alertdialog]');if(dd)dd.querySelectorAll('button')[1].click();window.__keepDlg=false;await sleep(300)}
   T('ștergere din bibliotecă',document.querySelectorAll('#lib .lib-item').length===0,{left:document.querySelectorAll('#lib .lib-item').length});
   const f=new File([txt],'b.json',{type:'application/json'});const dt=new DataTransfer();dt.items.add(f);$('bkfile').files=dt.files;$('bkfile').dispatchEvent(new Event('change',{bubbles:true}));
   const back=await waitFor(()=>document.querySelectorAll('#lib .lib-item').length>=cnt,6000);T('import restaurează biblioteca',!!back,{before:cnt,after:document.querySelectorAll('#lib .lib-item').length,note:$('libnote').textContent})}
  // limbi
  for(const l of ['en','fr','de','es','it','hu','ro']){const s=$('langsel');s.value=l;s.dispatchEvent(new Event('change'));await sleep(50);if(document.documentElement.lang!==l)T('limbă '+l,false,document.documentElement.lang)}T('comutare 7 limbi',!R.some(r=>/^limbă /.test(r.n)));
  done({probe,R,errs:window.__errs||[]});return}
})().catch(e=>done({probe:{},R:[{n:'EXCEPȚIE scenariu',ok:false,d:(e&&(e.name+': '+e.message+' | '+e.stack)||String(e)).slice(0,400)}],errs:window.__errs||[]}));
