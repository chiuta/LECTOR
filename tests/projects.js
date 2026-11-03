/* Profiluri de browser comune testelor */
const {chromium,firefox,webkit,devices}=require('playwright');
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
module.exports={P};
