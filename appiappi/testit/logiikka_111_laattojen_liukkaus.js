// Jono 19 jatko (F35 vaihe D, 21.10.2026): laattalajin liukkaus (jää). Kunnostus, painovoimassa jalkojen alla oleva laatta
// (vain maassa), ilman painovoimaa keskipisteen laatta, töytäisyn kitka, piilotettu kartta, ja kolikkologiikka KUN-palikalla
// (tapahtuma.laji) niin, ettei toinen ilmoittava laji katoa.
var KK=require('./moottori.js'),A=require('assert');
var T=3000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,Math.random()*1000);}
function LB(P,k,o){var b=KK.addBlock(P,k,o);N(P,b);return b;}
function run(P,s,dt){dt=dt||1/60;var n=Math.round(s/dt);for(var i=0;i<n;i++){T+=dt*1000;KK.frame(P,dt,C);}}
function E(P){return KK.Ev(P,C);}
function vw(P){return P.views[0].id;}
function alue(P){var a=KK.addBlock(P,'alue',{v:vw(P)});a.x=-2000;a.y=-2000;a.w=6000;a.h=6000;a.pv=2000;return a;}
function kartta(P,x,y,rivit,lj){var b=KK.addBlock(P,'laatat',{v:vw(P)});b.x=x;b.y=y;b.rk=32;b.lh2=rivit.length;b.lw=rivit[0].length;b.lrt=rivit.slice();b.lj=lj;N(P,b);KK.repair(P);return b;}
function hahmo(P,x,y){var b=KK.addBlock(P,'muoto',{v:vw(P)});b.x=x;b.y=y;b.w=28;b.h=28;var li=LB(P,'liike',{o:b.id});return {b:b,li:li};}
function X(P,h){return E(P).omiNum(h.b.id,'x',0);}
function rivi(c,n){var s='';for(var i=0;i<n;i++)s+=c;return s;}
var LJ=[{c:'1',n:'Seinä',hue:0,t:'kiintea'},{c:'4',n:'Jää',hue:5,t:'kiintea',liu:85},{c:'6',n:'Lattia',hue:2,t:'lapi',liu:50}];

// --- Kunnostus: liu 1–100 säilyy, virheellinen korjataan ---
(function(){var P=KK.newProject('k');var b=kartta(P,0,0,['14','..'],LJ);A.strictEqual(b.lj[1].liu,85,'liu säilyy');
  b.lj=[{c:'1',n:'A',hue:0,t:'kiintea',liu:150},{c:'2',n:'B',hue:0,t:'kiintea',liu:'x'},{c:'3',n:'C',hue:0,t:'kiintea',liu:0}];KK.repair(P);
  A.deepStrictEqual(b.lj.map(function(l){return l.liu;}),[100,undefined,undefined],'yli 100 → 100, virheellinen ja 0 pois');
  var J=JSON.parse(JSON.stringify(P));A.strictEqual(J.b[b.id].lj[0].liu,100,'tallentuu');})();

// --- Painovoima: jäällä lähtö ja pysähdys liukuvat, seinällä eivät ---
function lahto(m){var P=KK.newProject('pv');alue(P);kartta(P,0,0,[rivi('.',30),rivi('.',30),rivi(m,30)],LJ);var h=hahmo(P,100,30);KK.repair(P);run(P,0.5);
  A.ok(KK.liikeSt(P,h.li.id).ma,'maassa');var x0=X(P,h);h.li.vx='200';KK.repair(P);run(P,0.1);var d1=X(P,h)-x0;run(P,1.5);h.li.vx='0';KK.repair(P);var x2=X(P,h);run(P,0.3);
  return {d1:d1,d2:X(P,h)-x2};}
(function(){var s=lahto('1'),j=lahto('4');
  A.ok(s.d1>18,'seinällä lähtö heti '+s.d1);A.ok(j.d1<s.d1*0.3,'jäällä lähtö liukuu '+j.d1);
  A.ok(s.d2<0.5,'seinällä pysähtyy heti '+s.d2);A.ok(j.d2>20,'jäällä liukuu pysähtyessä '+j.d2);})();

// --- Ilmassa jää ei vaikuta; Liikkeen oma liukkaus suurempi voittaa ---
(function(){var P=KK.newProject('ilma');alue(P);kartta(P,0,0,[rivi('.',30),rivi('.',30),rivi('.',30),rivi('.',30),rivi('.',30),rivi('4',30)],LJ);var h=hahmo(P,100,0);KK.repair(P);
  A.strictEqual(KK.ltLiukkaus(P,E(P),h.b,KK.liikeSt(P,h.li.id),{g:2000,dx:0,dy:1},null,function(b){return KK.rectNow(P,E(P),b);}),0,'ilmassa 0');
  run(P,1);A.ok(KK.liikeSt(P,h.li.id).ma,'laskeutui');A.strictEqual(KK.ltLiukkaus(P,E(P),h.b,KK.liikeSt(P,h.li.id),{g:2000,dx:0,dy:1},null,function(b){return KK.rectNow(P,E(P),b);}),85,'jäällä 85');})();

// --- Ilman painovoimaa: keskipisteen lattia (läpi, liukkaus 50) ---
function ylhaalta(m){var P=KK.newProject('yl');kartta(P,0,0,[rivi(m,20),rivi(m,20),rivi(m,20)],LJ);var h=hahmo(P,40,34);KK.repair(P);h.li.vx='200';KK.repair(P);run(P,0.1);return X(P,h)-40;}
(function(){var tyhja=ylhaalta('.'),lat=ylhaalta('6');A.ok(tyhja>18,'tyhjällä heti '+tyhja);A.ok(lat<tyhja*0.5,'liukkaalla lattialla hitaammin '+lat);})();

// --- Töytäisyn kitka: liukkaus 50 % puolittaa kitkan (hidastuvuus neljännes) ---
function toytaisy(m){var P=KK.newProject('ty');var k=kartta(P,0,0,[rivi(m,40),rivi(m,40),rivi(m,40)],LJ);var h=hahmo(P,40,34);KK.repair(P);
var s=KK.liikeSt(P,h.li.id),s1={};for(var q in s)s1[q]=s[q];s1.ux=400;P.st[h.li.id]=s1;run(P,0.2);return X(P,h)-40;}
(function(){var a=toytaisy('.'),b=toytaisy('6');
  // kitka 50 % → 750 px/s²: 0,2 s → 400·0,2 − 750·0,02 = 65; kitka 25 % → 187,5 px/s²: 80 − 3,75 = 76,25
  A.ok(Math.abs(a-65)<3,'tavallinen kitka '+a);A.ok(Math.abs(b-76.25)<1.5,'liukkaalla kitka puolet '+b);})();

// --- Kolikot laattoina: KUN tapahtuma.laji = "Kolikko" → Maalaa ja Lisää; toinen ilmoittava laji (Paine) ei katoa ---
(function(){var P=KK.newProject('kol');alue(P);LB(P,'tapaht',{nm:'Tapahtuma'});var lj=[{c:'1',n:'Seinä',hue:0,t:'kiintea'},{c:'2',n:'Kolikko',hue:2,t:'lapi',il:true},{c:'5',n:'Paine',hue:1,t:'lapi',il:true}];
  var m=kartta(P,0,0,[rivi('.',14),rivi('.',14),'...2..5..2....',rivi('1',14)],lj);var h=hahmo(P,10,40);
  var f=LB(P,'kaava');f.f=KK.kaavaToIds(P,'tapahtuma.laji = "Kolikko"');var ku=LB(P,'kun',{}),pi=LB(P,'muisti',{v:'0'});
  var ma=LB(P,'tee',{do:'maalaa',o:m.id}),li=LB(P,'tee',{do:'lisaa',o:pi.id,v:'1'});
  KK.addLink(P,N(P,m).id,'e',N(P,ku).id,'e');KK.addLink(P,N(P,f).id,'v',N(P,ku).id,'c');KK.addLink(P,N(P,ku).id,'e',N(P,ma).id,'e');KK.addLink(P,N(P,ku).id,'e',N(P,li).id,'e');
  KK.repair(P);run(P,0.4);h.li.vx='200';KK.repair(P);run(P,2.2);
  A.strictEqual(E(P).val(pi.id),2,'kaksi kolikkoa');A.strictEqual(E(P).prop(m.id,'määrä.kolikko'),0,'kolikot kerätty');A.strictEqual(E(P).prop(m.id,'määrä.paine'),1,'painelaatta jäi');})();
console.log('logiikka_111_laattojen_liukkaus: ok');
