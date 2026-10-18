// Jonon 1v: linjakkuuskartoitus 11:n korjaukset S1, S2 ja S4 (S3 on paneeli, selain_114).
// S1 painovoimassa maassa olevan alustan vaihtuminen ei ole törmäys; S2 painovoiman puuttuessa irtosi maasta;
// S4 toisesta projektista liitetyn Alueen Tunnistaa (ja muut pelkät tunnistekentät) tyhjenevät.
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

// --- S1: viiden Muodon lattia, hahmo laskeutuu ja kävelee yli → yksi törmäsi; seinä kävellessä → yksi lisää ---
[0,2].forEach(function(mas){
  var P=KK.newProject('s1'+mas);alue(P,{x:-2000,y:-2000,w:6000,h:6000,pv:2000});
  for(var i=0;i<5;i++)laatikko(P,i*200,300,200,40,{nm:'Laatta '+(i+1)});
  var h=hahmo(P,20,200,{m:mas||null});var nT=laskuri(P,h.li,'tor'),nL=laskuri(P,h.li,'lask');KK.repair(P);
  run(P,0.5);A.strictEqual(V(P,nT),1,'laskeutuessa yksi törmäsi (massa '+mas+')');A.strictEqual(V(P,nL),1);
  h.li.vx='200';KK.repair(P);run(P,4.2);
  A.ok(E(P).omiNum(h.b.id,'x',0)>820,'käveli lattian yli');A.strictEqual(E(P).val(h.li.id,'maa'),true,'yhä maassa');
  A.strictEqual(V(P,nT),1,'saumat eivät ole törmäyksiä (massa '+mas+'), oli 5');A.strictEqual(V(P,nL),1,'ei uutta laskeutumista');
  A.strictEqual(E(P).val(h.li.id,'alla'),'Laatta 5','alla kertoo alustan vaihdosta');
  laatikko(P,1000,100,20,200,{nm:'Seinä'});h.li.vx='200';KK.repair(P);run(P,0.6);
  A.strictEqual(V(P,nT),2,'seinä kävellessä on törmäys (massa '+mas+')');});
// Katto: hyppy kattoon on törmäys, vaikka hahmo lähti maasta
(function(){var P=KK.newProject('s1k');alue(P,{x:-2000,y:-2000,w:6000,h:6000,pv:2000});laatikko(P,0,300,400,40,{nm:'Lattia'});laatikko(P,0,150,400,20,{nm:'Katto'});
  var h=hahmo(P,100,250);var nT=laskuri(P,h.li,'tor');KK.repair(P);run(P,0.3);A.strictEqual(V(P,nT),1);
  A.ok(KK.liikeHyppyKomento(P,h.li.id,'hyp'));run(P,0.6);A.ok(V(P,nT)>=2,'katto on törmäys');})();
// Massalliset alustat (fysParit): laatikoiden päällä kävely, saumat eivät ole törmäyksiä
(function(){var P=KK.newProject('s1m');alue(P,{x:-2000,y:-2000,w:6000,h:6000,pv:2000});laatikko(P,-200,400,1400,40,{nm:'Pohja'});
  var ls=[];for(var i=0;i<3;i++){var q=hahmo(P,i*120,355);q.b.w=120;q.b.mas=5;ls.push(q);}
  var h=hahmo(P,10,250,{m:1});var nT=laskuri(P,h.li,'tor');KK.repair(P);run(P,1);var t0=V(P,nT);A.ok(t0>=1,'laskeutui laatikolle');
  h.li.vx='120';KK.repair(P);run(P,2);A.strictEqual(V(P,nT),t0,'massallisten laatikoiden saumat eivät ole törmäyksiä');})();

// --- S2: kävely ulos painovoima-Alueelta ja painovoima tyhjäksi → irtosi maasta ---
(function(){var P=KK.newProject('s2');var a=alue(P,{x:-100,y:-100,w:400,h:600,pv:2000});laatikko(P,-100,300,1200,40,{nm:'Lattia'});
  var h=hahmo(P,20,200);var nI=laskuri(P,h.li,'irt');KK.repair(P);run(P,0.5);A.strictEqual(E(P).val(h.li.id,'maa'),true);
  h.li.vx='200';KK.repair(P);run(P,2);A.ok(E(P).omiNum(h.b.id,'x',0)>300,'käveli Alueelta ulos');
  A.strictEqual(E(P).val(h.li.id,'maa'),false,'ei maassa ilman painovoimaa');A.strictEqual(V(P,nI),1,'irtosi maasta kerran');
  run(P,0.5);A.strictEqual(V(P,nI),1,'ei toistu');
  var Q=KK.newProject('s2b');var b=alue(Q,{x:-2000,y:-2000,w:6000,h:6000,pv:2000});laatikko(Q,-100,300,1200,40);var g=hahmo(Q,20,200);var nJ=laskuri(Q,g.li,'irt');KK.repair(Q);
  run(Q,0.5);delete b.pv;g.li.vx='100';KK.repair(Q);run(Q,0.3);A.strictEqual(E(Q).val(g.li.id,'maa'),false);A.strictEqual(V(Q,nJ),1,'painovoima tyhjäksi → irtosi maasta');})();

// --- S4: toisesta projektista liitetty Alue: kopioimattomaan osoittava Tunnistaa tyhjenee ---
(function(){var P=KK.newProject('A'),v=P.views[0].id;var pel=KK.addBlock(P,'muoto',{v:v});KK.setName(P,pel.id,'Pelaaja');
  var a=KK.addBlock(P,'alue',{v:v});a.kuka=pel.id;var kal=KK.addBlock(P,'kalenteri',{v:v});var pv=KK.addBlock(P,'pvm',{v:v});kal.lahteet=[pv.id];
  var clip=KK.copyBlocks(P,[a.id,kal.id]);
  var ids=KK.pasteBlocks(P,clip,v,20,20);A.strictEqual(P.b[ids[0]].kuka,pel.id,'samassa projektissa Tunnistaa ennallaan');A.deepStrictEqual(P.b[ids[1]].lahteet,[pv.id]);A.strictEqual(ids.tyhj.length,0);
  var Q=KK.newProject('B'),w=Q.views[0].id;var kivi=KK.addBlock(Q,'muoto',{v:w});KK.setName(Q,kivi.id,'Kivi0');clip.b[a.id].kuka=kivi.id;clip.b[kal.id].lahteet=[kivi.id];
  var ids2=KK.pasteBlocks(Q,clip,w,0,0),a2=Q.b[ids2[0]],k2=Q.b[ids2[1]];
  A.strictEqual(a2.kuka,undefined,'toisessa projektissa Tunnistaa = kuka tahansa');A.deepStrictEqual(k2.lahteet,[],'vieras lähde pois');
  A.deepStrictEqual(ids2.tyhj.map(function(t){return t.k;}).sort(),['kuka','lahteet'],'ilmoitukselle tieto');
  // kopioitu yhdessä: Tunnistaa osoittaa uuteen
  var clip2=KK.copyBlocks(P,[pel.id,a.id]);clip2.pid='muu';var ids3=KK.pasteBlocks(Q,clip2,w,0,0);A.strictEqual(Q.b[ids3[1]].kuka,ids3[0],'kopioitu pari: uusi Pelaaja');A.strictEqual(ids3.tyhj.length,0);})();
console.log('logiikka_96 ok');
