// Jonon 22 (F35 vaihe G): liikkuvat tasot. Maassa oleva kulkee alustansa mukana, alustan liikkui se millä tavalla tahansa.
// Moottorin osuus.
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
function hahmo(P,x,y){var b=laatikko(P,x,y,40,40,'Hahmo');var li=LB(P,'liike',{o:b.id});return {b:b,li:li};}
/* Taso omalla Liikkeellä (painovoima 0 %), vauhti vx, vy px/s. */
function taso(P,x,y,vx,vy){var b=laatikko(P,x,y,200,20,'Taso');var li=LB(P,'liike',{o:b.id});li.pvk=0;if(vx)li.vx=String(vx);if(vy)li.vy=String(vy);return {b:b,li:li};}
function laskuri(P,li,p){var m=LB(P,'muisti',{v:'0'});var t=LB(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,li).id,p,N(P,t).id,'e');return m;}
function seisoo(P,h,tb,m){A.strictEqual(E(P).val(h.li.id,'maa'),true,m+': maassa');A.strictEqual(E(P).val(h.li.id,'alla'),'Taso',m+': alla = Taso');near(Y(P,h.b),Y(P,tb.b)-40,1.5,m+': tason päällä');}

// --- 1. Vaakaan liikkuva taso kuljettaa (molemmat liikejärjestykset) ---
[0,1].forEach(function(jarj){var P=KK.newProject('v'+jarj),h,tb;alue(P);
  if(jarj){tb=taso(P,0,200,0,0);h=hahmo(P,80,140);}else{h=hahmo(P,80,140);tb=taso(P,0,200,0,0);}KK.repair(P);
  run(P,0.5);seisoo(P,h,tb,'laskeutui');var x0=X(P,h.b);tb.li.vx='120';KK.repair(P);run(P,1);
  var tx=X(P,tb.b);near(tx,120,3,'taso kulki');near(X(P,h.b)-x0,tx,2.5,'järjestys '+jarj+': hahmo kulki tason mukana');seisoo(P,h,tb,'vaaka '+jarj);});

// --- 2. Nouseva hissi nostaa (ei pysähdy hahmoon), laskeva laskee ilman irtoamista ---
[0,1].forEach(function(jarj){var P=KK.newProject('h'+jarj),h,tb;alue(P);if(jarj){tb=taso(P,0,400,0,0);h=hahmo(P,80,340);}else{h=hahmo(P,80,340);tb=taso(P,0,400,0,0);}
  var nI=laskuri(P,h.li,'irt'),nT=laskuri(P,h.li,'tor');KK.repair(P);run(P,0.5);seisoo(P,h,tb,'alussa');var t0=E(P).val(nT.id);
  tb.li.vy='-100';KK.repair(P);run(P,1);near(Y(P,tb.b),300,3,'hissi nousi 100 px (hahmo ei pysäyttänyt)');seisoo(P,h,tb,'nousu '+jarj);
  tb.li.vy='100';KK.repair(P);run(P,1.5);near(Y(P,tb.b),450,4,'hissi laski');seisoo(P,h,tb,'lasku '+jarj);
  A.strictEqual(E(P).val(nI.id),0,'laskeva hissi: ei irronnut maasta');A.strictEqual(E(P).val(nT.id),t0,'hissi ei tuota törmäyksiä');});

// --- 3. Alusta siirtyy muuten kuin Liikkeellä (toiminto/kaava): hahmo seuraa ---
(function(){var P=KK.newProject('s');alue(P);var tb=laatikko(P,0,200,200,20,'Taso'),h=hahmo(P,80,140);KK.repair(P);run(P,0.5);
  var x0=X(P,h.b);for(var i=0;i<60;i++){KK.setOmi(P,tb.id,'x',i+1);T+=1000/60;KK.frame(P,1/60,C);}
  near(X(P,h.b)-x0,60,1.5,'asetettu x: hahmo kulki 60 px');near(Y(P,h.b),160,1,'pysyi päällä');})();

// --- 3b. Reitillä kulkeva taso (tavallisin liikkuva taso) ---
(function(){var P=KK.newProject('r');alue(P);var rt=KK.addBlock(P,'reitti',{v:vw(P)});rt.x=100;rt.y=210;rt.pts=[[0,0],[150,0]];rt.w=150;rt.h=1;
  var tb=laatikko(P,0,200,200,20,'Taso'),h=hahmo(P,80,140);KK.repair(P);run(P,0.5);var x0=X(P,h.b),t0=X(P,tb);
  var rl=LB(P,'liike',{o:tb.id,ohj:'reitti',rt:rt.id,vm:100});KK.repair(P);run(P,1);var d=X(P,tb)-t0;
  A.ok(d>50,'reittitaso liikkui: '+d);near(X(P,h.b)-x0,d,2,'hahmo kulki reittitason mukana');seisoo(P,h,{b:tb},'reitti');})();

// --- 4. Oma kävely lisätään tason liikkeeseen; seinä pysäyttää kannon ---
(function(){var P=KK.newProject('k');alue(P);var tb=taso(P,0,200,0,0),h=hahmo(P,20,140);KK.repair(P);run(P,0.5);
  tb.li.vx='100';h.li.vx='50';KK.repair(P);var x0=X(P,h.b);run(P,1);near(X(P,h.b)-x0,150,3,'kävely + taso = 150 px');})();
(function(){var P=KK.newProject('w');alue(P);var tb=taso(P,0,200,0,0),h=hahmo(P,140,140);laatikko(P,200,-200,20,380,'Seinä');KK.repair(P);run(P,0.5);
  tb.li.vx='100';KK.repair(P);run(P,0.5);A.ok(X(P,h.b)<=160+1e-6,'seinä pysäyttää kannon: '+X(P,h.b));A.ok(X(P,tb.b)>40,'taso jatkoi seinän alta');})();

// --- 5. Hyppy tasolta irrottaa; paikallaan oleva taso ei muuta mitään eikä pidä kuvasilmukkaa käynnissä ---
(function(){var P=KK.newProject('j');alue(P);var tb=taso(P,0,400,60,0),h=hahmo(P,80,340);KK.repair(P);run(P,0.3);
  A.ok(KK.liikeHyppyKomento(P,h.li.id,'hyp'));run(P,0.1);A.strictEqual(E(P).val(h.li.id,'maa'),false,'hyppäsi irti');var xa=X(P,h.b),ta=X(P,tb.b);run(P,0.2);
  /* Jonon 35 (a): ilmassa ei kanneta, mutta tason vauhti 60 px/s jäi hyppyyn: 0,2 s = 12 px, ja hahmo pysyy tason kohdalla. */
  near(X(P,h.b)-xa,12,0.5,'tason vauhti jäi hyppyyn');near(X(P,h.b)-xa,X(P,tb.b)-ta,0.5,'hahmo pysyy tason kohdalla');})();
(function(){var P=KK.newProject('p');alue(P);var tb=laatikko(P,0,200,200,20,'Taso'),h=hahmo(P,80,140);KK.repair(P);run(P,1);
  near(X(P,h.b),80,1e-9,'paikallaan oleva alusta: x ennallaan');A.ok(!KK.frame(P,1/60,C),'kuvasilmukka pysähtyy');})();

// --- 6. Ristiin Laattakartan (Appi-appi 81) kanssa: laattaseinä pysäyttää kannon, laattalattialta tasolle ja takaisin ---
function kartta(P,x,y,rivit){var b=KK.addBlock(P,'laatat',{v:vw(P)});b.x=x;b.y=y;b.rk=32;b.lh2=rivit.length;b.lw=rivit[0].length;b.lrt=rivit.slice();
  b.lj=[{c:'1',n:'Seinä',hue:0,t:'kiintea'}];KK.setName(P,b.id,'Kartta');KK.repair(P);return b;}
(function(){var P=KK.newProject('lt');alue(P);kartta(P,320,-192,['1','1','1','1','1','1','1','1','1','1','1','1']);var tb=taso(P,0,200,0,0),h=hahmo(P,140,140);KK.repair(P);run(P,0.5);seisoo(P,h,tb,'laatat');
  tb.li.vx='100';KK.repair(P);run(P,1.5);A.ok(X(P,h.b)<=280+1e-6&&X(P,h.b)>270,'laattaseinä pysäyttää kannon: '+X(P,h.b));
  A.ok(X(P,tb.b)>140,'taso jatkoi (laattaseinä ei ole sen tiellä vielä): '+X(P,tb.b));})();
(function(){var P=KK.newProject('lt2');alue(P);kartta(P,-320,224,['1111111111']);
  var tb=laatikko(P,0,224,200,20,'Taso'),h=hahmo(P,-200,160);h.li.vx='100';KK.repair(P);run(P,0.4);
  A.strictEqual(E(P).val(h.li.id,'alla'),'Kartta','seisoo laattalattialla');
  run(P,2.4);A.strictEqual(E(P).val(h.li.id,'alla'),'Taso','kävelee laatoilta tasolle');var x1=X(P,h.b);h.li.vx='';KK.repair(P);
  for(var i=0;i<60;i++){KK.setOmi(P,tb.id,'x',-(i+1));T+=1000/60;KK.frame(P,1/60,C);}near(X(P,h.b)-x1,-60,1.5,'taso kantaa laattalattian yllä');
  A.strictEqual(E(P).val(h.li.id,'maa'),true);})();
console.log('ok: liikkuvat tasot');
