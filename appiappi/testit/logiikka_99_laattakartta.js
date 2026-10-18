// Jonon 18 (F35 vaihe C, suunnitelma 19 kohta 5): Laattakartta. Kunnostus ja vanha tallennus, kaavan määrät ja koko,
// laattaeste (kiinteä, läpi, taso), saumat (kävely lattian yli, liuku seinää pitkin), taso ylhäältä ja alhaalta,
// käännetty painovoima, piilossa ei estä, reitinhaku laattaseinän ohi, ruutuliike, 200 × 200 kartan keveys.
var KK=require('./moottori.js'),A=require('assert');
var T=3000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,0);}
function LB(P,k,o){var b=KK.addBlock(P,k,o);N(P,b);return b;}
function run(P,s,dt){dt=dt||1/60;var n=Math.round(s/dt);for(var i=0;i<n;i++){T+=dt*1000;KK.frame(P,dt,C);}}
function E(P){return KK.Ev(P,C);}
function vw(P){return P.views[0].id;}
function alue(P,o){var a=KK.addBlock(P,'alue',{v:vw(P)});a.x=o.x;a.y=o.y;a.w=o.w;a.h=o.h;a.pv=o.pv;if(o.s)a.pvs=o.s;return a;}
function kartta(P,x,y,rivit,o){o=o||{};var b=KK.addBlock(P,'laatat',{v:vw(P)});b.x=x;b.y=y;b.rk=o.rk||32;b.lh2=rivit.length;b.lw=rivit[0].length;b.lrt=rivit.slice();
  if(o.lj)b.lj=o.lj;if(o.nm)KK.setName(P,b.id,o.nm);KK.repair(P);return b;}
function hahmo(P,x,y,o){o=o||{};var b=KK.addBlock(P,'muoto',{v:vw(P)});b.x=x;b.y=y;b.w=o.w||28;b.h=o.h||28;if(o.ymp){b.laji='ympyra';}var li=LB(P,'liike',{o:b.id});if(o.vx!=null)li.vx=String(o.vx);if(o.vy!=null)li.vy=String(o.vy);return {b:b,li:li};}
function laskuri(P,li,p){var m=LB(P,'muisti',{v:'0'});var t=LB(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,li).id,p,N(P,t).id,'e');return m;}
function X(P,h){return E(P).omiNum(h.b.id,'x',0);}function Y(P,h){return E(P).omiNum(h.b.id,'y',0);}
var LJ3=[{c:'1',n:'Seinä',hue:0,t:'kiintea'},{c:'2',n:'Koriste',hue:4,t:'lapi'},{c:'3',n:'Taso',hue:2,t:'taso'},{c:'4',n:'Kolikko',hue:3,t:'lapi'}];

// --- Kunnostus, oletukset ja tallennus ---
(function(){var P=KK.newProject('k');var b=KK.addBlock(P,'laatat',{v:vw(P)});KK.repair(P);
  A.strictEqual(b.rk,32);A.strictEqual(b.lw,16);A.strictEqual(b.lh2,10);A.strictEqual(b.w,512);A.strictEqual(b.h,320);
  A.deepStrictEqual(b.lj.map(function(l){return l.n+':'+l.t;}),['Seinä:kiintea','Koriste:lapi']);A.strictEqual(b.lrt.length,10);A.strictEqual(b.lrt[0],'................');
  var r0=b.lrt;KK.repair(P);A.strictEqual(b.lrt,r0,'ehjää ei korvata (piirto tunnistaa muutoksen taulukosta)');
  b.lrt=['11x','1'];b.lw=3;b.lh2=3;b.rk=1000;KK.repair(P);A.deepStrictEqual(b.lrt,['11.','1..','...'],'tuntematon merkki ja lyhyt rivi korjataan');A.strictEqual(b.rk,256);A.strictEqual(b.w,768);
  b.lw=500;KK.repair(P);A.strictEqual(b.lw,200,'enintään 200 × 200');b.lw=3;KK.repair(P);
  b.lj=[{c:'1',n:'A',hue:9,t:'mika'},{c:'1',n:'B',hue:2,t:'taso',kim:150},null];KK.repair(P);A.deepStrictEqual(b.lj,[{c:'1',n:'A',hue:7,t:'kiintea'},{c:'2',n:'B',hue:2,t:'taso',kim:150}],'lajit korjataan, tuplamerkki saa uuden');
  // tallennus ja lataus
  var J=JSON.parse(JSON.stringify(P));KK.repair(J);var b2=J.b[b.id];A.deepStrictEqual(b2.lrt,b.lrt);A.deepStrictEqual(b2.lj,b.lj);
  // vanha projekti ilman laattoja ennallaan
  var Q=KK.newProject('vanha');var q=KK.addBlock(Q,'muoto',{v:vw(Q)});var s0=JSON.stringify(q);KK.repair(Q);A.strictEqual(JSON.stringify(q),s0);})();

// --- Kaava ja ominaisuudet ---
(function(){var P=KK.newProject('f');var b=kartta(P,0,0,['1111','1.4.','1414'],{lj:LJ3,nm:'Kartta'});var e=E(P);
  A.strictEqual(e.val(b.id),10,'arvo = laattoja');A.strictEqual(e.prop(b.id,'määrä'),10);A.strictEqual(e.prop(b.id,'määrä.seinä'),7);A.strictEqual(e.prop(b.id,'maara.kolikko'),3);
  A.strictEqual(e.prop(b.id,'määrä.taso'),0);A.ok(KK.isErr(e.prop(b.id,'määrä.laava')),'tuntematon laji on virhe');A.ok(/lajit: seina, koriste, taso, kolikko/.test(e.prop(b.id,'määrä.laava').err));
  A.strictEqual(e.prop(b.id,'sarakkeet'),4);A.strictEqual(e.prop(b.id,'rivit'),3);A.strictEqual(e.prop(b.id,'ruutukoko'),32);A.strictEqual(e.prop(b.id,'leveys'),128,'leveys on pikseleinä kuten muillakin');
  var f=LB(P,'kaava',{f:''});f.f=KK.kaavaToIds(P,b.vt+'.määrä.kolikko * 10');A.strictEqual(E(P).val(f.id),30,'kaavassa');
  var ps=KK.omat(b).map(function(o){return o.p;});A.ok(ps.indexOf('este')<0&&ps.indexOf('massa')<0&&ps.indexOf('kimmoisuus')<0,'este, massa ja kimmoisuus ovat lajeilla');A.ok(ps.indexOf('sarakkeet')>=0&&ps.indexOf('näkyy')>=0);
  b.lrt=['....','....','...4'];A.strictEqual(E(P).prop(b.id,'määrä.kolikko'),1,'uudet rivit lasketaan uudelleen');
  A.deepStrictEqual(KK.ports(b).outs.map(function(o){return o.p;}),['v']);})();

// --- Kävely laattalattian yli: saumat eivät pysäytä, yksi törmäsi (laskeutuminen) ---
[{},{ymp:1}].forEach(function(o){
  var P=KK.newProject('lattia');alue(P,{x:-2000,y:-2000,w:6000,h:6000,pv:2000});var row='',top='';for(var i=0;i<30;i++){row+='1';top+='.';}
  var m=kartta(P,0,0,[top,top,top,top,top,row,row],{nm:'Maa'});var h=hahmo(P,20,100,o);var nT=laskuri(P,h.li,'tor');KK.repair(P);
  run(P,0.6);A.strictEqual(E(P).val(h.li.id,'maa'),true,'seisoo laattojen päällä');A.ok(Math.abs(Y(P,h)-(160-28))<0.6,'pinnalla '+Y(P,h));A.strictEqual(E(P).val(h.li.id,'alla'),'Maa');
  h.li.vx='300';KK.repair(P);var x0=X(P,h);run(P,2);
  A.ok(X(P,h)-x0>560,'kävelee saumojen yli ('+(X(P,h)-x0)+' px)'+(o.ymp?' ympyrä':''));A.strictEqual(E(P).val(h.li.id,'maa'),true);A.strictEqual(E(P).val(nT.id),1,'saumat eivät ole törmäyksiä');});

// --- Liuku seinää pitkin: painovoima vetää alas, ohjaus painaa seinään, ei jää saumaan ---
(function(){var P=KK.newProject('seina');alue(P,{x:-2000,y:-2000,w:6000,h:6000,pv:2000});var r=[];for(var i=0;i<12;i++)r.push(i===11?'1111111111':'.....1....');
  kartta(P,0,0,r);var h=hahmo(P,140,0);h.li.vx='200';KK.repair(P);run(P,1.2);
  A.ok(Math.abs(X(P,h)-(160-28))<0.6,'seinää vasten '+X(P,h));A.ok(Y(P,h)>320-28-1,'liukui seinää pitkin lattialle asti ('+Y(P,h)+')');})();

// --- Ilman painovoimaa: ylhäältä kuvattu, liikkuja kulkee seinän viertä (sokkelo) ---
(function(){var P=KK.newProject('ylh');kartta(P,0,0,['1111111111','1........1','1........1','1111111111']);var h=hahmo(P,40,36,{vx:150,vy:-80});KK.repair(P);run(P,2);
  A.ok(X(P,h)>=288-28-0.6&&X(P,h)<=288-28+0.01,'pysähtyi oikeaan seinään '+X(P,h));A.ok(Math.abs(Y(P,h)-32)<0.6,'ylä-seinää vasten '+Y(P,h));})();

// --- Läpi-laji ei estä, piilossa oleva kartta ei estä ---
(function(){var P=KK.newProject('lapi');alue(P,{x:-2000,y:-2000,w:6000,h:6000,pv:2000});kartta(P,0,0,['....','....','2222','2222']);var h=hahmo(P,20,0);KK.repair(P);run(P,0.5);
  A.ok(Y(P,h)>200,'koriste ei estä');
  var Q=KK.newProject('piilo');alue(Q,{x:-2000,y:-2000,w:6000,h:6000,pv:2000});var m=kartta(Q,0,0,['....','....','1111']);var ar=LB(Q,'arvo',{v:'ei'});KK.addLink(Q,N(Q,ar).id,'v',N(Q,m).id,'nk');var g=hahmo(Q,20,0);KK.repair(Q);run(Q,0.5);
  A.ok(Y(Q,g)>200,'piilossa oleva kartta ei estä');})();

// --- Taso: alhaalta läpi, ylhäältä seisoo; kimmoisuus lajilta ---
(function(){var P=KK.newProject('taso');alue(P,{x:-2000,y:-2000,w:6000,h:6000,pv:2000});
  var m=kartta(P,0,0,['........','........','........','........','33333333','........','........','........','11111111'],{lj:LJ3});
  var h=hahmo(P,40,190);KK.repair(P);run(P,0.4);A.ok(Math.abs(Y(P,h)-(256-28))<0.6,'lattialla tason alla '+Y(P,h));
  A.ok(KK.liikeHyppyKomento(P,h.li.id,'hyp'));h.li.hyk=150;KK.repair(P);A.ok(KK.liikeHyppyKomento(P,h.li.id,'hyp'));run(P,1.2);
  A.ok(Math.abs(Y(P,h)-(128-28))<0.6,'hyppäsi tason läpi ja jäi sen päälle '+Y(P,h));A.strictEqual(E(P).val(h.li.id,'maa'),true);
  h.li.vx='200';KK.repair(P);run(P,0.5);A.ok(Math.abs(Y(P,h)-(128-28))<0.6,'kävelee tasoa pitkin');
  // kimmoisuus lajilta
  var Q=KK.newProject('kim');var lj=[{c:'1',n:'Pomppu',hue:1,t:'kiintea',kim:100}];alue(Q,{x:-2000,y:-2000,w:6000,h:6000,pv:2000});kartta(Q,0,0,['....','....','....','....','....','....','....','1111'],{lj:lj});
  var g=hahmo(Q,20,0);g.b.mas=1;KK.repair(Q);run(Q,0.42);var ymin=1e9;for(var i=0;i<40;i++){run(Q,1/60);ymin=Math.min(ymin,Y(Q,g));}A.ok(ymin<150,'pomppulaatta kimmottaa ('+ymin+')');})();

// --- Käännetty painovoima: laattakatto on alusta ---
(function(){var P=KK.newProject('ylos');alue(P,{x:-2000,y:-2000,w:6000,h:6000,pv:2000,s:'ylos'});kartta(P,0,0,['11111111','........','........','........']);var h=hahmo(P,40,90);KK.repair(P);run(P,0.6);
  A.ok(Math.abs(Y(P,h)-32)<0.6,'putosi ylös kattoon '+Y(P,h));A.strictEqual(E(P).val(h.li.id,'maa'),true);})();

// --- Reitinhaku laattaseinän ohi (Napautus, kiertää esteet) ---
(function(){var P=KK.newProject('reitti');var r=[];for(var i=0;i<10;i++)r.push(i<8?'.....1....':'..........');kartta(P,0,0,r);var h=hahmo(P,20,20);h.li.ohj='napautus';h.li.kie=true;h.li.vm=300;KK.repair(P);
  A.strictEqual(KK.liikeNapautus(P,vw(P),280,40,C),1);run(P,4);A.ok(X(P,h)>230,'kiersi seinän ('+X(P,h)+', '+Y(P,h)+')');})();

// --- Ruutuliike: laatta estää askeleen ---
(function(){var P=KK.newProject('ruutu');kartta(P,0,0,['....','..1.','....']);var b=KK.addBlock(P,'muoto',{v:vw(P)});b.x=2;b.y=34;b.w=28;b.h=28;var li=LB(P,'liike',{o:b.id,ohj:'ruutu',ra:32,vm:400});var nT=laskuri(P,li,'tor');KK.repair(P);
  A.ok(KK.liikeRuutuKomento(P,li.id,'oi'));run(P,0.3);A.strictEqual(E(P).omiNum(b.id,'x',0),34,'yksi askel');A.ok(KK.liikeRuutuKomento(P,li.id,'oi'));run(P,0.3);
  A.strictEqual(E(P).omiNum(b.id,'x',0),34,'laatta esti');A.strictEqual(E(P).val(nT.id),1,'törmäsi');})();

// --- 200 × 200 kartta: ruudut haetaan vain liikkujan kohdalta ---
(function(){var P=KK.newProject('iso');alue(P,{x:-2000,y:-2000,w:12000,h:12000,pv:2000});var r=[],full='',emp='';for(var i=0;i<200;i++){full+='1';emp+=i%7===0?'1':'.';}
  for(var j=0;j<200;j++)r.push(j===199?full:j%9===0?emp:emp.replace(/1/g,'.'));var m=kartta(P,0,0,r);var h=hahmo(P,40,6000);h.li.vx='300';KK.repair(P);
  run(P,0.5);var t0=Date.now(),n=120;for(var i2=0;i2<n;i2++){T+=1000/60;KK.frame(P,1/60,C);}var ms=(Date.now()-t0)/n;
  console.log('200×200: '+ms.toFixed(3)+' ms/kuva');A.ok(ms<4,'kuva alle 4 ms ('+ms+')');A.strictEqual(E(P).val(h.li.id,'maa'),true);})();
// --- Kopioi ja liitä (Appi-appi 74/75): rivit ja lajit mukaan omina taulukoinaan, myös toiseen projektiin ---
(function(){var P=KK.newProject('kop'),v=vw(P);var b=kartta(P,0,0,['1122','..33'],{lj:LJ3});var c=KK.copyBlocks(P,[b.id]);var ids=KK.pasteBlocks(P,c,v,10,10),n=P.b[ids[0]];
  A.deepStrictEqual(n.lrt,b.lrt);A.ok(n.lrt!==b.lrt,'oma taulukko');A.deepStrictEqual(n.lj,b.lj);var Q=KK.newProject('kop2'),ids2=KK.pasteBlocks(Q,c,vw(Q),0,0);A.strictEqual(Q.b[ids2[0]].lrt[1],'..33');A.strictEqual(ids2.tyhj.length,0);})();
console.log('logiikka_99 ok');
