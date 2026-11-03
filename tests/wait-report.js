/* Așteaptă raportul trimis de runner.html: node wait-report.js <nume> [secunde] */
const fs=require('fs'),path=require('path');
const name=process.argv[2],limit=+process.argv[3]||900,f=path.join(__dirname,'results',name+'.json');
(async()=>{const t0=Date.now();while(!fs.existsSync(f)){if((Date.now()-t0)/1000>limit){console.error('FAIL: niciun raport în '+limit+' s ('+name+')');process.exit(2)}await new Promise(r=>setTimeout(r,2000))}
 await new Promise(r=>setTimeout(r,500));const rep=JSON.parse(fs.readFileSync(f,'utf8'));
 const lines=[`### ${rep.app||''} · ${name}`,'',`\`${rep.ua}\``,'',`Ecran ${rep.screen} @${rep.dpr} · context securizat: ${rep.secure}`,'','| Verificare | Rezultat |','|---|---|',...rep.R.map(r=>`| ${r.n.replace(/\|/g,'/')} | ${r.ok?'✅':((process.env.SOFT_FAIL&&new RegExp(process.env.SOFT_FAIL,'i').test(r.n))?'⚠️ ':'❌ ')+String(r.d||'').replace(/[|\n]/g,' ').slice(0,140)} |`),''];
 console.log(lines.join('\n'));if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join('\n')+'\n');
 const SOFT=process.env.SOFT_FAIL?new RegExp(process.env.SOFT_FAIL,'i'):null;const bad=rep.R.filter(r=>!r.ok&&!(SOFT&&SOFT.test(r.n)));const soft=rep.R.filter(r=>!r.ok&&SOFT&&SOFT.test(r.n));if(soft.length)console.log('Avertismente (mediu fără codec video sau lent): '+soft.map(r=>r.n).join('; '));console.log(`${rep.R.length-bad.length}/${rep.R.length} reușite`);process.exit(bad.length||(rep.errs||[]).length?1:0)})();
