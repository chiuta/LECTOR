/* Analiză statică: ESLint pe scripturile din index.html și sw.js, html-validate pe index.html */
const fs=require('fs'),path=require('path');
const {ESLint}=require('eslint');const {HtmlValidate}=require('html-validate');
const R=path.resolve(__dirname,'..');const html=fs.readFileSync(path.join(R,'index.html'),'utf8');
(async()=>{
 let bad=0,warn=0;
 const rules={'no-dupe-keys':2,'no-dupe-args':2,'no-dupe-class-members':2,'no-dupe-else-if':2,'no-duplicate-case':2,'no-unreachable':2,'no-redeclare':2,'no-const-assign':2,'no-func-assign':1,'no-self-assign':2,'no-cond-assign':0,'no-unsafe-finally':2,'use-isnan':2,'valid-typeof':2,'no-empty-character-class':2,'no-unsafe-negation':2,'getter-return':2,'no-loss-of-precision':2,'no-sparse-arrays':1,'no-unsafe-optional-chaining':2,'no-async-promise-executor':2,'no-misleading-character-class':1,'no-prototype-builtins':0,'no-unused-labels':1,'no-useless-escape':0,'no-eval':1,'no-implied-eval':1,'no-new-func':1,'no-script-url':1,'eqeqeq':0,'no-undef':0,'no-unused-vars':0,'no-empty':0,'require-atomic-updates':0};
 const eslint=new ESLint({overrideConfigFile:true,overrideConfig:[{files:['**/*.js'],languageOptions:{ecmaVersion:2022,sourceType:'script'},rules}]});
 const items=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m,i)=>['index.html#script'+i,m[1]]);
 items.push(['sw.js',fs.readFileSync(path.join(R,'sw.js'),'utf8')]);
 for(const [n,src] of items){
  const [r]=await eslint.lintText(src,{filePath:n.replace('#','_')+'.js'});
  for(const m of r.messages){const l=`${n}:${m.line}:${m.column} ${m.ruleId||'sintaxă'} — ${m.message}`;if(m.severity===2){console.log('FAIL '+l);bad++}else{console.log('WARN '+l);warn++}}
  console.log(`OK   ESLint ${n}: ${r.errorCount} erori, ${r.warningCount} avertismente`)}
 const hv=new HtmlValidate({root:true,extends:['html-validate:recommended'],rules:{'no-inline-style':'off','require-sri':'off','no-trailing-whitespace':'off','void-style':'off','attr-quotes':'off','no-implicit-close':'off','element-name':'off','prefer-native-element':'off','wcag/h30':'off','wcag/h32':'off','wcag/h37':'off','no-redundant-role':'off','no-raw-characters':'off','unique-landmark':'off','input-missing-label':'off','no-implicit-button-type':'off','long-title':'off','heading-level':'warn','no-dup-id':'error','no-dup-attr':'error','valid-id':'off','attribute-allowed-values':'warn','attribute-boolean-style':'off','attribute-empty-style':'off','doctype-style':'off','prefer-button':'off','script-type':'off','element-permitted-content':'warn','element-permitted-parent':'warn','element-required-attributes':'warn','element-permitted-order':'warn','no-missing-references':'error','close-order':'error','unrecognized-char-ref':'warn','missing-doctype':'error','no-unknown-elements':'warn','tel-non-breaking':'off','empty-heading':'off','text-content':'off','hidden-focusable':'off','aria-label-misuse':'warn'}});
 const rep=await hv.validateString(html,'index.html');
 for(const m of rep.results.flatMap(r=>r.messages)){const l=`index.html:${m.line}:${m.column} ${m.ruleId} — ${m.message}`;if(m.severity===2){console.log('FAIL '+l);bad++}else{console.log('WARN '+l);warn++}}
 console.log(`OK   html-validate: ${rep.errorCount} erori, ${rep.warningCount} avertismente`);
 console.log(`\nTotal: ${bad} erori, ${warn} avertismente`);
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`### Analiză statică\n\n${bad} erori, ${warn} avertismente\n`);
 process.exit(bad?1:0)})();
