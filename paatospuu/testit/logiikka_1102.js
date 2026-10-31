'use strict';
// Juuri 1.102 (Emil 31.10.2026): sanalinkit muistiinpanojen välille (5 alkukirjainta, estot, sallinta).
const A=require('assert'),E=require('./engine');
A.equal(E.wlKey('Kokouksen'),'kokou');A.equal(E.wlKey('kokous'),'kokou');A.equal(E.wlKey('talo'),'=talo');A.equal(E.wlKey('jo'),'');A.equal(E.wlKey('2026'),'');
A.equal(E.wlKey('kirja',4),'kirj');
const N=(id,text,arch)=>({id,text,arch});
const notes=[N('a','Kokous huomenna. Talo ja kirja.'),N('b','Kokouksen muistio: talo myytiin.'),N('c','Kirje mummolle, olisivat iloisia'),N('d','olisi kokousmuistio'),N('e','Arkistoitu kokous','2026-10-01')];
let O=E.wlOpt({}),I=E.wlIndex(notes,O);
A.equal(I.n,4);
const hits=(id,o)=>E.wlHits(notes.find(n=>n.id===id).text,E.wlIndex(notes,o||O),o||O,id).map(h=>h.w);
// Kokous ↔ Kokouksen ↔ kokousmuistio; talo kokonaisena; kirja ≠ kirje 5 kirjaimella; huomenna ja olisi/olisivat estetty; arkistoitu ei
A.deepEqual(hits('a'),['Kokous','Talo']);
A.deepEqual(E.wlHits('Kokous huomenna. Talo ja kirja.',I,O,'a')[0].ids,['b','d']);
A.deepEqual(hits('c'),[]);
// 4 kirjainta: kirja ↔ Kirje
let O4=E.wlOpt({wlk:'4'});A.deepEqual(hits('a',O4).includes('kirja'),true);
// Oma esto ja sallinta
A.deepEqual(hits('a',E.wlOpt({wlno:'kokouksessa'})),['Talo']);
A.deepEqual(hits('c',E.wlOpt({wlyes:'olisi'})),['olisivat']);
// Pois päältä
A.deepEqual(hits('a',E.wlOpt({wl:'off'})),[]);
// Yleisyysraja: sana kaikissa 10 muistiinpanossa ei linkity, ellei sallittu
const many=[];for(let i=0;i<10;i++)many.push(N('m'+i,'Projekti numero '+i+(i<2?' harvinainen':'')));
let I2=E.wlIndex(many,O);A.deepEqual(E.wlHits(many[0].text,I2,O,'m0').map(h=>h.w),['harvinainen']);
let Oy=E.wlOpt({wlyes:'projekti'});A.deepEqual(E.wlHits(many[0].text,E.wlIndex(many,Oy),Oy,'m0').map(h=>h.w),['Projekti','harvinainen']);
console.log('1.102: sanalinkkien avaimet, estot ja sallinta OK');
