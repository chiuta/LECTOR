/* Verifică linkurile https din index.html și README.md (rulează în CI, are rețea) */
const fs=require('fs'),path=require('path');
const R=path.resolve(__dirname,'..');
const txt=['index.html','README.md'].filter(f=>fs.existsSync(path.join(R,f))).map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n');
// nu sunt linkuri: prefixe de URL completate în cod (…?url=, …/pdfjs-dist@, …/embed/) și adresele-model din placeholdere (serverul-tau.ro …).
// Gazdele fără cale și fără „/” (surse CSP, egress) contează doar dacă răspund; chiuta.ro/ și linkurile cu cale rămân verificate strict.
const PREFIX=/[=@?&#]$|^https:\/\/(player\.vimeo\.com\/video|www\.dailymotion\.com\/(embed\/)?video|www\.youtube-nocookie\.com\/embed)\/$/;
const MODEL=/\/\/(serverul-tau\.ro|your-server\.com|votre-serveur\.fr|dein-server\.de|tu-servidor\.es|tuo-server\.it|sajat-szerver\.hu|o-teu-servidor\.pt)\//;
const urls=[...new Set([...txt.matchAll(/https:\/\/[^\s"'<>)\]`]+/g)].map(m=>m[0].replace(/[.,;]+$/,'')))].filter(u=>!/\$\{|\{\}|\*\./.test(u)&&!/localhost|example\.com/.test(u)&&!PREFIX.test(u)&&!MODEL.test(u));
(async()=>{let bad=0;
 for(const u of urls){try{const c=new AbortController();const t=setTimeout(()=>c.abort(),15000);
  let r=await fetch(u,{method:'HEAD',redirect:'follow',signal:c.signal,headers:{'user-agent':'Mozilla/5.0 (link-check)'}});
  if(r.status===405||r.status===403||r.status===400)r=await fetch(u,{method:'GET',redirect:'follow',signal:c.signal,headers:{'user-agent':'Mozilla/5.0 (link-check)'}});
  clearTimeout(t);const hostOnly=/^https:\/\/[^/]+$/.test(u);const ok=r.status<400||(hostOnly&&r.status<500);console.log((ok?'OK   ':'FAIL ')+r.status+' '+u);if(!ok)bad++}catch(e){console.log('FAIL ERR '+u+' '+String(e.message||e).slice(0,60));bad++}}
 console.log(`\n${urls.length} linkuri, ${bad} defecte`);process.exit(bad?1:0)})();
