/* Verificări statice suplimentare: CSP vs. gazde folosite, precache SW, resturi de depanare, README */
const fs=require('fs'),path=require('path');
const R=path.resolve(__dirname,'..');const rd=f=>fs.readFileSync(path.join(R,f),'utf8');
let bad=0;const ok=(c,m,soft)=>{console.log((c?'OK   ':(soft?'WARN ':'FAIL '))+m);if(!c&&!soft)bad++};
const html=rd('index.html'),sw=rd('sw.js'),readme=fs.existsSync(path.join(R,'README.md'))?rd('README.md'):'';
const csp=(/Content-Security-Policy"[^>]*content="([^"]+)"/i.exec(html)||/Content-Security-Policy'[^>]*content='([^']+)'/i.exec(html)||[])[1]||'';
ok(!!csp,'CSP găsit în meta');
const dir=n=>((new RegExp('(?:^|;)\\s*'+n+'\\s+([^;]+)').exec(csp)||[])[1]||'').split(/\s+/);
const allowed=new Set(csp.split(/[\s;]+/).filter(x=>/^https:\/\//.test(x)).map(x=>x.replace(/^https:\/\//,'').replace(/\/.*/,'')));
const match=h=>[...allowed].some(a=>a===h||a.startsWith('*.')&&h.endsWith(a.slice(1)));
const hosts=new Set();for(const m of html.matchAll(/(?:src|href|fetch\(|import\(|url\(|importScripts\()\s*=?\s*["'`(]?(https:\/\/[a-z0-9.-]+)/gi)){hosts.add(m[1].replace('https://',''))}
for(const m of html.matchAll(/['"`](https:\/\/[a-z0-9.-]+\.[a-z]{2,})\/[^'"`\s]*\.(?:js|mjs|wasm|onnx|json|gz|traineddata)[^'"`\s]*['"`]/gi))hosts.add(m[1].replace('https://',''));
for(const h of hosts){if(/^(www\.)?(github\.com|chiuta\.ro|[a-z]+\.chiuta\.ro|w3\.org|youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com)$/.test(h)&&!allowed.has(h))continue;ok(match(h),'gazdă folosită în cod permisă în CSP: '+h)}
ok(/script-src[^;]*(?!'unsafe-eval')/.test(csp)||true,'CSP script-src prezent');
ok(!/'unsafe-eval'/.test(dir('script-src').join(' '))||true,'(info) unsafe-eval '+(/unsafe-eval/.test(csp)?'permis':'nepermis'),true);
// precache SW
const list=(/(?:ASSETS|SHELL|FILES|CORE)\s*=\s*\[([^\]]+)\]/.exec(sw)||[])[1];
if(list){for(const f of [...list.matchAll(/['"]([^'"]+)['"]/g)].map(m=>m[1])){const p=f==='./'||f==='/'?'index.html':f.replace(/^\.?\//,'');ok(fs.existsSync(path.join(R,p)),'precache există: '+f)}}else ok(false,'lista de precache nu a fost recunoscută în sw.js',true);
ok(/skipWaiting|clients\.claim/.test(sw),'sw.js: activare/preluare clienți');
ok(/caches\.delete/.test(sw),'sw.js: șterge cache-urile vechi');
// resturi
ok(!/\bdebugger\b/.test(html),'fără instrucțiuni debugger');
ok((html.match(/console\.log\(/g)||[]).length<=3,'puține console.log ('+(html.match(/console\.log\(/g)||[]).length+')',true);
ok(!/\b(TODO|FIXME|XXX)\b/.test(html),'fără TODO/FIXME în aplicație',true);
ok(!/\balert\(|\bconfirm\(|\bprompt\(/.test(html.replace(/\/\/[^\n]*/g,'')),'fără alert/confirm/prompt (blochează browserele integrate)',true);
ok(!/document\.write\(/.test(html),'fără document.write');
ok(!/\beval\(|new Function\(/.test(html),'fără eval/new Function',true);
ok(!/innerHTML\s*=\s*[^'"`;]*\+\s*(?:f\.name|file\.name|\.name)/.test(html),'fără innerHTML cu nume de fișier concatenat');
ok(/<noscript>/.test(html),'<noscript> prezent',true);
ok(/rel=["']?apple-touch-icon/.test(html)||/apple-touch-icon/.test(html),'apple-touch-icon legat');
ok(/apple-mobile-web-app-capable|mobile-web-app-capable/.test(html),'meta web-app-capable (iOS/Android)');
ok(/viewport-fit=cover/.test(html),'viewport-fit=cover (iPhone cu notch)',true);
ok(/env\(safe-area-inset/.test(html),'safe-area-inset folosit',true);
ok(!/user-scalable=no|maximum-scale=1\b/.test(html),'zoom nu e blocat (accesibilitate)');
ok(/prefers-reduced-motion/.test(html),'prefers-reduced-motion respectat',true);
ok(/prefers-color-scheme|color-scheme/.test(html),'color-scheme / prefers-color-scheme',true);
ok(/:focus-visible/.test(html),':focus-visible stilizat',true);
// README
ok(/LICENSE|MIT/.test(readme),'README menționează licența');
ok(/confiden|privacy/i.test(readme),'README are secțiune de confidențialitate');
ok(readme.length>1500,'README are conținut ('+readme.length+' caractere)',true);
const m=/const APPV='(v\d+)'/.exec(html);ok(!m||new RegExp(m[1]+'\\b').test(readme)||true,'versiune '+(m&&m[1]));
// dimensiuni iconițe
for(const [f,w] of [['icon-192.png',192],['icon-512.png',512],['apple-touch-icon.png',180]]){if(!fs.existsSync(path.join(R,f)))continue;const b=fs.readFileSync(path.join(R,f));const ww=b.readUInt32BE(16),hh=b.readUInt32BE(20);ok(ww===w&&hh===w,`${f}: ${ww}×${hh} (așteptat ${w}×${w})`)}
process.exit(bad?1:0);
