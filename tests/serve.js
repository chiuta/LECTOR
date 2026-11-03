/* Server static de test: aplicația la /, fixturi la /assets, biblioteci la /vendor, rezultate la POST /__report */
const http=require('http'),fs=require('fs'),path=require('path');
const T=__dirname,ROOT=path.resolve(T,'..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.wasm':'application/wasm','.gz':'application/octet-stream','.mp4':'video/mp4','.m4a':'audio/mp4','.pdf':'application/pdf','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.epub':'application/epub+zip','.css':'text/css','.svg':'image/svg+xml','.txt':'text/plain'};
const ALLOW=new Set(['index.html','sw.js','manifest.webmanifest','apple-touch-icon.png','icon-192.png','icon-512.png','CNAME','README.md']);
function resolve(u){
  if(u==='/'||u==='')u='/index.html';
  if(u==='/__runner.html')return path.join(T,'runner.html');
  if(u==='/__scen.js')return path.join(T,'scen.js');
  if(u==='/__app.json')return path.join(T,'app.json');
  if(u==='/common.js')return path.join(T,'common.js');
  if(u.startsWith('/assets/'))return path.join(T,u);
  if(u.startsWith('/vendor/'))return path.join(T,'.vendor',u.slice(8));
  const n=u.slice(1);return ALLOW.has(n)?path.join(ROOT,n):null}
function start(port){
  const srv=http.createServer((req,res)=>{
    const url=new URL(req.url,'http://x');
    if(req.method==='POST'&&url.pathname==='/__report'){
      const name=(url.searchParams.get('name')||'device').replace(/[^\w.-]/g,'_');let body=[];
      req.on('data',c=>body.push(c));req.on('end',()=>{fs.mkdirSync(path.join(T,'results'),{recursive:true});fs.writeFileSync(path.join(T,'results',name+'.json'),Buffer.concat(body));res.writeHead(204);res.end()});return}
    if(url.pathname==='/__ping'){res.writeHead(200);res.end('ok');return}
    let f;try{f=resolve(decodeURIComponent(url.pathname))}catch(e){f=null}
    if(!f||f.includes('\0')||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);res.end('not found');return}
    const st=fs.statSync(f),h={'Content-Type':MIME[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
    const rg=req.headers.range&&/bytes=(\d*)-(\d*)/.exec(req.headers.range);
    if(rg){const a=rg[1]?+rg[1]:0,b=rg[2]?Math.min(+rg[2],st.size-1):st.size-1;res.writeHead(206,{...h,'Content-Range':`bytes ${a}-${b}/${st.size}`,'Content-Length':b-a+1});fs.createReadStream(f,{start:a,end:b}).pipe(res);return}
    res.writeHead(200,{...h,'Content-Length':st.size});fs.createReadStream(f).pipe(res)});
  return new Promise(ok=>srv.listen(port,'0.0.0.0',()=>ok(srv)))}
module.exports={start};
if(require.main===module){start(+process.argv[2]||8765).then(s=>console.log('server la http://localhost:'+s.address().port+'/'))}
