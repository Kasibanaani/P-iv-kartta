/* Yhtenäisen kaavakielen lukija, havaintojoukot ja kaavojen riippuvuudet. */
const assert = require('node:assert/strict');
const { KAAVA, MUUTTUJA, VAULT } = require('./engine.js');
const today = '2026-11-26';
const created = '2026-11-26T12:00:00Z';
const note = (name, text) => ({ vp: 'projektit/' + name + '.md', text, created });
const food = note('ruokapaivakirja', [
  'Ruokapäiväkirja',
  '((ruoka: =RYHMÄ(kana; eläimet; lihapulla; "Pinaattilettu")))',
  '((eläimet: =RYHMÄ(kana; lihapulla)))',
  '((1.8.2026; Kana: proteiini = 23,5 g; rasva = 2 g; #ravinto; ^ateria-1))',
  '((1.8.2026; Kana: proteiini = 23,5 g; rasva = 2 g; #ravinto; ^ateria-2))',
  '((31.8.2026, Lihapulla: proteiini = 12 g))',
  '((vk 36/2026; Pinaattilettu: proteiini = 4 g))',
  '((1.9.2026; Kana: proteiini = 29 g))',
  '((Kana: proteiini = 7 g; selite = "A; B = C"))',
  '((1.8.2026; Kana: proteiini = "99"; rasva = 0 g))',
  '((1.8.2026; Kana: proteiini vertailumäärässä = 101 g))',
  '((1.8.2026; Kana: proteiini = "puuttuu"))',
  '((1.8.2026; Kana: kuiva = false))',
  '((2.8.2026; Kana: eri = 1 kg))',
  '((3.8.2026; Kana: eri = 200 g))',
  '((26.99.2026; Kana: proteiini = 300 g))',
  '~~~markdown',
  '((1.8.2026; Kana: proteiini = 999 g))',
  '((piilossa: =999))',
  '~~~',
].join('\n'));
const situation = VAULT.noteOf('projektit/tilanne.md', [
  '---', 'otsikko: Päivän tilanne', 'luotu: 2026-11-26', '---', '# Päivän tilanne',
  '((kuormitus: =2))',
  '((Päivän ohje:',
  '  JOS kuormitus > 5: "Ota rennosti tänään"',
  '  JOS kuormitus < 3: "Anna palaa!"',
  '  MUUTEN: "Jatka tavalliseen tapaan"',
  '))',
  '((Ensimmäinen osuma:', 'JOS kuormitus > 0: "ensimmäinen"', 'JOS kuormitus < 3: "toinen"', '))',
  '((Puuttuva tietue:', 'JOS tuntematon > 5: "odota"', 'MUUTEN: "jatka"', '))',
  '((Tyhjä tulos:', 'JOS kuormitus > 5: "odota"', '))',
  '## Oma osio ^paiva',
  'Ohje on ((=[[tilanne]].Päivän ohje)).',
  '((=PAINIKE("Tallenna"; muuttuja = "Tehty"; arvo = 1)))',
  '## Seuraava',
  'Ei kuulu upotukseen.',
].join('\n'));
const plan = note('suunnitelma', [
  '((Suunnitelma:',
  '  JOS [[Päivän tilanne]].Päivän ohje = "Anna palaa!": "Tee treeni"',
  '  MUUTEN: "Kevyt päivä"',
  '))',
  '((silmukka: =[[silmukka]].jatko))',
  'vanha: {=17}',
].join('\n'));
const circular = note('silmukka', '((jatko: =[[suunnitelma]].silmukka))\n((A: =RYHMÄ(B)))\n((B: =RYHMÄ(A)))');
const engine = KAAVA.create([food, situation, plan, circular], new Set(), null, { today });
const run = (formula, expected, owner=food) => assert.deepEqual(engine.run(formula, owner), expected, formula);
const trace = formula => engine.trace(formula, food);
run('=SUMMA(ruoka.proteiini; aika="2026-08")', {value:63});
run('=SUMMA(SUODATA(ruoka.proteiini; aika="2026-08"); alku="31.8.2026"; loppu="2.9.2026")', {value:16});
run('=SUMMA(kana."proteiini (g)"; aika="1.8.2026")', {value:47});
run('=MÄÄRÄ(kana.proteiini; aika="1.8.2026")', {value:4});
run('=SUMMA(kana.proteiini; aika="vk 36/2026")', {value:29});
run('=SUMMA(pinaattilettu.proteiini; aika="2026-08")', {value:4});
run('=SUMMA(ruoka.proteiini; alku="2.9.2026"; loppu="1.8.2026")', {error:'#AIKA!'});
run('=SUMMA(ruoka.proteiini; aika="2026-08"; alku="2026-08-01")', {error:'#AIKA!'});
run('=SUMMA(a.proteiini)', {error:'#KEHÄ'});
run('=SUMMA(kana.eri)', {error:'#YKSIKKÖ!'});
run('=SUMMA(kana."eri (g)")', {value:200});
run('=VIIMEISIN(kana.proteiini)', {value:29});
run('=VIIMEISIN(kana.proteiini; aika="1.8.2026")', {error:'#MONTA ARVOA!'});
run('=VIIMEISIN(kana.kuiva)', {value:false});
run('=VIIMEISIN(kana.selite)', {value:'A; B = C'});
run('=[[Päivän tilanne]].Päivän ohje', {value:'Anna palaa!'}, plan);
run('=[[projektit/tilanne]]."Päivän ohje"', {value:'Anna palaa!'}, plan);
run('=NIMETTY("Suunnitelma")', {value:'Tee treeni'}, plan);
run('=NIMETTY("Ensimmäinen osuma")', {value:'ensimmäinen'}, situation);
run('=NIMETTY("Puuttuva tietue")', {error:'#NIMI?'}, situation);
run('=NIMETTY("Tyhjä tulos")', {value:''}, situation);
run('=SISÄLTÄÄ([[tilanne]].Päivän ohje; "anna palaa")', {value:true}, plan);
run('=[[tilanne]].puuttuva', {error:'#NIMI?'}, plan);
run('=silmukka', {error:'#KEHÄ'}, plan);
run('=vanha', {value:17}, plan);
run('=piilossa', {error:'#NIMI?'});
assert.deepEqual(trace('=KUVAAJA(ruoka.proteiini; aika="2026-08")').value, {trend:[23.5, 23.5, null, null, 12, 4]});
assert.deepEqual(trace('=UPOTA([[tilanne]]; "^paiva")').value, {embed:'Ohje on Anna palaa!.'});
assert.equal(trace('=SUMMA(ruoka.proteiini; aika="2026-08")').sources.filter(p=>p.o?.block?.id).length, 2);

const atoms = '((26.11.2026; Kana: rasva = 2 g; #ravinto; ^ateria-1))\n' +
  '((tulos: =JOS(1=1; "teksti ))"; "x")))\n' +
  'teksti ((=SUMMA((2+3); 1)))\n' +
  '((Tänään: =YHDISTÄ("26.11.2026"; " !!a: 7!!")))\n' +
  '((taso: =LIUKUSÄÄDIN(min = 0; max = 10; askel = 0,5)))';
assert.equal(MUUTTUJA.parse(atoms, created).length, 1);
assert.equal(KAAVA.noteSpans(atoms).blocks.length, 3);
assert.equal(KAAVA.noteSpans(atoms).blocks[2].control.step, 0.5);
assert.equal(KAAVA.noteSpans(atoms).inlines[0].source, '=SUMMA((2+3); 1)');
assert.equal(KAAVA.maskCells(atoms).length, atoms.length);
assert.ok(!KAAVA.maskCells(atoms).includes('!!a'));
assert.deepEqual(MUUTTUJA.parse(atoms, created)[0].paivat, [today]);
assert.equal(MUUTTUJA.parse('((Kohde | v: (vapaa teksti))', created)[0].arvo, '(vapaa teksti');
assert.equal(MUUTTUJA.parse('((tavallista tekstiä ja !!x: 2!!))', created)[0].luku, 2);
assert.equal(KAAVA.check(KAAVA.noteSpans('((väärä: =SUMMA(2; 3))').blocks[0].source), '#KAAVA!');

const renamed = note('uusi', '## Vaihdettu nimi ^paiva\nPäivitetty osio.');
const embedCycle = note('kehakuva', '((=UPOTA([[kehakuva]])))');
const follow = KAAVA.create([renamed,embedCycle],new Set(),null,{today});
assert.deepEqual(follow.trace('=UPOTA([[uusi]]; "^paiva")', renamed).value, {embed:'Päivitetty osio.'});
assert.equal(follow.trace('=UPOTA([[kehakuva]])', embedCycle).error, '#KEHÄ');
console.log('Yhtenäiset solut, havaintojoukot, ryhmät, ehdot, viittaukset ja upotukset toimivat.');
