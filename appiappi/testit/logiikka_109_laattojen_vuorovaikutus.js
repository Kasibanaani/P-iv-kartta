// Jonon 19 (F35 vaihe D, suunnitelma 19 kohta 5): laattojen vuorovaikutus. Laattakartan astuttu ja poistuttu ilmoittavista
// lajeista (laji, ruutux, ruutuy, kuka), kolikko kerätään Maalaa laatta -toiminnolla (käyttötieto, määrä laskee, Palauta
// palauttaa), painelaatta jalkojen alla, Liikkeen laatta, törmäsi laattaan (tapahtuma.laji), taso-laatan läpi pudotus,
// kunnostus ja tallennus, ei ilmoittavia lajeja = ei kirjanpitoa.
var KK=require('./moottori.js'),A=require('assert');
var T=3000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,Math.random()*1000);}
function LB(P,k,o){var b=KK.addBlock(P,k,o);N(P,b);return b;}
function run(P,s,dt){dt=dt||1/60;var n=Math.round(s/dt);for(var i=0;i<n;i++){T+=dt*1000;KK.frame(P,dt,C);}}
function E(P){return KK.Ev(P,C);}
function vw(P){return P.views[0].id;}
function alue(P){var a=KK.addBlock(P,'alue',{v:vw(P)});a.x=-2000;a.y=-2000;a.w=6000;a.h=6000;a.pv=2000;return a;}
function kartta(P,x,y,rivit,lj,nm){var b=KK.addBlock(P,'laatat',{v:vw(P)});b.x=x;b.y=y;b.rk=32;b.lh2=rivit.length;b.lw=rivit[0].length;b.lrt=rivit.slice();b.lj=lj;N(P,b);
  if(nm)KK.setName(P,b.id,nm);KK.repair(P);return b;}
function hahmo(P,x,y,nm){var b=KK.addBlock(P,'muoto',{v:vw(P)});b.x=x;b.y=y;b.w=28;b.h=28;if(nm)KK.setName(P,b.id,nm);var li=LB(P,'liike',{o:b.id});return {b:b,li:li};}
function laskuri(P,b,p){var m=LB(P,'muisti',{v:'0'});var t=LB(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,b).id,p,N(P,t).id,'e');return m;}
function kirjaa(P,b,p,f){var m=LB(P,'muisti',{v:''});var k=LB(P,'kaava');k.f=KK.kaavaToIds(P,f);var t=LB(P,'tee',{do:'aseta',o:m.id,v:{r:k.id}});KK.addLink(P,N(P,b).id,p,N(P,t).id,'e');return m;}
function X(P,h){return E(P).omiNum(h.b.id,'x',0);}function Y(P,h){return E(P).omiNum(h.b.id,'y',0);}
var LJ=[{c:'1',n:'Seinä',hue:0,t:'kiintea'},{c:'2',n:'Kolikko',hue:3,t:'lapi',il:true},{c:'3',n:'Taso',hue:2,t:'taso'},{c:'4',n:'Jää',hue:5,t:'kiintea'},{c:'5',n:'Paine',hue:1,t:'kiintea',il:true}];
function rivi(c,n){var s='';for(var i=0;i<n;i++)s+=c;return s;}

// --- Kohdat, kunnostus ja tallennus ---
(function(){var P=KK.newProject('k');var b=kartta(P,0,0,['..','11'],LJ);
  A.deepStrictEqual(KK.ports(b).outs.map(function(o){return o.p;}),['v','e','ulos'],'Laattakartalla astuttu ja poistuttu');
  A.strictEqual(b.lj[1].il,true,'ilmoittaa säilyy kunnostuksessa');b.lj=[{c:'1',n:'A',hue:0,t:'kiintea',il:'kyllä'},{c:'1',n:'B',hue:0,t:'lapi',il:true}];KK.repair(P);
  A.deepStrictEqual(b.lj.map(function(l){return !!l.il;}),[false,true],'virheellinen il pois, tosi säilyy');
  var t=LB(P,'tee',{do:'maalaa',o:b.id});A.strictEqual(KK.DOS.maalaa,'Maalaa laatta');A.ok(/Maalaa laatta/.test(KK.descAct(P,t.id)),'kuvaus');})();

// --- Kolikko: astuttu (laji, ruutu, kuka), Maalaa laatta kerää, määrä laskee, ei poistuttua kerätystä, Palauta palauttaa ---
(function(){var P=KK.newProject('kolikko');alue(P);LB(P,'tapaht',{nm:'Tapahtuma'});
  var m=kartta(P,0,0,[rivi('.',12),rivi('.',12),'....2...2...',rivi('1',12)],LJ,'Kartta');var h=hahmo(P,10,40,'Pelaaja');
  var nA=laskuri(P,m,'e'),nP=laskuri(P,m,'ulos'),lj=kirjaa(P,m,'e','tapahtuma.laji'),rx=kirjaa(P,m,'e','tapahtuma.ruutux'),ry=kirjaa(P,m,'e','tapahtuma.ruutuy'),ku=kirjaa(P,m,'e','tapahtuma.kuka');
  var mk=LB(P,'tee',{do:'maalaa',o:m.id});KK.addLink(P,N(P,m).id,'e',N(P,mk).id,'e');KK.repair(P);
  A.strictEqual(E(P).prop(m.id,'määrä.kolikko'),2);run(P,0.5);A.strictEqual(E(P).val(nA.id),0,'ei vielä kolikolla');
  h.li.vx='200';KK.repair(P);run(P,0.9);
  A.strictEqual(E(P).val(nA.id),1,'yksi kolikko astuttu');A.strictEqual(E(P).val(lj.id),'Kolikko');A.strictEqual(E(P).val(rx.id),5);A.strictEqual(E(P).val(ry.id),3);A.strictEqual(E(P).val(ku.id),'Pelaaja');
  A.strictEqual(E(P).prop(m.id,'määrä.kolikko'),1,'kerätty kolikko pois käytössä');A.strictEqual(m.lrt[2],'....2...2...','rakentajan kartta ennallaan');
  A.strictEqual(E(P).val(m.id),13,'laattoja nyt');run(P,1);
  A.strictEqual(E(P).val(nA.id),2,'toinen kolikko');A.strictEqual(E(P).prop(m.id,'määrä.kolikko'),0);A.strictEqual(E(P).val(nP.id),0,'kerätystä ei poistuttua');
  // tallennus ja lataus pitää käyttötiedon
  var J=JSON.parse(JSON.stringify(P));KK.repair(J);A.strictEqual(E(J).prop(m.id,'määrä.kolikko'),0,'käyttötieto tallentuu');
  // Palauta palauttaa
  var pa=LB(P,'tee',{do:'palauta',o:m.id});KK.runAction(P,pa.id,C,0);A.strictEqual(E(P).prop(m.id,'määrä.kolikko'),2,'Palauta palauttaa maalatun kartan');
  // käytön rivit, jotka eivät sovi kokoon, ohitetaan
  P.st['lt:'+m.id]=['xx'];A.strictEqual(KK.ltNyt(P,m),m);})();

// --- Maalaa laatta kaavoilla, laji, virheet; seinän maalaus estää ---
(function(){var P=KK.newProject('maalaa');var m=kartta(P,0,0,['....','....'],LJ,'Kartta');var vv=[];var C2={now:C.now,nav:C.nav,toast:function(t){vv.push(t);}};
  var t=LB(P,'tee',{do:'maalaa',o:m.id,lc:'1',kv:{x:'2 + 1',y:'2'}});KK.repair(P);KK.runAction(P,t.id,C2,0);A.strictEqual(KK.ltNyt(P,m).lrt[1],'..1.');
  A.ok(KK.onEste(P,E(P),m)===false,'Laattakartta ei ole palikkaeste');
  t.kv={x:'9',y:'1'};KK.runAction(P,t.id,C2,0);A.ok(/ulkopuolella/.test(vv.join()),'kartan ulkopuolella näkyy virhe');
  t.kv={};vv=[];KK.runAction(P,t.id,C2,0);A.ok(/ruutu puuttuu/.test(vv.join()),'ilman tapahtumaa ja kenttiä virhe');
  t.kv={x:'3',y:'2'};t.lc='';KK.runAction(P,t.id,C2,0);A.strictEqual(KK.ltNyt(P,m).lrt[1],'....','tyhjä laji pyyhkii');})();

// --- Painelaatta jalkojen alla (kiinteä, ilmoittaa), Liikkeen laatta, poistuttu kun lähtee ---
(function(){var P=KK.newProject('paine');alue(P);var m=kartta(P,0,0,[rivi('.',12),rivi('.',12),rivi('.',12),'44455544444.'],LJ,'Kartta');var h=hahmo(P,10,40);
  var nA=laskuri(P,m,'e'),nP=laskuri(P,m,'ulos');KK.repair(P);run(P,0.5);
  A.strictEqual(E(P).val(h.li.id,'maa'),true);A.strictEqual(E(P).prop(h.li.id,'laatta'),'Jää','seisoo jäällä');A.strictEqual(E(P).val(h.li.id,'alla'),'Kartta','alla on edelleen palikka');
  A.strictEqual(E(P).val(nA.id),0);h.li.vx='100';KK.repair(P);run(P,1.2);
  A.ok(E(P).val(nA.id)>=1,'painelaatta astuttu ('+E(P).val(nA.id)+')');run(P,1.4);A.strictEqual(E(P).val(nA.id),E(P).val(nP.id),'jokaisesta astutusta poistuttu');
  A.strictEqual(E(P).prop(h.li.id,'laatta'),'Jää');
  var Q=KK.newProject('ilmanpv');var q=kartta(Q,0,0,['22','22'],LJ);var g=hahmo(Q,10,10);KK.repair(Q);A.strictEqual(E(Q).prop(g.li.id,'laatta'),'Kolikko','ylhäältä kuvattu: keskipisteen laatta');})();

// --- Törmäsi laattaan: tapahtuma.laji ja ruutu ---
(function(){var P=KK.newProject('tor');LB(P,'tapaht',{nm:'Tapahtuma'});var m=kartta(P,0,0,['.....4','......'],LJ);var h=hahmo(P,2,2);h.li.vx='200';var lj=kirjaa(P,h.li,'tor','tapahtuma.laji'),rx=kirjaa(P,h.li,'tor','tapahtuma.ruutux');KK.repair(P);run(P,1);
  A.strictEqual(E(P).val(lj.id),'Jää');A.strictEqual(E(P).val(rx.id),6);})();

// --- Taso-laatan läpi: hyppy alaspäin ohjatessa pudottaa, pelkkä hyppy ei ---
(function(){var P=KK.newProject('lapi');alue(P);var m=kartta(P,0,0,[rivi('.',8),rivi('.',8),rivi('3',8),rivi('.',8),rivi('.',8),rivi('1',8)],LJ);var h=hahmo(P,40,20);h.li.hyk=20;KK.repair(P);run(P,0.6);
  A.ok(Math.abs(Y(P,h)-(64-28))<0.6,'tason päällä '+Y(P,h));KK.liikeHyppyKomento(P,h.li.id,'hyp');run(P,0.6);A.ok(Math.abs(Y(P,h)-(64-28))<0.6,'tavallinen hyppy jää tasolle '+Y(P,h));
  h.li.vy='200';KK.repair(P);run(P,0.1);A.ok(Math.abs(Y(P,h)-(64-28))<0.6,'pelkkä alas ei pudota');KK.liikeHyppyKomento(P,h.li.id,'hyp');run(P,0.8);
  A.ok(Math.abs(Y(P,h)-(160-28))<0.6,'putosi tason läpi lattialle '+Y(P,h));
  // kiinteän läpi ei pudoteta
  KK.liikeHyppyKomento(P,h.li.id,'hyp');run(P,0.8);A.ok(Math.abs(Y(P,h)-(160-28))<0.6,'lattia pitää '+Y(P,h));})();

// --- Ei ilmoittavia lajeja: ei kirjanpitoa ---
(function(){var P=KK.newProject('hiljaa');alue(P);var m=kartta(P,0,0,[rivi('.',6),rivi('1',6)],[{c:'1',n:'Seinä',hue:0,t:'kiintea'}]);var h=hahmo(P,10,0);h.li.vx='100';KK.repair(P);run(P,1);
  A.ok(!Object.keys(P.st).some(function(k){return /^ltk?:/.test(k);}),'ei käyttötietoa');})();
console.log('ok');
