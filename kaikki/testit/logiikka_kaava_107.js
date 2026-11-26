/* Nimetyt kaavaruudut, havaintohaut ja nykyisen muistiinpanon säädinarvo. */
const assert = require('node:assert/strict');
const {KAAVA} = require('./engine.js');

const note = {
  vp:'projektit/arvio.md',
  text:[
    'työ: {=5}',
    'kuormitus: {=työ + väsymys}',
    '{liukusäädin: väsymys; muuttuja = "Väsymys"; kohde = "Oma"; askel = 0,5}',
    '```md',
    'koodi: {=999}',
    '```',
    '((26.11.2026 klo 12.00, Oma: Väsymys = 4, aktiivinen = false, säilytä = "false"))',
    '((24.11.2026 klo 20.00, Oma: Väsymys = 0))',
    '((25.11.2026 klo 12.00, Oma: Väsymys = 6))',
  ].join('\n'),
};
const second = {vp:'projektit/toinen.md',text:'luku: {=[[arvio]].kuormitus * 2}'};
const preview = new Map();
const engine = KAAVA.create([note,second],new Set(),null,{today:'2026-11-26',preview:{note,values:preview}});
function check(formula,expected,owner=note){
  assert.deepEqual(engine.run(formula,owner),expected,formula);
}
check('=kuormitus',{value:9});
check('=[[arvio]].työ',{value:5},second);
check('=luku',{value:18},second);
check('=koodi',{error:'#NIMI?'});
check('=HAVAINTO("Oma";"Väsymys";"24.11.2026")',{value:0});
check('=HAVAINTO("Oma";"aktiivinen";TÄNÄÄN())',{value:false});
check('=HAVAINTO("Oma";"säilytä";TÄNÄÄN())',{value:'false'});
check('=JOSPUUTTUU(HAVAINTO("Oma"; "puuttuva"); "ei kirjattu")',{value:'ei kirjattu'});
check('=JOSPUUTTUU(1/0;"ei kirjattu")',{error:'#JAKO/0!'});
check('=MEDIaani(HAVAINNOT("Oma";"Väsymys";"7 päivää"))',{value:4});
check('=SUMMA(SUODATA(HAVAINNOT("Oma";"Väsymys");">";3))',{value:10});
assert.deepEqual(engine.trace('=OTA(HAVAINNOT("Oma";"Väsymys");2)',note).value,[0,6]);
assert.deepEqual(engine.trace('=LAJITTELE(HAVAINNOT("Oma";"Väsymys");"laskeva")',note).value,[6,4,0]);
assert.deepEqual(engine.trace('=PIENKUVAAJA(HAVAINNOT("Oma";"Väsymys"))',note).value,{trend:[0,6,4]});
check('=JA(EI(HAVAINTO("Oma";"aktiivinen")); TAI(1=0;1=1))',{value:true});
assert.ok(engine.trace('=kuormitus',note).sources.some(item => item.n===note && item.o.nimi==='Väsymys'));
preview.set('väsymys',7);
engine.refreshPreview();
check('=kuormitus',{value:12});
check('=luku',{value:24},second);
assert.equal(KAAVA.control('{liukusäädin: olo; kohde = "Arki; koti"; askel = 0,5}').subject,'Arki; koti');
assert.equal(KAAVA.control('{liukusäädin: olo; min = 10; max = 0}').error,'Tarkista liukusäätimen minimi, maksimi, askel ja alkuarvo.');
assert.equal(KAAVA.control('{painike: "Kuittaa"; muuttuja = "Tehty"; arvo = 1}').value,'1');
console.log('Kaavaruudut, havaintohaut ja säätimen esikatselu toimivat.');
