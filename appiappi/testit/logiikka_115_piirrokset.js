// Jono 20 (F35 vaihe E1, 21.10.2026): piirroskirjasto P.px. Kunnostus, uusi piirros ja nimet, koon muutos ja kääntö,
// viitteet (Kuvan kuva, kuvasarja, laattalaji), poisto kirjastosta, kopio toiseen projektiin, presetti ja näkymän Pikselitarkka.
var KK=require('./moottori.js'),A=require('assert');
function vw(P){return P.views[0].id;}
function rt(P){return KK.repair(JSON.parse(JSON.stringify(P)));}

// --- Uusi piirros, nimet ja kunnostus ---
(function(){var P=KK.newProject('a');var id=KK.pxUusi(P,'Hahmo',16,8);A.strictEqual(id,'d1');var x=P.px[id];
  A.deepStrictEqual([x.n,x.w,x.h,x.d.length],['Hahmo',16,8,128]);A.ok(/^\.+$/.test(x.d),'tyhjä = läpinäkyvä');
  var id2=KK.pxUusi(P,'hahmo',8,8);A.strictEqual(P.px[id2].n,'hahmo 2','nimi yksilöllinen');A.strictEqual(KK.pxUusi(P,'',99,0),'d3');A.deepStrictEqual([P.px.d3.n,P.px.d3.w,P.px.d3.h],['Piirros',64,16]);
  P.px.d4={n:'Rikki',w:3,h:2,d:'abZ'};P.px.d5='x';P.px.zz={n:'a',w:1,h:1,d:'a'};P.px.d6={n:'Iso',w:500,h:1,d:'a'};KK.repair(P);
  A.deepStrictEqual(P.px.d4,{n:'Rikki',w:3,h:2,d:'ab....'},'tuntematon merkki ja puuttuvat → läpinäkyvä');A.ok(!P.px.d5&&!P.px.zz,'rikki ja väärä tunniste pois');
  A.deepStrictEqual([P.px.d6.w,P.px.d6.d.length],[64,64]);A.ok(KK.pxValid(P.px.d1));
  var Q=KK.newProject('b');Q.px={};KK.repair(Q);A.ok(!('px' in Q),'tyhjä kirjasto pois');Q.px=[1];KK.repair(Q);A.ok(!('px' in Q));
  A.deepStrictEqual(rt(P).px,P.px,'tallentuu');})();

// --- Koko ja kääntö ---
(function(){var x={n:'k',w:3,h:2,d:'abc...'};A.deepStrictEqual(KK.pxKoko(x,2,3),{n:'k',w:2,h:3,d:'ab....'});A.deepStrictEqual(KK.pxKaanna(x).d,'cba...');
  A.deepStrictEqual(KK.PX_KOOT,[8,16,32,64]);A.strictEqual(KK.PX_MERKIT.length,24,'8 väriä × 3 sävyä');})();

// --- Viitteet: Kuva, kuvasarja, laattalaji ---
(function(){var P=KK.newProject('v'),id=KK.pxUusi(P,'Kissa',8,8);
  var k=KK.addBlock(P,'pkuva',{v:vw(P)});k.src='px:'+id;k.sarja=['px:'+id,'px:zz','<svg viewBox="0 0 1 1"></svg>'];
  var m=KK.addBlock(P,'laatat',{v:vw(P)});m.lj=[{c:'1',n:'Seinä',hue:0,t:'kiintea',px:id},{c:'2',n:'Koriste',hue:4,t:'lapi',px:'huono'}];KK.repair(P);
  A.deepStrictEqual(k.sarja,['px:'+id,'<svg viewBox="0 0 1 1"></svg>'],'kelvoton piirrosviite pois sarjasta');
  A.strictEqual(m.lj[0].px,id,'lajin piirros säilyy');A.ok(!('px' in m.lj[1]),'virheellinen px pois');
  A.strictEqual(KK.kuvaUrl('px:'+id),'px:'+id,'ilman käyttöliittymää viite sellaisenaan');A.strictEqual(KK.kuvaUrl('px:'),'');
  KK.setPxUrl(function(q){return q===id?'data:image/png;base64,AA':'';});A.strictEqual(KK.kuvaUrl('px:'+id),'data:image/png;base64,AA');A.strictEqual(KK.kuvaUrl('px:d9'),'');
  KK.repair(P);A.strictEqual(k.sarja.length,2,'sarja ei riipu kuvan teosta');KK.setPxUrl(null);
  A.deepStrictEqual(KK.pxKayttajat(P,id).map(function(b){return b.id;}).sort(),[k.id,m.id].sort());
  var lj0=m.lj;A.strictEqual(KK.pxPoista(P,id),3,'kolme viitettä');A.ok(!P.px,'kirjasto tyhjä');A.strictEqual(k.src,'');A.deepStrictEqual(k.sarja,['<svg viewBox="0 0 1 1"></svg>']);
  A.ok(!('px' in m.lj[0])&&m.lj!==lj0,'laji ilman piirrosta, uusi taulukko (piirto huomaa)');})();

// --- Kopio toiseen projektiin ja presetti ---
(function(){var P=KK.newProject('p'),id=KK.pxUusi(P,'Kolikko',8,8);P.px[id].d='e'+P.px[id].d.slice(1);
  var k=KK.addBlock(P,'pkuva',{v:vw(P)});k.src='px:'+id;var m=KK.addBlock(P,'laatat',{v:vw(P)});m.lj=[{c:'1',n:'K',hue:2,t:'lapi',px:id}];KK.repair(P);
  var clip=KK.copyBlocks(P,[k.id,m.id]);A.ok(clip.px&&clip.px[id],'kopio kantaa piirroksen');
  var ids=KK.pasteBlocks(P,clip,vw(P),20,20);A.strictEqual(Object.keys(P.px).length,1,'samassa projektissa sama piirros');A.strictEqual(P.b[ids[0]].src,'px:'+id);
  var Q=KK.newProject('q'),q1=KK.pxUusi(Q,'Muu',4,4);var qi=KK.pasteBlocks(Q,JSON.parse(JSON.stringify(clip)),vw(Q),0,0);
  var nk=Q.b[qi[0]],nm=Q.b[qi[1]];A.strictEqual(nk.src,'px:d2','toisessa projektissa d1 on varattu → uusi tunniste');A.strictEqual(nm.lj[0].px,'d2','kartta samaan uuteen');
  A.deepStrictEqual([Q.px.d2.n,Q.px.d2.d],[P.px[id].n,P.px[id].d]);A.strictEqual(Q.px[q1].n,'Muu','vanha ennallaan');
  KK.pasteBlocks(Q,JSON.parse(JSON.stringify(clip)),vw(Q),0,0);A.strictEqual(Object.keys(Q.px).length,2,'toinen liitos ei kahdenna');
  var pr=KK.presetMake(P,[k.id],[],{nm:'Kolikko'});A.ok(pr.px&&pr.px[id]);var R=KK.newProject('r'),o=KK.presetPaste(R,JSON.parse(JSON.stringify(pr)),{v:vw(R)});
  A.strictEqual(R.b[o.b[0]].src,'px:d1');A.strictEqual(R.px.d1.d,P.px[id].d,'presetti tuo piirroksen');})();

// --- Pikselitarkka näkymän asetuksena ---
(function(){var P=KK.newProject('n');P.views[0].pxt=true;KK.repair(P);A.strictEqual(P.views[0].pxt,true);P.views[0].pxt='kyllä';KK.repair(P);A.ok(!('pxt' in P.views[0]));})();
console.log('logiikka_115 ok');
