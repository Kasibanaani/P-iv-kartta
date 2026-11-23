/* Kaikki 0.66: kojelaudan muuttujaruutu (SUUNNITELMA jonon kohta 3: muistiinpanokentät inforuutujen lähteenä). */
'use strict';
const A=require('assert/strict'),{MUUTTUJA:M}=require('./engine.js');
const T='2026-11-23',n=(text,extra)=>Object.assign({text:text,created:'2026-11-23T12:00:00'},extra||{});
// Suunnitelman esimerkki: uni 8 ja 6,5 → keskiarvo 7,25, havaintoja 2; tyhjä ohitetaan, nolla lasketaan
const notes=[n('!!22.11.: Uni: 8!!',{vp:'paivat/2026/a.md'}),n('!!21.11.: uni: 6,5!! !!Uni: !!',{vp:'inbox/b.md'})];
let r=M.ruutu(notes,{muuttuja:'Uni',laske:'keskiarvo'},T);A.equal(r.arvo,7.25);A.equal(r.pisteet,2);A.equal(r.lahteet.length,2);
A.equal(M.ruutu(notes,{muuttuja:'uni',laske:'maara'},T).arvo,2);
A.equal(M.ruutu(notes,{muuttuja:'Uni',laske:'summa'},T).arvo,14.5);
A.equal(M.ruutu(notes,{muuttuja:'Uni',laske:'min'},T).arvo,6.5);A.equal(M.ruutu(notes,{muuttuja:'Uni',laske:'max'},T).arvo,8);
r=M.ruutu(notes,{muuttuja:'Uni',laske:'viimeisin'},T);A.equal(r.arvo,8);A.equal(r.viimeisin.d,'2026-11-22');
A.equal(M.ruutu(notes.concat([n('!!20.11.: Uni: 0!!')]),{muuttuja:'Uni',laske:'keskiarvo'},T).arvo,14.5/3,'nolla lasketaan');
// kansio
r=M.ruutu(notes,{muuttuja:'Uni',laske:'maara',kansio:'paivat'},T);A.equal(r.arvo,1);
A.equal(M.ruutu(notes,{muuttuja:'Uni',laske:'maara',kansio:'/inbox/'},T).arvo,1);
// tunniste tekstistä tai alkutiedoista
const tg=[n('#arki !!22.11.: Uni: 7!!'),n('!!22.11.: Uni: 5!!',{vfm:['tagit: [arki, uni]']}),n('!!22.11.: Uni: 9!!')];
A.equal(M.ruutu(tg,{muuttuja:'Uni',laske:'summa',tunniste:'#Arki'},T).arvo,12);
// aikaväli: 7 pv = 17.–23.11.; päivätön ja tuleva eivät mukana; Kaikki ottaa päivättömän
const ai=[n('!!16.11.: Uni: 1!! !!17.11.: Uni: 2!! !!23.11.: Uni: 3!! !!Uni: 4!!',{created:'2026-11-23T12:00:00'}),n('!!2026-11-30: Uni: 5!!')];
A.equal(M.ruutu(ai,{muuttuja:'Uni',laske:'summa',aika:'7'},T).arvo,5);
A.equal(M.ruutu(ai,{muuttuja:'Uni',laske:'summa'},T).arvo,15);
A.equal(M.ruutu(ai,{muuttuja:'Uni',laske:'viimeisin'},T).arvo,5,'kaikki: myöhäisin päivä, myös tuleva');
// useampi päivä samasta merkinnästä = piste kullekin päivälle; lähde kerran
r=M.ruutu([n('!!20.11. ja 21.11.: Kuorma: 9!!')],{muuttuja:'Kuorma',laske:'maara'},T);A.equal(r.arvo,2);A.equal(r.lahteet.length,1);
// sarja: puuttuva päivä on aukko, nolla on nolla, päivän arvo keskiarvo tai summa
r=M.ruutu([n('!!20.11.: X: 2!! !!20.11.: X: 4!! !!22.11.: X: 0!!')],{muuttuja:'X',laske:'keskiarvo',aika:'7'},T);
A.equal(r.sarja.length,7);A.deepEqual(r.sarja.map(p=>p.v),[null,null,null,3,null,0,null]);
r=M.ruutu([n('!!20.11.: X: 2!! !!20.11.: X: 4!!')],{muuttuja:'X',laske:'summa',aika:'7'},T);A.equal(r.sarja[3].v,6);
// tekstiarvo: viimeisin näyttää tekstin, numeeriset laskut tyhjiä, määrä laskee
const tx=[n('!!21.11.: Fiilis: hyvä!! !!22.11.: Fiilis: väsynyt!!')];
A.equal(M.ruutu(tx,{muuttuja:'Fiilis',laske:'viimeisin'},T).arvo,'väsynyt');A.equal(M.ruutu(tx,{muuttuja:'Fiilis',laske:'keskiarvo'},T).arvo,null);
A.equal(M.ruutu(tx,{muuttuja:'Fiilis',laske:'maara'},T).arvo,2);
// tuntematon muuttuja ja laji
r=M.ruutu(notes,{muuttuja:'Ei ole',laske:'outo'},T);A.equal(r.laske,'viimeisin');A.equal(r.arvo,null);A.deepEqual(r.sarja,[]);
console.log('logiikka_muuttujaruutu ok');
