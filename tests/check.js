/* Verificări statice: sintaxă JS, manifest, PWA, CSP, buget de mărime, versiuni consecvente */
const fs=require('fs'),path=require('path'),vm=require('vm');
const R=path.resolve(__dirname,'..');const rd=f=>fs.readFileSync(path.join(R,f),'utf8');
let bad=0;const ok=(c,m)=>{console.log((c?'OK   ':'FAIL ')+m);if(!c)bad++};
const html=rd('index.html');
// doar scripturile JavaScript: blocurile de date (type="application/json": fff-info, traduceri) nu sunt cod și nu se parsează ca atare
const scripts=[...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>!/\btype=["'](?!module|text\/javascript)/i.test(m[1])).map(m=>m[2]);
ok(scripts.length>0,'index.html are script inline ('+scripts.length+')');
scripts.forEach((s,i)=>{try{new vm.Script(s,{filename:'inline-'+i+'.js'});ok(true,'sintaxă script #'+i+' ('+s.length+' caractere)')}catch(e){ok(false,'sintaxă script #'+i+': '+e.message)}});
try{new vm.Script(rd('sw.js'),{filename:'sw.js'});ok(true,'sintaxă sw.js')}catch(e){ok(false,'sw.js: '+e.message)}
let mf;try{mf=JSON.parse(rd('manifest.webmanifest'));ok(true,'manifest JSON valid')}catch(e){ok(false,'manifest: '+e.message)}
if(mf){ok(!!(mf.name&&mf.start_url&&mf.display&&mf.icons&&mf.icons.length>=2),'manifest: name, start_url, display, icons');for(const i of mf.icons||[])ok(fs.existsSync(path.join(R,i.src)),'icon există: '+i.src)}
ok(fs.existsSync(path.join(R,'apple-touch-icon.png')),'apple-touch-icon.png există');
ok(/<html[^>]*\blang=/.test(html),'atribut lang pe <html>');
ok(/<meta[^>]+name=["']viewport["']/.test(html),'meta viewport');
ok(/Content-Security-Policy/i.test(html),'meta Content-Security-Policy');
ok(!/(?:\b(?:src|href|action)=["']|fetch\(["']|import\(["']|url\(["']?)http:\/\/(?!localhost|127\.0\.0\.1)/.test(html),'fără resurse încărcate prin http:// nesecurizat');
for(const m of html.matchAll(/<script[^>]+src=["']https?:[^>]*>/g))ok(/integrity=/.test(m[0])&&/crossorigin/.test(m[0]),'script extern cu integrity+crossorigin: '+m[0].slice(0,80));
const kb=Buffer.byteLength(html)/1024;// buget 420 → 600 KB: kitul fff și motorul de texturi, apoi fff-kit 1.8.0 cu rezervele pentru browsere mai vechi (ES2017, ~+60 KB) sunt în pagină
ok(kb<600,'mărime index.html '+kb.toFixed(0)+' KB (buget 600 KB)');
const av=/const APPV='(v\d+)'/.exec(html),sv=/const V='(v\d+)'/.exec(rd('sw.js'));
ok(av&&sv&&av[1]===sv[1],'versiune aplicație = versiune service worker ('+(av&&av[1])+' / '+(sv&&sv[1])+')');
ok(fs.existsSync(path.join(R,'CNAME')),'CNAME există ('+(fs.existsSync(path.join(R,'CNAME'))?rd('CNAME').trim():'-')+')');
process.exit(bad?1:0);
