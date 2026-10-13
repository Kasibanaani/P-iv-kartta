// Versio 11: tarkkuus ×2/÷2 (kaikki skaalautuu mukana), SVG:n mittasuhde ja muotojen tunnisteet, kuvakerrokset,
// tekijän muotoviitteet (sh) ja ikkunan zoomaus-, kamera- ja nipistyskentät.
const E=require('./moottori.js');
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
const SVG='<?xml version="1.0"?><!-- kuva --><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><rect id="ovi" x="10" y="10" width="20" height="40"/><g id="puu"><circle id="latva" cx="50" cy="50" r="5"/></g><path id=\'järvi\' d="M0 0"/></svg>';
eq('SVG kelpaa (xml-otsake ja kommentti)',[E.svgOk(SVG),E.svgOk('<div>'),E.svgOk('x'.repeat(10))],[true,false,false]);
eq('mittasuhde viewBoxista ja width/height-arvoista',[E.svgAspect(SVG),E.svgAspect('<svg width="40" height="10"></svg>'),E.svgAspect('<svg></svg>')],[0.5,0.25,null]);
eq('muotojen tunnisteet (ei svg-juurta)',E.svgIds('<svg id="juuri">'+SVG.slice(SVG.indexOf('<rect'))),['ovi','puu','latva','järvi']);
const P=E.newProject('V11');const add=(t,n,x)=>{const o=E.newObj(P,t,'s1',n);Object.assign(o,x||{});P.objs.push(o);return o;};
const M=E.newMap(P);M.w=6;M.h=4;M.img=SVG;M.lock=true;
const ik=add('map','Ikkuna',{zm:'px',ts:40,cam:'edge',pinch:true,start:{k:'xy',x:2,y:1}});const iv=add('map','Toinen',{zm:'all',ts:10,cam:'x',pinch:1});
const pis=add('counter','Pisteet');
const f=E.newFx(M,'zone');f.cells=['1,1','5,3'];f.trig='tap';f.sh=['#ovi','L1','L1#latva','L1#latva','huono ref','#a b',5];f.act=[{do:'warp',o:ik.id,x:3,y:2}];
M.layers=[{id:'L1',n:'Puu',img:SVG,x:1.234,y:-2,w:0,h:2,extra:1},{id:'L1',n:'tupla',img:SVG,x:0,y:0,w:1,h:1},{id:'X',img:SVG},{id:'L2',img:'<div>'}];
E.repair(P);
eq('ikkunan kentät',[ik.zm,ik.ts,ik.cam,ik.pinch,iv.zm,'ts' in iv,'cam' in iv,'pinch' in iv],['px',40,'edge',true,'all',false,false,false]);
eq('muotoviitteet siivottu',f.sh,['#ovi','L1','L1#latva']);
eq('kerrokset siivottu',M.layers,[{id:'L1',n:'Puu',img:SVG,x:1.23,y:0,w:0.25,h:2}]);
eq('lukitus säilyy',M.lock,true);
P.state.vals[ik.id]={x:2.5,y:1.5};
eq('tarkkuus ×2',[E.mapScale(P,M,2),M.w,M.h,f.cells.sort(),ik.start,ik.ts,f.act[0],P.state.vals[ik.id],M.layers[0].x,M.layers[0].w],[true,12,8,['10,6','10,7','11,6','11,7','2,2','2,3','3,2','3,3'],{k:'xy',x:5,y:3},20,{do:'warp',o:ik.id,x:7,y:5},{x:5,y:3},2.46,0.5]);
eq('tarkkuus ÷2 palauttaa',[E.mapScale(P,M,0.5),M.w,M.h,f.cells.sort(),ik.start,ik.ts,f.act[0],P.state.vals[ik.id]],[true,6,4,['1,1','5,3'],{k:'xy',x:2,y:1},40,{do:'warp',o:ik.id,x:3,y:2},{x:2.5,y:1.5}]);
eq('alle 3 ruutua ei skaalata',[E.mapScale(P,M,0.5),M.w],[false,6]);
M.w=150;eq('yli 200 ei skaalata',E.mapScale(P,M,2),false);M.w=6;
delete M.layers[0].img;E.repair(P);eq('kerros ilman kuvaa poistuu',('layers' in M),false);
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
