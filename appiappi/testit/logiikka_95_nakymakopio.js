// Jonon 25 (b, c): näkymän palikoiden kopio ja liitos (KK.copyBlocks/pasteBlocks) ja nimen sekä viitteen numerointi.
var KK=require('./moottori.js'),A=require('assert');
var P=KK.newProject('T');var v=P.views[0].id;
function U(k,o,nm){o=o||{};o.v=v;var b=KK.addBlock(P,k,o);if(nm)KK.setName(P,b.id,nm);return b;}

// (c) Nimi: lopun numero kasvaa, ei ”Arvo 1 2”. Viite samoin.
var a1=U('arvo',{},'Arvo 1');A.strictEqual(a1.nm,'Arvo 1');A.strictEqual(a1.vt,'arvo1');
var a2=KK.addBlock(P,'arvo',{nm:'Arvo 1'});A.strictEqual(a2.nm,'Arvo 2');A.strictEqual(a2.vt,'arvo2');
var a3=KK.addBlock(P,'arvo',{nm:'Arvo 1'});A.strictEqual(a3.nm,'Arvo 3','vapaa seuraava numero');
A.strictEqual(KK.uniqueName(P,'Arvo'),'Arvo','vapaa nimi ennallaan');
var x=U('arvo',{},'Arvo');A.strictEqual(KK.uniqueName(P,'Arvo'),'Arvo 4','numerolla alkavista seuraava vapaa');
A.strictEqual(KK.uniqueVt(P,'arvo1'),'arvo4','viite: arvo1 → seuraava vapaa');
A.strictEqual(KK.uniqueVt(P,'uni'),'uni','vapaa viite ennallaan');
U('arvo',{},'Uni');A.strictEqual(KK.uniqueVt(P,'uni'),'uni2','numeroton viite saa 2');
U('arvo',{},'Jos');A.ok(/^jos_\d+$/.test(P.b[Object.keys(P.b).pop()].vt),'varattu sana ennallaan jos_N');

// (b) Kopio ja liitos: samat asetukset, omat nimet ja viitteet, kopioitujen väliset viittaukset uusiin, muut ennallaan.
var m=U('muisti',{},'Pisteet');
var n=U('nappi',{t:'Lisää {#'+m.id+'}',hue:3},'Nappi 1');n.x=10;n.y=20;n.w=100;n.h=40;
var t=U('teksti',{t:'Nappi: {#'+n.id+'.tila}',nk:{r:n.id}},'Otsikko');t.x=10;t.y=80;t.vt='otsake';t.vtSet=true;
var clip=KK.copyBlocks(P,[n.id,t.id,m.id]);
A.deepStrictEqual(clip.ord,[n.id,t.id],'vain näkymän palikat kopioituvat');
var ids=KK.pasteBlocks(P,clip,v,20,20);A.strictEqual(ids.length,2);
var n2=P.b[ids[0]],t2=P.b[ids[1]];
A.strictEqual(n2.nm,'Nappi 2');A.strictEqual(n2.vt,'nappi2');A.strictEqual(n2.hue,3);A.strictEqual(n2.x,30);A.strictEqual(n2.y,40);A.strictEqual(n2.w,100);
A.strictEqual(n2.t,'Lisää {#'+m.id+'}','viittaus kopioimattomaan ennallaan');
A.strictEqual(t2.t,'Nappi: {#'+n2.id+'.tila}','viittaus kopioituun osoittaa uuteen');
A.strictEqual(t2.nk.r,n2.id,'nuolen viite uuteen');
A.strictEqual(t2.nm,'Otsikko 2');A.strictEqual(t2.vt,'otsake2');A.ok(t2.vtSet,'itse asetettu viite numeroituu');
A.strictEqual(t.nk.r,n.id,'alkuperäinen ennallaan');
// Toiseen näkymään: kerros, jota siellä ei ole, putoaa pohjalle.
P.views.push({id:'v2',n:'Näkymä 2'});P.views[0].kr=[{id:'k1',n:'Taso'}];n.kr='k1';
var i2=KK.pasteBlocks(P,KK.copyBlocks(P,[n.id]),'v2',0,0);A.strictEqual(P.b[i2[0]].v,'v2');A.ok(!P.b[i2[0]].kr,'tuntematon kerros pois');
var i3=KK.pasteBlocks(P,KK.copyBlocks(P,[n.id]),v,0,0);A.strictEqual(P.b[i3[0]].kr,'k1','sama näkymä: kerros säilyy');
// Toisesta projektista: viittaukset muihin kuin kopioituihin tyhjenevät.
var Q=KK.newProject('Q');var j=KK.pasteBlocks(Q,KK.copyBlocks(P,[t.id]),Q.views[0].id,0,0);var tq=Q.b[j[0]];
A.deepStrictEqual(tq.nk,{m:'aina'});A.strictEqual(tq.t,'Nappi: ');A.strictEqual(tq.nm,'Otsikko');
console.log('ok');
