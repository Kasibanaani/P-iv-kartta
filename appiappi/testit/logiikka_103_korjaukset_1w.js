// Jonon 1w: linjakkuuskartoitus 12:n korjaukset. S1 painovoima 0 -alueelle (Tikkaat) tultaessa maassa oleva pysyy maassa,
// kunnes irtoaa alustastaan; S3 syvyysvaroitus näkee Laattakartan ja palikan oman syvyyden (krSyVaroitus).
var KK=require('./moottori.js'),A=require('assert');
var T=3000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,0);}
function LB(P,k,o){var b=KK.addBlock(P,k,o);N(P,b);return b;}
function run(P,s,dt){dt=dt||1/60;var n=Math.round(s/dt);for(var i=0;i<n;i++){T+=dt*1000;KK.frame(P,dt,C);}}
function E(P){return KK.Ev(P,C);}
function vw(P){return P.views[0].id;}
function alue(P,o){var a=KK.addBlock(P,'alue',{v:vw(P)});a.x=o.x;a.y=o.y;a.w=o.w;a.h=o.h;a.pv=o.pv;return a;}
function laatikko(P,x,y,w,h,o){o=o||{};var b=KK.addBlock(P,'muoto',{v:vw(P)});b.x=x;b.y=y;b.w=w;b.h=h;b.este=true;if(o.m!=null)b.mas=o.m;if(o.nm)KK.setName(P,b.id,o.nm);return b;}
function hahmo(P,x,y,o){o=o||{};var b=laatikko(P,x,y,40,40,o);var li=LB(P,'liike',{o:b.id});if(o.vx!=null)li.vx=String(o.vx);return {b:b,li:li};}
function laskuri(P,li,p){var m=LB(P,'muisti',{v:'0'});var t=LB(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,li).id,p,N(P,t).id,'e');return m;}
function V(P,m){return E(P).val(m.id);}

// --- S1: tikkaiden (painovoima 0 -Alue lattiaan asti) ohi lattialla: törmäsi 1, laskeutui 1, irtosi 0, maassa koko matkan ---
[0,2].forEach(function(mas){
  var P=KK.newProject('t1'+mas);alue(P,{x:-2000,y:-2000,w:6000,h:6000,pv:2000});laatikko(P,-100,300,1200,40,{nm:'Lattia'});
  alue(P,{x:300,y:0,w:60,h:300,pv:0});
  var h=hahmo(P,20,200,{m:mas||null});var nT=laskuri(P,h.li,'tor'),nL=laskuri(P,h.li,'lask'),nI=laskuri(P,h.li,'irt');KK.repair(P);
  run(P,0.5);A.strictEqual(V(P,nT),1);A.strictEqual(V(P,nL),1);
  h.li.vx='150';KK.repair(P);var aina=true,tikkailla=false;
  for(var i=0;i<240;i++){run(P,1/60);var x=E(P).omiNum(h.b.id,'x',0);if(x+20>300&&x+20<360){tikkailla=true;if(E(P).val(h.li.id,'maa')!==true)aina=false;}}
  A.ok(E(P).omiNum(h.b.id,'x',0)>500,'käveli tikkaiden ohi');A.ok(tikkailla,'kävi tikkaiden kohdalla');A.ok(aina,'maassa tikkaiden kohdalla (massa '+mas+')');
  A.strictEqual(E(P).val(h.li.id,'alla'),'Lattia');
  A.strictEqual(V(P,nT),1,'törmäsi 1 (massa '+mas+')');A.strictEqual(V(P,nL),1,'laskeutui 1 (massa '+mas+')');A.strictEqual(V(P,nI),0,'irtosi 0 (massa '+mas+')');});
// Tikkaissa kiipeäminen irrottaa maasta, yläpäästä putoaminen laskeutuu ja törmää kuten ennen
(function(){var P=KK.newProject('t2');alue(P,{x:-2000,y:-2000,w:6000,h:6000,pv:2000});laatikko(P,-100,300,1200,40,{nm:'Lattia'});
  alue(P,{x:0,y:0,w:100,h:300,pv:0});
  var h=hahmo(P,140,200);var nT=laskuri(P,h.li,'tor'),nL=laskuri(P,h.li,'lask'),nI=laskuri(P,h.li,'irt');KK.repair(P);
  run(P,0.5);h.li.vx='-200';KK.repair(P);run(P,0.5);h.li.vx='';KK.repair(P);run(P,0.3);A.ok(E(P).omiNum(h.b.id,'x',0)<60,'tikkailla');A.strictEqual(E(P).val(h.li.id,'maa'),true,'tikkaiden juurella maassa');A.strictEqual(V(P,nI),0);
  h.li.vy='-200';KK.repair(P);run(P,0.3);A.strictEqual(E(P).val(h.li.id,'maa'),false,'kiipeää irti');A.strictEqual(V(P,nI),1,'irtosi maasta');
  h.li.vy='';h.li.vx='200';KK.repair(P);run(P,0.6);h.li.vx='';KK.repair(P);run(P,1);
  A.strictEqual(E(P).val(h.li.id,'maa'),true,'putosi lattialle');A.strictEqual(V(P,nL),2,'laskeutui uudelleen');A.strictEqual(V(P,nT),2,'putoaminen on törmäys');})();
// Painovoima-Alueelta kokonaan pois (ei Aluetta) on yhä irtosi maasta (1v S2)
(function(){var P=KK.newProject('t3');alue(P,{x:-100,y:-100,w:400,h:600,pv:2000});laatikko(P,-100,300,1200,40);
  var h=hahmo(P,20,200);var nI=laskuri(P,h.li,'irt');KK.repair(P);run(P,0.5);h.li.vx='200';KK.repair(P);run(P,2);
  A.strictEqual(E(P).val(h.li.id,'maa'),false);A.strictEqual(V(P,nI),1);})();

// --- S3: syvyysvaroitus (syVaroitus): Laattakartta ja palikan oma syvyys ---
(function(){var P=KK.newProject('s3');P.views[0].laite='puhelin';var v=vw(P);P.views[0].kr=[{id:'k1',n:'Syvä',sy:300},{id:'pohja',n:'Pohja'}];
  var LJ=[{c:'1',n:'Seinä',hue:0,t:'kiintea'},{c:'2',n:'Koriste',hue:4,t:'lapi'},{c:'3',n:'Taso',hue:2,t:'taso'}];
  var k=KK.addBlock(P,'laatat',{v:v,kr:'k1'});k.lw=3;k.lh2=1;k.rk=32;k.lj=LJ;k.lrt=['222'];KK.setName(P,k.id,'Kartta');
  var h=hahmo(P,0,0);KK.setName(P,h.b.id,'Pelaaja');h.b.este=false;KK.repair(P);
  A.strictEqual(KK.syVaroitus(P,v),null,'pelkkä läpi-laji ei ole este');
  k.lrt=['2.3'];KK.repair(P);var w=KK.syVaroitus(P,v);A.ok(w&&w.e===k&&w.t===h.b,'taso-laji syvässä kerroksessa → varoitus');
  k.lrt=['1..'];KK.repair(P);A.ok(KK.syVaroitus(P,v,function(b){return b.kr==='k1';}),'kiinteä-laji, kerrosrivin suodatin');
  A.strictEqual(KK.syVaroitus(P,v,function(b){return (b.kr||'pohja')==='pohja';}),null,'pohjakerroksessa ei estettä');
  k.sy=0;KK.repair(P);A.strictEqual(KK.syVaroitus(P,v),null,'kartan oma syvyys 0 = sama kuin hahmon');delete k.sy;k.lrt=['...'];KK.repair(P);
  // Este-palikka pohjakerroksessa, oma syvyys 300
  var e=laatikko(P,100,100,40,40,{nm:'Kivi'});KK.repair(P);A.strictEqual(KK.syVaroitus(P,v),null,'sama syvyys → ei varoitusta');
  e.sy=300;KK.repair(P);w=KK.syVaroitus(P,v);A.ok(w&&w.e===e&&w.t===h.b,'oma syvyys 300 → varoitus');
  A.ok(KK.syVaroitus(P,v,function(b){return b===e;}),'esteen paneeli');A.ok(KK.syVaroitus(P,v,null,h.b),'liikkujan paneeli');
  h.b.sy=300;KK.repair(P);A.strictEqual(KK.syVaroitus(P,v),null,'liikkuja samalla syvyydellä → ei varoitusta');
  // esteeksi merkitty kerros
  delete h.b.sy;e.este=false;delete e.sy;P.views[0].kr[0].este=true;var puu=KK.addBlock(P,'muoto',{v:v,kr:'k1'});KK.repair(P);
  w=KK.syVaroitus(P,v);A.ok(w&&w.e===puu,'esteen kerroksen palikka');})();
console.log('ok');
