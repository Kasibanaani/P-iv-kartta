/* Kaikki 0.24: laskenta ei kirjoita muistiinpanoihin. */
const assert = require('node:assert/strict');
const {KAAVA} = require('./engine.js');

const allowed = KAAVA.allowedFields([
  '## Omat kentät (Emil 22.11.2026)',
  '- **Sovitut kentät:** `hinta`, `tila`, `arvio` ja `selite`.',
  '## Tiedostonimi',
  '- **Sovitut kentät:** `valea`.'
].join('\n'));
assert.deepEqual([...allowed], ['hinta', 'tila', 'arvio', 'selite']);
const notes = [
  {vp:'projektit/remontti/keittio.md', vfm:['hinta: 10,5', 'tila: luonnos', 'tagit: [Remontti]'],
    text:['hinta: 2', 'hinta: -2', 'muuta: 999', 'selite: "A #B"', '```', 'hinta: 999', '```'].join('\n')},
  {vp:'projektit/remontti/piha.md', vfm:['hinta: 4', 'tila: valmis'], text:'Piha #remontti'},
  {vp:'inbox/lahde.md', vfm:['hinta: 2.25', 'jatko: =[[budjetti]].kulut'], text:''},
  {vp:'inbox/budjetti.md', vfm:['kulut: =SUMMA(hinta; kansio = projektit/remontti)', 'keha: =[[toinen]].keha'], text:''},
  {vp:'inbox/toinen.md', vfm:['keha: =[[budjetti]].keha'], text:''},
  {vp:'paivat/2026/2026-11-22.md', text:'## Pikakirjaukset\n\n- klo 14.32 · arvio: 7 #kokeilu'}
];
const previous = JSON.stringify(notes);
const engine = KAAVA.create(notes, allowed);
function check(formula, expected, note) {
  const result = engine.run(formula, note);
  assert.deepEqual(result, expected, formula);
}
check('=-(2 + 3) * 4 + 9 / 3', {value:-17});
check('=SUMMA(1,5; 2.5; -1)', {value:3});
check('=SUMMA(hinta; tunniste = remontti)', {value:14.5});
check('=SUMMA(hinta; kansio = projektit/remontti; tila = valmis)', {value:4});
check('=SUMMA(hinta; hinta > -3; tila = valmis)', {value:4});
check('=SUMMA(hinta)', {value:16.75});
check('=MÄÄRÄ(hinta; tunniste = remontti)', {value:4});
check('=MÄÄRÄ(tila)', {value:2});
check('=KESKIARVO(hinta; kansio = projektit/remontti)', {value:3.625});
check('=MIN(hinta)', {value:-2});
check('=MAX(hinta)', {value:10.5});
check('=JOS(2 ≤ 3; YHDISTÄ("A"; " "; "ä"); [[puuttuu]].hinta)', {value:'A ä'});
check('=PYÖRISTÄ(-1,005; 2)', {value:-1.01});
check('=[[projektit/remontti/piha]].hinta + [[lahde]].jatko', {value:18.5});
check('=YHDISTÄ(selite; "!")', {value:'A #B!'}, notes[0]);
check('=arvio-2', {value:5}, notes[5]);
check('=[[budjetti]].keha', {error:'#KEHÄ'});
check('=[[budjetti]].hinta', {error:'#PUUTTUU'});
check('=[[puuttuu]].hinta', {error:'#PUUTTUU'});
check('=SUMMA(hinta; keksitty = uusi)', {error:'#NIMI?'});
check('=hinta', {error:'#ARVO!'}, notes[0]);
check('=SUMMA(muuta)', {error:'#NIMI?'});
check('=1 / 0', {error:'#JAKO/0!'});
check('=JOS(1; 2)', {error:'#KAAVA!'});
check('=EVAL("teksti")', {error:'#NIMI?'});
assert.deepEqual(engine.values(notes[0], 'hinta'), {value:[10.5, 2, -2]});
assert.equal(JSON.stringify(notes), previous);
console.log('Kentät, kaavat, rajaukset, viittaukset ja virheet toimivat.');
