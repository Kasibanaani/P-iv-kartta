// Jono 20b (F35 vaihe E2, 21.10.2026): piirretty ilme b.il. Tilat lajeittain, kunnostus, tallennus, ominaisuus ilme (perusarvo
// = perus-piirroksen nimi, Aseta vaihtaa, Palauta palauttaa), ilNimesta, piirroksen poisto ja kopio toiseen projektiin.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(3000000);},toast:function(){},nav:function(){}};
function vw(P){return P.views[0].id;}
function rt(P){return KK.repair(JSON.parse(JSON.stringify(P)));}

// --- Tilat ---
A.deepStrictEqual(KK.ilTilat('nappi').map(function(x){return x[0];}),['perus','painettu','valittu','harmaa']);
A.deepStrictEqual(KK.ilTilat('kytkin').map(function(x){return x[0];}),['perus','paalla','harmaa']);
A.deepStrictEqual(KK.ilTilat('saadin').map(function(x){return x[0];}),['kisko','tayto','nuppi']);
A.deepStrictEqual(KK.ilTilat('tatti').map(function(x){return x[0];}),['pohja','nuppi']);
A.deepStrictEqual(KK.ilTilat('mittari').map(function(x){return x[0];}),['pohja','tayto']);
A.deepStrictEqual(KK.ilTilat('muoto').map(function(x){return x[0];}),['perus','vaihto']);
A.strictEqual(KK.ilTilat('pkuva'),null);A.strictEqual(KK.ilTilat('laatat'),null);A.strictEqual(KK.ilTilat('kaava'),null);

// --- Kunnostus ja tallennus ---
(function(){var P=KK.newProject('k'),a=KK.pxUusi(P,'Nappi',16,8),c=KK.pxUusi(P,'Alas',16,8);
  var n=KK.addBlock(P,'nappi',{v:vw(P)});n.il={t:{perus:a,painettu:c,kisko:a,valittu:'huono',harmaa:5},yp:true,nt:'x',muu:1};KK.repair(P);
  A.deepStrictEqual(n.il,{t:{perus:a,painettu:c},yp:true},'vain lajin tilat ja kelvolliset tunnisteet');
  var m=KK.addBlock(P,'muoto',{v:vw(P)});m.il={t:{}};var q=KK.addBlock(P,'pkuva',{v:vw(P)});q.il={t:{perus:a}};var l=KK.addBlock(P,'kaava',{});l.il={t:{perus:a}};
  var s=KK.addBlock(P,'saadin',{v:vw(P)});s.il='x';KK.repair(P);
  A.deepStrictEqual(m.il,{t:{}},'Piirros ilman piirroksia säilyy');A.ok(!('il' in q)&&!('il' in l)&&!('il' in s),'ei kelpaa');
  A.deepStrictEqual(rt(P).b[n.id].il,n.il,'tallentuu');
  var o=KK.addBlock(P,'nappi',{v:vw(P)});KK.repair(P);A.ok(!('il' in o),'uusi palikka ennallaan');})();

// --- Ominaisuus ilme ---
(function(){var P=KK.newProject('o'),a=KK.pxUusi(P,'Seisoo',8,8),h=KK.pxUusi(P,'Hyppy',8,8);
  var b=KK.addBlock(P,'muoto',{v:vw(P)});KK.repair(P);A.ok(!KK.omFind(b,'ilme'),'ei ilmettä ilman perus-piirrosta');
  b.il={t:{vaihto:a}};KK.repair(P);A.ok(!KK.omFind(b,'ilme'));
  b.il={t:{perus:a}};KK.repair(P);var e=KK.omFind(b,'ilme');A.ok(e&&e.o,'ilme ohjattava');A.strictEqual(KK.omBase(P,b,e,null),'Seisoo');
  A.strictEqual(KK.Ev(P,C).omiVal(b.id,'ilme'),'Seisoo');
  P.px[a]={n:'Paikallaan',w:8,h:8,d:P.px[a].d};A.strictEqual(KK.Ev(P,C).omiVal(b.id,'ilme'),'Paikallaan','seuraa nimeä');
  A.strictEqual(KK.ilNimesta(P,'hyppy'),h,'nimi kirjainkoosta riippumatta');A.strictEqual(KK.ilNimesta(P,'px:'+h),h);A.strictEqual(KK.ilNimesta(P,h),h);A.strictEqual(KK.ilNimesta(P,'Lento'),'');A.strictEqual(KK.ilNimesta(P,'"Hyppy"'),h,'lainausmerkit pois');
  // Aseta ja Palauta (toiminnot)
  var p=KK.addBlock(P,'nappi',{v:vw(P)});var na=KK.addNode(P,p.id,0,0);
  var t=KK.addBlock(P,'tee',{do:'aseta',o:b.id,om:'ilme',v:'Hyppy'});var nt=KK.addNode(P,t.id,300,0);KK.addLink(P,na.id,'e',nt.id,'e');KK.repair(P);
  var tp=KK.addBlock(P,'tee',{do:'palauta',o:b.id,om:'ilme'});KK.repair(P);
  KK.fire(P,p.id,'e',C);A.strictEqual(KK.Ev(P,C).omiVal(b.id,'ilme'),'Hyppy','Aseta vaihtaa ilmeen');
  A.strictEqual(KK.ilNimesta(P,KK.Ev(P,C).omiVal(b.id,'ilme')),h);})();

// --- Poisto ja kopio ---
(function(){var P=KK.newProject('p'),a=KK.pxUusi(P,'A',8,8),c=KK.pxUusi(P,'C',8,8);P.px[c].d='e'+P.px[c].d.slice(1);
  var n=KK.addBlock(P,'nappi',{v:vw(P)});n.il={t:{perus:a,painettu:c}};KK.repair(P);
  A.strictEqual(KK.pxKayttajat(P,c).length,1);var clip=KK.copyBlocks(P,[n.id]);A.ok(clip.px[a]&&clip.px[c],'kopio kantaa tilojen piirrokset');
  var Q=KK.newProject('q');KK.pxUusi(Q,'Muu',4,4);var ids=KK.pasteBlocks(Q,JSON.parse(JSON.stringify(clip)),vw(Q),0,0);var nb=Q.b[ids[0]];
  A.deepStrictEqual(nb.il.t,{perus:'d2',painettu:'d3'});A.strictEqual(Q.px.d3.d,P.px[c].d);
  var il0=n.il;KK.pxPoista(P,c);A.deepStrictEqual(n.il.t,{perus:a},'poisto tyhjentää tilan');A.ok(n.il!==il0,'uusi olio');})();
console.log('logiikka_116 ok');
