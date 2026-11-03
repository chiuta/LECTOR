const R=[];const T=(n,c,d)=>R.push({n,ok:!!c,d:d===undefined?undefined:(typeof d==='string'?d:JSON.stringify(d)).slice(0,300)});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const waitFor=async(f,ms=30000)=>{const t=Date.now();while(Date.now()-t<ms){try{const v=f();if(v)return v}catch(e){}await sleep(100)}return null};
const $=id=>document.getElementById(id);
const up=async(id,url,name,type)=>{const b=await (await fetch(url)).blob();const f=new File([b],name,{type:type||b.type});const dt=new DataTransfer();dt.items.add(f);const el=$(id);el.files=dt.files;el.dispatchEvent(new Event('change',{bubbles:true}))};
const hookBlob=()=>{if(window.__hk)return;window.__hk=true;window.__blobs=[];const o=URL.createObjectURL.bind(URL);URL.createObjectURL=b=>{try{window.__blobs.push(b)}catch(e){}return o(b)}};
const b64=async blob=>{const ab=await blob.arrayBuffer();const u=new Uint8Array(ab);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)};
