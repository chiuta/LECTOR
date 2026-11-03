/* Copiază bibliotecile (pdf.js, tesseract.js, date OCR română) din node_modules în tests/.vendor și verifică amprentele SHA-384 din aplicație */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const NM=path.join(__dirname,'node_modules'),V=path.join(__dirname,'.vendor');
const EXPECT={'pdf.min.mjs':'sha384-z/XbAtvhBXJoK+yvYimnFuTCF6/2wTCDSIFD09/HtIfwFtvDKOMdAe5Z3wOChkmW','pdf.worker.min.mjs':'sha384-vbNBYP03jHFPlgtK4qSXtazEmGfmpTWlSsfq9OiU20MroW/Q9TbaEXiM7PpeWg+6','tesseract.min.js':'sha384-GJqSu7vueQ9qN0E9yLPb3Wtpd7OrgK8KmYzC8T1IysG1bcvxvIO4qtYR/D3A991F'};
const cp=(a,b)=>{fs.mkdirSync(path.dirname(b),{recursive:true});fs.copyFileSync(a,b)};
fs.rmSync(V,{recursive:true,force:true});
cp(path.join(NM,'pdfjs-dist/legacy/build/pdf.min.mjs'),path.join(V,'pdf.min.mjs'));
cp(path.join(NM,'pdfjs-dist/legacy/build/pdf.worker.min.mjs'),path.join(V,'pdf.worker.min.mjs'));
cp(path.join(NM,'tesseract.js/dist/tesseract.min.js'),path.join(V,'tesseract.min.js'));
cp(path.join(NM,'tesseract.js/dist/worker.min.js'),path.join(V,'worker.min.js'));
for(const f of fs.readdirSync(path.join(NM,'tesseract.js-core')))if(/^tesseract-core.*\.(js|wasm)$/.test(f)||f==='index.js')cp(path.join(NM,'tesseract.js-core',f),path.join(V,'core',f));
cp(path.join(NM,'@tesseract.js-data/ron/4.0.0_best_int/ron.traineddata.gz'),path.join(V,'lang/ron.traineddata.gz'));
let bad=0;for(const [f,h] of Object.entries(EXPECT)){const d='sha384-'+crypto.createHash('sha384').update(fs.readFileSync(path.join(V,f))).digest('base64');if(d!==h){console.error('AMPRENTĂ DIFERITĂ pentru',f,'\n  găsit  ',d,'\n  așteptat',h);bad++}else console.log('ok',f)}
if(bad)process.exit(1);
