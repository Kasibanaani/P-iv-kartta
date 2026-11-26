'use strict';
/* 0.97 (työjonon kärki 4): suomalainen aika ja viikkotarkkuus. Viikkoesityksen tiedostomuoto "vk 48/2026" (ISO-viikko). */
const assert = require('node:assert/strict');
const {MUUTTUJA: M, SAADIN: S, observationMatrix} = require('./engine.js');

const base = new Date(2026, 10, 25);

/* ISO-viikko: maanantai alkaa, viikkovuosi torstain mukaan */
assert.equal(M.weekOf('2026-11-25'), '2026-W48');
assert.equal(M.weekOf('2027-01-01'), '2026-W53', '1.1.2027 kuuluu viikkoon 53/2026');
assert.equal(M.weekOf('2027-01-04'), '2027-W01');
assert.equal(M.weekOf('2025-12-29'), '2026-W01');
assert.equal(M.weekOf('2021-01-03'), '2020-W53');
assert.deepEqual(M.weekDays('2026-W53'), {mon: '2026-12-28', sun: '2027-01-03'});
assert.deepEqual(M.weekDays('2026-W48'), {mon: '2026-11-23', sun: '2026-11-29'});
assert.equal(M.weekDays('2025-W53'), null, 'vuodessa 2025 ei ole viikkoa 53');
assert.equal(M.weekLabel('2026-W08'), 'vk 8/2026');

/* Viikon tulkinta */
assert.equal(M.parseWeek('vk 48/2026', base), '2026-W48');
assert.equal(M.parseWeek('Viikko 48/2026', base), '2026-W48');
assert.equal(M.parseWeek('vk 53/26', base), '2026-W53', 'kaksinumeroinen vuosi = 2000-luku');
assert.equal(M.parseWeek('2026-W48', base), '2026-W48');
assert.equal(M.parseWeek('vk 48', base), '2026-W48', 'vuodeton = kuluva vuosi');
assert.equal(M.parseWeek('vk 49', base), '2025-W49', 'vuodeton tuleva viikko = edellinen vuosi');
assert.equal(M.parseWeek('vk 54/2026', base), null);
assert.equal(M.parseWeek('48/2026', base), null, 'vk-sana tarvitaan');

/* Päivän tulkinta: sama päivä eri kirjoitusasuilla, vuosi aina nelinumeroisena */
for (const t of ['5.1.2026', '05.01.2026', '5.1.26', 'ma 5.1.2026', '2026-01-05']) {
  assert.deepEqual(M.parseWhen(t, base), {day: '2026-01-05', clock: '', week: ''}, t);
}
assert.deepEqual(M.parseWhen('25.11.2026 klo 18.05', base), {day: '2026-11-25', clock: '18:05', week: ''});
assert.deepEqual(M.parseWhen('vk 48/2026', base), {day: '', clock: '', week: '2026-W48'});
assert.equal(M.parseWhen('huomisaamu', base), null);
assert.equal(M.parseWhen('5.1.–7.1.2026', base), null, 'jakso ei ole yksi hetki');

/* Lohkon luku: viikkohavainto ei saa päivää eikä osion päivää */
const text = '# 2026-11-24\n\n- ((vk 48/2026, Penkki: paino = 80 kg, toistot = 8, #treeni, ^w1))\n- ((24.11.2026 klo 7.00, paino = 70 kg))\n- ((10.11.2026, paino = 60 kg))\n';
const obs = M.parse(text, base);
assert.deepEqual(obs.map(o => [o.nimi, o.paivat, o.viikko, o.kohde]), [
  ['paino (kg)', [], '2026-W48', 'Penkki'], ['toistot', [], '2026-W48', 'Penkki'],
  ['paino (kg)', ['2026-11-24'], '', ''], ['paino (kg)', ['2026-11-10'], '', ''],
]);
assert.equal(M.obsWhen(obs[0]), '2026-11-23');
assert.equal(M.obsWhen(obs[2]), '2026-11-24 07:00');
/* Vanhat lohkot ennallaan */
assert.deepEqual(M.parse('((ti 24.11. klo 12.30, Kanan fileesuikaleet: annos = 150 g, #ravinto))', base).map(o => [o.paivat, o.kello, o.viikko]),
  [[['2026-11-24'], '12:30', '']]);
/* 0.97: vuodeton mennyt päivä on tämä vuosi, vuodeton tuleva päivä edellinen vuosi (havainto ei koske tulevaa) */
assert.deepEqual(M.parseWhen('26.11.', base), {day: '2025-11-26', clock: '', week: ''});
assert.deepEqual(M.parseWhen('eilen', base), {day: '2026-11-24', clock: '', week: ''});
assert.deepEqual(M.parse('- ((uni (h) = 8))', base).map(o => [o.paivat, o.viikko]), [[[], '']]);

/* Kooste: viikkohavainto on yksi piste, mukana kun viikko osuu aikaväliin, ei päiväsarjassa */
const notes = [{text, created: base}];
let r = M.ruutu(notes, {muuttuja: 'paino (kg)', laske: 'summa', aika: 7}, '2026-11-25');
assert.equal(r.arvo, 150);
assert.equal(r.pisteet, 2);
assert.deepEqual(r.sarja.filter(p => p.v !== null), [{d: '2026-11-24', v: 70}]);
r = M.ruutu(notes, {muuttuja: 'paino (kg)', laske: 'summa', alku: '2026-11-29', loppu: '2026-12-05', aika: 'oma'}, '2026-11-25');
assert.equal(r.arvo, 80, 'sunnuntai 29.11. kuuluu viikkoon 48');
r = M.ruutu(notes, {muuttuja: 'paino (kg)', laske: 'summa', alku: '2026-11-30', loppu: '2026-12-05', aika: 'oma'}, '2026-11-25');
assert.equal(r.arvo, null);
r = M.ruutu(notes, {muuttuja: 'paino (kg)', laske: 'maara'}, '2026-11-25');
assert.equal(r.arvo, 3);

/* Havaintotaulukko: viikkoakselilla oma viikko, päiväakselilla oma rivi */
const view = {subjects: [], rowAxis: 'viikko', colAxis: 'valitut', columns: [{name: 'paino (kg)', mode: 'summa'}], variable: '', tag: '', noteTag: ''};
const m1 = observationMatrix(notes, view);
const rows1 = m1.rows.map(([k, v]) => [k, v.label]);
assert.ok(rows1.some(([k, l]) => k === '2026-11-23' && /Viikko alkaen 23\.11\.2026/.test(l)), JSON.stringify(rows1));
const m2 = observationMatrix(notes, {...view, rowAxis: 'paiva'});
const rows2 = m2.rows.map(([k, v]) => [k, v.label]);
assert.ok(rows2.some(([k, l]) => k === 'W2026-W48' && l === 'vk 48/2026'), JSON.stringify(rows2));

/* Kirjoitus: napin aika viikko */
const it = S.parse('# S\n\n## Viikon paino\n- tunnus: viikon-paino\n- muuttuja: paino\n- yksikko: kg\n- aika: viikko\n').items[0];
assert.equal(it.aika, 'viikko');
assert.equal(it.virhe, '');
const line = S.record(it, {day: '2027-01-01', clock: '', week: M.weekOf('2027-01-01'), values: ['80'], dayNote: false, id: 'qh9'});
assert.equal(line, '- ((vk 53/2026; paino = 80 kg; ^qh9))');
assert.deepEqual(M.parse(line, base).map(o => [o.viikko, o.paivat, o.luku]), [['2026-W53', [], 80]]);
const stamp = S.parse('# S\n\n## Viikko tehty\n- aikaleima: kylla\n- aika: viikko\n').items[0];
assert.equal(S.record(stamp, {day: '2026-11-25', clock: '', week: '2026-W48', dayNote: true}), '- vk 48/2026 · Viikko tehty');
assert.match(S.lines(it).join('\n'), /- aika: viikko/);
console.log('viikot ok');
