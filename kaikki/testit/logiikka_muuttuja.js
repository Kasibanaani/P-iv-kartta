/* Kaikki 0.65: tekstimuuttujat !!nimi: arvo!! ja !!päivät: nimi: arvo!! (Emilin päätökset 23.11.2026, SUUNNITELMA jonon kohta 3). */
'use strict';
const A=require('assert/strict'),{MUUTTUJA:M}=require('./engine.js');
const B=new Date(2026,10,23,12);
const P=(t,b)=>M.parse(t,b||B).map(o=>({nimi:o.nimi,arvo:o.arvo,luku:o.luku,paivat:o.paivat,lahde:o.lahde,syy:o.syy,teksti:t.slice(o.s,o.e)}));
// välilyönti kaksoispisteen ympärillä ei vaikuta
let r=P('!!Mieliala:6!! ja !!Mieliala: 6!!');A.equal(r.length,2);A.deepEqual([r[0].nimi,r[0].luku],[r[1].nimi,r[1].luku]);A.equal(r[0].luku,6);
// nimen välilyönnit, sulkeet ja ääkköset säilyvät; desimaalipilkku ja -piste
r=P('!!Uni (h): 8,5!! !!Työn kuormittavuus: 7.25!!');A.equal(r[0].nimi,'Uni (h)');A.equal(r[0].luku,8.5);A.equal(r[1].nimi,'Työn kuormittavuus');A.equal(r[1].luku,7.25);
// tekstiarvo, myös toisella kaksoispisteellä; ei-numeerinen ei ole luku
r=P('!!Muistutus: klo 9: lääkäri!!');A.equal(r[0].nimi,'Muistutus');A.equal(r[0].arvo,'klo 9: lääkäri');A.equal(r[0].luku,null);
A.equal(P('!!Paino: 72 kg!!')[0].luku,null,'yksikkö arvossa = teksti');A.equal(P('!!Muutos: −0,2!!')[0].luku,-0.2);
// keskeneräinen, rivinvaihto, välilyönti avaavan jälkeen, ei kaksoispistettä, koodi
A.deepEqual(P('!!Uni: 8'),[]);A.deepEqual(P('!!Uni: 8\nseuraava!!'),[]);A.deepEqual(P('Hienoa!! Huom: tämä!!'),[]);A.deepEqual(P('Wau!!! Mahtavaa!!'),[]);
A.deepEqual(P('```\n!!Uni: 8!!\n```\nja `!!a: 1!!`'),[]);A.equal(P('```\n!!Uni: 8!!\n```\n!!Uni: 7!!')[0].luku,7);
A.deepEqual(P('!!: 8!! !!Uni: !!'),[]);
// havainnon omat päivät: lista, täytesanat ja erottimet, sama päivä vain kerran
r=P('!!1.4., 2.4. ja 3.4.: Työn kuormittavuus: 9!!');A.deepEqual(r[0].paivat,['2026-04-01','2026-04-02','2026-04-03']);A.equal(r[0].lahde,'merkintä');A.equal(r[0].nimi,'Työn kuormittavuus');A.equal(r[0].luku,9);
r=P('!!1.4. ja 1.4.2026: Uni: 6!!');A.deepEqual(r[0].paivat,['2026-04-01']);
r=P('!!2026-04-01: Mittarin nimi: 9!!');A.deepEqual(r[0].paivat,['2026-04-01']);A.equal(r[0].nimi,'Mittarin nimi');
r=P('!!eilen: Uni: 7!!');A.deepEqual(r[0].paivat,['2026-11-22']);
// vuodeton päivä ei mene tulevaan (havainto); viikonpäivän kanssa kuten kalenterissa
A.deepEqual(P('!!20.11.: Uni: 7!!')[0].paivat,['2026-11-20']);
// päivätty muoto vaatii vielä nimen ja arvon; muuten etuosa on nimi
r=P('!!1.4.: 5!!');A.equal(r[0].nimi,'1.4.');A.deepEqual(r[0].paivat,[]);
// osion yksi päivä (kuten kalenterissa), ei päivää, useita päiviä; merkinnän oma päivä ohittaa osion (vuodeton 2.12. ennen 23.11. luotuna = viime vuosi)
const T='Palaveri ma 30.11.\n!!Jännitys: 7!! !!2.12.: Jännitys: 3!!\n---\nEi päivää !!Fiilis: ok!!\n---\n1.12. ja 2.12. !!Fiilis: x!!\n---\nJoka maanantai !!Fiilis: y!!';
r=P(T);A.deepEqual(r.map(o=>[o.paivat,o.lahde,o.syy]),[[['2026-11-30'],'osio',''],[['2025-12-02'],'merkintä',''],[[],'','ei'],[[],'','monta'],[[],'','monta']]);
// ISO-päivä tekstissä (päivämuistiinpanon otsikko) on osion päivä
r=P('2026-11-23\n\nNukuin hyvin !!Uni: 8!!');A.deepEqual(r[0].paivat,['2026-11-23']);A.equal(r[0].lahde,'osio');
// merkinnän päivät eivät ole osion päiviä (kaksi merkintää eri päivillä ei tee osiosta monipäiväistä)
r=P('!!1.11.: Uni: 7!! !!2.11.: Uni: 8!! !!Mieliala: 5!!');A.equal(r[2].syy,'ei');
// mask: merkinnät välilyönneiksi (kalenteri ei näe niiden päiviä), pituus säilyy
const s='a !!1.4.: Uni: 8!! b';A.equal(M.mask(s).length,s.length);A.ok(!/1\.4/.test(M.mask(s)));A.equal(M.mask('ei merkintää 1.4.'),'ei merkintää 1.4.');
// luettelo: nimi isot/pienet kirjaimet ja välilyönnit yhdistyvät, aakkosjärjestys, havainnot muistiinpanoittain
const L=M.luettelo([{text:'!!Uni: 8!! !!mieliala: 5!!',created:'2026-11-22T08:00:00'},{text:'!!uni:  6,5!!\n!!Uni  : 7!!',created:'2026-11-23T08:00:00'},{text:'ei mitään'}]);
A.deepEqual(L.map(g=>[g.nimi,g.obs.length]),[['mieliala',1],['Uni',3]]);
const nums=L[1].obs.map(x=>x.o.luku);A.deepEqual(nums,[8,6.5,7]);
// Esimerkki suunnitelmasta: uni 8 ja 6,5 → keskiarvo 7,25, havaintoja 2
const L2=M.luettelo([{text:'!!uni: 8!!'},{text:'!!uni: 6,5!!'},{text:'!!uni: !!'}]);A.equal(L2[0].obs.length,2);A.equal(L2[0].obs.reduce((a,x)=>a+x.o.luku,0)/2,7.25);
// kirjattu nolla on luku
A.equal(P('!!Kahvit: 0!!')[0].luku,0);
console.log('logiikka_muuttuja ok');
