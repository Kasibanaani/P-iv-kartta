// Versio 4: sijainnit, alueet, alkukohta, rullaus ja Siirry vierien / heti.
// Moottorin osuus: palikkalajit ja portit, Siirry välittää siirtymän tavan, repair korjaa rikkinäiset
// arvot ja säilyttää vanhan projektin (vanha paikkamerkki = vasen yläkulma) ennallaan.
var KK=require('./moottori.js'),A=require('assert');
var T=new Date(2026,9,14,21,0);var navs=[];var C={now:function(){return T;},toast:function(){},nav:function(n){navs.push(n);}};
function N(P,b,g){return KK.addNode(P,b.id,0,0,g||'');}

// --- Lajit ja portit ---
var P=KK.newProject('sijainnit');
var m=KK.addBlock(P,'merkki',{kk:'keski',zz:0.8}),a=KK.addBlock(P,'alue');
A.strictEqual(m.nm,'Sijainti');A.strictEqual(a.nm,'Alue');
A.strictEqual(KK.addBlock(P,'merkki').nm,'Sijainti 2','toinen sijainti saa oman nimen');
A.deepStrictEqual(KK.ports(m),{ins:[],outs:[]},'sijainnilla ei ole kytkentäkohtia');
A.deepStrictEqual(KK.ports(a).ins,[],'alueella ei ole tulokohtia');A.deepStrictEqual(KK.ports(a).outs.map(function(o){return o.p;}),['v','n','e','ulos'],'Appi-appi 2: alueella sisällä, montako, astuttu, poistuttu');
A.strictEqual(a.w,640);A.strictEqual(a.h,420);
A.strictEqual(m.kk,'keski');A.strictEqual(m.zz,0.8);

// --- Siirry: tapa kulkee mukana, oletus vierien ---
var nap=KK.addBlock(P,'nappi',{beh:'kerta'});
var g1=KK.addBlock(P,'tee',{do:'siirry',o:m.id}),g2=KK.addBlock(P,'tee',{do:'siirry',o:a.id,tapa:'heti'});
var nn=N(P,nap),n1=N(P,g1),n2=N(P,g2);KK.addLink(P,nn.id,'e',n1.id,'e');KK.addLink(P,n1.id,'e',n2.id,'e');
KK.repair(P);KK.tick(P,C);navs=[];
KK.press(P,nap.id,C);
A.strictEqual(navs.length,2,'kaksi siirtoa ketjussa');
A.strictEqual(navs[0].o,m.id);A.ok(!('heti' in navs[0]),'oletus on vierien, eikä vanha viesti muutu');
A.strictEqual(navs[1].o,a.id);A.strictEqual(navs[1].heti,true,'heti välittyy');
var dsc=KK.descAct(P,g2.id);A.ok(/Siirry → Alue \(heti\)/.test(dsc),dsc);A.ok(!/heti/.test(KK.descAct(P,g1.id)),'vierien ei näy kuvauksessa');

// --- Näkymän asetukset: alku, rul, alue ---
var v=P.views[0];v.alku=m.id;v.rul='alue';v.alue=a.id;
KK.repair(P);A.deepStrictEqual([v.alku,v.rul,v.alue],[m.id,'alue',a.id],'kelvolliset säilyvät');
v.rul='lukko';v.alue=m.id;KK.repair(P);
A.strictEqual(v.rul,undefined,'tuntematon rullaus pois');A.strictEqual(v.alue,undefined,'aloitusalueen pitää olla alue');
P.views.push({id:'v2',n:'Toinen'});v.alku=m.id;m.v='v2';KK.repair(P);
A.strictEqual(v.alku,undefined,'alkukohdan pitää olla saman näkymän sijainti');
m.v='v1';

// --- Rikkinäiset kentät ---
m.kk='ylos';m.zz=99;g1.tapa='hyppy';KK.repair(P);
A.strictEqual(m.kk,undefined);A.strictEqual(m.zz,undefined);A.strictEqual(g1.tapa,undefined);
m.zz='0.5';KK.repair(P);A.strictEqual(m.zz,undefined,'zoomaus vain lukuna');

// --- Poisto: alkukohdan ja aloitusalueen viittaus katoaa ---
v.alku=m.id;v.alue=a.id;KK.removeBlock(P,m.id);KK.removeBlock(P,a.id);KK.repair(P);
A.strictEqual(v.alku,undefined);A.strictEqual(v.alue,undefined);

// --- Vanha projekti (versio 3): paikkamerkki ilman uusia kenttiä pysyy ennallaan ---
var old=KK.newProject('vanha');var om=KK.addBlock(old,'merkki',{nm:'Paikkamerkki'});delete om.kk;
var before=JSON.stringify(old);KK.repair(old);
A.strictEqual(JSON.stringify(old),before,'repair ei muuta vanhaa projektia');
A.strictEqual(om.kk,undefined,'vanha merkki ei saa keski-kohdistusta oletuksena');
A.strictEqual(om.nm,'Paikkamerkki','vanha nimi säilyy');

A.ok(KK.VER>=4,"versio vähintään 4");
console.log('ok logiikka_07_sijainnit');
