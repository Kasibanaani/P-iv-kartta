// Jonon 5 (F27 kohta 1): kaavan tuntematon nimi ja Arvo-palikan luonti nimestä (moottori). Synteettinen sisältö.
// Luotu Arvo saa nimen ja viitteen sanasta, arvo tyhjä; odottava {?nimi} sitoutuu siihen ja kaava toimii heti.
// Varattu sana, funktio, käytössä oleva viite tai epäkelpo nimi ei tarjoa luontia.
var KK=require('./moottori.js'),A=require('assert');
var T=new Date(2026,9,17,12,0);var C={now:function(){return T;},toast:function(){},nav:function(){}};
function V(P,b,p){return KK.Ev(P,C).val(b.id,p);}
var P=KK.newProject('luo');
var u=KK.addBlock(P,'luku',{nm:'Uni'});KK.addNode(P,u.id,0,0,'');KK.userSet(P,u.id,8,C);
var k=KK.addBlock(P,'kaava');k.f=KK.kaavaToIds(P,'uni + yöuni + tänään.vuosi + kello.tunti');KK.addNode(P,k.id,0,80,'');KK.repair(P);
// Tuntemattomat: yöuni (ei ominaisuutta perässä). kello.tunti ei ole luontiehdokas, tänään on varattu.
A.deepStrictEqual(KK.kaavaMiss(k.f),['yöuni']);
A.strictEqual(KK.canLuo(P,'yöuni'),true);
['uni','tänään','nyt','ei','jos','sisältää','2x','a b',''].forEach(function(n){A.strictEqual(KK.canLuo(P,n),false,'ei luontia: '+n);});
// Luonti
var b=KK.luoArvo(P,'Yöuni');
A.strictEqual(b.k,'arvo');A.strictEqual(b.nm,'Yöuni');A.strictEqual(b.vt,'yöuni');A.strictEqual(b.v,'','arvo tyhjä');
A.ok(k.f.indexOf('{#'+b.id+'}')>=0,'kaava sitoutui uuteen palikkaan: '+k.f);
A.deepStrictEqual(KK.kaavaMiss(k.f),[]);
A.strictEqual(KK.luoArvo(P,'yöuni'),null,'toista samaa ei luoda');
// Kaava toimii heti: arvo annetaan, summa lasketaan
var k2=KK.addBlock(P,'kaava');k2.f=KK.kaavaToIds(P,'pituus * 2');KK.addNode(P,k2.id,0,160,'');KK.repair(P);
A.ok(KK.isErr(V(P,k2)),'ennen luontia virhe');
var pb=KK.luoArvo(P,'pituus');pb.v='21';KK.repair(P);
A.strictEqual(V(P,k2),42,'kaava toimii luodulla arvolla');
// Nimen vaihto ei riko viitettä (viite seuraa nimeä)
KK.setName(P,pb.id,'Pituus cm');A.strictEqual(V(P,k2),42);A.strictEqual(KK.kaavaToText(P,k2.f),'pituuscm * 2');
// Toiminnon Lisää rivi -kenttä (kv) sitoutuu samoin
var t=KK.addBlock(P,'taulu',{});KK.addNode(P,t.id,0,240,'');var col=KK.addCol(t,'Paino','luku');var cid=typeof col==='string'?col:col.id;
var tee=KK.addBlock(P,'tee',{do:'lisaarivi',o:t.id});KK.addNode(P,tee.id,0,320,'');tee.kv={};tee.kv[cid]=KK.kaavaToIds(P,'paino + 1');KK.repair(P);
A.deepStrictEqual(KK.kaavaMiss(tee.kv[cid]),['paino']);
var pa=KK.luoArvo(P,'paino');A.strictEqual(tee.kv[cid],'{#'+pa.id+'} + 1');
// Pitkä nimi: viite pysyy sanana
var pit='abcdefghijklmnopqrstuvwxyz_pitka';var lb=KK.luoArvo(P,pit);A.strictEqual(lb.vt,pit);A.strictEqual(lb.vtSet,true);
// Viitevirhe: poistetun tilalle uusi Arvo samalla nimellä ja relink
var Q=KK.newProject('pois');var m=KK.addBlock(Q,'luku',{nm:'Askel'});var tx=KK.addBlock(Q,'nayta',{v:Q.views[0].id});tx.tx=KK.toIds(Q,'Askelia {askel}');
KK.addNode(Q,m.id,0,0,'');KK.removeBlock(Q,m.id);A.ok(KK.isGone(Q,m.id));A.strictEqual(KK.goneName(Q,m.id),'askel');
var na=KK.luoArvo(Q,KK.goneName(Q,m.id));KK.relink(Q,tx.id,m.id,na.id);A.strictEqual(tx.tx,'Askelia {#'+na.id+'}');
A.strictEqual(KK.brokenRefs(Q).length,0);
console.log('ok');
