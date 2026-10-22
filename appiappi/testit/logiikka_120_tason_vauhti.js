// Jonon 35 (a): liikkuvan tason vauhti jää hyppyyn ja reunalta pudotessa, laskeutuminen tason suhteen, katon ja nousevan
// tason väliin jäävä puristuu (tapahtuma puristui). Lisäksi Kuolema-alueen logiikka (Palauta x, y ja vauhti 0). Moottorin osuus.
var KK=require('./moottori.js'),A=require('assert');
var T=3000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function near(a,b,e,m){A.ok(Math.abs(a-b)<=(e||1e-6),(m||'')+': '+a+' ≠ '+b+' (±'+e+')');}
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,0);}
function LB(P,k,o){var b=KK.addBlock(P,k,o);N(P,b);return b;}
function run(P,s,dt){dt=dt||1/60;var n=Math.round(s/dt);for(var i=0;i<n;i++){T+=dt*1000;KK.frame(P,dt,C);}}
function E(P){return KK.Ev(P,C);}
function X(P,b){return E(P).omiNum(b.id,'x',0);}
function Y(P,b){return E(P).omiNum(b.id,'y',0);}
function vw(P){return P.views[0].id;}
function alue(P){var a=KK.addBlock(P,'alue',{v:vw(P)});a.x=-3000;a.y=-3000;a.w=8000;a.h=8000;a.pv=2000;return a;}
function laatikko(P,x,y,w,h,nm){var b=KK.addBlock(P,'muoto',{v:vw(P)});b.x=x;b.y=y;b.w=w;b.h=h;b.este=true;if(nm)b.nm=nm;return b;}
function hahmo(P,x,y){var b=laatikko(P,x,y,40,40,'Hahmo');var li=LB(P,'liike',{o:b.id});li.hyk='160';return {b:b,li:li};}
function taso(P,x,y,vx,vy,w){var b=laatikko(P,x,y,w||400,20,'Taso');var li=LB(P,'liike',{o:b.id});li.pvk=0;if(vx)li.vx=String(vx);if(vy)li.vy=String(vy);return {b:b,li:li};}
function laskuri(P,li,p){var m=LB(P,'muisti',{v:'0'});var t=LB(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,li).id,p,N(P,t).id,'e');return m;}
function kirjuri(P,li,p,f){if(!Object.keys(P.b).some(function(i){return P.b[i].k==='tapaht';})){var tp=KK.addBlock(P,'tapaht',{nm:'Tapahtuma'});N(P,tp);}
  var m=LB(P,'muisti',{v:''}),k=LB(P,'kaava');k.f=KK.kaavaToIds(P,f);var s=LB(P,'tee',{do:'aseta',o:m.id,v:{r:k.id}});KK.addLink(P,N(P,li).id,p,N(P,s).id,'e');return m;}
function hyppaa(P,h){A.ok(KK.liikeHyppyKomento(P,h.li.id,'hyp'),'hyppää');}
function maassa(P,h){return E(P).val(h.li.id,'maa')===true;}
/* Huippu: pienin y hypyn aikana (askel 1/120 s). */
function huippu(P,h,s){var m=Infinity;for(var i=0;i<Math.round(s*120);i++){T+=1000/120;KK.frame(P,1/120,C);m=Math.min(m,Y(P,h.b));}return m;}

// --- 1. Vaakataso: hyppy tasolta kantaa tason vauhdin, laskeutuu takaisin samaan kohtaan tasoa (kitka 50 ja 0) ---
[50,0].forEach(function(kit){var P=KK.newProject('v'+kit);alue(P);var tb=taso(P,0,400,120,0,600),h=hahmo(P,100,340);h.li.kit=kit;KK.repair(P);run(P,0.5);
  A.ok(maassa(P,h),'seisoo tasolla');var d0=X(P,h.b)-X(P,tb.b);hyppaa(P,h);run(P,0.05);A.ok(!maassa(P,h),'ilmassa');
  near(E(P).omiNum(h.li.id,'vauhtix',0),120,6,'kitka '+kit+': tason vauhti töytäisyvauhdiksi');
  run(P,0.8);A.ok(maassa(P,h),'laskeutui');A.strictEqual(E(P).val(h.li.id,'alla'),'Taso','takaisin tasolle');
  near(X(P,h.b)-X(P,tb.b),d0,1.5,'kitka '+kit+': sama kohta tasoa hypyn jälkeen');run(P,0.5);
  near(X(P,h.b)-X(P,tb.b),d0,1.5,'kitka '+kit+': ei liu\'u tason päällä laskeutumisen jälkeen');
  near(E(P).omiNum(h.li.id,'vauhtix',0),0,1,'kitka '+kit+': töytäisyvauhti tason suhteen 0');});

// --- 2. Reunalta pudotessa vauhti säilyy: kävely 100 + taso 100 = 200 px/s ---
(function(){var P=KK.newProject('r');alue(P);var tb=taso(P,0,400,0,0,200),h=hahmo(P,100,340);KK.repair(P);run(P,0.5);
  tb.li.vx='100';h.li.vx='100';var nI=laskuri(P,h.li,'irt');KK.repair(P);var k=0;while(maassa(P,h)&&k++<200)run(P,1/60);A.ok(!maassa(P,h),'putosi reunalta');
  run(P,0.05);var x0=X(P,h.b);run(P,0.1);near(X(P,h.b)-x0,20,1.5,'ilmassa 200 px/s (kävely + tason vauhti)');A.strictEqual(E(P).val(nI.id),1,'irtosi kerran');})();

// --- 3. Nousevalta tasolta hyppy on korkeampi (ponnistus 800 + taso 100 px/s), laskevalta matalampi ---
function nousu(vy){var P=KK.newProject('n'+vy);alue(P);var tb=taso(P,0,600,0,0),h=hahmo(P,100,540);KK.repair(P);run(P,0.3);if(vy){tb.li.vy=String(vy);KK.repair(P);}run(P,0.3);
  var y0=Y(P,h.b);hyppaa(P,h);return y0-huippu(P,h,0.8);}
var n0=nousu(0),nU=nousu(-100),nD=nousu(100);
near(n0,160,3,'paikallaan olevalta tasolta 160 px');near(nU,900*900/4000,5,'nousevalta tasolta (800 + 100)² / (2 · 2000)');near(nD,700*700/4000,5,'laskevalta tasolta (800 − 100)² / (2 · 2000)');

// --- 4. Kuvittain siirtyvä alusta (asetettu x joka kuva, 60 px/s): vauhti tasoittuu askelten yli ---
(function(){var P=KK.newProject('k');alue(P);var tb=laatikko(P,0,400,600,20,'Taso'),h=hahmo(P,100,340);KK.repair(P);run(P,0.5);
  for(var i=0;i<30;i++){KK.setOmi(P,tb.id,'x',i+1);T+=1000/60;KK.frame(P,1/60,C);}hyppaa(P,h);for(i=30;i<36;i++){KK.setOmi(P,tb.id,'x',i+1);T+=1000/60;KK.frame(P,1/60,C);}
  A.ok(!maassa(P,h),'ilmassa');near(E(P).omiNum(h.li.id,'vauhtix',0),60,9,'kuvittainen alusta: noin 60 px/s');})();

// --- 5. Katon ja nousevan tason väliin: puristui kerran, hahmo putoaa tason läpi, taso ei pysähdy hahmoon ---
(function(){var P=KK.newProject('p');alue(P);var tb=taso(P,-100,400,0,0),h=hahmo(P,80,340);laatikko(P,-200,200,600,20,'Katto');
  var nP=laskuri(P,h.li,'pur');
  KK.repair(P);run(P,0.5);A.ok(maassa(P,h));tb.li.vy='-100';KK.repair(P);run(P,1.3);
  A.strictEqual(E(P).val(nP.id),0,'ei puristusta ennen kattoa');run(P,0.3);A.strictEqual(E(P).val(nP.id),1,'puristui');
  run(P,1);A.strictEqual(E(P).val(nP.id),1,'puristui vain kerran');near(Y(P,tb.b),220,1,'taso nousi kattoon asti');
  A.ok(Y(P,h.b)>Y(P,tb.b)+20,'hahmo putosi tason läpi alle: '+Y(P,h.b));A.ok(!P.st[h.li.id].pur,'puristus päättyi');})();
// Ristiin kaista A:n ryhmien kanssa (jonon 15e, 1s): puristui lähtee myös ryhmän jäsentapahtumana (jäsen = liikutettava hahmo)
(function(){var P=KK.newProject('pj');alue(P);var tb=taso(P,-100,400,0,0),h=hahmo(P,80,340);laatikko(P,-200,200,600,20,'Katto');
  var J=KK.jkLuo(P,'pelaajat');h.b.jkt=[J];var pj=KK.addBlock(P,'pjoukko',{jj:J,jlj:'liike'}),m=LB(P,'muisti',{v:'0'}),t=LB(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,pj).id,'j_pur',N(P,t).id,'e');
  KK.repair(P);run(P,0.5);tb.li.vy='-100';KK.repair(P);run(P,2);A.strictEqual(E(P).val(m.id),1,'ryhmän jäsentapahtuma puristui');})();
// Puristuksen kohde = taso; vaakataso seinää vasten ei puristu (hahmo jää tason päälle, taso jatkaa alta)
(function(){var P=KK.newProject('p2');alue(P);var tb=taso(P,-100,400,0,0),h=hahmo(P,80,340);laatikko(P,-200,200,600,20,'Katto');
  var m=kirjuri(P,h.li,'pur','tapahtuma.kohde');KK.repair(P);run(P,0.5);tb.li.vy='-100';KK.repair(P);run(P,2);
  A.strictEqual(String(E(P).val(m.id)),'Taso','tapahtuma.kohde = Taso');})();
(function(){var P=KK.newProject('p3');alue(P);var tb=taso(P,0,400,0,0,200),h=hahmo(P,140,340);laatikko(P,200,-200,20,580,'Seinä');var nP=laskuri(P,h.li,'pur');KK.repair(P);run(P,0.5);
  tb.li.vx='100';KK.repair(P);run(P,0.5);A.strictEqual(E(P).val(nP.id),0,'seinä ei purista');A.ok(maassa(P,h),'pysyy tasolla');})();

// --- 6. Kuolema-alueen logiikka: Palauta x, y ja Aseta vauhtix, vauhtiy 0 → putoaa alusta levosta ---
(function(){var P=KK.newProject('ku');alue(P);var h=hahmo(P,100,0),a=KK.addBlock(P,'alue',{v:vw(P),kuka:h.b.id});a.x=0;a.y=600;a.w=400;a.h=100;var an=N(P,a);
  ['x','y'].forEach(function(k){var t=LB(P,'tee',{do:'palauta',o:h.b.id,om:k});KK.addLink(P,an.id,'e',N(P,t).id,'e');});
  ['ux','uy'].forEach(function(k){var t=LB(P,'tee',{do:'aseta',o:h.li.id,om:k,v:'0'});KK.addLink(P,an.id,'e',N(P,t).id,'e');});
  KK.repair(P);var k=0;while(Y(P,h.b)<560&&k++<200)run(P,1/60);run(P,2/60);
  A.ok(Y(P,h.b)<40,'palasi alkuun: '+Y(P,h.b));A.ok(E(P).omiNum(h.li.id,'vauhtiy',0)<=2000/60*3,'putoaa levosta: '+E(P).omiNum(h.li.id,'vauhtiy',0));})();
console.log('ok: tason vauhti ja puristus');
